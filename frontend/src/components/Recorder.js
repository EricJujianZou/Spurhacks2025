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
  MIME_TYPES,
  API_CONFIG
} from '../constants';
import { 
  formatTime, 
  getBestMimeType, 
  isGetUserMediaSupported 
} from '../utils';
import { analyzeVideo } from '../utils/apiCall';
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
  // Eye contact detection refs
  const modelRef = useRef(null);          // Teachable Machine model instance
  const eyeContactFramesRef = useRef(0);  // Number of frames with eye contact
  const totalFramesRef = useRef(0);       // Total frames analysed
  const predictionIntervalRef = useRef(null); // Interval ID for predictions

  // URL path to your Teachable Machine model (placed in public/my_model)
  const TM_MODEL_URL = 'https://teachablemachine.withgoogle.com/models/9kLQtUrC6/';

  // ========== STATE ==========
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [recordingBlob, setRecordingBlob] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
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

  /**
   * Load Teachable Machine eye-contact model if not already loaded
   */
  const loadEyeContactModel = useCallback(async () => {
    if (modelRef.current) {
      console.log('Eye contact model already loaded');
      return;
    }
    
    if (!window.tmImage) {
      console.error('Teachable Machine library not loaded - window.tmImage is undefined');
      return;
    }
    
    try {
      console.log('Loading eye contact model from:', TM_MODEL_URL);
      const modelURL = `${TM_MODEL_URL}model.json`;
      const metadataURL = `${TM_MODEL_URL}metadata.json`;
      
      console.log('Model URL:', modelURL);
      console.log('Metadata URL:', metadataURL);
      
      modelRef.current = await window.tmImage.load(modelURL, metadataURL);
      console.log('Eye contact model loaded successfully:', modelRef.current);
    } catch (err) {
      console.error('Failed to load eye contact model:', err);
      console.error('Model URL attempted:', TM_MODEL_URL);
    }
  }, []);

  /**
   * Start prediction loop to evaluate eye contact while recording
   */
  const startEyeContactDetection = useCallback(async () => {
    console.log('Starting eye contact detection...');
    
    if (!modelRef.current) {
      console.error('Eye contact model not loaded, cannot start detection');
      return;
    }
    
    if (!videoRef.current) {
      console.error('Video element not available, cannot start detection');
      return;
    }

    eyeContactFramesRef.current = 0;
    totalFramesRef.current = 0;
    console.log('Eye contact detection initialized, starting prediction loop...');

    // Run prediction roughly every 300ms
    predictionIntervalRef.current = setInterval(async () => {
      try {
        const predictions = await modelRef.current.predict(videoRef.current);
        if (!predictions || predictions.length === 0) {
          console.warn('No predictions returned from model');
          return;
        }

        // Log predictions for debugging (only every 10th frame to avoid spam)
        if (totalFramesRef.current % 10 === 0) {
          console.log('Predictions:', predictions);
        }

        // Assume the class "Eye Contact" (index 0) indicates looking at camera
        const eyeContactProb = predictions[0].probability;
        totalFramesRef.current += 1;
        if (eyeContactProb >= 0.5) {
          eyeContactFramesRef.current += 1;
        }
        
        // Log progress every 10 frames
        if (totalFramesRef.current % 10 === 0) {
          console.log(`Eye contact progress: ${eyeContactFramesRef.current}/${totalFramesRef.current} frames`);
        }
      } catch (err) {
        console.error('Eye contact prediction failed:', err);
      }
    }, 300);
  }, []);

  /**
   * Stop prediction loop
   */
  const stopEyeContactDetection = useCallback(() => {
    if (predictionIntervalRef.current) {
      clearInterval(predictionIntervalRef.current);
      predictionIntervalRef.current = null;
    }
  }, []);

  // ========== EFFECTS ==========

  /**
   * Initialize media stream on component mount and when returning to recorder view
   * Requests camera and microphone permissions and sets up video preview
   */
  useEffect(() => {
    // Only initialize media when in recorder view
    if (currentView !== 'recorder') return;

    let isMounted = true;

    async function initializeMedia() {
      try {
        setError(null);
        setIsInitializing(true);

        // Check browser compatibility
        if (!isGetUserMediaSupported()) {
          throw new Error('getUserMedia is not supported in this browser');
        }

        // Request media access and load eye contact model in parallel
        const [mediaStream] = await Promise.all([
          navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS),
          loadEyeContactModel()
        ]);
        
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

    // Cleanup when leaving recorder view or unmounting
    return () => {
      isMounted = false;
      if (currentView !== 'recorder') {
        cleanup();
      }
    };
  }, [cleanup, currentView]);

  // ========== EVENT HANDLERS ==========

  /**
   * Handles completion of recording
   * Creates blob from recorded chunks and transitions to review screen
   */
  const handleRecordingComplete = useCallback(() => {
    if (chunksRef.current.length === 0) return;

    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    setRecordingBlob(blob);

    // Compute eye contact score percentage
    const eyeContactScore = totalFramesRef.current > 0 ?
      Math.round((eyeContactFramesRef.current / totalFramesRef.current) * 100) : 0;

    // Log eye contact score to console
    console.log(`Eye Contact Score: ${eyeContactScore}% (${eyeContactFramesRef.current}/${totalFramesRef.current} frames)`);

    // Store preliminary analysis data with eyeContactScore; will merge later
    setAnalysisData(prev => ({ ...(prev || {}), eyeContactScore }));

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

      // Begin eye-contact detection
      startEyeContactDetection();

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
  }, [handleRecordingComplete, startEyeContactDetection]);

  /**
   * Stops video recording
   * Stops MediaRecorder and timer, triggers completion handler
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    // Stop eye-contact detection loop
    stopEyeContactDetection();
    
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
    setAnalysisData(null);
  }, []);

  /**
   * Handles analyze speech button click
   * Makes API call to backend and transitions to loading/analysis
   */
  const handleAnalyzeSpeech = useCallback(async () => {
    setCurrentView('loading');

    try {
      console.log('Starting speech analysis');
      const result = await analyzeVideo(recordingBlob);
      console.log('Integration ready! Backend returned:', result);

      // Merge backend result with locally computed eye contact score (override if backend provides)
      setAnalysisData(prev => ({ ...result, eyeContactScore: prev?.eyeContactScore }));

      // Switch to dashboard now that analysis is complete
      setCurrentView('dashboard');
    } catch (error) {
      console.error('API call failed:', error);
      setError('Analysis failed. Please try again.');
      // Return to review screen so user can retry or re-record
      setCurrentView('review');
    }
  }, [recordingBlob]);

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
    return <LoadingScreen onComplete={handleLoadingComplete} autoComplete={false} />;
  }

  /**
   * Renders the dashboard with analysis results
   */
  if (currentView === 'dashboard') {
    return (
      <Dashboard 
        onBack={handleDashboardBack} 
        recordingBlob={recordingBlob}
        analysisData={analysisData}
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
          <div className="font-manrope text-xl font-bold text-text-primary">
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
      <div className="flex flex-col items-center justify-center gap-md max-w-layout mx-auto mt-16">
        
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
        <div className="font-manrope text-2xl font-bold text-text-primary min-h-8 flex items-center">
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