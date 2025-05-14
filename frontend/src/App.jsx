import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import GroupList from "./pages/GroupList";
import Acceuil from "./pages/Acceuil";
import GroupDetail from "./pages/GroupDetail";
import Navbar from "./components/Navbar.jsx";
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Acceuil />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/groups" element={<GroupList />} />
          <Route
            path="/groups/:id"
            element={
                <GroupDetail />

            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
