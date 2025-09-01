// src/components/SignOutButton.tsx
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function SignOutButton() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <button
      onClick={handleSignOut}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
    >
      Sign Out
    </button>
  );
}