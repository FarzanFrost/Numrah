import React, { useState } from 'react';

const ImageUpload = ({ onImageChange, image }) => {
  return (
    <div className="mb-3">
      <label htmlFor="imageInput" className="form-label">Upload Image</label>
      <div className="d-flex align-items-center">
        <input
          type="file"
          className="form-control me-3"
          id="imageInput"
          onChange={onImageChange}
        />
        {image && (
          <img src={image} alt="Uploaded" className="img-thumbnail" style={{ width: '150px', height: '150px' }} />
        )}
      </div>
    </div>
  );
};

const LabelList = ({ labels, onAddLabel, onRemoveLabel }) => {
  // Predefined list of available labels
  const availableLabels = ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7'];

  const handleAddLabel = (index, label) => {
    if (labels[index].includes(label)) {
      return; // Prevent adding duplicate labels
    }
    const updatedLabels = [...labels];
    updatedLabels[index].push(label);
    onAddLabel(updatedLabels);
  };

  const handleLabelChange = (index, subIndex, label) => {
    const updatedLabels = [...labels];
    updatedLabels[index][subIndex] = label;
    onAddLabel(updatedLabels);
  };

  const handleRemoveLabel = (index, subIndex) => {
    const updatedLabels = [...labels];
    updatedLabels[index].splice(subIndex, 1);
    onAddLabel(updatedLabels);
  };

  return (
    <div className="mb-3">
      {labels.map((list, index) => (
        <div key={index} className="mb-2">
          <div className="d-flex flex-wrap">
            {list.map((label, subIndex) => (
              <div key={subIndex} className="me-2 mb-2">
                <span className="badge bg-primary">
                  {label || 'Empty Label'}
                  <button
                    type="button"
                    className="btn-close btn-sm ms-2"
                    aria-label="Close"
                    onClick={() => handleRemoveLabel(index, subIndex)}
                  />
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <select
              className="form-select form-select-sm"
              onChange={(e) => handleAddLabel(index, e.target.value)}
              value=""
              disabled={list.length >= 5}
            >
              <option value="" disabled>Select a Label</option>
              {availableLabels.map((label, labelIndex) => (
                <option key={labelIndex} value={label}>
                  {label}
                </option>
              ))}
            </select>
            {list.length < 5 && (
              <div className="text-danger mt-1">Please add exactly 5 unique labels.</div>
            )}
          </div>
        </div>
      ))}
      <button
        className="btn btn-primary mt-2"
        onClick={() => onAddLabel([...labels, []])}
      >
        Add List
      </button>
    </div>
  );
};

const TextInput = ({ onTextChange }) => {
  return (
    <div className="mb-3">
      <label htmlFor="textInput" className="form-label">Enter Text</label>
      <textarea
        id="textInput"
        className="form-control"
        rows="3"
        onChange={onTextChange}
      ></textarea>
    </div>
  );
};

const ImageGeneration = () => {
  const [image, setImage] = useState(null);
  const [labels, setLabels] = useState([[]]);
  const [text, setText] = useState('');

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleLabelsChange = (newLabels) => {
    setLabels(newLabels);
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  return (
    <div className="container mt-4">
      <div className="bg-light rounded p-3 shadow-sm border border-dark w-75 mx-auto my-2">
        <div className="row">
          <div className="col-12">
            {/* Image Upload input */}
            <ImageUpload onImageChange={handleImageChange} image={image} />
          </div>
          <div className="col-12">
            {/* Labels Section */}
            <LabelList labels={labels} onAddLabel={handleLabelsChange} onRemoveLabel={handleLabelsChange} />
          </div>
          <div className="col-12">
            {/* Text Input Section */}
            <TextInput onTextChange={handleTextChange} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGeneration;
