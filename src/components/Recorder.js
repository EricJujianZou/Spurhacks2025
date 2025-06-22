/**
 * Speech Recorder Component
 * 
 * A comprehensive recording interface that handles:
 * - Video/audio recording using WebRTC
 * - Recording review and playback
 * - Navigation to analysis and dashboard
 * - Error handling and browser compatibility
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MEDIA_CONSTRAINTS, 
  MIME_TYPES
} from '../constants';
import { 
  formatTime, 
  getBestMimeType, 
  isGetUserMediaSupported 
} from '../utils';
import LoadingScreen from './LoadingScreen';
import Dashboard from './Dashboard';

/**
 * Main Recorder Component
 * 
 * Manages the complete speech recording workflow including recording,
 * review, analysis, and results. Handles multiple views and state transitions.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Callback to return to main app
 * @returns {JSX.Element} Recorder interface with multiple views
 */
function Recorder({ onClose }) {
  // ========== REFS ==========
  const videoRef = useRef(null);           // Video element for preview
  const streamRef = useRef(null);          // Media stream reference
  const mediaRecorderRef = useRef(null);   // MediaRecorder instance
  const timerRef = useRef(null);           // Timer for recording duration
  const chunksRef = useRef([]);            // Video data chunks

  // ========== STATE ==========
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [recordingBlob, setRecordingBlob] = useState(null);
  const [currentView, setCurrentView] = useState('recorder'); // 'recorder', 'review', 'loading', 'dashboard'

  // ========== UTILITY FUNCTIONS ==========

  /**
   * Cleanup function to stop all media streams and timers
   * Prevents memory leaks and releases camera/microphone access
   */
  const cleanup = useCallback(() => {
    // Stop all media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clear recording timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop media recorder if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // ========== EFFECTS ==========

  /**
   * Initialize media stream on component mount
   * Requests camera and microphone permissions and sets up video preview
   */
  useEffect(() => {
    let isMounted = true;

    async function initializeMedia() {
      try {
        setError(null);
        setIsInitializing(true);

        // Check browser compatibility
        if (!isGetUserMediaSupported()) {
          throw new Error('getUserMedia is not supported in this browser');
        }

        // Request media access
        const mediaStream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
        
        // Check if component is still mounted
        if (!isMounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        // Set up media stream
        streamRef.current = mediaStream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error accessing media devices:', err);
          setError(err.message || 'Failed to access camera and microphone');
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }

    initializeMedia();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      cleanup();
    };
  }, [cleanup]);

  // ========== EVENT HANDLERS ==========

  /**
   * Handles completion of recording
   * Creates blob from recorded chunks and transitions to review screen
   */
  const handleRecordingComplete = useCallback(() => {
    if (chunksRef.current.length === 0) return;

    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    setRecordingBlob(blob);
    setCurrentView('review');
  }, []);

  /**
   * Starts video recording
   * Sets up MediaRecorder and begins capturing video/audio data
   */
  const startRecording = useCallback(() => {
    if (!streamRef.current) {
      setError('No media stream available');
      return;
    }

    try {
      // Get best supported video format
      const mimeType = getBestMimeType([MIME_TYPES.preferred, MIME_TYPES.fallback]);

      // Create MediaRecorder instance
      const recorder = new MediaRecorder(streamRef.current, { 
        mimeType: mimeType || undefined 
      });
      
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      // Set up event handlers
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = handleRecordingComplete;

      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setError('Recording failed');
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      // Start recording
      recorder.start();
      setIsRecording(true);
      setElapsed(0);
      
      // Start duration timer
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording');
    }
  }, [handleRecordingComplete]);

  /**
   * Stops video recording
   * Stops MediaRecorder and timer, triggers completion handler
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * Handles back button navigation
   * Stops recording if active and returns to main app
   */
  const handleBack = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }
    onClose();
  }, [isRecording, stopRecording, onClose]);

  /**
   * Handles completion of loading/analysis screen
   * Transitions to dashboard with results
   */
  const handleLoadingComplete = useCallback(() => {
    setCurrentView('dashboard');
  }, []);

  /**
   * Handles back navigation from dashboard
   * Returns to recorder for new recording
   */
  const handleDashboardBack = useCallback(() => {
    setCurrentView('recorder');
    setRecordingBlob(null);
  }, []);

  /**
   * Handles analyze speech button click
   * Transitions from review to loading/analysis
   */
  const handleAnalyzeSpeech = useCallback(() => {
    setCurrentView('loading');
  }, []);

  /**
   * Handles re-record button click
   * Returns to recorder and resets state
   */
  const handleReRecord = useCallback(() => {
    setCurrentView('recorder');
    setRecordingBlob(null);
    setElapsed(0);
  }, []);

  // ========== RENDER METHODS ==========

  /**
   * Renders the loading screen
   */
  if (currentView === 'loading') {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  /**
   * Renders the dashboard with analysis results
   */
  if (currentView === 'dashboard') {
    return (
      <Dashboard 
        onBack={handleDashboardBack} 
        recordingBlob={recordingBlob}
      />
    );
  }

  /**
   * Renders the review screen for recorded video
   */
  if (currentView === 'review') {
    return (
      <div className="min-h-screen bg-page-bg p-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 max-w-layout mx-auto">
          <button 
            onClick={handleBack} 
            className="btn-secondary"
            aria-label="Go back to previous page"
          >
            ← Back
          </button>
          
          <h1 className="font-manrope text-3xl font-bold text-text-primary text-center flex-1 mx-md">
            Review your recording
          </h1>
          
          <div className="w-20" />
        </div>

        {/* Review Interface */}
        <div className="flex flex-col items-center justify-center gap-md max-w-layout mx-auto">
          
          {/* Video Preview */}
          {recordingBlob && (
            <video
              controls
              className="w-video max-w-full h-video bg-accent rounded-md md:w-full md:h-auto md:aspect-video"
              aria-label="Recording preview"
            >
              <source src={URL.createObjectURL(recordingBlob)} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          )}

          {/* Recording Duration */}
          <div className="font-mono text-xl font-semibold text-text-primary">
            Recording Duration: {formatTime(elapsed)}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleReRecord}
              className="btn-secondary min-w-32"
              aria-label="Re-record your speech"
            >
              Re-record
            </button>
            
            <button
              onClick={handleAnalyzeSpeech}
              className="btn-primary min-w-32"
              aria-label="Analyze your speech"
            >
              Analyze Speech
            </button>
          </div>

          {/* Helpful Instructions */}
          <p className="text-text-secondary text-center max-w-md text-sm mt-4">
            Review your recording above. If you're happy with it, click "Analyze Speech" to get AI feedback. 
            Otherwise, click "Re-record" to try again.
          </p>
          
        </div>
      </div>
    );
  }

  // ========== DEFAULT RECORDER VIEW ==========
  return (
    <div className="min-h-screen bg-page-bg p-lg">
      
      {/* Header with Back Button and Title */}
      <div className="flex items-center justify-between mb-8 max-w-layout mx-auto">
        <button 
          onClick={handleBack} 
          className="btn-secondary"
          aria-label="Go back to previous page"
        >
          ← Back
        </button>
        
        <h1 className="font-manrope text-3xl font-bold text-text-primary text-center flex-1 mx-md">
          Record your speech
        </h1>
        
        <div className="w-20" />
      </div>

      {/* Recording Interface */}
      <div className="flex flex-col items-center justify-center gap-md max-w-layout mx-auto">
        
        {/* Error Display */}
        {error && (
          <div className="mb-md max-w-video w-full bg-red-50 border border-red-200 text-red-700 px-md py-3 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Video Preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={!isRecording}
          className="w-video max-w-full h-video bg-accent rounded-md md:w-full md:h-auto md:aspect-video"
          aria-label="Webcam preview"
        />

        {/* Recording Timer */}
        <div className="font-mono text-2xl font-semibold text-text-primary min-h-8 flex items-center">
          {formatTime(elapsed)}
        </div>

        {/* Record/Stop Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isInitializing || !!error}
          className={`min-w-36 ${
            isRecording 
              ? 'btn-error' 
              : 'btn-primary'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isInitializing ? 'Initializing...' : isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        
      </div>
    </div>
  );
}

export default Recorder; 