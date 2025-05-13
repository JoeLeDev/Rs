import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

const GroupDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchGroup();
  }, []);

  const fetchGroup = async () => {
    try {
      const res = await API.get(`/groups/${id}`);
      setGroup(res.data);
    } catch (err) {
      setError("Groupe introuvable");
    }
  };

  const isMember = () => {
    return group?.members?.some((m) => {
      const memberId = typeof m === "object" ? m._id?.toString() : m.toString();
      return memberId === user?._id?.toString();
    });
  };
  console.log(
    "👥 Comparaison membres:",
    group?.members.map((m) =>
      typeof m === "object" ? m._id?.toString() : m.toString()
    )
  );
  console.log("🆔 Utilisateur ID:", user?._id?.toString());

  const handleToggleMembership = async () => {
    const wasMember = isMember(); // 👈 capture l’état AVANT

    try {
      const route = wasMember ? "leave" : "join";
      await API.patch(`/groups/${id}/${route}`);

      const res = await API.get(`/groups/${id}`);
      setGroup(res.data);
      console.log("🔍 Groupe reçu :", res.data);
      console.log("👤 Utilisateur connecté :", user);

      setMessage(
        wasMember ? "Tu as quitté le groupe." : "Tu as rejoint le groupe !"
      );
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Erreur lors de l'action.");
    }
  };

  if (error) return <p className="text-red-600 text-center mt-6">{error}</p>;
  if (!group) return <p className="text-center mt-6">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">{group.name}</h1>
      <p className="text-gray-700 mb-4">{group.description}</p>
      <p className="text-gray-500 mb-2">
        🗓️ Jour de réunion : {group.meetingDay}
      </p>
      <p className="text-gray-500 mb-4">👥 Membres : {group.members?.length}</p>

      <button
        onClick={handleToggleMembership}
        className={`px-4 py-2 rounded text-white ${
          isMember()
            ? "bg-red-600 hover:bg-red-700"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {isMember() ? "Quitter le groupe" : "Rejoindre le groupe"}
      </button>

      {message && <p className="mt-4 text-center text-blue-600">{message}</p>}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Liste des membres</h2>
        <ul className="list-disc list-inside text-gray-600">
          {group.members?.map((member) => (
            <li key={typeof member === "object" ? member._id : member}>
              {member.username || "Utilisateur"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GroupDetail;
