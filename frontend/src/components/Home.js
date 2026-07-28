import React from 'react';
import { Container, Button } from 'react-bootstrap';
import 'animate.css';

export default function Home() {
  return (
    <div
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(46, 125, 50, 0.7)), url('/images/farmer.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        color: 'white',
        position: 'relative',
      }}
    >
      {/* Main Content */}
      <Container className="d-flex flex-column justify-content-center align-items-center h-100 text-center">
        <h1 className="fw-bold display-3 animate__animated animate__fadeInDown">
          Empowering Farmers, Growing Futures
        </h1>
        <p className="lead mt-3 animate__animated animate__fadeInUp animate__delay-1s">
          Invest in agriculture and be part of a sustainable tomorrow.
        </p>
        <Button
          variant="success"
          size="lg"
          href="/projectlist"
          className="mt-4 animate__animated animate__zoomIn animate__delay-2s"
          style={{
            boxShadow: '0px 4px 15px rgba(0,0,0,0.3)',
            padding: '12px 28px',
            fontSize: '1.2rem',
          }}
        >
          🌾 Explore Projects
        </Button>
      </Container>

      {/* Scroll Indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '2rem',
          animation: 'bounce 2s infinite',
          cursor: 'pointer',
        }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        ⬇️
      </div>

      {/* Bounce Animation */}
      <style>
        {`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translate(-50%, 0); }
            40% { transform: translate(-50%, -10px); }
            60% { transform: translate(-50%, -5px); }
          }
        `}
      </style>
    </div>
  );
}
