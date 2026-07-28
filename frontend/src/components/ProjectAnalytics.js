import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Badge, Table, ProgressBar } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { API_URL } from '../config';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ProjectAnalytics() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { isDark } = useContext(ThemeContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjectAnalytics();
    }, [projectId]);

    const fetchProjectAnalytics = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/api/projects/${projectId}/analytics`,
                { withCredentials: true }
            );
            setData(response.data);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            navigate('/project-management');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-5 text-center">Loading...</div>;
    if (!data) return <div className="p-5 text-center">Project not found</div>;

    const { project, investors } = data;

    // Chart colors
    const chartBgColor = isDark ? '#2a2a2a' : '#fff';
    const chartTextColor = isDark ? '#e0e0e0' : '#000';
    const chartGridColor = isDark ? '#444' : '#ddd';

    // Doughnut chart data
    const fundingChartData = {
        labels: ['Funded', 'Remaining'],
        datasets: [
            {
                data: [project.funded, Math.max(0, project.goal - project.funded)],
                backgroundColor: ['#28a745', isDark ? '#444' : '#e0e0e0'],
                borderColor: [chartBgColor, chartBgColor],
                borderWidth: 2
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                labels: { color: chartTextColor, font: { size: 14 } }
            }
        }
    };

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
            <div className="mb-4">
                <h2 className="text-success fw-bold mb-3" style={{ color: isDark ? '#2ECC71' : '#28a745' }}>
                    📈 Project Analytics
                </h2>
                <h4>{project.name}</h4>
            </div>

            {/* Project Info Cards */}
            <Row className="mb-4">
                <Col md={3} className="mb-3">
                    <Card style={{ backgroundColor: isDark ? '#2a2a2a' : '#fff', color: isDark ? '#e0e0e0' : '#000' }}>
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-2">Status</h6>
                            <Badge bg={getStatusBadge(project.status)} className="p-2">
                                {project.status}
                            </Badge>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card style={{ backgroundColor: isDark ? '#2a2a2a' : '#fff', color: isDark ? '#e0e0e0' : '#000' }}>
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-2">Funding Goal</h6>
                            <h4 className="text-success fw-bold">₹{project.goal.toLocaleString()}</h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card style={{ backgroundColor: isDark ? '#2a2a2a' : '#fff', color: isDark ? '#e0e0e0' : '#000' }}>
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-2">Total Funded</h6>
                            <h4 className="text-info fw-bold">₹{project.funded.toLocaleString()}</h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card style={{ backgroundColor: isDark ? '#2a2a2a' : '#fff', color: isDark ? '#e0e0e0' : '#000' }}>
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-2">Total Investors</h6>
                            <h4 className="text-warning fw-bold">{project.investorCount}</h4>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Funding Progress */}
            <Row className="mb-4">
                <Col md={12}>
                    <Card style={{ backgroundColor: isDark ? '#2a2a2a' : '#fff', color: isDark ? '#e0e0e0' : '#000' }}>
                        <Card.Body>
                            <h5 className="mb-3">Funding Progress</h5>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Progress</span>
                                    <span className="fw-bold text-success">{project.fundingPercent.toFixed(1)}%</span>
                                </div>
                                <ProgressBar
                                    now={project.fundingPercent}
                                    variant="success"
                                    style={{ height: '25px' }}
                                />
                            </div>
                            <div className="row text-center">
                                <div className="col-md-4">
                                    <small className="text-muted">Funded</small>
                                    <h6 className="text-success">₹{project.funded.toLocaleString()}</h6>
                                </div>
                                <div className="col-md-4">
                                    <small className="text-muted">Remaining</small>
                                    <h6 className="text-warning">₹{Math.max(0, project.goal - project.funded).toLocaleString()}</h6>
                                </div>
                                <div className="col-md-4">
                                    <small className="text-muted">Goal</small>
                                    <h6 className="text-info">₹{project.goal.toLocaleString()}</h6>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row className="mb-4">
                <Col md={6}>
                    <Card style={{ backgroundColor: isDark ? '#2a2a2a' : '#fff', color: isDark ? '#e0e0e0' : '#000' }}>
                        <Card.Body>
                            <h5 className="mb-3">Funding Distribution</h5>
                            <Doughnut data={fundingChartData} options={chartOptions} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card style={{ backgroundColor: isDark ? '#2a2a2a' : '#fff', color: isDark ? '#e0e0e0' : '#000' }}>
                        <Card.Body>
                            <h5 className="mb-3">Project Details</h5>
                            <div className="mb-3">
                                <p className="mb-2"><strong>Creator:</strong> {project.creatorName}</p>
                                <p className="mb-2"><strong>Email:</strong> {project.creatorEmail}</p>
                                <p className="mb-2"><strong>Created:</strong> {new Date(project.created_at).toLocaleDateString()}</p>
                                <p className="mb-0"><strong>Description:</strong></p>
                                <p className="text-muted">{project.description}</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Investors Table */}
            <Row>
                <Col md={12}>
                    <Card style={{ backgroundColor: isDark ? '#2a2a2a' : '#fff', color: isDark ? '#e0e0e0' : '#000' }}>
                        <Card.Body>
                            <h5 className="mb-3">💰 Top Investors ({investors.length} total)</h5>
                            {investors.length === 0 ? (
                                <p className="text-muted text-center py-4">No investors yet</p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <Table hover style={{ color: isDark ? '#e0e0e0' : '#000' }}>
                                        <thead>
                                            <tr style={{ borderColor: isDark ? '#444' : '#ddd' }}>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Total Invested</th>
                                                <th>Investments Count</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {investors.map((investor, idx) => (
                                                <tr key={investor.id} style={{ borderColor: isDark ? '#444' : '#ddd' }}>
                                                    <td>{idx + 1}</td>
                                                    <td>{investor.name}</td>
                                                    <td>{investor.email}</td>
                                                    <td className="fw-bold text-success">
                                                        ₹{investor.totalInvested.toLocaleString()}
                                                    </td>
                                                    <td>{investor.investmentCount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
