import { useEffect, useState } from "react";
import API from "../api/axios";
import { Link } from "react-router-dom";

const days = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [meetingDay, setMeetingDay] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await API.get("/groups");
        setGroups(res.data);
        setFiltered(res.data);
      } catch (err) {
        setError("Impossible de charger les groupes");
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    let result = [...groups];

    if (meetingDay) {
      result = result.filter((group) => group.meetingDay === meetingDay);
    }

    if (search.trim() !== "") {
      const lower = search.toLowerCase();
      result = result.filter(
        (group) =>
          group.name.toLowerCase().includes(lower) ||
          group.description.toLowerCase().includes(lower)
      );
    }

    setFiltered(result);
  }, [meetingDay, search, groups]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Trouver un groupe</h1>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 max-w-3xl mx-auto">
        <input
          type="text"
          placeholder="Rechercher un groupe..."
          className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring focus:ring-blue-500 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={meetingDay}
          onChange={(e) => setMeetingDay(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring focus:ring-blue-500 bg-white"
        >
          <option value="">Tous les jours</option>
          {days.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filtered.map((group) => (
            <div
              key={group._id}
              className="bg-white p-6 rounded-xl shadow hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold text-blue-700">
                {group.name}
              </h2>
              <p className="text-gray-600 mt-2">{group.description}</p>
              <div className="mt-4 text-sm text-gray-500">
                📍 {group.location} <br />
                🗓️ {group.meetingDay}
              </div>
              <Link to={`/groups/${group._id}`}>
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Voir le groupe
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupList;
