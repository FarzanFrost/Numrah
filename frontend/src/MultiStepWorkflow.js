import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const MultiStepWorkflow = ({ steps, currentStep }) => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12">
          {/* Workflow steps as divs */}
          <ul className="nav nav-pills justify-content-center">
            {steps.map((step, index) => (
              <li className="nav-item" key={index}>
                <div
                  className={`nav-link ${currentStep === index ? 'active' : ''}`}
                  style={{ cursor: 'default' }} // Prevent pointer cursor
                >
                  {step}
                </div>
              </li>
            ))}
          </ul>

          {/* Arrows between steps */}
          <div className="d-flex justify-content-center mt-2">
            {steps.map((_, index) => (
              <div key={index} className="d-flex align-items-center">
                {index < steps.length - 1 && (
                  <span className="bi bi-arrow-right-circle mx-2" />
                )}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="progress">
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`
                }}
                aria-valuenow={currentStep + 1}
                aria-valuemin="0"
                aria-valuemax={steps.length}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiStepWorkflow;
