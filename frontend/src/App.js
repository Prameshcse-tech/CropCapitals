import React, { useEffect, useState, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import ProjectManagement from './components/ProjectManagement';
import CreateProject from './components/CreateProject';
import ProjectAnalytics from './components/ProjectAnalytics';
import AdminPanel from './components/AdminPanel';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_URL } from './config';
// import './styles/styles.css'

// Protected Route for Admin Only
const AdminRoute = ({ user, component: Component }) => {
  if (!user || user.role !== 'admin') {
    return <AdminPanel user={user} />;
  }
  return <Component user={user} />;
};

function AppContent() {
  const [user, setUser] = useState(null);
  const { isDark } = useContext(ThemeContext);

  useEffect(() => {
    axios.get(`${API_URL}/api/user`, { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(err => console.error("Error fetching user:", err));
  }, []);

  const appStyle = {
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    color: isDark ? '#e0e0e0' : '#000000',
    minHeight: '100vh',
    transition: 'background-color 0.3s, color 0.3s'
  };

  return (
    <div style={appStyle}>
      <Router>
        <Navbar user={user} setUser={setUser} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/projectlist" element={<ProjectList user={user} />} />
          <Route path="/project/:id" element={<ProjectDetail user={user} />} />
          <Route path="/project-management" element={<ProjectManagement user={user} />} />
          <Route path="/create-project" element={<CreateProject user={user} />} />
          <Route path="/project-analytics/:projectId" element={<ProjectAnalytics />} />
          <Route path="/admin" element={<AdminPanel user={user} />} />
        </Routes>
      </Router>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
