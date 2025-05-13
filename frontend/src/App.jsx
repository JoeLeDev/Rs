import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import GroupList from "./pages/GroupList";
import Acceuil from "./pages/Acceuil";

function App() {
  return (
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
      <Route
        path="/groups"
        element={
            <GroupList />
        }
      />
    </Routes>
  );
}

export default App;
