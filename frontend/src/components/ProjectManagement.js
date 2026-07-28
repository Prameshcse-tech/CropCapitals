import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Badge, Modal, Form } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import AlertBox from './AlertBox';
import { API_URL } from '../config';

export default function ProjectManagement({ user }) {
    const navigate = useNavigate();
    const { isDark } = useContext(ThemeContext);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: '', description: '', status: 'open' });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        fetchProjects();
    }, [user, navigate]);

    const fetchProjects = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/user-projects`, {
                withCredentials: true
            });
            setProjects(response.data);
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Failed to load projects' });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await axios.delete(`${API_URL}/api/projects/${projectId}`, {
                    withCredentials: true
                });
                setProjects(projects.filter(p => p.id !== projectId));
                setAlert({ show: true, type: 'success', message: 'Project deleted successfully' });
            } catch (err) {
                setAlert({ show: true, type: 'error', message: 'Failed to delete project' });
            }
        }
    };

    const handleEditClick = (project) => {
        setEditingProject(project);
        setEditFormData({
            name: project.name,
            description: project.description,
            status: project.status
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async () => {
        try {
            const response = await axios.put(
                `${API_URL}/api/projects/${editingProject.id}`,
                editFormData,
                { withCredentials: true }
            );
            setProjects(projects.map(p => p.id === editingProject.id ? response.data.project : p));
            setShowEditModal(false);
            setAlert({ show: true, type: 'success', message: 'Project updated successfully' });
        } catch (err) {
            setAlert({ show: true, type: 'error', message: 'Failed to update project' });
        }
    };

    if (!user) return <h2 className="p-5 text-center">Please login</h2>;

    // Check if user is a farmer
    if (user.role !== 'farmer') {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={6}>
                        <Card className={`text-center p-5 ${isDark ? 'bg-dark border-secondary' : 'bg-light'}`}>
                            <h3 className="mb-3">🚫 Access Denied</h3>
                            <p className={isDark ? 'text-light' : 'text-muted'}>
                                Only farmers can manage projects. This feature is exclusively for farmers to create and manage agricultural projects.
                            </p>
                            <Button variant="primary" onClick={() => navigate('/projectlist')} className="mt-3">
                                Browse Projects
                            </Button>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

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
        <Container className="py-5">
            {alert.show && (
                <AlertBox
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert({ ...alert, show: false })}
                    autoClose={alert.type === 'success'}
                    duration={4000}
                />
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-success fw-bold mb-0" style={{ color: isDark ? '#2ECC71' : '#28a745' }}>
                    📊 Your Projects
                </h2>
                <Link to="/create-project">
                    <Button variant="success" className="d-flex align-items-center gap-2">
                        ➕ New Project
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-5">Loading...</div>
            ) : projects.length === 0 ? (
                <Card className="text-center p-5" style={{ backgroundColor: isDark ? '#2a2a2a' : '#f8f9fa' }}>
                    <h5>No projects created yet</h5>
                    <p className="text-muted">Create your first agricultural project and start attracting investors!</p>
                    <Link to="/create-project">
                        <Button variant="success">Create Project</Button>
                    </Link>
                </Card>
            ) : (
                <Row>
                    {projects.map(project => (
                        <Col md={6} lg={4} key={project.id} className="mb-4">
                            <Card
                                style={{
                                    backgroundColor: isDark ? '#2a2a2a' : '#fff',
                                    color: isDark ? '#e0e0e0' : '#000',
                                    borderColor: isDark ? '#444' : '#ddd',
                                    height: '100%'
                                }}
                            >
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="card-title mb-0">{project.name}</h5>
                                        <Badge bg={getStatusBadge(project.status)}>{project.status}</Badge>
                                    </div>
                                    <p className="text-muted small mb-2">{project.description?.substring(0, 60)}...</p>

                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between mb-1 small">
                                            <span>Goal</span>
                                            <span className="fw-bold">₹{parseFloat(project.goal).toLocaleString()}</span>
                                        </div>
                                        <div className="progress">
                                            <div
                                                className="progress-bar bg-success"
                                                style={{ width: `${project.fundingPercent || 0}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="row g-2 mb-3 small">
                                        <div className="col-6">
                                            <span className="text-muted">Funded: </span>
                                            <span className="fw-bold text-success">₹{parseFloat(project.funded).toLocaleString()}</span>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted">Investors: </span>
                                            <span className="fw-bold">{project.investorCount || 0}</span>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="outline-info"
                                            size="sm"
                                            className="flex-grow-1"
                                            as={Link}
                                            to={`/project-analytics/${project.id}`}
                                        >
                                            📈 Analytics
                                        </Button>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="flex-grow-1"
                                            onClick={() => handleEditClick(project)}
                                        >
                                            ✏️ Edit
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="flex-grow-1"
                                            onClick={() => handleDelete(project.id)}
                                        >
                                            🗑️ Delete
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Edit Project Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header
                    closeButton
                    style={{
                        backgroundColor: isDark ? '#2a2a2a' : '#f8f9fa',
                        borderColor: isDark ? '#444' : '#ddd',
                        color: isDark ? '#e0e0e0' : '#000'
                    }}
                >
                    <Modal.Title>Edit Project</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: isDark ? '#1a1a1a' : '#fff', color: isDark ? '#e0e0e0' : '#000' }}>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Project Name</Form.Label>
                            <Form.Control
                                value={editFormData.name}
                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                style={{
                                    backgroundColor: isDark ? '#2a2a2a' : '#fff',
                                    color: isDark ? '#e0e0e0' : '#000',
                                    borderColor: isDark ? '#444' : '#ddd'
                                }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={editFormData.description}
                                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                style={{
                                    backgroundColor: isDark ? '#2a2a2a' : '#fff',
                                    color: isDark ? '#e0e0e0' : '#000',
                                    borderColor: isDark ? '#444' : '#ddd'
                                }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                value={editFormData.status}
                                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                style={{
                                    backgroundColor: isDark ? '#2a2a2a' : '#fff',
                                    color: isDark ? '#e0e0e0' : '#000',
                                    borderColor: isDark ? '#444' : '#ddd'
                                }}
                            >
                                <option value="open">Open</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="closed">Closed</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: isDark ? '#2a2a2a' : '#f8f9fa', borderColor: isDark ? '#444' : '#ddd' }}>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleEditSubmit}>
                        Update Project
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
