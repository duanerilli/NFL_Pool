import { useEffect, useState } from 'react';

type Pick = {
  week: number;
  team: string;
  status: string;
};

type User = {
  id: string;
  name: string;
  eliminated: boolean;
  picks: Pick[];
};

export default function Leaderboard() {
  const [stillIn, setStillIn] = useState<User[]>([]);
  const [eliminated, setEliminated] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4000/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setStillIn(data.stillIn);
        setEliminated(data.eliminated);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading leaderboard...</p>;

  const renderUser = (user: User) => (
    <div key={user.id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
      <h3>{user.name}</h3>
      <ul>
        {user.picks.map(pick => (
          <li key={pick.week}>
            Week {pick.week}: {pick.team} ({pick.status})
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div>
      <h2>💪 Still In</h2>
      {stillIn.length ? stillIn.map(renderUser) : <p>No survivors remaining.</p>}

      <h2>☠️ Eliminated</h2>
      {eliminated.length ? eliminated.map(renderUser) : <p>No eliminations yet!</p>}
    </div>
  );
}