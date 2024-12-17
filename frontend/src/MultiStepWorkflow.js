import React from 'react';

const MultiStepWorkflow = ({ steps, currentStep }) => {
  // Calculate progress: Ensure it works for all steps and avoids edge cases
  const progressWidth = steps.length > 1 
    ? (currentStep / (steps.length - 1)) * 100
    : 0; // Avoid division by zero if only one step exists

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12">
          {/* Workflow steps as divs */}
          <div className="d-flex justify-content-center">
            {steps.map((step, index) => (
              <div key={index} className="d-flex align-items-center">
                {/* Step Label */}
                <div
                  className={`px-3 py-2 text-center fw-bold ${
                    currentStep === index ? 'text-white bg-primary rounded' : 'text-secondary'
                  }`}
                >
                  {step}
                </div>

                {/* Arrows */}
                {index < steps.length - 1 && (
                  <div className="mx-2 text-success">&rarr;</div>
                )}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-4">
          <div className="progress" style={{ height: '10px' }}>
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{
                width: `${progressWidth}%`, // Dynamic width
                transition: 'width 0.5s ease-in-out',
                minWidth: '0', // Ensure no Bootstrap conflicts
              }}
              aria-valuenow={progressWidth}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiStepWorkflow;
