import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type PickRow = {
  week: number;
  team_code: string | null;
  status: "pending" | "win" | "loss" | "push";
  starts_at?: string | null; // ISO from backend (games.start_time)
};

type Player = {
  id: string;
  name?: string | null;
  eliminated: boolean;
  picks?: PickRow[];
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function HomePage() {
  const navigate = useNavigate();
  const [stillIn, setStillIn] = useState<Player[]>([]);
  const [eliminated, setEliminated] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/leaderboard`)
      .then(async (res) => {
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(`${res.status} ${res.statusText} ${t}`);
        }
        return res.json();
      })
      .then((data) => {
        setStillIn(Array.isArray(data?.stillIn) ? data.stillIn : []);
        setEliminated(Array.isArray(data?.eliminated) ? data.eliminated : []);
        setErr(null);
      })
      .catch((e) => {
        console.error("Error fetching leaderboard:", e);
        setErr(e.message || "Failed to load leaderboard");
      })
      .finally(() => setLoading(false));
  }, []);

  const symbolFor = (status?: string) => {
    switch (status) {
      case "win":  return "☠️"; // reversed rule: win => eliminated
      case "loss": return "🟢"; // loss => alive
      case "push": return "⚪";
      default:     return "⏳";
    }
  };

  const labelFor = (status?: string) => {
    switch (status) {
      case "win":  return "WIN (eliminated)";
      case "loss": return "LOSS (alive)";
      case "push": return "PUSH (alive)";
      default:     return "PENDING";
    }
  };

  const PlayerCard = ({ player }: { player: Player }) => {
    const picks: PickRow[] = Array.isArray(player.picks) ? player.picks : [];
    const sorted = picks.slice().sort((a, b) => (a.week ?? 0) - (b.week ?? 0));

    return (
      <div className="bg-white shadow-md rounded-xl p-4 border hover:shadow-lg transition-shadow">
        <h3 className="text-lg font-bold mb-2">{player.name || "—"}</h3>
        {sorted.length === 0 ? (
          <div className="text-sm text-gray-500">No picks yet.</div>
        ) : (
          <ul className="text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            {sorted.map((p, i) => {
              const startsMs = p.starts_at ? new Date(p.starts_at).getTime() : 0;
              const hide = p.status === "pending" && startsMs > Date.now(); // hide until kickoff
              return (
                <li key={`${player.id}-${p.week}-${i}`}>
                  Week {p.week}:{" "}
                  {hide
                    ? "⏳"
                    : <>
                        {p.team_code || ""} — {symbolFor(p.status)} {labelFor(p.status)}
                      </>
                  }
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading…</div>;
  }

  if (err) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6 text-center">💀 Idaho Andy&apos;s Suicide Pool 💀</h1>
        <div className="text-red-600">Error: {err}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-center">💀 Idaho Andy&apos;s Suicide Pool 💀</h1>

      {/* Still In */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-green-700">🟢 Still In</h2>
        {stillIn.length === 0 ? (
          <p className="text-gray-500">No active users yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {stillIn.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        )}
      </section>

      {/* Eliminated */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-red-700">💀 Eliminated</h2>
        {eliminated.length === 0 ? (
          <p className="text-gray-500">No eliminations yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {eliminated.map((p) => (
              <div className="opacity-70" key={p.id}>
                <PlayerCard player={p} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 🔒 Login Button */}
      <div className="flex justify-center mt-10">
        <button
          onClick={() => navigate("/signin")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow"
        >
          Login to Make Your Picks
        </button>
      </div>
    </div>
  );
}