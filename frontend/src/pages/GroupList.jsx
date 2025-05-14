import { useEffect, useState } from "react";
import API from "../api/axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Settings } from "lucide-react";
import ManageGroupModal from "../components/ManageModal";
import { useAuth } from "../contexts/AuthContext";

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
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { user } = useAuth();
  const [groupToEdit, setGroupToEdit] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [membershipFilter, setMembershipFilter] = useState("all");

  const fetchGroups = async () => {
    try {
      const res = await API.get("/groups");
      setGroups(res.data);
      setFiltered(res.data);
    } catch (err) {
      setError("Impossible de charger les groupes");
    }
  };

  useEffect(() => {
    fetchGroups();

    let result = [...groups];

    // 📅 Filtre par jour
    if (meetingDay) {
      result = result.filter((group) => group.meetingDay === meetingDay);
    }

    // 👥 Filtre par appartenance
    if (membershipFilter === "joined") {
      result = result.filter((group) =>
        group.members.some((m) =>
          typeof m === "object" ? m._id === user._id : m === user._id
        )
      );
    } else if (membershipFilter === "not_joined") {
      result = result.filter(
        (group) =>
          !group.members.some((m) =>
            typeof m === "object" ? m._id === user._id : m === user._id
          )
      );
    }

    // 🔎 Filtre texte
    if (search.trim() !== "") {
      const lower = search.toLowerCase();
      result = result.filter(
        (group) =>
          group.name.toLowerCase().includes(lower) ||
          group.description.toLowerCase().includes(lower)
      );
    }

    setFiltered(result);
  }, [groups, meetingDay, membershipFilter, search]);

  const handleCreateGroup = async () => {
    if (!name) return toast.error("Le nom est requis");

    try {
      await API.post("/groups", { name, description });
      toast.success("Groupe créé !");
      setShowModal(false);
      setName("");
      setDescription("");
      fetchGroups();
    } catch (err) {
      toast.error("Erreur lors de la création");
    }
  };

  const handleUpdateGroup = async (data) => {
    try {
      await API.patch(`/groups/${groupToEdit._id}`, data);
      const refreshed = await API.get(`/groups/${groupToEdit._id}`);
      setGroupToEdit(refreshed.data); // remet à jour la modale
      toast.success("Groupe mis à jour !");
      fetchGroups(); // met à jour la liste filtrée
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await API.delete(`/groups/${groupToEdit._id}`);
      toast.success("Groupe supprimé !");
      setShowManageModal(false);
      fetchGroups();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const getTitle = () => {
    if (membershipFilter === "joined") return "Mes groupes";
    if (membershipFilter === "not_joined") return "Groupes disponibles";
    if (meetingDay) return `Groupes du ${meetingDay}`;
    return "Tous les groupes";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">{getTitle()}</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Créer un groupe
        </button>
      </div>

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

        <select
          value={membershipFilter}
          onChange={(e) => setMembershipFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm bg-white"
        >
          <option value="all">Tous les groupes</option>
          <option value="joined">Mes groupes</option>
          <option value="not_joined">Groupes disponibles</option>
        </select>

        <button
          onClick={() => {
            setSearch("");
            setMeetingDay("");
            setMembershipFilter("all");
          }}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
        >
          Réinitialiser les filtres
        </button>
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
                📍 {group.location || "Non définie"} <br />
                🗓️ {group.meetingDay}
              </div>
              <Link to={`/groups/${group._id}`}>
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Voir le groupe
                </button>
              </Link>
              {user?.role === "admin" && (
                <button
                  onClick={async () => {
                    try {
                      const res = await API.get(`/groups/${group._id}`); // 👈 fetch avec populate(members)
                      setGroupToEdit(res.data); // ✅ avec des objets membres complets
                      setShowManageModal(true);
                    } catch (error) {
                      toast.error("Erreur lors du chargement du groupe");
                    }
                  }}
                  className="mt-2 flex items-center gap-2 text-sm text-yellow-600 hover:text-yellow-700"
                >
                  <Settings className="w-4 h-4" />
                  Gérer
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODALE */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <h2 className="text-xl font-bold mb-4">Créer un groupe</h2>

            <input
              type="text"
              placeholder="Nom du groupe"
              className="w-full mb-3 px-4 py-2 border rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              placeholder="Description (optionnel)"
              className="w-full mb-4 px-4 py-2 border rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <select
              value={meetingDay}
              onChange={(e) => setMeetingDay(e.target.value)}
              className="w-full mb-4 px-4 py-2 border rounded"
            >
              <option value="">Sélectionner un jour de réunion</option>
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
      {showManageModal && groupToEdit && (
        <ManageGroupModal
          group={groupToEdit}
          members={groupToEdit.members}
          onClose={() => setShowManageModal(false)}
          onUpdate={handleUpdateGroup}
          onDelete={handleDeleteGroup}
        />
      )}
    </div>
  );
};

export default GroupList;
