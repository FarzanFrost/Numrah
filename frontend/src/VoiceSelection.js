import React, { useEffect, useState } from "react";
import './VoiceSelection.css'

const VoiceSelection = ({setCurrentStep, selectedVoices, setSelectedVoices}) => {
  const [voices, setVoices] = useState([]); // To store voice data
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  // Function to fetch voices from FastAPI
  const fetchVoices = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/voice_selection/voices");
      if (!response.ok) {
        throw new Error("Failed to fetch voices");
      }
      const data = await response.json();
      setVoices(data.voices || []); // Update state with fetched voices
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle checkbox change
  const handleCheckboxChange = (voiceId) => {
    setSelectedVoices((prevSelected) => {
      if (prevSelected.includes(voiceId)) {
        // Remove voiceId if already selected
        return prevSelected.filter((id) => id !== voiceId);
      } else {
        // Add voiceId to the list
        return [...prevSelected, voiceId];
      }
    });
  };

  useEffect(() => {
    fetchVoices(); // Fetch voices on component mount
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Available Voices</h1>

      {/* Loading and Error States */}
      {loading && <p>Loading voices...</p>}
      {error && <p className="text-danger">Error: {error}</p>}

      {/* Voice List */}
      <div className="row">
        {voices.map((voice) => (
          <div key={voice.voice_id} className="col-md-6 col-sm-12 mb-4">
            {/* Responsive column: 2 columns on medium and larger screens, 1 column on small screens */}
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{voice.name}</h5>
                {voice.preview_url ? (
                  <audio controls>
                    <source src={voice.preview_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <p>No preview available</p>
                )}

                {/* Checkbox to Select Voice */}
                <div className="form-check custom-checkbox mt-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`voice-${voice.voice_id}`}
                    checked={selectedVoices.includes(voice.voice_id)}
                    onChange={() => handleCheckboxChange(voice.voice_id)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`voice-${voice.voice_id}`}
                  >
                    Select Voice
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedVoices.length === 0 && <div className="text-danger mt-1">Kindly Select at least one voice.</div>}
      <button className="btn btn-primary m-2" onClick={() => {setCurrentStep(2)}} disabled={selectedVoices.length === 0}>
        Submit Voices
    </button>
    <button className="btn btn-dark m-2" onClick={() => {setCurrentStep(0)}}>
        Back
      </button>
    </div>
  );
};


export default VoiceSelection