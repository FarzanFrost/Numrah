import React from 'react';
import './Logo.css';

const Logo = () => {
  return (
    <div className="position-relative d-inline-block text-center">
      <div className="d-flex align-items-center justify-content-center logo p-2">
        <span className="text-warning fs-2 me-1">⚡</span>
        <span className="text-primary fs-2 fw-bold">MVG</span>
      </div>
      <div className="tooltip bg-dark text-white px-2 py-1 rounded position-absolute top-100 start-50 translate-middle-x mt-2">
        Flash Marketing Video Generator
      </div>
    </div>
  );
};

export default Logo;
