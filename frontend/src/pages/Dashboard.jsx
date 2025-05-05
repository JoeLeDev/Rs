import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Users, Calendar, Mail, User } from "lucide-react";
import { Link } from "react-router-dom";


const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const linkStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: "1rem",
    textDecoration: "none",
    color: "inherit",
    fontWeight: 500
  };
  
  const iconStyle = {
    marginRight: "0.5rem"
  };
    const cardStyle = {
        padding: "1rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",
        marginBottom: "1rem"
    };
    
  return (
    <div className="card">
      <h2>Bienvenue {user?.username} 👋</h2>
      <p>Voici ton tableau de bord.</p>

      <ul style={{ listStyle: "none", padding: 0 }}>
  <li>
    <Link to="/groups" style={linkStyle}>
      <Users style={iconStyle} /> Mes groupes
    </Link>
  </li>
  <li>
    <Link to="/events" style={linkStyle}>
      <Calendar style={iconStyle} /> Mes événements
    </Link>
  </li>
  <li>
    <Link to="/messages" style={linkStyle}>
      <Mail style={iconStyle} /> Ma messagerie
    </Link>
  </li>
  <li>
    <Link to="/profile" style={linkStyle}>
      <User style={iconStyle} /> Mon profil
    </Link>
  </li>
</ul>
    </div>
  );
};

export default Dashboard;
