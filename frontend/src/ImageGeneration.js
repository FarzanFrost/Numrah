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
          <img src={URL.createObjectURL(image)} alt="Uploaded" className="img-thumbnail" style={{ width: '150px', height: '150px' }} />
        )}
      </div>
    </div>
  );
};

const LabelList = ({ labels, onAddLabel, onRemoveLabel }) => {
  // Predefined list of available labels
  const availableLabels = [
    "Photorealistic",  
    // Artistic Styles
    "Impressionism",
    "Cubism",
    "Surrealism",
    "Expressionism",
    "Realism",
    "Abstract Art",
    "Pop Art",
    "Minimalism",  
    // Digital Styles
    "3D Render",
    "Vector Art",
    "Pixel Art",
    "Low Poly",
    "Isometric",
    "Cyberpunk",
    "Synthwave",  
    // Illustration Styles
    "Anime/Manga",
    "Comic Book Style",
    "Children's Book Illustration",
    "Cartoon",
    "Storyboard Sketch",
    "Ink Drawing",  
    // Fantasy and Sci-Fi Styles
    "Steampunk",
    "Fantasy Art",
    "Sci-Fi Concept Art",
    "Post-Apocalyptic",  
    // Classic Mediums
    "Watercolor",
    "Oil Painting",
    "Charcoal Sketch",
    "Pencil Drawing",
    "Marker Sketch",  
    // Cinematic Styles
    "Film Noir",
    "HDR (High Dynamic Range)",
    "4K Ultra-Realistic",
    "Blurry / Depth of Field Focus",
    "Aerial View / Bird's Eye",  
    // Cultural and Historic Styles
    "Medieval Art",
    "Baroque",
    "Renaissance",
    "Graffiti",
    "Street Art",
    "Tribal Art",  
    // Modern Aesthetics
    "Vaporwave",
    "Minimalist Flat Design",
    "Futurism",
    "Typography-based Art",  
    // Experimental Styles
    "Glitch Art",
    "Double Exposure",
    "Generative Abstract",
    "Collage",
    "Neon Glow"
  ];

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

const ImageGallery = ({images, setImages}) => {
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-3">
      <label htmlFor="galleryInput" className="form-label">Upload Images for Gallery</label>
      <input
        type="file"
        className="form-control"
        id="galleryInput"
        multiple
        accept="image/*"
        onChange={handleImageChange}
      />
      {images.length > 0 && (
        <div className="mt-3">
          <h5>Image Gallery</h5>
          <div className="row g-2">
            {images.map((image, index) => (
              <div key={index} className="col-4 col-md-3 col-lg-2">
                <div className="position-relative">
                  <img
                    src={`data:image/jpeg;base64,${image}`}
                    alt={`Uploaded ${index}`}
                    className="img-thumbnail"
                    style={{ height: '100px', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    className="btn-close position-absolute top-0 end-0 bg-light"
                    aria-label="Remove"
                    onClick={() => removeImage(index)}
                  ></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ImageGeneration = ({nextStep}) => {
  const [image, setImage] = useState(null);
  const [labels, setLabels] = useState([[]]);
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [images, setImages] = useState([]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleLabelsChange = (newLabels) => {
    setLabels(newLabels);
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const generateImages = async (image) => {
    if (!image){
      alert("please add image")
      return;
    }

    setLoading(true);
    setError(null);

    const reader = new FileReader()
    reader.readAsDataURL(image)
    reader.onload = async () => {
      const base64Image = reader.result.split(',')[1] // Extract base64 string

      try {
        const response  = await fetch(
          "http://127.0.0.1:8000/image_generation/create_images",
          {
            method: "POST",
            headers: {
              "Content-Type" : "application/json"
            },
            body: JSON.stringify(
              {
                input_image: base64Image,
                styles: labels,
                prompt: text
              }
            )
          }
        );
        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json()

        setImages(data)
        setMessage("Image uploaded successfully!");
      } catch (err) {
        console.error("Error uploading image:", err);
        setError(err.message || "Failed to upload image");
        setMessage('');
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="container mt-4">
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
        <button className="btn btn-primary m-2" onClick={() => generateImages(image)}>
        Generate Images
        </button>
        <ImageGallery images={images} setImages={setImages}/>
        <button className="btn btn-primary m-2" onClick={nextStep}>
        Submit Images
        </button>
    </div>
  );
};

export default ImageGeneration;
