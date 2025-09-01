// src/pages/SignUp.tsx
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    setError("");
    setLoading(true);
    try {
      // 1) Create Supabase Auth user + send name in metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: username } }, // <-- trigger reads this
      });
      if (signUpError) throw signUpError;

      // 2) DO NOT insert into public.users here — the trigger handles it

      // 3) Navigate (or show “check your email” if you require confirmation)
      navigate("/dashboard");
    } catch (e: any) {
      setError(e.message ?? "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Sign Up</h2>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <button
        onClick={handleSignUp}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded w-full"
      >
        {loading ? "Creating..." : "Create Account"}
      </button>
    </div>
  );
}