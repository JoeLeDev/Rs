import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const GroupMembers = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupRes = await API.get(`/groups/${id}`);
        setGroup(groupRes.data);

        const membersRes = await API.get(`/groups/${id}/members`);
        setMembers(membersRes.data);

        // Vérification d'autorisation (admin ou pilote)
        const isPilot = groupRes.data.roles?.some(
          (r) =>
            r.role === "pilote" &&
            (r.userId === user.id || r.userId?._id === user.id)
        );
        if (user.role !== "admin" && !isPilot) {
          toast.error("Accès refusé");
          navigate(`/groups/${id}`);
        }
      } catch (err) {
        toast.error("Erreur lors du chargement");
        navigate("/groups");
      }
    };
    fetchData();
  }, [id, user]);

  const handleChangeRole = async (memberId, newRole) => {
    try {
      await API.patch(`/groups/${id}/roles`, { memberId, role: newRole });

      setMembers((prev) =>
        prev.map((m) => (m._id === memberId ? { ...m, role: newRole } : m))
      );

      toast.success("Rôle mis à jour");
    } catch (err) {
      toast.error("Erreur de mise à jour du rôle");
    }
  };

  const handleRemove = async (memberId) => {
    if (memberId === user.id)
      return toast.error("Tu ne peux pas te retirer toi-même");

    const confirmed = window.confirm("Supprimer ce membre du groupe ?");
    if (!confirmed) return;

    try {
      await API.patch(`/groups/${id}/leave`, { userId: memberId }); // À adapter selon ta logique
      toast.success("Membre retiré");
      const membersRes = await API.get(`/groups/${id}/members`);
      setMembers(membersRes.data);
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (!group) return <p>Chargement...</p>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">
        Membres du groupe : {group.name}
      </h1>
      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Nom</th>
            <th className="p-2">Email</th>
            <th className="p-2">Rôle</th>
            <th className="p-2">Date d'adhésion</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m._id} className="border-t">
              <td className="p-2">{m.username}</td>
              <td className="p-2">{m.email}</td>
              <td className="p-2">
                <select
                  value={m.role}
                  onChange={(e) => handleChangeRole(m._id, e.target.value)}
                  className="border px-2 py-1 rounded"
                >
                  <option value="membre">Membre</option>
                  <option value="pilote">Pilote</option>
                </select>
              </td>
              <td className="p-2">
                {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "N/A"}
              </td>
              <td className="p-2">
                {user.role !== "admin" && (
                  <button
                    onClick={() => handleRemove(m._id)}
                    className="text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupMembers;
