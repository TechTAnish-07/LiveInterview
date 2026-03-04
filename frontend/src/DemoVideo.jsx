import React, { useRef, useState } from 'react';
import demoVideo from './assets/demo.mp4';

const DemoVideo = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Demo Video</h1>
      
      <div style={styles.videoWrapper}>
        <video
          ref={videoRef}
          style={styles.video}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        >
          <source src={demoVideo} type="video/quicktime" />
          <source src={demoVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Custom Controls */}
        <div style={styles.controls}>
          {/* Play/Pause Button */}
          <button style={styles.playButton} onClick={togglePlay}>
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          {/* Time Display */}
          <span style={styles.time}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            style={styles.progressBar}
          />

          {/* Volume Control */}
          <button style={styles.volumeButton} onClick={toggleMute}>
            {isMuted || volume === 0 ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            style={styles.volumeBar}
          />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    color: '#e2e8f0',
    marginBottom: '30px',
    fontSize: '32px',
  },
  videoWrapper: {
    width: '100%',
    maxWidth: '800px',
    background: '#000',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
  },
  video: {
    width: '100%',
    display: 'block',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px 20px',
    background: 'rgba(0, 0, 0, 0.8)',
  },
  playButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '5px',
    color: '#fff',
  },
  time: {
    color: '#e2e8f0',
    fontSize: '14px',
    fontFamily: 'monospace',
    minWidth: '100px',
  },
  progressBar: {
    flex: 1,
    height: '6px',
    cursor: 'pointer',
    accentColor: '#3b82f6',
  },
  volumeButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '5px',
  },
  volumeBar: {
    width: '80px',
    height: '6px',
    cursor: 'pointer',
    accentColor: '#3b82f6',
  },
};

export default DemoVideo;
