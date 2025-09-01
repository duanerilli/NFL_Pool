// src/pages/SignUp.tsx
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const navigate = useNavigate();

  const handleSignUp = async () => {
    setError("");

    // 1) Create Supabase Auth user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      // if you want your trigger to read a username from metadata:
      options: { data: { username } },
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // 2) Insert into public.users (only if you STILL need to—if you have a trigger, this can be skipped)
    const userId = signUpData?.user?.id;
    if (userId) {
      const { error: insertError } = await supabase.from("users").insert([
        { id: userId, name: username, email },
      ]);
      if (insertError) {
        setError(insertError.message);
        return;
      }
    }

    // 3) Go to dashboard
    navigate("/dashboard");
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
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
      >
        Create Account
      </button>
    </div>
  );
}