import { useState, useEffect, useContext } from "react";
import API from "./Api";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const days = [
  "Tous",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [filter, setFilter] = useState("all"); // all, mine, available
  const [day, setDay] = useState("Tous");
  const [filteredGroups, setFilteredGroups] = useState([]);
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

  useEffect(() => {
    let result = [...groups];

    if (filter === "mine") {
      result = result.filter((g) => g.members.some((m) => m._id === user.id));
    } else if (filter === "available") {
      result = result.filter((g) => !g.members.some((m) => m._id === user.id));
    }

    if (day !== "Tous") {
      result = result.filter((g) => g.meetingDay === day);
    }

    setFilteredGroups(result);
  }, [groups, filter, day, user.id]);

  const getDynamicTitle = () => {
    const groupLabel = filter === "mine" ? "Mes groupes" :
                       filter === "available" ? "Groupes disponibles" :
                       "Tous les groupes";
  
    const dayLabel = day !== "Tous" ? ` du ${day}` : "";
  
    return groupLabel + dayLabel;
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>
        {getDynamicTitle()}
      </h2>

      {/* 🔍 Filtres */}
      <div
        style={{
          width: "100%",
          maxWidth: "fit-content",
          minHeight: "50px",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow)",
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          transition: "0.2s",
          cursor: "pointer",
          textAlign: "left",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        <select   style={{ width: "auto", borderRadius: "12px", }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Tous les groupes</option>
          <option value="mine">Mes groupes</option>
          <option value="available">Groupes disponibles</option>
        </select>

        <select style={{ width: "auto" , borderRadius: "12px",}} value={day} onChange={(e) => setDay(e.target.value)}>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* ➕ Admin : création */}
      {isAdmin && (
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button onClick={() => setShowModal(true)}>+ Créer un groupe</button>
        </div>
      )}

      {/* 🧱 Cartes */}
      {filteredGroups.length === 0 ? (
        <p style={{ textAlign: "center" }}>Aucun groupe trouvé.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1.5rem",
            justifyContent: "center"
          }}
        >
          {filteredGroups.map((group) => (
            <Link
              to={`/groups/${group.groupId}`}
              key={group.groupId}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  padding: "1.5rem",
                  border: "1px solid #ddd",
                  borderRadius: "var(--radius)",
                  boxShadow: "var(--shadow)",
                  backgroundColor: "#fff",
                  transition: "0.2s",
                  cursor: "pointer",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                    {group.name}
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: "#666" }}>
                    {group.description.slice(0, 60)}...
                  </p>
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    marginTop: "1rem",
                    color: "#555",
                  }}
                >
                  📅 {group.meetingDay || "Jour non défini"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Groups;
