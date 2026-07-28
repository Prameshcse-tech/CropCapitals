import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import AlertBox from './AlertBox';
import { API_URL } from '../config';

export default function Register({ setUser }) {
    const { isDark } = useContext(ThemeContext);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'investor'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('All fields are required');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        if (!formData.email.includes('@')) {
            setError('Please enter a valid email');
            return false;
        }
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) return;

        setLoading(true);
        axios.post(`${API_URL}/api/register`, {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role
        }, { withCredentials: true })
            .then(res => {
                if (res.data.success) {
                    setSuccess('Registration successful! Logging you in...');
                    setUser(res.data.user);
                    setTimeout(() => navigate('/dashboard'), 2000);
                } else {
                    setError(res.data.message || 'Registration failed');
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.response?.data?.message || 'Registration failed. Please try again.');
                setLoading(false);
            });
    };

    return (
        <Container className="py-5" style={{
            maxWidth: "500px",
            color: isDark ? '#e0e0e0' : '#000'
        }}>
            <Card className="shadow-lg border-0" style={{
                backgroundColor: isDark ? '#2a2a2a' : '#fff',
                color: isDark ? '#e0e0e0' : '#000'
            }}>
                <Card.Body className="p-4">
                    <h2 className="text-success fw-bold mb-2">Create Account</h2>
                    <p style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="mb-4">
                        Join Crop Capitals and start investing in agriculture
                    </p>

                    {error && <AlertBox type="error" message={error} onClose={() => setError('')} autoClose={false} />}
                    {success && <AlertBox type="success" message={success} onClose={() => setSuccess('')} duration={3000} />}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                style={{
                                    backgroundColor: isDark ? '#1a1a1a' : '#fff',
                                    color: isDark ? '#e0e0e0' : '#000',
                                    borderColor: isDark ? '#444' : '#ddd'
                                }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                style={{
                                    backgroundColor: isDark ? '#1a1a1a' : '#fff',
                                    color: isDark ? '#e0e0e0' : '#000',
                                    borderColor: isDark ? '#444' : '#ddd'
                                }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                placeholder="At least 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                style={{
                                    backgroundColor: isDark ? '#1a1a1a' : '#fff',
                                    color: isDark ? '#e0e0e0' : '#000',
                                    borderColor: isDark ? '#444' : '#ddd'
                                }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                placeholder="Re-enter your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                style={{
                                    backgroundColor: isDark ? '#1a1a1a' : '#fff',
                                    color: isDark ? '#e0e0e0' : '#000',
                                    borderColor: isDark ? '#444' : '#ddd'
                                }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>👤 Account Type</Form.Label>
                            <Form.Select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                style={{
                                    backgroundColor: isDark ? '#1a1a1a' : '#fff',
                                    color: isDark ? '#e0e0e0' : '#000',
                                    borderColor: isDark ? '#444' : '#ddd'
                                }}
                            >
                                <option value="investor">🤑 Investor - Invest in agricultural projects</option>
                                <option value="farmer">🌾 Farmer - Create and manage projects</option>
                            </Form.Select>
                            <small className="text-muted mt-2 d-block">
                                👉 Farmers can create projects after verification by admin
                            </small>
                        </Form.Group>

                        <Button
                            type="submit"
                            variant="success"
                            className="w-100 mb-3"
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </Form>

                    <div className="text-center">
                        <p style={{ color: isDark ? '#b0b0b0' : '#6c757d' }}>
                            Already have an account? <Link to="/login" className="text-success fw-bold">Login</Link>
                        </p>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}
