import API from '../api/Axios';
import { useEffect, useState } from 'react';

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await API.get('/groups'); // ajuster selon ta route réelle
        setGroups(res.data);
      } catch (err) {
        setError("Impossible de charger les groupes");
      }
    };

    fetchGroups();
  }, []);

  if (error) return <p className="text-red-600 text-center">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Trouver un groupe</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {groups.map((group) => (
          <div key={group._id} className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-blue-700">{group.name}</h2>
            <p className="text-gray-600 mt-2">{group.description}</p>
            <div className="mt-4 text-sm text-gray-500">
              📍 {group.location} <br />
              🗓️ {group.day}
            </div>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Voir le groupe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupList;
