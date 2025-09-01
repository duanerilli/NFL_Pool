// src/pages/SignIn.tsx
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    let email = identifier;

    // If they entered a username, fetch email from DB
    if (!identifier.includes("@")) {
      const { data, error: lookupError } = await supabase
        .from("users")
        .select("email")
        .eq("name", identifier)
        .single();

      if (lookupError || !data) {
        setError("Username not found");
        return;
      }

      email = data.email;
    }

    // Sign in with email + password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Invalid login credentials");
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Sign In</h2>

      <input
        type="text"
        placeholder="Username or Email"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
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
        onClick={handleLogin}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
      >
        Log In
      </button>

      <p className="mt-4 text-sm text-center">
        Don&apos;t have an account?{" "}
        <button
          className="text-blue-600 cursor-pointer hover:underline"
          onClick={() => navigate("/signup")}
        >
          Sign up
        </button>
      </p>
    </div>
  );
}