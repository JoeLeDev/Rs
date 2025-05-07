import { useState, useEffect, useContext } from "react";
import API from "./Api";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";


// Composant pour afficher la liste des groupes
const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const { user } = useContext(AuthContext);

  const isAdmin = ["admin", "admin_groupe"].includes(user?.role);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await API.get("/groups");
        setGroups(res.data);
      } catch (err) {
        console.error("Erreur chargement groupes", err);
      }
    };

    fetchGroups();
  }, []);

  const handleCreateGroup = async () => {
    try {
      await API.post("/groups", form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setShowModal(false);
      setForm({ name: "", description: "" });
      const res = await API.get("/groups");
      setGroups(res.data);
    } catch (err) {
      console.error("Erreur création groupe", err);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Tous les groupes</h2>

      {isAdmin && (
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button onClick={() => setShowModal(true)}>+ Créer un groupe</button>
        </div>
      )}

      {groups.length === 0 ? (
        <p style={{ textAlign: "center" }}>Aucun groupe trouvé.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
{groups.map((group) => (
  <Link
    to={`/groups/${group.groupId}`}
    key={group.groupId}
    style={{ textDecoration: "none", color: "inherit" }}
  >
    <div style={{
      padding: "1.5rem",
      border: "1px solid #ddd",
      borderRadius: "var(--radius)",
      boxShadow: "var(--shadow)",
      backgroundColor: "#fff",
      transition: "0.2s",
      cursor: "pointer"
    }}>
      <h3>{group.name}</h3>
      <p>{group.description}</p>
      <p style={{ color: "blue", marginTop: "1rem" }}>Voir le groupe →</p>
    </div>
  </Link>
))}
        </div>
      )}

      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{
            backgroundColor: "#fff", padding: "2rem", borderRadius: "var(--radius)", width: "400px"
          }}>
            <h3>Créer un groupe</h3>
            <input
              placeholder="Nom"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
            />
            <div style={{ marginTop: "1rem" }}>
              <button onClick={handleCreateGroup}>Créer</button>
              <button onClick={() => setShowModal(false)} style={{ marginLeft: "1rem" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
