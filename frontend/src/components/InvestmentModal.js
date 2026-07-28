import React, { useContext } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext';

export default function InvestmentModal({ show, projectName, amount, onConfirm, onCancel, loading }) {
    const { isDark } = useContext(ThemeContext);

    return (
        <Modal show={show} onHide={onCancel} centered backdrop="static" keyboard={false}>
            <Modal.Header
                closeButton={!loading}
                style={{
                    backgroundColor: isDark ? '#2a2a2a' : '#f8f9fa',
                    borderColor: isDark ? '#444' : '#ddd',
                    color: isDark ? '#e0e0e0' : '#000'
                }}
            >
                <Modal.Title className="fw-bold">💰 Confirm Investment</Modal.Title>
            </Modal.Header>
            <Modal.Body
                style={{
                    backgroundColor: isDark ? '#1a1a1a' : '#fff',
                    color: isDark ? '#e0e0e0' : '#000'
                }}
            >
                <div className="text-center">
                    <div className="mb-4">
                        <h5 style={{ color: isDark ? '#90ee90' : '#28a745' }} className="mb-2">
                            {projectName}
                        </h5>
                        <p style={{ color: isDark ? '#b0b0b0' : '#6c757d' }} className="mb-0">
                            Investment Amount
                        </p>
                        <h3 style={{ color: isDark ? '#ffd700' : '#ff9800' }} className="fw-bold mt-2">
                            ₹{parseFloat(amount).toLocaleString('en-IN', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            })}
                        </h3>
                    </div>

                    <div
                        style={{
                            backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '20px'
                        }}
                    >
                        <p style={{ color: isDark ? '#b0b0b0' : '#666', margin: '0' }}>
                            ✓ You are about to invest in this agricultural project
                        </p>
                        <p style={{ color: isDark ? '#b0b0b0' : '#666', margin: '8px 0 0' }}>
                            ✓ This investment will be recorded in your portfolio
                        </p>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer
                style={{
                    backgroundColor: isDark ? '#2a2a2a' : '#f8f9fa',
                    borderColor: isDark ? '#444' : '#ddd'
                }}
            >
                <Button
                    variant="outline-secondary"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    variant="success"
                    onClick={onConfirm}
                    disabled={loading}
                    className="fw-bold"
                >
                    {loading ? '⏳ Processing...' : '✓ Confirm Investment'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
