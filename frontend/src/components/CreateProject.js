import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import AlertBox from './AlertBox';
import { API_URL } from '../config';

export default function CreateProject({ user }) {
    const navigate = useNavigate();
    const { isDark } = useContext(ThemeContext);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
    const [formData, setFormData] = useState({
        name: '',
        goal: '',
        funded: '',
        description: '',
        status: 'open'
    });
    const [imageFile, setImageFile] = useState(null);

    // Check if user is a farmer
    if (user && user.role !== 'farmer') {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={6}>
                        <Card className={`text-center p-5 ${isDark ? 'bg-dark border-secondary' : 'bg-light'}`}>
                            <h3 className="mb-3">🚫 Access Denied</h3>
                            <p className={isDark ? 'text-light' : 'text-muted'}>
                                Only farmers can create projects. Please register as a farmer to create agricultural projects.
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const validateForm = () => {
        if (!formData.name || !formData.goal) {
            setAlert({ show: true, type: 'error', message: 'Project name and goal are required' });
            return false;
        }
        if (formData.goal <= 0) {
            setAlert({ show: true, type: 'error', message: 'Goal must be greater than 0' });
            return false;
        }
        if (formData.funded && formData.funded < 0) {
            setAlert({ show: true, type: 'error', message: 'Funded amount cannot be negative' });
            return false;
        }
        if (formData.funded > formData.goal) {
            setAlert({ show: true, type: 'error', message: 'Funded amount cannot exceed the goal' });
            return false;
        }
        if (formData.name.length < 3) {
            setAlert({ show: true, type: 'error', message: 'Project name must be at least 3 characters' });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const form = new FormData();
            form.append('name', formData.name);
            form.append('goal', parseFloat(formData.goal));
            form.append('funded', formData.funded ? parseFloat(formData.funded) : 0);
            form.append('description', formData.description || '');
            form.append('status', formData.status || 'open');
            if (imageFile) {
                form.append('image', imageFile);
            }

            await axios.post(
                `${API_URL}/api/projects`,
                form,
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );

            setAlert({ show: true, type: 'success', message: '✓ Project created successfully!' });
            setTimeout(() => {
                navigate('/project-management');
            }, 2000);
        } catch (err) {
            setAlert({
                show: true,
                type: 'error',
                message: err.response?.data?.message || 'Failed to create project'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <h2 className="p-5 text-center">Please login</h2>;

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

            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card
                        style={{
                            backgroundColor: isDark ? '#2a2a2a' : '#fff',
                            color: isDark ? '#e0e0e0' : '#000',
                            borderColor: isDark ? '#444' : '#ddd'
                        }}
                    >
                        <Card.Body className="p-5">
                            <h2 className="text-success mb-4 fw-bold">🌾 Create New Project</h2>

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Project Name *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g., Organic Mango Orchard"
                                        style={{
                                            backgroundColor: isDark ? '#1a1a1a' : '#fff',
                                            color: isDark ? '#e0e0e0' : '#000',
                                            borderColor: isDark ? '#444' : '#ddd'
                                        }}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Funding Goal (₹) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="goal"
                                        value={formData.goal}
                                        onChange={handleChange}
                                        placeholder="e.g., 50000"
                                        min="1000"
                                        step="1000"
                                        style={{
                                            backgroundColor: isDark ? '#1a1a1a' : '#fff',
                                            color: isDark ? '#e0e0e0' : '#000',
                                            borderColor: isDark ? '#444' : '#ddd'
                                        }}
                                        required
                                    />
                                    <Form.Text className="text-muted">Minimum ₹1000</Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Initial Funded Amount (₹)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="funded"
                                        value={formData.funded}
                                        onChange={handleChange}
                                        placeholder="e.g., 10000"
                                        min="0"
                                        step="1000"
                                        style={{
                                            backgroundColor: isDark ? '#1a1a1a' : '#fff',
                                            color: isDark ? '#e0e0e0' : '#000',
                                            borderColor: isDark ? '#444' : '#ddd'
                                        }}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Describe your project, farming methods, expected returns, and timeline..."
                                        style={{
                                            backgroundColor: isDark ? '#1a1a1a' : '#fff',
                                            color: isDark ? '#e0e0e0' : '#000',
                                            borderColor: isDark ? '#444' : '#ddd'
                                        }}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Project Image</Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{
                                            backgroundColor: isDark ? '#1a1a1a' : '#fff',
                                            color: isDark ? '#e0e0e0' : '#000',
                                            borderColor: isDark ? '#444' : '#ddd'
                                        }}
                                    />
                                    <Form.Text className="text-muted">Upload an image file. It will be stored in S3 and the public URL will be saved in the database.</Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Status</Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        style={{
                                            backgroundColor: isDark ? '#1a1a1a' : '#fff',
                                            color: isDark ? '#e0e0e0' : '#000',
                                            borderColor: isDark ? '#444' : '#ddd'
                                        }}
                                    >
                                        <option value="open">🟢 Open for Investment</option>
                                        <option value="in-progress">🟡 In Progress</option>
                                        <option value="completed">🟢 Completed</option>
                                    </Form.Select>
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button
                                        variant="success"
                                        size="lg"
                                        type="submit"
                                        disabled={loading}
                                        className="fw-bold"
                                    >
                                        {loading ? '⏳ Creating...' : '✓ Create Project'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
