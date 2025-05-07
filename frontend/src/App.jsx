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
import PrivateRoute from './components/PrivateRoute';


const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/dashboard' element={<PrivateRoute><Dashboard /></PrivateRoute> } />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/profile' element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path='/groups' element={<PrivateRoute><Groups /></PrivateRoute>} />
        <Route path='/events' element={<PrivateRoute><Events /></PrivateRoute>} />
        <Route path='/messages' element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/groups/:id" element={<PrivateRoute><GroupDetail /></PrivateRoute>} />
        <Route path='*' element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  );
};

export default App;