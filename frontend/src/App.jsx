import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Groups from './pages/Groups';
import Events from './pages/Events';
import Messages from './pages/Messages';
import Home from './pages/Home';
import GroupDetail from './pages/GroupDetail';


const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/groups' element={<Groups />} />
        <Route path='/events' element={<Events />} />
        <Route path='/messages' element={<Messages />} />
        <Route path="/groups/:id" element={<GroupDetail />} />
        <Route path='*' element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  );
};

export default App;