import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Calendar, MapPin, UserCircle, Settings } from "lucide-react";
import { toast } from "react-toastify";
import API from "../api/axios";
import { useAuth } from "../contexts/AuthContext";
import { defineAbilityFor } from "../abilities/ability";
import ManageGroupModal from "../components/ManageModal";
import "react-toastify/dist/ReactToastify.css";

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

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

  const handleToggleMembership = async () => {
    const wasMember = isMember();

    try {
      const route = wasMember ? "leave" : "join";
      await API.patch(`/groups/${id}/${route}`);

      const res = await API.get(`/groups/${id}`);
      setGroup(res.data);

      toast.success(wasMember ? "Tu as quitté le groupe." : "Tu as rejoint le groupe !");
    } catch (err) {
      toast.error("Erreur lors de l'action.");
    }
  };

  const handleUpdate = async (data) => {
    await API.patch(`/groups/${id}`, data);
    const updated = await API.get(`/groups/${id}`);
    setGroup(updated.data);
  };

  const handleDelete = async () => {
    await API.delete(`/groups/${id}`);
    toast.success("Groupe supprimé avec succès");
    navigate("/groups");
  };

  if (error) return <p className="text-red-600 text-center mt-6">{error}</p>;
  if (!group) return <p className="text-center mt-6">Chargement...</p>;

  const ability = defineAbilityFor(user, group);

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="bg-blue-700 text-white py-16 px-6 text-center bg-cover bg-center"
        style={{ backgroundImage: "url('https://source.unsplash.com/1600x400/?community,people')" }}
      >
        <h1 className="text-4xl font-bold mb-2 drop-shadow-sm">{group.name}</h1>
        <p className="flex justify-center gap-4 text-blue-100 items-center">
          <Calendar className="w-5 h-5" /> {group.meetingDay}
          <Users className="w-5 h-5" /> {group.members?.length} membre{group.members?.length > 1 ? 's' : ''}
        </p>

        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          {ability.can("update", "Group") && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300"
            >
              <Settings className="w-4 h-4" /> Gérer le groupe
            </button>
          )}

          <button
            onClick={handleToggleMembership}
            className={`px-4 py-2 rounded text-white transition ${
              isMember()
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isMember() ? "Quitter le groupe" : "Rejoindre le groupe"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{group.description}</p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-600 space-y-1">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Localisation : Non définie
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <ManageGroupModal
          group={group}
          onClose={() => setShowModal(false)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default GroupDetail;
