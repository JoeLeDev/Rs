import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import API from "./Api";

const GroupDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const isMember = group?.members?.some((m) => m._id === user?.id);

  const fetchGroup = async () => {
    try {
      const res = await API.get(`/groups/${id}`);
      setGroup(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Erreur chargement du groupe :", err);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [id]);

  const handleToggleMembership = async () => {
    try {
      const route = isMember ? "leave" : "join";

      await API.patch(`/groups/${id}/${route}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setMessage(isMember ? "Tu as quitté le groupe." : "Tu as rejoint le groupe !");
      fetchGroup(); // refresh des membres
    } catch (err) {
      console.error("Erreur changement de statut :", err);
      setMessage("Une erreur est survenue.");
    }

    // Effacer le message après 3 secondes
    setTimeout(() => setMessage(""), 3000);
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "4rem" }}>Chargement...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "4rem auto", padding: "2rem" }}>
      <div style={{
        backgroundColor: "#fff",
        borderRadius: "var(--radius)",
        padding: "2rem",
        boxShadow: "var(--shadow)",
        border: "1px solid #eee"
      }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>{group.name}</h1>
        <p style={{ color: "#555", lineHeight: 1.6 }}>{group.description}</p>

        <hr style={{ margin: "2rem 0" }} />

        <h3 style={{ marginBottom: "1rem" }}>👥 Membres du groupe :</h3>
        {group.members.length === 0 ? (
          <p style={{ color: "#999" }}>Aucun membre pour le moment.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {group.members.map((member) => (
              <li key={member._id} style={{
                padding: "0.5rem 0",
                borderBottom: "1px solid #eee"
              }}>
                {member.username || member.email}
              </li>
            ))}
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
              cursor: "pointer"
            }}
          >
            {isMember ? "Quitter le groupe" : "Rejoindre le groupe"}
          </button>

          {message && (
            <p style={{ marginTop: "1rem", color: "green" }}>{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
