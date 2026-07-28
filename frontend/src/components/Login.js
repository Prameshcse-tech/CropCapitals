import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Container, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { API_URL } from '../config';

export default function Login({ setUser }) {
    const { isDark } = useContext(ThemeContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const submit = (e) => {
        e.preventDefault();
        axios.post(`${API_URL}/api/login`, { email, password }, { withCredentials: true })
            .then(res => {
                if (res.data.success) {
                    setUser(res.data.user);
                    navigate('/dashboard');
                } else {
                    alert(res.data.message);
                }
            });
    };

    return (
        <Container className="py-5" style={{
            maxWidth: "500px",
            color: isDark ? '#e0e0e0' : '#000'
        }}>
            <h2 className="text-success fw-bold mb-4">Login</h2>
            <Form onSubmit={submit}>
                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        onChange={(e) => setEmail(e.target.value)}
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
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            backgroundColor: isDark ? '#1a1a1a' : '#fff',
                            color: isDark ? '#e0e0e0' : '#000',
                            borderColor: isDark ? '#444' : '#ddd'
                        }}
                    />
                </Form.Group>
                <Button type="submit" variant="success">Login</Button>
            </Form>
        </Container>
    );
}
