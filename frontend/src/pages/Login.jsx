import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/login", { email, password });
      const { token, user } = res.data;

      // Stocker le token localement
      localStorage.setItem("token", token);
      console.log("Connecté en tant que :", user);

       navigate('/dashboard');

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de la connexion");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", paddingTop: "4rem" }}>
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Se connecter
        </button>
      </form>
    </div>
  );
};

export default Login;
