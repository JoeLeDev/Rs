import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={{ padding: "1rem", backgroundColor: "#f0f0f0", display: "flex", justifyContent: "space-between" }}>
      <Link to="/" style={{ marginRight: "1rem" }}>
        Accueil
      </Link>

      {isAuthenticated ? (
        <>
          <Link to="/dashboard" style={{ marginRight: "1rem" }}>
            Dashboard
          </Link>
          <Link
            to="/profile"
            style={{
              marginRight: "1rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            
            {user?.imageUrl && (
              <img
                src={`http://localhost:5001/${user.imageUrl}`}
                alt="avatar"
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginLeft: "0.5rem",
                  border: "1px solid #aaa",
                }}
              />
            )}
          </Link>
          <button onClick={handleLogout} style={{ marginLeft: "1rem" }}>
            Déconnexion
          </button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ marginRight: "1rem" }}>
            Connexion
          </Link>
          <Link to="/register">Inscription</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
