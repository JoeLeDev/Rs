import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Users, Calendar, MapPin, Settings } from "lucide-react";
import { toast } from "react-toastify";
import API from "../api/Axios";
import { useAuth } from "../contexts/AuthContext";
import { defineAbilityFor } from "../abilities/ability";
import ManageGroupModal from "../components/ManageModal";
import PostForm from "../components/post/PostForm";
import PostList from "../components/post/PostList";
import "react-toastify/dist/ReactToastify.css";


const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [posts, setPosts] = useState([]);

  // Vérifie si l'utilisateur est membre
  const isMember = () => {
    return group?.members?.some((m) => {
      const memberId = typeof m === "object" ? m._id?.toString() : m.toString();
      return memberId === user?._id?.toString();
    });
  };

  const isAdmin = user?.role === "admin";
  const isPilot = group?.roles?.some(
    (r) =>
      r.role === "pilote" && (r.userId === user.id || r.userId?._id === user.id)
  );

  const canManageMembers = isAdmin || isPilot;

  const fetchGroup = async () => {
    try {
      const res = await API.get(`/groups/${id}`);
      setGroup(res.data);
    } catch (err) {
      console.error("Erreur lors du fetchGroup :", err);
      setError("Groupe introuvable");
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await API.get(`/posts/group/${id}?page=1`);
      setPosts(res.data.posts);
    } catch (err) {
      console.error("Erreur lors du chargement des posts :", err);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, []);

  useEffect(() => {
    if (group?._id) {
      fetchPosts();
    }
  }, [group?._id]);

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
    const res = await API.patch(`/groups/${id}`, data);
    setGroup(res.data);
  };

  const handleDelete = async () => {
    await API.delete(`/groups/${id}`);
    toast.success("Groupe supprimé avec succès");
    navigate("/groups");
  };

  const handleOpenManageModal = async () => {
    try {
      const res = await API.get(`/groups/${id}`);
      setGroup(res.data);
      setShowModal(true);
    } catch (err) {
      toast.error("Erreur lors du chargement du groupe");
    }
  };

  if (error) return <p className="text-red-600 text-center mt-6">{error}</p>;
  if (!group) return <p className="text-center mt-6">Chargement...</p>;

  const ability = defineAbilityFor(user, group);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bannière */}
      <div
        className="bg-blue-700 text-white py-16 px-6 text-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://source.unsplash.com/1600x400/?community,people')",
        }}
      >
        <h1 className="text-4xl font-bold mb-2 drop-shadow-sm">{group.name}</h1>
        <p className="flex justify-center gap-4 text-blue-100 items-center">
          <Calendar className="w-5 h-5" /> {group.meetingDay}
          <Users className="w-5 h-5" /> {group.members?.length} membre
          {group.members?.length > 1 ? "s" : ""}
        </p>

        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          {ability.can("update", "Group") && (
            <button
              onClick={handleOpenManageModal}
              className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded hover:bg-yellow-300"
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

          {canManageMembers && (
            <Link to={`/groups/${group._id}/members`}>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                Gérer les membres
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Détails */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{group.description}</p>
        </div>

        <div className="text-gray-600 space-y-1 mb-6">
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Localisation : Non définie
          </p>
        </div>

        {isMember() && (
          <PostForm groupId={group._id} user={user} onPostCreated={fetchPosts} />
        )}

        <PostList groupId={group._id} currentUser={user} posts={posts} onDelete={fetchPosts} />
      </div>

      {showModal && (
        <ManageGroupModal
          group={group}
          members={group.members}
          onClose={() => setShowModal(false)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default GroupDetail;
