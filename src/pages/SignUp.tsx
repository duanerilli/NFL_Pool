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
  
    // Create Supabase Auth user
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
  
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
  
    // If you are using a trigger on Supabase to insert into `public.users`,
    // you don’t need to manually insert into the `users` table here.
    // Otherwise, you would do that part below.
    
    // Navigate to dashboard after signup
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