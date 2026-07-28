import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Form, ProgressBar, Badge, ListGroup, Alert } from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext';
import 'animate.css';
import { API_URL } from '../config';

export default function ProjectDetail({ user }) {
  const { isDark } = useContext(ThemeContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/projects`, { withCredentials: true })
      .then(res => {
        const foundProject = res.data.find(p => p.id === parseInt(id));
        setProject(foundProject);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load project details");
        setLoading(false);
      });
  }, [id]);

  // Mock farmer data - can be extended with real API data
  const farmerData = {
    name: "Farmer Rajesh Kumar",
    experience: "15 years",
    location: "Punjab, India",
    certifications: ["Organic Certified", "Sustainable Farming"],
    successRate: "95%"
  };

  // Mock milestones data
  const milestones = [
    { month: 1, title: "Land Preparation", status: "completed" },
    { month: 2, title: "Seed Sowing", status: "completed" },
    { month: 4, title: "Growth Phase", status: "in-progress" },
    { month: 6, title: "Harvest", status: "pending" },
    { month: 8, title: "Processing", status: "pending" },
    { month: 10, title: "Returns Distribution", status: "pending" }
  ];

  const investInProject = () => {
    if (!investmentAmount || investmentAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    axios.post(`${API_URL}/api/invest`,
      { projectId: parseInt(id), amount: parseFloat(investmentAmount) },
      { withCredentials: true }
    ).then(() => {
      alert(`You invested ₹${investmentAmount}`);
      setInvestmentAmount("");
      // Refresh project data
      axios.get(`${API_URL}/api/projects`, { withCredentials: true })
        .then(res => {
          const foundProject = res.data.find(p => p.id === parseInt(id));
          setProject(foundProject);
        });
    }).catch(err => {
      alert("Investment failed. Please try again.");
    });
  };

  if (loading) {
    return <Container className="py-5 text-center"><p>Loading project details...</p></Container>;
  }

  if (error || !project) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || "Project not found"}</Alert>
        <Button variant="primary" onClick={() => navigate('/projectlist')}>
          Back to Projects
        </Button>
      </Container>
    );
  }

  const fundingPercentage = (project.funded / project.goal) * 100;
  const remainingAmount = project.goal - project.funded;

  return (
    <Container className="py-5">
      {/* Back Button */}
      <Button variant="outline-secondary" className="mb-4" onClick={() => navigate('/projectlist')}>
        ← Back to Projects
      </Button>

      {/* Project Header */}
      <Row className="mb-5">
        <Col lg={8}>
          <div className="animate__animated animate__fadeInLeft">
            <img
              src={project.image || "https://via.placeholder.com/600x400"}
              alt={project.name}
              style={{ width: "100%", borderRadius: "15px", height: "400px", objectFit: "cover", marginBottom: "20px" }}
            />
            <h1 className="text-success fw-bold mb-2" style={{ color: '#2ECC71' }}>{project.name}</h1>
            <p style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="lead">{project.description}</p>
          </div>
        </Col>

        {/* Investment Card */}
        <Col lg={4}>
          <Card className="shadow-lg border-0 p-4 animate__animated animate__fadeInRight" style={{
            borderRadius: "15px",
            position: "sticky",
            top: "20px",
            backgroundColor: isDark ? '#2a2a2a' : '#fff',
            color: isDark ? '#e0e0e0' : '#000'
          }}>
            <h5 className="text-success fw-bold mb-4">💰 Investment Summary</h5>

            {/* Funding Progress */}
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="fw-bold">Funding Progress</span>
                <Badge bg="success">{fundingPercentage.toFixed(1)}%</Badge>
              </div>
              <ProgressBar now={fundingPercentage} variant="success" style={{ height: "25px" }} />
            </div>

            {/* Amount Details */}
            <ListGroup variant="flush" className="mb-4">
              <ListGroup.Item
                className="d-flex justify-content-between px-0"
                style={{
                  backgroundColor: isDark ? '#2a2a2a' : '#fff',
                  color: isDark ? '#e0e0e0' : '#000',
                  borderColor: isDark ? '#444' : '#ddd'
                }}
              >
                <span>Target Goal:</span>
                <strong className="text-success">₹{project.goal.toLocaleString()}</strong>
              </ListGroup.Item>
              <ListGroup.Item
                className="d-flex justify-content-between px-0"
                style={{
                  backgroundColor: isDark ? '#2a2a2a' : '#fff',
                  color: isDark ? '#e0e0e0' : '#000',
                  borderColor: isDark ? '#444' : '#ddd'
                }}
              >
                <span>Amount Funded:</span>
                <strong className="text-primary">₹{project.funded.toLocaleString()}</strong>
              </ListGroup.Item>
              <ListGroup.Item
                className="d-flex justify-content-between px-0"
                style={{
                  backgroundColor: isDark ? '#2a2a2a' : '#fff',
                  color: isDark ? '#e0e0e0' : '#000',
                  borderColor: isDark ? '#444' : '#ddd'
                }}
              >
                <span>Remaining:</span>
                <strong className="text-warning">₹{remainingAmount.toLocaleString()}</strong>
              </ListGroup.Item>
            </ListGroup>

            {fundingPercentage < 100 ? (
              <>
                <style>{`
                  input::placeholder {
                    color: ${isDark ? '#888' : '#999'} !important;
                    opacity: 1 !important;
                  }
                `}</style>
                <Form.Control
                  type="number"
                  placeholder="Enter investment amount (₹)"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="mb-3"
                  min="1"
                  style={{
                    backgroundColor: isDark ? '#1a1a1a' : '#fff',
                    color: isDark ? '#e0e0e0' : '#000',
                    borderColor: isDark ? '#444' : '#ddd'
                  }}
                />
                <Button
                  variant="success"
                  size="lg"
                  className="w-100 fw-bold"
                  onClick={investInProject}
                  disabled={!user}
                >
                  {user ? "🌾 Invest Now" : "Login to Invest"}
                </Button>
                {!user && <p style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="text-muted small mt-2">Please login to invest in this project.</p>}
              </>
            ) : (
              <Alert variant="info" className="mb-0">✅ Funding Goal Reached!</Alert>
            )}
          </Card>
        </Col>
      </Row>

      {/* Project Details Tabs */}
      <Row className="mb-5">
        <Col lg={8}>
          {/* Farmer Information */}
          <Card className="shadow-sm border-0 mb-4 p-4" style={{
            borderRadius: "15px",
            backgroundColor: isDark ? '#2a2a2a' : '#fff',
            color: isDark ? '#e0e0e0' : '#000'
          }}>
            <h4 className="text-success fw-bold mb-4">👨‍🌾 Farmer Information</h4>
            <Row>
              <Col md={6} className="mb-3">
                <div className="mb-3">
                  <small style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="text-muted">Name</small>
                  <p className="fw-bold">{farmerData.name}</p>
                </div>
                <div className="mb-3">
                  <small style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="text-muted">Location</small>
                  <p className="fw-bold">{farmerData.location}</p>
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="mb-3">
                  <small style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="text-muted">Experience</small>
                  <p className="fw-bold">{farmerData.experience}</p>
                </div>
                <div className="mb-3">
                  <small style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="text-muted">Success Rate</small>
                  <p className="fw-bold text-success">{farmerData.successRate}</p>
                </div>
              </Col>
            </Row>
            <div className="mb-3">
              <small style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="text-muted">Certifications</small>
              <div className="mt-2">
                {farmerData.certifications.map((cert, idx) => (
                  <Badge key={idx} bg="success" className="me-2 mb-2 p-2">
                    ✓ {cert}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* Project Timeline */}
          <Card className="shadow-sm border-0 mb-4 p-4" style={{
            borderRadius: "15px",
            backgroundColor: isDark ? '#2a2a2a' : '#fff',
            color: isDark ? '#e0e0e0' : '#000'
          }}>
            <h4 className="text-success fw-bold mb-4">📅 Project Timeline</h4>
            <div className="timeline">
              {milestones.map((milestone, idx) => (
                <div key={idx} className="d-flex mb-4">
                  <div className="me-3 text-center" style={{ minWidth: "50px" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: milestone.status === "completed" ? "#2ECC71" : milestone.status === "in-progress" ? "#F39C12" : "#BDC3C7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold"
                      }}
                    >
                      {milestone.status === "completed" && "✓"}
                      {milestone.status === "in-progress" && "●"}
                      {milestone.status === "pending" && "○"}
                    </div>
                  </div>
                  <div>
                    <p className="fw-bold mb-0">{milestone.title}</p>
                    <small style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="text-muted">Month {milestone.month}</small>
                    <Badge bg={milestone.status === "completed" ? "success" : milestone.status === "in-progress" ? "warning" : "secondary"} className="ms-2">
                      {milestone.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Key Stats */}
          <Card className="shadow-sm border-0 p-4" style={{
            borderRadius: "15px",
            backgroundColor: isDark ? '#2a2a2a' : '#fff',
            color: isDark ? '#e0e0e0' : '#000'
          }}>
            <h4 className="text-success fw-bold mb-4">📊 Key Statistics</h4>
            <Row>
              <Col md={4} className="text-center mb-3">
                <div className="p-3 rounded" style={{ backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }}>
                  <p style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="text-muted small mb-1">Est. Duration</p>
                  <h5 className="text-success fw-bold">10 Months</h5>
                </div>
              </Col>
              <Col md={4} className="text-center mb-3">
                <div className="p-3 rounded" style={{ backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }}>
                  <p style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="text-muted small mb-1">Expected ROI</p>
                  <h5 className="text-success fw-bold">12-15%</h5>
                </div>
              </Col>
              <Col md={4} className="text-center mb-3">
                <div className="p-3 rounded" style={{ backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }}>
                  <p style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="text-muted small mb-1">Risk Level</p>
                  <h5 className="text-warning fw-bold">Low</h5>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Frequently Asked Questions */}
        <Col lg={4}>
          <Card className="shadow-sm border-0 p-4" style={{
            borderRadius: "15px",
            backgroundColor: isDark ? '#2a2a2a' : '#fff',
            color: isDark ? '#e0e0e0' : '#000'
          }}>
            <h5 className="text-success fw-bold mb-4">❓ FAQ</h5>
            <div className="mb-4">
              <p style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="fw-bold small text-muted mb-2">How often are returns distributed?</p>
              <p style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="text-muted small">Returns are typically distributed annually after harvest season.</p>
            </div>
            <div className="mb-4">
              <p style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="fw-bold small text-muted mb-2">What if the harvest fails?</p>
              <p style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="text-muted small">We have crop insurance to cover failures. Your investment is protected.</p>
            </div>
            <div className="mb-4">
              <p style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="fw-bold small text-muted mb-2">Can I withdraw anytime?</p>
              <p style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="text-muted small">Investments are locked for the project duration for stability.</p>
            </div>
            <div>
              <p style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="fw-bold small text-muted mb-2">How is equipment maintained?</p>
              <p style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="text-muted small">All equipment is regularly maintained and updated yearly.</p>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
