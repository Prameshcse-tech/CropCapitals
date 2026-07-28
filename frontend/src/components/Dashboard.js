import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Container, ListGroup, Card, Row, Col, Badge } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import { ThemeContext } from '../context/ThemeContext';
import { DashboardSkeleton } from './Skeletons';
import { API_URL } from '../config';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement);

export default function Dashboard({ user }) {
    const { isDark } = useContext(ThemeContext);
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(true);
            axios.get(`${API_URL}/api/investments`, { withCredentials: true })
                .then(res => {
                    setInvestments(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching investments:", err);
                    setLoading(false);
                });
        }
    }, [user]);

    if (!user) return <h2 className="p-5 text-center text-danger">Please login to view your dashboard</h2>;

    if (loading) {
        return (
            <Container className="py-5">
                <DashboardSkeleton />
            </Container>
        );
    }

    const labels = investments.map(inv => inv.projectname || 'Unknown Project');
    const amounts = investments.map(inv => inv.amount);

    const barData = {
        labels,
        datasets: [
            {
                label: 'Investment Amount (₹)',
                data: amounts,
                backgroundColor: 'rgba(46, 204, 113, 0.7)',
                borderRadius: 6,
                borderColor: isDark ? '#444' : '#ddd'
            }
        ]
    };

    const pieData = {
        labels,
        datasets: [
            {
                data: amounts,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#2ECC71', '#9B59B6',
                    '#F39C12', '#E67E22', '#1ABC9C', '#34495E', '#E74C3C'
                ]
            }
        ]
    };

    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: isDark ? '#e0e0e0' : '#000'
                }
            },
            tooltip: {
                titleColor: isDark ? '#e0e0e0' : '#000',
                bodyColor: isDark ? '#e0e0e0' : '#000'
            }
        },
        scales: {
            x: {
                ticks: { color: isDark ? '#e0e0e0' : '#000' },
                grid: { color: isDark ? '#444' : '#e0e0e0' }
            },
            y: {
                ticks: { color: isDark ? '#e0e0e0' : '#000' },
                grid: { color: isDark ? '#444' : '#e0e0e0' }
            }
        }
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                position: 'right',
                labels: {
                    color: isDark ? '#e0e0e0' : '#000',
                    font: { size: 12 },
                    padding: 15,
                    usePointStyle: true
                }
            },
            tooltip: {
                titleColor: isDark ? '#e0e0e0' : '#000',
                bodyColor: isDark ? '#e0e0e0' : '#000',
                callbacks: {
                    label: function (context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                        return context.label + ': ₹' + context.parsed + ' (' + percentage + '%)';
                    }
                }
            }
        }
    };

    return (
        <Container className="py-5">
            <Card className="shadow-lg border-0 p-4 mb-4" style={{
                borderRadius: '15px',
                backgroundColor: isDark ? '#2a2a2a' : '#fff',
                color: isDark ? '#e0e0e0' : '#000'
            }}>
                <h2 className="text-success fw-bold mb-2">Welcome, {user.name}</h2>
                <p style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="mb-0">Here's a quick overview of your investments</p>
            </Card>

            {investments.length > 0 ? (
                <>
                    <Card className="shadow-sm p-3 mb-4" style={{
                        borderRadius: '10px',
                        backgroundColor: isDark ? '#2a2a2a' : '#fff',
                        color: isDark ? '#e0e0e0' : '#000'
                    }}>
                        <h4 className="mb-3 text-primary">Your Investments</h4>
                        <ListGroup variant="flush">
                            {investments.map((inv, index) => (
                                <ListGroup.Item
                                    key={index}
                                    className="d-flex justify-content-between align-items-center"
                                    style={{
                                        backgroundColor: isDark ? '#1a1a1a' : '#fff',
                                        color: isDark ? '#e0e0e0' : '#000',
                                        borderColor: isDark ? '#444' : '#ddd'
                                    }}
                                >
                                    <span>{inv.projectname || 'Unknown Project'}</span>
                                    <Badge bg="success" pill>₹{inv.amount}</Badge>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>

                    <Row>
                        <Col md={6} className="mb-4">
                            <Card className="p-3 shadow-sm" style={{
                                borderRadius: '10px',
                                backgroundColor: isDark ? '#2a2a2a' : '#fff',
                                color: isDark ? '#e0e0e0' : '#000'
                            }}>
                                <h5 className="text-center mb-3">Investment Amount by Project</h5>
                                <Bar data={barData} options={{ ...barChartOptions, plugins: { legend: { display: false } } }} />
                            </Card>
                        </Col>
                        <Col md={6} className="mb-4">
                            <Card className="p-3 shadow-sm" style={{
                                borderRadius: '10px',
                                backgroundColor: isDark ? '#2a2a2a' : '#fff',
                                color: isDark ? '#e0e0e0' : '#000'
                            }}>
                                <h5 className="text-center mb-3">Investment Distribution</h5>
                                <Pie data={pieData} options={pieChartOptions} />
                            </Card>
                        </Col>
                    </Row>
                </>
            ) : (
                <Card className="shadow-sm p-4 text-center" style={{
                    borderRadius: '10px',
                    backgroundColor: isDark ? '#2a2a2a' : '#fff',
                    color: isDark ? '#e0e0e0' : '#000'
                }}>
                    <p style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="mb-0">💡 You haven't made any investments yet. Start exploring projects!</p>
                </Card>
            )}
        </Container>
    );
}
