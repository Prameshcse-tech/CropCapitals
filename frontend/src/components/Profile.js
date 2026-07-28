import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Card, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import AlertBox from './AlertBox';
import { API_URL } from '../config';

export default function Profile({ user, setUser }) {
    const { isDark } = useContext(ThemeContext);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
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
    };

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.currentPassword) {
            setError('Current password is required to update profile');
            return;
        }

        setLoading(true);
        axios.post(`${API_URL}/api/update-profile`, {
            name: formData.name,
            email: formData.email,
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword || undefined
        }, { withCredentials: true })
            .then(res => {
                if (res.data.success) {
                    setUser(res.data.user);
                    setSuccess('Profile updated successfully!');
                    setFormData(prev => ({
                        ...prev,
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                    }));
                    setTimeout(() => setEditMode(false), 1500);
                } else {
                    setError(res.data.message || 'Update failed');
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.response?.data?.message || 'Update failed');
                setLoading(false);
            });
    };

    if (!user) {
        return (
            <Container className="py-5 text-center">
                <h2 className="text-danger">Please login to view your profile</h2>
                <Button onClick={() => navigate('/login')} variant="success" className="mt-3">
                    Go to Login
                </Button>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="shadow-lg border-0" style={{
                        borderRadius: '15px',
                        backgroundColor: isDark ? '#2a2a2a' : '#fff',
                        color: isDark ? '#e0e0e0' : '#000'
                    }}>
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h2 className="text-success fw-bold mb-0">👤 My Profile</h2>
                                <Button
                                    variant={editMode ? 'secondary' : 'outline-success'}
                                    onClick={() => setEditMode(!editMode)}
                                >
                                    {editMode ? 'Cancel' : 'Edit Profile'}
                                </Button>
                            </div>

                            {error && <AlertBox type="error" message={error} onClose={() => setError('')} autoClose={false} />}
                            {success && <AlertBox type="success" message={success} onClose={() => setSuccess('')} duration={3000} />}

                            {!editMode ? (
                                <div>
                                    <div className="mb-4">
                                        <h5 className="text-muted mb-2">Full Name</h5>
                                        <p className="fs-5 fw-bold">{user.name}</p>
                                    </div>

                                    <div className="mb-4">
                                        <h5 className="text-muted mb-2">Email Address</h5>
                                        <p className="fs-5">{user.email}</p>
                                    </div>

                                    <div className="mb-4">
                                        <h5 className="text-muted mb-2">📋 Account Role</h5>
                                        <div>
                                            <Badge bg={user.role === 'farmer' ? 'warning' : user.role === 'admin' ? 'danger' : 'info'} className="p-2">
                                                {user.role === 'farmer' && '🌾 Farmer'}
                                                {user.role === 'investor' && '🤑 Investor'}
                                                {user.role === 'admin' && '👑 Administrator'}
                                            </Badge>
                                            {user.role === 'farmer' && user.verified && (
                                                <Badge bg="success" className="ms-2 p-2">✓ Verified</Badge>
                                            )}
                                            {user.role === 'farmer' && !user.verified && (
                                                <Badge bg="secondary" className="ms-2 p-2">⏳ Pending Verification</Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h5 className="text-muted mb-2">Account Status</h5>
                                        <Badge bg="success" className="p-2">✓ Active</Badge>
                                    </div>

                                    <div>
                                        <h5 className="text-muted mb-2">Member Since</h5>
                                        <p className="text-muted">{new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ) : (
                                <Form onSubmit={handleUpdateProfile}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Full Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="name"
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
                                            value={formData.email}
                                            onChange={handleChange}
                                            style={{
                                                backgroundColor: isDark ? '#1a1a1a' : '#fff',
                                                color: isDark ? '#e0e0e0' : '#000',
                                                borderColor: isDark ? '#444' : '#ddd'
                                            }}
                                        />
                                    </Form.Group>

                                    <hr />

                                    <h5 className="mb-3">Change Password (Optional)</h5>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Current Password *</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="currentPassword"
                                            placeholder="Required to make changes"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            style={{
                                                backgroundColor: isDark ? '#1a1a1a' : '#fff',
                                                color: isDark ? '#e0e0e0' : '#000',
                                                borderColor: isDark ? '#444' : '#ddd'
                                            }}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>New Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="newPassword"
                                            placeholder="Leave blank to keep current password"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            style={{
                                                backgroundColor: isDark ? '#1a1a1a' : '#fff',
                                                color: isDark ? '#e0e0e0' : '#000',
                                                borderColor: isDark ? '#444' : '#ddd'
                                            }}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Confirm New Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="Confirm new password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            style={{
                                                backgroundColor: isDark ? '#1a1a1a' : '#fff',
                                                color: isDark ? '#e0e0e0' : '#000',
                                                borderColor: isDark ? '#444' : '#ddd'
                                            }}
                                        />
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        variant="success"
                                        className="w-100"
                                        disabled={loading}
                                    >
                                        {loading ? 'Updating...' : 'Save Changes'}
                                    </Button>
                                </Form>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
