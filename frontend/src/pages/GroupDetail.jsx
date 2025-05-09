import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import API from "./Api";

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    meetingDay: "",
  });

  const fetchGroup = async () => {
    try {
      const res = await API.get(`/groups/${id}`);
      setGroup(res.data);
      setEditForm({
        name: res.data.name,
        description: res.data.description,
        meetingDay: res.data.meetingDay,
      });
      setLoading(false);
    } catch (err) {
      console.error("Erreur chargement du groupe :", err);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [id]);

  const [isMember, setIsMember] = useState(false);
  console.log("🧑‍💻 user dans le contexte :", user);
  useEffect(() => {
    if (group && user) {
      console.log("🧩 group.members :", group.members);
      console.log("🙋‍♂️ user.id :", user.id);
  
      const isMember = group.members.some(
        (m) => (typeof m === "object" ? m._id?.toString() : m) === user?._id
      );
  
      console.log("✅ Calcul de isMember :", isMember);
      setIsMember(isMember);
    }
  }, [group, user]);

  const isOwnerOrAdmin =
    group?.createdBy === user?.id ||
    ["admin", "admin_groupe"].includes(user?.role);

    const handleToggleMembership = async () => {
      try {
        const route = isMember ? "leave" : "join";
        await API.patch(
          `/groups/${id}/${route}`,
          {},
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
    
        const res = await API.get(`/groups/${id}`);
        console.log("📦 Nouvelle data du groupe après PATCH :", res.data);
        setGroup(res.data); 
    
        setMessage(
          !isMember
            ? "Vous avez rejoint le groupe."
            : "Vous avez quitté le groupe."
        );
    
        setTimeout(() => setMessage(""), 3000);
      } catch (err) {
        if (err.response?.status === 400) {
          setMessage(err.response.data.message);
        } else {
          setMessage("Une erreur est survenue.");
        }
      }
    };

  const handleUpdate = async () => {
    try {
      await API.patch(`/groups/${group.groupId}`, editForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setShowModal(false);
      fetchGroup();
    } catch (err) {
      console.error("❌ Erreur updateGroup :", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    try {
      await API.delete(`/groups/${group.groupId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      navigate("/groups");
    } catch (err) {
      console.error("❌ Erreur deleteGroup :", err);
    }
  };

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "4rem" }}>Chargement...</p>
    );

  return (
    <div style={{ maxWidth: "800px", margin: "4rem auto", padding: "2rem" }}>
      {isOwnerOrAdmin && (
        <div style={{ textAlign: "right", marginBottom: "1rem" }}>
          <button onClick={() => setShowModal(true)}>⚙️ Gérer le groupe</button>
        </div>
      )}

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "var(--radius)",
          padding: "2rem",
          boxShadow: "var(--shadow)",
          border: "1px solid #eee",
        }}
      >
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>{group.name}</h1>
        <p style={{ color: "#555", lineHeight: 1.6 }}>{group.description}</p>

        <hr style={{ margin: "2rem 0" }} />

        <h3 style={{ marginBottom: "1rem" }}>👥 Membres du groupe :</h3>
        {group.members.length === 0 ? (
          <p style={{ color: "#999" }}>Aucun membre pour le moment.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {group.members.map(
              (member) => (
                <li
                  key={member._id}
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {member.username || member.email}
                </li>
              )
            )}
          </ul>
        )}

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <button
            onClick={handleToggleMembership}
            style={{
              backgroundColor: isMember ? "#aaa" : "var(--primary)",
              color: "#fff",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "var(--radius)",
              cursor: "pointer",
            }}
          >
            {isMember ? "Quitter le groupe" : "Rejoindre le groupe"}
          </button>

          {message && (
            <p style={{ marginTop: "1rem", color: "green" }}>{message}</p>
          )}
        </div>
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "var(--radius)",
              width: "500px",
            }}
          >
            <h3>📝 Modifier le groupe</h3>
            <input
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              placeholder="Nom"
              style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
            />
            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              placeholder="Description"
              rows={3}
              style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
            />
            <select
              value={editForm.meetingDay}
              onChange={(e) =>
                setEditForm({ ...editForm, meetingDay: e.target.value })
              }
              style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
            >
              <option value="">-- Jour de réunion --</option>
              <option value="lundi">Lundi</option>
              <option value="mardi">Mardi</option>
              <option value="mercredi">Mercredi</option>
              <option value="jeudi">Jeudi</option>
              <option value="vendredi">Vendredi</option>
              <option value="samedi">Samedi</option>
              <option value="dimanche">Dimanche</option>
            </select>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                onClick={handleUpdate}
                disabled={!editForm.meetingDay}
                style={{
                  backgroundColor: !editForm.meetingDay ? "#ccc" : "green",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  cursor: !editForm.meetingDay ? "not-allowed" : "pointer",
                }}
              >
                Enregistrer
              </button>

              <button
                onClick={handleDelete}
                style={{
                  backgroundColor: "crimson",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                }}
              >
                Supprimer le groupe
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              style={{ marginTop: "1rem" }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;
