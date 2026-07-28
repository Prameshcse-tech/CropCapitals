import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Navbar, Nav, Button, Container, Dropdown } from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext';
import { API_URL } from '../config';

export default function Navigation({ user, setUser }) {
    const { isDark, toggleTheme } = useContext(ThemeContext);

    const logout = () => {
        axios.get(`${API_URL}/api/logout`, { withCredentials: true })
            .then(() => setUser(null));
    };

    return (
        <Navbar bg={isDark ? "dark" : "success"} variant={isDark ? "dark" : "dark"} expand="lg" className="shadow-sm" style={{ backgroundColor: isDark ? '#2a2a2a' : '#28a745' }}>
            <Container>
                <Navbar.Brand className="fw-bold">
                    🌾 Farm Investment
                </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse>
                    <Nav className="me-auto">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/about" className="nav-link">About Us</Link>

                        {user && user.role === 'farmer' && (
                            <>
                                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                                <Link to="/projectlist" className="nav-link">Projects</Link>
                                <Link to="/project-management" className="nav-link">My Projects</Link>
                            </>
                        )}

                        {user && user.role === 'investor' && (
                            <>
                                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                                <Link to="/projectlist" className="nav-link">Projects</Link>
                            </>
                        )}

                        {user && user.role === 'admin' && (
                            <>
                                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                                <Link to="/projectlist" className="nav-link">Projects</Link>
                                {/* <Link to="/project-management" className="nav-link">My Projects</Link> */}
                                <Link to="/admin" className="nav-link">Admin</Link>
                            </>
                        )}

                        {!user && <Link to="/admin" className="nav-link">Admin</Link>}
                    </Nav>
                    <Nav className="d-flex align-items-center gap-2">
                        <Button
                            variant="outline-light"
                            onClick={toggleTheme}
                            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            className="d-flex align-items-center gap-1"
                        >
                            {isDark ? "☀️ Light" : "🌙 Dark"}
                        </Button>
                        {user ? (
                            <>
                                <Dropdown>
                                    <Dropdown.Toggle variant="info" id="userDropdown" className="d-flex align-items-center gap-2">
                                        {user.role === 'farmer' && '🌾'}
                                        {user.role === 'investor' && '🤑'}
                                        {user.role === 'admin' && '👑'}
                                        {user.name}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu align="end" style={{
                                        backgroundColor: isDark ? '#1a1a1a' : '#fff',
                                        color: isDark ? '#e0e0e0' : '#000'
                                    }}>
                                        <Dropdown.Header>
                                            Role: {user.role === 'farmer' && '🌾 Farmer'}
                                            {user.role === 'investor' && '🤑 Investor'}
                                            {user.role === 'admin' && '👑 Administrator'}
                                        </Dropdown.Header>
                                        <Dropdown.Divider />
                                        <Link to="/profile" className="dropdown-item">
                                            ⚙️ My Profile
                                        </Link>
                                        {user.role === 'farmer' && (
                                            <Link to="/project-management" className="dropdown-item">
                                                📋 My Projects
                                            </Link>
                                        )}
                                        {user.role === 'admin' && (
                                            <>
                                                <Link to="/admin" className="dropdown-item">
                                                    👑 Admin Dashboard
                                                </Link>
                                            </>
                                        )}
                                        <Dropdown.Divider />
                                        <Dropdown.Item onClick={logout}>
                                            🚪 Logout
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-warning">Login</Link>
                                <Link to="/register" className="btn btn-light">Sign Up</Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
