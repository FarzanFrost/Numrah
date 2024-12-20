import React, { useState, useRef, useEffect } from 'react';
import './VideoResults.css'; // Custom CSS for enhanced styles

const VideoResults = ({newIdea, videos, setVideos}) => {
  console.log(videos)
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef(null);
  const playerRef = useRef(null);

  // Handle video upload
  const handleVideoUpload = (event) => {
    const files = event.target.files;
    const newVideos = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const videoUrl = URL.createObjectURL(file);
      newVideos.push({ name: file.name, url: videoUrl, size: file.size, duration: 0 });
    }
    setVideos((prevVideos) => [...prevVideos, ...newVideos]);
  };

  // Update video duration once metadata is loaded
  const handleMetadataLoaded = (index) => {
    const updatedVideos = [...videos];
    updatedVideos[index].duration = videoRef.current.duration;
    setVideos(updatedVideos);
  };

  // Handle video selection
  const handleVideoSelect = (index) => {
    setSelectedVideo(index);
    setIsPlaying(false); // Reset play/pause state on selection
    setProgress(0); // Reset progress bar

    // Reset video player state
    if (videoRef.current) {
      videoRef.current.pause(); // Pause any currently playing video
      videoRef.current.currentTime = 0; // Reset playback position
      videoRef.current.load(); // Reload the video
    }

    // Auto-play the newly selected video
    setTimeout(() => {
      videoRef.current.play();
      setIsPlaying(true);
    }, 100); // Small delay to ensure the video has loaded
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle volume change
  const handleVolumeChange = (event) => {
    const value = event.target.value;
    setVolume(value);
    videoRef.current.volume = value;
  };

  // Handle progress change
  const handleProgressChange = (event) => {
    const value = event.target.value;
    setProgress(value);
    videoRef.current.currentTime = (value / 100) * videoRef.current.duration;
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen();
      } else if (playerRef.current.mozRequestFullScreen) {
        playerRef.current.mozRequestFullScreen();
      } else if (playerRef.current.webkitRequestFullscreen) {
        playerRef.current.webkitRequestFullscreen();
      } else if (playerRef.current.msRequestFullscreen) {
        playerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Handle progress bar update during playback
  const updateProgress = () => {
    setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
  };

  useEffect(() => {
    if (selectedVideo !== null && videoRef.current) {
      videoRef.current.addEventListener('timeupdate', updateProgress);
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('timeupdate', updateProgress);
      }
    };
  }, [selectedVideo]);

  return (
    <div className="container">
      {/* Sub-component 1: Video Upload */}
      {/* <div className="my-">
        <input type="file" accept="video/*" multiple onChange={handleVideoUpload} />
      </div> */}

      {/* Sub-component 2: Video List and Player */}
      <div className="row">
        <div className="col-md-8">
          {selectedVideo !== null && (
            <div
              ref={playerRef}
              className="video-player-container"
              onMouseEnter={() => playerRef.current.classList.add('show-controls')}
              onMouseLeave={() => playerRef.current.classList.remove('show-controls')}
            >
              <video
                ref={videoRef}
                className="video-player"
                onLoadedMetadata={() => handleMetadataLoaded(selectedVideo)}
              >
                <source src={`http://localhost:8000/static/${videos[selectedVideo].url}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {/* Custom Controls */}
              <div className="controls">
                <button className="play-btn" onClick={togglePlay}>
                  {isPlaying ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>}
                </button>
                <input
                  type="range"
                  className="progress-bar"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleProgressChange}
                />
                <div className="volume-controls">
                  <input
                    type="range"
                    className="volume-bar"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                  />
                  <button
                    className="mute-btn"
                    onClick={() => {
                      setIsMuted(!isMuted);
                      videoRef.current.muted = !isMuted;
                    }}
                  >
                    {isMuted ? <i className="fas fa-volume-mute"></i> : <i className="fas fa-volume-up"></i>}
                  </button>
                </div>
                <button className="fullscreen-btn" onClick={toggleFullscreen}>
                  <i className={isFullscreen ? 'fas fa-compress' : 'fas fa-expand'}></i>
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="col-md-4">
        <ul className="list-group">
          {videos.map((video, index) => (
            <li
              key={index}
              className={`list-group-item d-flex flex-column ${
                selectedVideo === index ? 'bg-primary text-white' : ''
              } my-1`}
              onClick={() => handleVideoSelect(index)}
            >
              {/* Top Row: Video Details */}
              <div className="d-flex justify-content-between align-items-center w-100">
                <div className="d-flex flex-column" style={{ cursor: 'pointer' }}>
                  <span>{video.name}</span>
                  <small>{(video.size / 1024 / 1024).toFixed(2)} MB</small>
                  <small>{new Date(video.duration * 1000).toISOString().substr(11, 8)}</small>
                </div>
                <img
                  src={`data:image/png;base64,${video.image}`}
                  alt={video.name}
                  width="50"
                  height="50"
                  className="ml-2"
                />
              </div>

              <div className="d-flex justify-content-end mt-2">
              <a
                href={`http://localhost:8000/static/${video.url}`}
                download={video.name}
                className="btn btn-secondary btn-sm"
                title="Download"
              >
                <i className="fas fa-download"></i>
              </a>
            </div>
            </li>
          ))}
        </ul>
        </div>
      </div>
      <button className="btn btn-primary m-2" onClick={newIdea}>
      New Marketing Idea?
      </button>
    </div>
  );
};

export default VideoResults;