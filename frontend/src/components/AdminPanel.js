import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Badge, Table, Tabs, Tab, Button, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AlertBox from './AlertBox';
import { API_URL } from '../config';

export default function AdminPanel({ user }) {
    const navigate = useNavigate();
    const { isDark } = useContext(ThemeContext);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState('');

    const fetchData = async () => {
        try {
            console.log('📊 Fetching admin data...');
            const [projectsRes, usersRes] = await Promise.all([
                axios.get(`${API_URL}/api/admin/projects`, { withCredentials: true }),
                axios.get(`${API_URL}/api/admin/users`, { withCredentials: true })
            ]);
            console.log('✅ Projects:', projectsRes.data);
            console.log('✅ Users:', usersRes.data);
            setProjects(projectsRes.data || []);
            setUsers(usersRes.data || []);
        } catch (err) {
            console.error('❌ Failed to fetch admin data:', err.response?.data || err.message);
            setAlert({ show: true, type: 'error', message: err.response?.data?.message || 'Failed to fetch admin data - ' + err.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Check if user is admin
    if (!user) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={6}>
                        <Card className={`text-center p-5 ${isDark ? 'bg-dark border-secondary' : 'bg-light'}`}>
                            <h3 className="mb-3">🔐 Access Denied</h3>
                            <p className={isDark ? 'text-light' : 'text-muted'}>
                                Please login to access the admin panel.
                            </p>
                            <Button variant="primary" onClick={() => navigate('/login')} className="mt-3">
                                Go to Login
                            </Button>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (user.role !== 'admin') {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={6}>
                        <Card className={`text-center p-5 ${isDark ? 'bg-dark border-secondary' : 'bg-light'}`}>
                            <h3 className="mb-3">🚫 Access Denied</h3>
                            <p className={isDark ? 'text-light' : 'text-muted'}>
                                Only administrators can access this page. Admin privileges are required to manage users and projects.
                            </p>
                            <Button variant="primary" onClick={() => navigate('/')} className="mt-3">
                                Back to Home
                            </Button>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    const handleChangeRole = (u) => {
        setSelectedUser(u);
        setNewRole(u.role);
        setShowRoleModal(true);
    };

    const confirmRoleChange = async () => {
        try {
            const res = await axios.post(
                `${API_URL}/api/admin/users/${selectedUser.id}/role`,
                { newRole },
                { withCredentials: true }
            );
            setUsers(users.map(u => u.id === selectedUser.id ? res.data.user : u));
            setAlert({ show: true, type: 'success', message: `✓ Role changed to ${newRole}` });
            setShowRoleModal(false);
            setSelectedUser(null);
        } catch (err) {
            setAlert({ show: true, type: 'error', message: err.response?.data?.message || 'Failed to change role' });
        }
    };

    const verifyFarmer = async (userId) => {
        try {
            const res = await axios.post(
                `${API_URL}/api/admin/users/${userId}/verify`,
                {},
                { withCredentials: true }
            );
            setUsers(users.map(u => u.id === userId ? res.data.user : u));
            setAlert({ show: true, type: 'success', message: '✓ Farmer verified successfully' });
        } catch (err) {
            setAlert({ show: true, type: 'error', message: err.response?.data?.message || 'Failed to verify farmer' });
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(
                `${API_URL}/api/admin/users/${userId}`,
                { withCredentials: true }
            );
            setUsers(users.filter(u => u.id !== userId));
            setAlert({ show: true, type: 'success', message: '✓ User deleted successfully' });
        } catch (err) {
            setAlert({ show: true, type: 'error', message: err.response?.data?.message || 'Failed to delete user' });
        }
    };

    const getRoleBadge = (role) => {
        if (role === 'farmer') return <Badge bg="warning">🌾 Farmer</Badge>;
        if (role === 'investor') return <Badge bg="info">🤑 Investor</Badge>;
        if (role === 'admin') return <Badge bg="danger">👑 Admin</Badge>;
        return <Badge bg="secondary">{role}</Badge>;
    };

    const calculateStats = () => {
        const totalProjects = projects.length;
        const totalUsers = users.length;
        const totalFunded = projects.reduce((sum, p) => sum + parseFloat(p.funded || 0), 0);
        const totalGoal = projects.reduce((sum, p) => sum + parseFloat(p.goal || 0), 0);
        const totalInvestments = projects.reduce((sum, p) => sum + parseInt(p.investorCount || 0), 0);

        return { totalProjects, totalUsers, totalFunded, totalGoal, totalInvestments };
    };

    if (loading) return <div className="p-5 text-center">Loading...</div>;

    const stats = calculateStats();

    // Prepare chart data
    const projectsChartData = projects.slice(0, 10).map(p => ({
        name: p.name.substring(0, 10),
        funded: parseFloat(p.funded),
        goal: parseFloat(p.goal)
    }));

    const statusChartData = [
        { name: 'Open', value: projects.filter(p => p.status === 'open').length },
        { name: 'In Progress', value: projects.filter(p => p.status === 'in-progress').length },
        { name: 'Completed', value: projects.filter(p => p.status === 'completed').length },
        { name: 'Closed', value: projects.filter(p => p.status === 'closed').length }
    ].filter(item => item.value > 0);

    const COLORS = ['#28a745', '#ffc107', '#17a2b8', '#dc3545'];

    const getStatusBadge = (status) => {
        const variants = {
            'open': 'success',
            'in-progress': 'warning',
            'completed': 'info',
            'closed': 'danger'
        };
        return variants[status] || 'secondary';
    };

    return (
        <Container fluid className="py-5">
            <h2 className="text-success fw-bold mb-4" style={{ color: isDark ? '#2ECC71' : '#28a745' }}>
                👑 Admin Dashboard
            </h2>

            {alert.show && (
                <AlertBox
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert({ ...alert, show: false })}
                    autoClose={alert.type === 'success'}
                    duration={4000}
                />
            )}

            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4" fill>
                {/* Overview Tab */}
                <Tab eventKey="overview" title="📊 Overview">
                    <Row className="mb-4">
                        <Col md={3} className="mb-3">
                            <Card style={{ backgroundColor: isDark ? '#2a2a2a' : '#fff', color: isDark ? '#e0e0e0' : '#000' }}>
                                <Card.Body className="text-center">
                                    <h6 className="text-muted mb-2">Total Projects</h6>
                                    <h3 className="text-success fw-bold">{stats.totalProjects}</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} className="mb-3">
                            <Card style={{ backgroundColor: isDark ? '#2a2a2a' : '#fff', color: isDark ? '#e0e0e0' : '#000' }}>
                                <Card.Body className="text-center">
                                    <h6 className="text-muted mb-2">Total Users</h6>
                                    <h3 className="text-info fw-bold">{stats.totalUsers}</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} className="mb-3">
                            <Card style={{ backgroundColor: isDark ? '#2a2a2a' : '#fff', color: isDark ? '#e0e0e0' : '#000' }}>
                                <Card.Body className="text-center">
                                    <h6 className="text-muted mb-2">Total Funded</h6>
                                    <h3 className="text-warning fw-bold">₹{(stats.totalFunded / 100000).toFixed(1)}L</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} className="mb-3">
                            <Card style={{ backgroundColor: isDark ? '#2a2a2a' : '#fff', color: isDark ? '#e0e0e0' : '#000' }}>
                                <Card.Body className="text-center">
                                    <h6 className="text-muted mb-2">Total Investments</h6>
                                    <h3 className="text-primary fw-bold">{stats.totalInvestments}</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6} className="mb-4">
                            <Card style={{ backgroundColor: isDark ? '#2a2a2a' : '#fff', color: isDark ? '#e0e0e0' : '#000' }}>
                                <Card.Body>
                                    <h5 className="mb-3">Project Status Distribution</h5>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie data={statusChartData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                                                {statusChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6} className="mb-4">
                            <Card style={{ backgroundColor: isDark ? '#2a2a2a' : '#fff', color: isDark ? '#e0e0e0' : '#000' }}>
                                <Card.Body>
                                    <h5 className="mb-3">Top Projects by Goal</h5>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={projectsChartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#ddd'} />
                                            <XAxis dataKey="name" stroke={isDark ? '#e0e0e0' : '#000'} />
                                            <YAxis stroke={isDark ? '#e0e0e0' : '#000'} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="goal" fill="#28a745" />
                                            <Bar dataKey="funded" fill="#17a2b8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>

                {/* Projects Tab */}
                <Tab eventKey="projects" title="🌾 All Projects">
                    <Card style={{ backgroundColor: isDark ? '#2a2a2a' : '#fff', color: isDark ? '#e0e0e0' : '#000' }}>
                        <Card.Body>
                            <div style={{ overflowX: 'auto' }}>
                                <Table hover style={{ color: isDark ? '#e0e0e0' : '#000' }}>
                                    <thead>
                                        <tr style={{ borderColor: isDark ? '#444' : '#ddd' }}>
                                            <th>#</th>
                                            <th>Project Name</th>
                                            <th>Creator</th>
                                            <th>Status</th>
                                            <th>Goal</th>
                                            <th>Funded</th>
                                            <th>Investors</th>
                                            <th>Progress</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {projects.map((project, idx) => (
                                            <tr key={project.id} style={{ borderColor: isDark ? '#444' : '#ddd' }}>
                                                <td>{idx + 1}</td>
                                                <td>{project.name}</td>
                                                <td>{project.creatorName}</td>
                                                <td>
                                                    <Badge bg={getStatusBadge(project.status)}>
                                                        {project.status}
                                                    </Badge>
                                                </td>
                                                <td>₹{parseFloat(project.goal).toLocaleString()}</td>
                                                <td>₹{parseFloat(project.funded).toLocaleString()}</td>
                                                <td>{project.investorCount}</td>
                                                <td>
                                                    <div style={{ width: '100px' }}>
                                                        <div className="progress">
                                                            <div
                                                                className="progress-bar bg-success"
                                                                style={{
                                                                    width: `${Math.min((parseFloat(project.funded) / parseFloat(project.goal)) * 100, 100)}%`
                                                                }}
                                                            />
                                                        </div>
                                                        <small>{((parseFloat(project.funded) / parseFloat(project.goal)) * 100).toFixed(0)}%</small>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Tab>

                {/* Users Tab */}
                <Tab eventKey="users" title="👥 All Users">
                    <Card style={{ backgroundColor: isDark ? '#2a2a2a' : '#fff', color: isDark ? '#e0e0e0' : '#000' }}>
                        <Card.Body>
                            <div style={{ overflowX: 'auto' }}>
                                <Table hover style={{ color: isDark ? '#e0e0e0' : '#000' }}>
                                    <thead>
                                        <tr style={{ borderColor: isDark ? '#444' : '#ddd' }}>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Projects Created</th>
                                            <th>Investments</th>
                                            <th>Total Invested</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u, idx) => (
                                            <tr key={u.id} style={{ borderColor: isDark ? '#444' : '#ddd' }}>
                                                <td>{idx + 1}</td>
                                                <td>{u.name}</td>
                                                <td>{u.email}</td>
                                                <td>{getRoleBadge(u.role)}</td>
                                                <td>
                                                    {u.role === 'farmer' && u.verified && <Badge bg="success">✓ Verified</Badge>}
                                                    {u.role === 'farmer' && !u.verified && <Badge bg="secondary">⏳ Pending</Badge>}
                                                    {u.role !== 'farmer' && <Badge bg="info">Active</Badge>}
                                                </td>
                                                <td><Badge bg="info">{u.projectsCreated}</Badge></td>
                                                <td><Badge bg="primary">{u.investmentsCount}</Badge></td>
                                                <td className="fw-bold text-success">₹{parseFloat(u.totalInvested).toLocaleString()}</td>
                                                <td>
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Button
                                                            variant="warning"
                                                            size="sm"
                                                            onClick={() => handleChangeRole(u)}
                                                            title="Change role"
                                                        >
                                                            🔄
                                                        </Button>
                                                        {u.role === 'farmer' && !u.verified && (
                                                            <Button
                                                                variant="success"
                                                                size="sm"
                                                                onClick={() => verifyFarmer(u.id)}
                                                                title="Verify farmer"
                                                            >
                                                                ✓
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => deleteUser(u.id)}
                                                            title="Delete user"
                                                        >
                                                            🗑️
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>

            {/* Role Change Modal */}
            <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} style={{
                backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)'
            }}>
                <Modal.Header closeButton style={{
                    backgroundColor: isDark ? '#2a2a2a' : '#fff',
                    color: isDark ? '#e0e0e0' : '#000'
                }}>
                    <Modal.Title>Change User Role</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{
                    backgroundColor: isDark ? '#2a2a2a' : '#fff',
                    color: isDark ? '#e0e0e0' : '#000'
                }}>
                    <Form.Group className="mb-3">
                        <Form.Label>User: {selectedUser?.name} ({selectedUser?.email})</Form.Label>
                        <Form.Select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            style={{
                                backgroundColor: isDark ? '#1a1a1a' : '#fff',
                                color: isDark ? '#e0e0e0' : '#000',
                                borderColor: isDark ? '#444' : '#ddd'
                            }}
                        >
                            <option value="farmer">🌾 Farmer</option>
                            <option value="investor">🤑 Investor</option>
                            <option value="admin">👑 Admin</option>
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer style={{
                    backgroundColor: isDark ? '#2a2a2a' : '#fff'
                }}>
                    <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="success" onClick={confirmRoleChange}>
                        Change Role
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
