import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export default function AlertBox({ type = 'info', message = '', onClose = null, autoClose = true, duration = 4000 }) {
    const { isDark } = useContext(ThemeContext);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose?.();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, onClose]);

    if (!isVisible) return null;

    const getAlertStyles = () => {
        const baseStyle = {
            padding: '16px 20px',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '15px',
            fontWeight: '500',
            animation: 'slideIn 0.3s ease-out',
            boxShadow: isDark
                ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: 'none',
            position: 'relative',
            overflow: 'hidden'
        };

        const typeStyles = {
            success: {
                backgroundColor: isDark ? '#1a3a2a' : '#d4edda',
                color: isDark ? '#90ee90' : '#155724',
                borderLeftColor: '#28a745'
            },
            error: {
                backgroundColor: isDark ? '#3a1a1a' : '#f8d7da',
                color: isDark ? '#ff6b6b' : '#721c24',
                borderLeftColor: '#dc3545'
            },
            warning: {
                backgroundColor: isDark ? '#3a3a1a' : '#fff3cd',
                color: isDark ? '#ffd700' : '#856404',
                borderLeftColor: '#ffc107'
            },
            info: {
                backgroundColor: isDark ? '#1a2a3a' : '#d1ecf1',
                color: isDark ? '#87ceeb' : '#0c5460',
                borderLeftColor: '#17a2b8'
            }
        };

        return {
            ...baseStyle,
            ...typeStyles[type],
            borderLeft: `4px solid ${typeStyles[type].borderLeftColor}`
        };
    };

    const getIcon = () => {
        const iconStyle = { fontSize: '20px', fontWeight: 'bold' };
        switch (type) {
            case 'success':
                return <span style={iconStyle}>✓</span>;
            case 'error':
                return <span style={iconStyle}>✕</span>;
            case 'warning':
                return <span style={iconStyle}>⚠</span>;
            case 'info':
                return <span style={iconStyle}>ℹ</span>;
            default:
                return null;
        }
    };

    return (
        <>
            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes slideOut {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }
            `}</style>
            <div style={getAlertStyles()}>
                <div style={{ flexShrink: 0 }}>
                    {getIcon()}
                </div>
                <div style={{ flex: 1 }}>
                    {message}
                </div>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        onClose?.();
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: 'inherit',
                        opacity: 0.7,
                        padding: '0',
                        flexShrink: 0
                    }}
                    title="Close"
                >
                    ×
                </button>
            </div>
        </>
    );
}
