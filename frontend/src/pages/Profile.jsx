import { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import API from "./Api";

const Profile = () => {
  const { user, login } = useContext(AuthContext);

  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState(user?.username || "");

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await API.patch("/auth/update", { username ,email, password });
      login(res.data.user, localStorage.getItem("token")); // maj contexte
      setMessage("✅ Profil mis à jour");
      setPassword("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur lors de la mise à jour");
    }
  };

  if (!user) return <p style={{ padding: "2rem" }}>Aucun utilisateur connecté.</p>;

  return (
    <div style={{ maxWidth: 500, margin: "auto", paddingTop: "4rem" }}>
      <h2>Profil utilisateur</h2>
      <ul>
        <li><strong>Nom d'utilisateur :</strong> {user.username}</li>
        <li><strong>Email actuel :</strong> {user.email}</li>
      </ul>


      <h3 style={{ marginTop: "2rem" }}>Modifier mes infos</h3>
        <form onSubmit={handleUpdate}>
            <div style={{ marginBottom: "1rem" }}>
                <label>Nom d'utilisateur</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ width: "100%", padding: "0.5rem" }}
                />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Nouvel email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Nouveau mot de passe</label>
          <input
            type="password"
            placeholder="Laisse vide pour ne pas changer"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        {message && <p>{message}</p>}
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Mettre à jour
        </button>
      </form>
    </div>
  );
};

export default Profile;
