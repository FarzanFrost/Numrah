import React from 'react';

function ButtonComponent({ onClick, label }) {
  return (
    <button className="btn btn-primary m-2" onClick={onClick}>
      {label}
    </button>
  );
}

export default ButtonComponent;
