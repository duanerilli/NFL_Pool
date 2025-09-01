// src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import SignOutButton from "../components/SignOutButton";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

// If you want to allow dev picks even when games started, set VITE_IGNORE_LOCK=1 in .env
const IGNORE_LOCK = import.meta.env.VITE_IGNORE_LOCK === "1";

type HistoryPick = {
  id: string;
  week: number;
  status?: string | null;
  team?: { code?: string | null; name?: string | null } | null;
  game?: { start_time?: string | null } | null;
};

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  const [picks, setPicks] = useState<HistoryPick[]>([]);
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [message, setMessage] = useState("");

  const [phase, setPhase] = useState<"PRE" | "REG" | "POST">("REG");
  const [week, setWeek] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // --- helpers -------------------------------------------------------------

  const canSubmit = useMemo(
    () => !!user?.id && !!selectedTeam && availableTeams.length > 0,
    [user?.id, selectedTeam, availableTeams.length]
  );

  async function loadAvailableAndHistory(u: { id: string }) {
    setLoading(true);
    setErr(null);

    // Let the backend pick the right phase/week automatically for live use.
    // For dev, you can append ?ignoreLock=1 via env flag.
    const params = new URLSearchParams();
    if (IGNORE_LOCK) params.set("ignoreLock", "1");
    const availUrl = `${API_BASE}/api/picks/available/${u.id}${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    try {
      const [historyRes, availRes] = await Promise.all([
        fetch(`${API_BASE}/api/picks/history/${u.id}`),
        fetch(availUrl),
      ]);

      if (!historyRes.ok) {
        const t = await historyRes.text().catch(() => "");
        throw new Error(`history ${historyRes.status} ${t}`);
      }
      if (!availRes.ok) {
        const t = await availRes.text().catch(() => "");
        throw new Error(`available ${availRes.status} ${t}`);
      }

      const historyJson = await historyRes.json();
      const availJson = await availRes.json();

      setPicks(Array.isArray(historyJson?.picks) ? historyJson.picks : []);
      setAvailableTeams(Array.isArray(availJson?.available_teams) ? availJson.available_teams : []);

      const wk = typeof availJson?.week === "number" ? availJson.week : 1;
      const ph = (availJson?.phase || "reg").toString().toUpperCase() as "PRE" | "REG" | "POST";
      setWeek(wk);
      setPhase(ph);
    } catch (e: any) {
      console.error("loadAvailableAndHistory error:", e);
      setErr(e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  // --- effects -------------------------------------------------------------

  // Get the auth user once
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
      else console.warn("No supabase user found");
    });
  }, []);

  // Load history + available once user is known
  useEffect(() => {
    if (!user?.id) return;
    loadAvailableAndHistory(user).catch(console.error);
  }, [user?.id]);

  // --- submit --------------------------------------------------------------

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/picks/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          week,                         // use backend-provided week
          team: selectedTeam,
          phase: phase.toLowerCase(),   // 'pre' | 'reg' | 'post'
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(`❌ ${result?.error || "Failed to submit"}`);
        return;
      }

      setMessage("✅ Pick submitted!");
      setSelectedTeam("");

      // Reload after submit
      await loadAvailableAndHistory(user);
    } catch (e: any) {
      console.error("submit error:", e);
      setMessage(`❌ ${e?.message || "Server error"}`);
    }
  };

  // --- render --------------------------------------------------------------

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Dashboard</h2>
        <SignOutButton />
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <p className="text-gray-700">
          <strong>Email:</strong> {user?.email || "—"}
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Previous Picks</h3>
          <button
            onClick={() => user && loadAvailableAndHistory(user)}
            className="text-sm px-3 py-1 rounded border hover:bg-gray-50"
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {err && <p className="text-red-600 mt-2">Error: {err}</p>}

        {picks.length === 0 ? (
          <p className="text-gray-500 mt-2">No picks yet.</p>
        ) : (
          <ul className="list-disc list-inside mt-2">
            {picks.map((p) => (
              <li key={p.id}>
                Week {p.week}: {p.team?.code || p.team?.name || "—"} —{" "}
                {(p.status || "pending").toLowerCase()}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-gray-500 mb-2">
        debug — phase: {phase}, week: {week}, teams: {availableTeams.length}
      </p>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-3">
          Make Your Pick — {phase} Week {week}
        </h3>

        <div className="flex items-center gap-3">
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="border rounded px-3 py-2"
            disabled={loading || availableTeams.length === 0}
          >
            <option value="">-- Select a Team --</option>
            {availableTeams.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className={`px-4 py-2 rounded text-white ${
              canSubmit && !loading
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Submitting…" : "Submit Pick"}
          </button>
        </div>

        {message && <p className="mt-3 font-medium">{message}</p>}

        {availableTeams.length === 0 && (
          <p className="text-xs text-gray-500 mt-2">
            No teams available right now. This can happen if all games for this week have
            started (locked) or you’ve already picked. Try Refresh.
          </p>
        )}
      </div>
    </div>
  );
}