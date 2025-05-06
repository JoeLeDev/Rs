import { useState, useEffect } from "react";
import API from "./Api";

const Groups = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await API.get("/groups"); // à implémenter côté backend
        setGroups(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des groupes", err);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div className="card">
      <h2>Mes Groupes</h2>
      {groups.length === 0 ? (
        <p>Aucun groupe trouvé.</p>
      ) : (
        <ul>
          {groups.map((group) => (
            <li key={group._id}>{group.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Groups;
