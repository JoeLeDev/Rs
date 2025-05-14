import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-blue-700">
        My ICC Online
      </Link>

      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
              Accueil
            </Link>
            <Link to="/groups" className="text-gray-700 hover:text-blue-600">
              Groupes
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-700 hover:text-blue-600">
              Connexion
            </Link>
            <Link to="/register" className="text-gray-700 hover:text-blue-600">
              Inscription
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
