/**
 * Main App Component
 * 
 * This is the root component that handles the landing page and routing
 * to the speech recorder functionality.
 */

import React, { useState, useCallback } from 'react';
import Recorder from './components/Recorder';

/**
 * Main Application Component
 * 
 * Renders the landing page with hero section and dashboard preview.
 * Handles navigation to the speech recorder when user clicks "Try Demo".
 * 
 * @returns {JSX.Element} The main application component
 */
function App() {
  // State to control whether to show the recorder or landing page
  const [showRecorder, setShowRecorder] = useState(false);

  /**
   * Handles the demo button click
   * Opens the speech recorder interface
   */
  const handleDemoClick = useCallback(() => {
    setShowRecorder(true);
  }, []);

  /**
   * Handles closing the recorder
   * Returns to the main landing page
   */
  const handleRecorderClose = useCallback(() => {
    setShowRecorder(false);
  }, []);

  // Show recorder component if demo is active
  if (showRecorder) {
    return <Recorder onClose={handleRecorderClose} />;
  }

  // Main landing page
  return (
    <div className="h-screen bg-page-bg flex items-center py-lg overflow-hidden">
      <div 
        className="max-w-layout mx-auto px-xl flex flex-col items-center gap-lg w-full h-full" 
        style={{ marginTop: '45rem' }}
      >
        {/* Hero Section */}
        <h1 className="font-manrope text-h1 font-bold text-text-primary text-center max-w-4xl -mt-20">
          Judgement free speech feedback with AI.
        </h1>

        <h2 className="font-manrope text-h2 font-normal text-text-secondary text-center max-w-2xl">
          Practice what you preach, literally.
        </h2>

        <button 
          onClick={handleDemoClick}
          className="btn-primary min-w-32"
          aria-label="Try the demo - record your speech"
        >
          Try Demo
        </button>

        {/* Dashboard Preview Image */}
        <div className="relative w-full mt-2xl">
          <img 
            src="/images/dashboard.png"
            alt="Speech Analysis Dashboard showing confidence scores, speech composition, video player, and personalized feedback"
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-auto object-cover rounded-xl scale-110"
          />
        </div>
      </div>
    </div>
  );
}

export default App; 