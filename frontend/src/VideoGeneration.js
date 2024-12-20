import React, { useState, useEffect, useRef } from 'react';
import './VideoGeneration.css'

const VideoGeneration = ({setCurrentStep, scripts, voices, images, image, setVideos}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const ranOnce = useRef(false)
  // Function to fetch data from FastAPI
  const generateVideos = async () => {
    
    const reader = new FileReader()
    reader.readAsDataURL(image)
    reader.onload = async () => {
      const base64Image = reader.result.split(',')[1] // Extract base64 string
      
      try {
      // Making the POST request
      const response = await fetch('http://127.0.0.1:8000/video_generation/videos', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scripts,
            voices,
            images,
            background_image: base64Image
          }),
      });
      
      // Check if the request was successful
      if (!response.ok) {
          throw new Error('Failed to fetch data');
      }

      // Parse the JSON response and update the state
      const data = await response.json();
      setVideos(data)
      setCurrentStep(4)
      } catch (err) {
      setError(err.message);  // Handle errors
      } finally {
      setLoading(false);  // Set loading to false once the request is complete
      }
    }
  };

  const handleVideoGeneration = () => {
    if (ranOnce.current) return;
    ranOnce.current = true
    generateVideos()
  }

  useEffect(() => {
    handleVideoGeneration()
  }, []);

  return (
    <div className="container text-center">
      {loading ? (
        <div className="video-loader">
          <div className="reel"></div>
          <div className="message">
            <p>Generating your videos...</p>
            <p>Please hold tight! This may take a while!</p>
          </div>
        </div>
      ) : (
        <p>Video ready for playback!</p>
      )}
      {
        error === null && <div className="text-warning mt-1">Something went wrong, Retry Video Generation or Go Back.</div>
      }
      <button className="btn btn-primary m-2" onClick={generateVideos}>
        Retry Video Generation
      </button>
      <button className="btn btn-dark m-2" onClick={() => {setCurrentStep(2)}}>
        Back
      </button>
    </div>
  );
};

export default VideoGeneration;
