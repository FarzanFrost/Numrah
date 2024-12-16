import React, { useState, useEffect } from 'react';
import './VideoGeneration.css'

const VideoGeneration = () => {
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   // Simulate backend call
  //   setTimeout(() => {
  //     setLoading(false);
  //   }, 5000); // Change to match your video generation time
  // }, []);

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
    </div>
  );
};

export default VideoGeneration;
