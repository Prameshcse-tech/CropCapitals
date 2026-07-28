import React from 'react';
import { Card, Row, Col, Placeholder } from 'react-bootstrap';

export function ProjectSkeleton() {
    return (
        <Col md={4} className="mb-4">
            <Card className="shadow-lg h-100 border-0" style={{ borderRadius: '10px' }}>
                <Placeholder className="card-img-top" style={{ height: '200px', backgroundColor: '#e0e0e0' }} />
                <Card.Body>
                    <Placeholder as={Card.Title} animation="wave">
                        <Placeholder xs={6} />
                    </Placeholder>
                    <Placeholder as={Card.Text} animation="wave">
                        <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} /> <Placeholder xs={6} />
                    </Placeholder>
                    <Placeholder as={Card.Text} animation="wave">
                        <Placeholder xs={8} />
                    </Placeholder>
                    <div style={{ height: '50px', backgroundColor: '#e0e0e0', borderRadius: '5px', marginBottom: '10px' }} />
                    <Placeholder as="div" animation="wave">
                        <Placeholder xs={12} style={{ height: '40px', marginBottom: '10px' }} />
                        <Placeholder xs={12} style={{ height: '40px' }} />
                    </Placeholder>
                </Card.Body>
            </Card>
        </Col>
    );
}

export function DashboardSkeleton() {
    return (
        <>
            <Card className="shadow-lg border-0 p-4 mb-4" style={{ borderRadius: '15px' }}>
                <Placeholder as={Card.Title} animation="wave">
                    <Placeholder xs={4} />
                </Placeholder>
                <Placeholder as={Card.Text} animation="wave">
                    <Placeholder xs={6} />
                </Placeholder>
            </Card>

            <Row>
                <Col md={6} className="mb-4">
                    <Card className="p-3 shadow-sm" style={{ borderRadius: '10px' }}>
                        <Placeholder as={Card.Title} animation="wave">
                            <Placeholder xs={5} />
                        </Placeholder>
                        <div style={{ height: '300px', backgroundColor: '#e0e0e0', borderRadius: '5px' }} />
                    </Card>
                </Col>
                <Col md={6} className="mb-4">
                    <Card className="p-3 shadow-sm" style={{ borderRadius: '10px' }}>
                        <Placeholder as={Card.Title} animation="wave">
                            <Placeholder xs={5} />
                        </Placeholder>
                        <div style={{ height: '300px', backgroundColor: '#e0e0e0', borderRadius: '5px' }} />
                    </Card>
                </Col>
            </Row>
        </>
    );
}

export function ProjectDetailSkeleton() {
    return (
        <>
            <Row className="mb-5">
                <Col lg={8}>
                    <div style={{ height: '400px', backgroundColor: '#e0e0e0', borderRadius: '15px', marginBottom: '20px' }} />
                    <Placeholder as="h1" animation="wave">
                        <Placeholder xs={8} />
                    </Placeholder>
                    <Placeholder as={Card.Text} animation="wave">
                        <Placeholder xs={12} /> <Placeholder xs={12} /> <Placeholder xs={8} />
                    </Placeholder>
                </Col>
                <Col lg={4}>
                    <Card className="shadow-lg border-0 p-4" style={{ borderRadius: '15px', position: 'sticky', top: '20px' }}>
                        <Placeholder as={Card.Title} animation="wave">
                            <Placeholder xs={6} />
                        </Placeholder>
                        <div style={{ height: '300px', backgroundColor: '#e0e0e0', borderRadius: '5px' }} />
                    </Card>
                </Col>
            </Row>
        </>
    );
}
