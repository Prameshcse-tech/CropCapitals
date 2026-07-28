import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Form, ProgressBar, Badge, Collapse } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { ProjectSkeleton } from './Skeletons';
import InvestmentModal from './InvestmentModal';
import AlertBox from './AlertBox';
import { API_URL } from '../config';

export default function ProjectList({ user }) {
    const navigate = useNavigate();
    const { isDark } = useContext(ThemeContext);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("name");
    const [investmentAmounts, setInvestmentAmounts] = useState({});
    const [showFilters, setShowFilters] = useState(false);
    const [refreshProjects, setRefreshProjects] = useState(0);

    // Modal and Alert states
    const [showInvestmentModal, setShowInvestmentModal] = useState(false);
    const [investmentMessage, setInvestmentMessage] = useState('');
    const [investmentAlert, setInvestmentAlert] = useState({ show: false, type: 'info', message: '' });
    const [pendingInvestment, setPendingInvestment] = useState(null);
    const [investmentLoading, setInvestmentLoading] = useState(false);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState([]);
    const [fundingStatus, setFundingStatus] = useState([]);
    const [roiRange, setRoiRange] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });

    // Helper function to extract location from project name
    const extractLocation = (name) => {
        const words = name.split(' ');
        return words[words.length - 1] || '';
    };

    // Helper function to get category from project name
    const getCategory = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('wheat') || lowerName.includes('rice') || lowerName.includes('corn') || lowerName.includes('barley') || lowerName.includes('sugar')) return 'Grain & Cereals';
        if (lowerName.includes('tomato') || lowerName.includes('onion') || lowerName.includes('potato') || lowerName.includes('carrot') || lowerName.includes('cabbage') || lowerName.includes('spinach') || lowerName.includes('lettuce') || lowerName.includes('broccoli') || lowerName.includes('beetroot')) return 'Vegetables';
        if (lowerName.includes('mango') || lowerName.includes('banana') || lowerName.includes('orange') || lowerName.includes('grape') || lowerName.includes('watermelon') || lowerName.includes('strawberry') || lowerName.includes('papaya') || lowerName.includes('guava') || lowerName.includes('pear') || lowerName.includes('peach') || lowerName.includes('kiwi') || lowerName.includes('coconut') || lowerName.includes('date') || lowerName.includes('fig') || lowerName.includes('avocado') || lowerName.includes('jackfruit') || lowerName.includes('plum') || lowerName.includes('pomegranate') || lowerName.includes('almond') || lowerName.includes('cashew') || lowerName.includes('olive')) return 'Fruits & Nuts';
        if (lowerName.includes('rose') || lowerName.includes('tulip') || lowerName.includes('lavender')) return 'Flowers';
        if (lowerName.includes('coffee') || lowerName.includes('tea') || lowerName.includes('vanilla') || lowerName.includes('chili') || lowerName.includes('mustard')) return 'Spices & Beverages';
        if (lowerName.includes('cotton') || lowerName.includes('peanut') || lowerName.includes('sunflower')) return 'Oil & Fibre';
        if (lowerName.includes('mushroom')) return 'Specialty Crops';
        return 'Other';
    };

    // Get expected ROI based on goal
    const getExpectedROI = (goal) => {
        if (goal <= 40000) return '15-18%';
        if (goal <= 70000) return '12-15%';
        return '10-12%';
    };

    const fetchProjects = () => {
        if (!user) return;

        setLoading(true);
        axios.get(`${API_URL}/api/projects`, { withCredentials: true })
            .then(res => {
                setProjects(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching projects:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProjects();
    }, [user, refreshProjects]);

    // Get unique locations
    const uniqueLocations = [...new Set(projects.map(p => extractLocation(p.name)))].sort();

    // Get unique categories
    const uniqueCategories = [...new Set(projects.map(p => getCategory(p.name)))].sort();

    const investInProject = (id) => {
        const amount = investmentAmounts[id];
        if (!amount || amount <= 0) {
            setInvestmentAlert({
                show: true,
                type: 'warning',
                message: 'Please enter a valid amount'
            });
            return;
        }

        // Find project details
        const project = projects.find(p => p.id === id);
        if (!project) return;

        // Show confirmation modal
        setPendingInvestment({ projectId: id, amount: parseFloat(amount), projectName: project.name });
        setShowInvestmentModal(true);
    };

    const confirmInvestment = () => {
        if (!pendingInvestment) return;

        setInvestmentLoading(true);
        axios.post(`${API_URL}/api/invest`,
            { projectId: pendingInvestment.projectId, amount: pendingInvestment.amount },
            { withCredentials: true }
        ).then(() => {
            setInvestmentAmounts(prev => ({ ...prev, [pendingInvestment.projectId]: "" }));
            setRefreshProjects(prev => prev + 1);
            setInvestmentAlert({
                show: true,
                type: 'success',
                message: `✓ Successfully invested ₹${pendingInvestment.amount.toLocaleString()}`
            });
            setShowInvestmentModal(false);
            setInvestmentLoading(false);
            setPendingInvestment(null);
        }).catch(err => {
            setInvestmentAlert({
                show: true,
                type: 'error',
                message: err.response?.data?.message || 'Investment failed. Please try again.'
            });
            setInvestmentLoading(false);
        });
    };

    if (!user) return <h2 className="p-5 text-center">Please login to see projects</h2>;

    // Apply all filters
    let filteredProjects = projects.filter(p => {
        const location = extractLocation(p.name);
        const category = getCategory(p.name);
        const fundingPercent = (p.funded / p.goal) * 100;

        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory.length === 0 || selectedCategory.includes(category);
        const matchesLocation = selectedLocation.length === 0 || selectedLocation.includes(location);

        const matchesFundingStatus = fundingStatus.length === 0 || fundingStatus.some(status => {
            if (status === 'not-started') return fundingPercent < 25;
            if (status === 'in-progress') return fundingPercent >= 25 && fundingPercent < 75;
            if (status === 'nearly-complete') return fundingPercent >= 75 && fundingPercent < 100;
            if (status === 'complete') return fundingPercent === 100;
            return true;
        });

        const matchesROI = roiRange.length === 0 || roiRange.some(roi => {
            if (roi === 'high') return p.goal <= 40000;
            if (roi === 'medium') return p.goal > 40000 && p.goal <= 70000;
            if (roi === 'low') return p.goal > 70000;
            return true;
        });

        const matchesPrice = p.goal >= priceRange.min && p.goal <= priceRange.max;

        return matchesSearch && matchesCategory && matchesLocation && matchesFundingStatus && matchesROI && matchesPrice;
    });

    // Sort
    filteredProjects.sort((a, b) => {
        if (sortOption === "name") return a.name.localeCompare(b.name);
        else if (sortOption === "goal") return a.goal - b.goal;
        else if (sortOption === "funded") return b.funded - a.funded;
        else if (sortOption === "progress") return (b.funded / b.goal) - (a.funded / a.goal);
        return 0;
    });

    const clearAllFilters = () => {
        setSearchTerm("");
        setSelectedCategory([]);
        setSelectedLocation([]);
        setFundingStatus([]);
        setRoiRange([]);
        setPriceRange({ min: 0, max: 100000 });
        setSortOption("name");
    };

    const hasActiveFilters = searchTerm || selectedCategory.length > 0 || selectedLocation.length > 0 ||
        fundingStatus.length > 0 || roiRange.length > 0 ||
        priceRange.min !== 0 || priceRange.max !== 100000;

    return (
        <Container className="py-5">
            <style>{`
                input::placeholder {
                    color: ${isDark ? '#888' : '#999'} !important;
                    opacity: 1 !important;
                }
                input:-ms-input-placeholder {
                    color: ${isDark ? '#888' : '#999'} !important;
                }
                input::-ms-input-placeholder {
                    color: ${isDark ? '#888' : '#999'} !important;
                }
            `}</style>

            {investmentAlert.show && (
                <AlertBox
                    type={investmentAlert.type}
                    message={investmentAlert.message}
                    onClose={() => setInvestmentAlert({ ...investmentAlert, show: false })}
                    autoClose={investmentAlert.type === 'success'}
                    duration={4000}
                />
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-success fw-bold mb-0" style={{ color: isDark ? '#2ECC71' : '#28a745' }}>Available Projects</h2>
                <Badge bg="info" pill className="p-2">{filteredProjects.length} Projects</Badge>
            </div>

            <Row className="mb-3">
                <Col>
                    <Form.Control
                        type="text"
                        placeholder="🔍 Search projects by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="shadow-sm"
                        style={{
                            backgroundColor: isDark ? '#1a1a1a' : '#fff',
                            color: isDark ? '#e0e0e0' : '#000',
                            borderColor: isDark ? '#444' : '#ddd'
                        }}
                    />
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={8}>
                    <Button
                        variant={showFilters ? "success" : "outline-success"}
                        onClick={() => setShowFilters(!showFilters)}
                        className="me-2 mb-2"
                    >
                        {showFilters ? "▼ Hide Filters" : "▶ Show Filters"}
                    </Button>
                    {hasActiveFilters && (
                        <Button
                            variant="outline-danger"
                            onClick={clearAllFilters}
                            className="mb-2"
                        >
                            ✕ Clear All Filters
                        </Button>
                    )}
                </Col>
                <Col md={4}>
                    <Form.Select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        style={{
                            backgroundColor: isDark ? '#1a1a1a' : '#fff',
                            color: isDark ? '#e0e0e0' : '#000',
                            borderColor: isDark ? '#444' : '#ddd'
                        }}
                    >
                        <option value="name">Sort by Name (A–Z)</option>
                        <option value="goal">Sort by Goal Amount (Low → High)</option>
                        <option value="funded">Sort by Funded Amount (High → Low)</option>
                        <option value="progress">Sort by Progress (High → Low)</option>
                    </Form.Select>
                </Col>
            </Row>

            <Collapse in={showFilters}>
                <Card className="mb-4 border-0 shadow-sm" style={{
                    backgroundColor: isDark ? '#2a2a2a' : '#f8f9fa',
                    color: isDark ? '#e0e0e0' : '#000'
                }}>
                    <Card.Body>
                        <Row>
                            <Col md={6} lg={3} className="mb-3">
                                <h6 className="fw-bold text-success mb-2">📁 Category</h6>
                                {uniqueCategories.map(cat => (
                                    <div key={cat} className="mb-2">
                                        <Form.Check
                                            type="checkbox"
                                            label={cat}
                                            id={`cat-${cat}`}
                                            checked={selectedCategory.includes(cat)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedCategory([...selectedCategory, cat]);
                                                } else {
                                                    setSelectedCategory(selectedCategory.filter(c => c !== cat));
                                                }
                                            }}
                                        />
                                    </div>
                                ))}
                            </Col>

                            <Col md={6} lg={3} className="mb-3">
                                <h6 className="fw-bold text-success mb-2">📍 Location</h6>
                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {uniqueLocations.map(loc => (
                                        <div key={loc} className="mb-2">
                                            <Form.Check
                                                type="checkbox"
                                                label={loc}
                                                id={`loc-${loc}`}
                                                checked={selectedLocation.includes(loc)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedLocation([...selectedLocation, loc]);
                                                    } else {
                                                        setSelectedLocation(selectedLocation.filter(l => l !== loc));
                                                    }
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </Col>

                            <Col md={6} lg={3} className="mb-3">
                                <h6 className="fw-bold text-success mb-2">💰 Funding Status</h6>
                                {[
                                    { id: 'not-started', label: 'Not Started (0-25%)' },
                                    { id: 'in-progress', label: 'In Progress (25-75%)' },
                                    { id: 'nearly-complete', label: 'Nearly Complete (75-99%)' },
                                    { id: 'complete', label: 'Complete (100%)' }
                                ].map(status => (
                                    <div key={status.id} className="mb-2">
                                        <Form.Check
                                            type="checkbox"
                                            label={status.label}
                                            id={`status-${status.id}`}
                                            checked={fundingStatus.includes(status.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFundingStatus([...fundingStatus, status.id]);
                                                } else {
                                                    setFundingStatus(fundingStatus.filter(f => f !== status.id));
                                                }
                                            }}
                                        />
                                    </div>
                                ))}
                            </Col>

                            <Col md={6} lg={3} className="mb-3">
                                <h6 className="fw-bold text-success mb-2">📈 Expected ROI</h6>
                                <div className="mb-4">
                                    {[
                                        { id: 'high', label: '🔥 High (15-18%)' },
                                        { id: 'medium', label: '⭐ Medium (12-15%)' },
                                        { id: 'low', label: '💼 Low (10-12%)' }
                                    ].map(roi => (
                                        <div key={roi.id} className="mb-2">
                                            <Form.Check
                                                type="checkbox"
                                                label={roi.label}
                                                id={`roi-${roi.id}`}
                                                checked={roiRange.includes(roi.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setRoiRange([...roiRange, roi.id]);
                                                    } else {
                                                        setRoiRange(roiRange.filter(r => r !== roi.id));
                                                    }
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <h6 className="fw-bold text-success mb-2">💵 Price Range</h6>
                                <small style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="text-muted">Min: ₹{priceRange.min.toLocaleString()}</small>
                                <Form.Range
                                    min={0}
                                    max={100000}
                                    step={5000}
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                                />
                                <small style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="text-muted">Max: ₹{priceRange.max.toLocaleString()}</small>
                                <Form.Range
                                    min={0}
                                    max={100000}
                                    step={5000}
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                                />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Collapse>

            <Row>
                {filteredProjects.length > 0 ? (
                    filteredProjects.map(p => {
                        const fundingPercentage = (p.funded / p.goal) * 100;
                        const location = extractLocation(p.name);
                        const category = getCategory(p.name);
                        const roi = getExpectedROI(p.goal);

                        return (
                            <Col md={4} key={p.id} className="mb-4">
                                <Card className="shadow-lg h-100 border-0"
                                    style={{
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        backgroundColor: isDark ? '#2a2a2a' : '#fff',
                                        color: isDark ? '#e0e0e0' : '#000'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'scale(1.03)';
                                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.25)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0,0,0,0.15)';
                                    }}
                                >
                                    <div style={{ position: 'relative' }}>
                                        <Card.Img
                                            variant="top"
                                            src={p.image || "https://via.placeholder.com/300x200"}
                                            style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                                            onClick={() => navigate(`/project/${p.id}`)}
                                        />
                                        <Badge bg="success" style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                            {category}
                                        </Badge>
                                    </div>
                                    <Card.Body>
                                        <Card.Title
                                            className="text-success"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/project/${p.id}`)}
                                        >
                                            {p.name}
                                        </Card.Title>

                                        <div className="mb-2 d-flex gap-2 flex-wrap">
                                            <Badge bg="light" text="dark" className="small">📍 {location}</Badge>
                                            {/* <Badge bg="info" className="small">📈 ROI: {roi}</Badge> */}
                                        </div>

                                        {/* <Card.Text className="text-muted small mb-3">{p.description || "High-quality agricultural project to invest in."}</Card.Text> */}

                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between mb-2">
                                                <small className="text-muted">Funding Progress</small>
                                                <Badge bg="success">{fundingPercentage.toFixed(0)}%</Badge>
                                            </div>
                                            <ProgressBar now={fundingPercentage} variant="success" style={{ height: '8px' }} />
                                        </div>

                                        <div className="mb-3">
                                            <small className="text-muted">₹{p.funded.toLocaleString()} of ₹{p.goal.toLocaleString()}</small>
                                        </div>

                                        <Form.Control
                                            type="number"
                                            placeholder="Enter amount (₹)"
                                            value={investmentAmounts[p.id] || ""}
                                            onChange={(e) =>
                                                setInvestmentAmounts(prev => ({
                                                    ...prev,
                                                    [p.id]: e.target.value
                                                    // console.log(e.target.value)
                                                }))
                                            }
                                            className="mb-2"
                                            size="sm"
                                            style={{
                                                backgroundColor: isDark ? '#1a1a1a' : '#fff',
                                                color: isDark ? '#e0e0e0' : '#000',
                                                borderColor: isDark ? '#444' : '#ddd'
                                            }}

                                        />

                                        <div className="d-grid gap-2">
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => investInProject(p.id)}
                                            >
                                                ✓ Invest Now
                                            </Button>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => navigate(`/project/${p.id}`)}
                                            >
                                                📋 View Details
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })
                ) : (
                    <Col xs={12} className="text-center py-5">
                        <h5 className="text-muted">😕 No projects match your filters</h5>
                        <p className="text-muted mb-3">Try adjusting your search criteria or clearing some filters</p>
                        {hasActiveFilters && (
                            <Button variant="outline-success" onClick={clearAllFilters}>
                                Clear All Filters
                            </Button>
                        )}
                    </Col>
                )}
            </Row>

            <InvestmentModal
                show={showInvestmentModal}
                projectName={pendingInvestment?.projectName || ''}
                amount={pendingInvestment?.amount || 0}
                onConfirm={confirmInvestment}
                onCancel={() => {
                    setShowInvestmentModal(false);
                    setPendingInvestment(null);
                }}
                loading={investmentLoading}
            />
        </Container>
    );
}
