/**
 * Loading Screen Component
 * 
 * Displays an animated loading screen while speech analysis is being processed.
 * Shows progress indicators, step descriptions, and helpful tips for users.
 */

import React, { useState, useEffect } from 'react';

/**
 * Animated loading icon using SVG
 * 
 * @returns {JSX.Element} Spinning loading icon
 */
const LoadingIcon = () => (
  <svg className="animate-spin h-8 w-8 text-emerald-600" viewBox="0 0 24 24">
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4" 
      fill="none"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/**
 * Loading Screen Component
 * 
 * Simulates speech analysis processing with progress bar and step indicators.
 * Automatically completes after 5 seconds and calls onComplete callback.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onComplete - Callback function called when loading completes
 * @param {boolean} props.autoComplete - Whether to automatically complete loading
 * @returns {JSX.Element} Loading screen with progress and tips
 */
const LoadingScreen = ({ onComplete, autoComplete = true }) => {
  // State for progress percentage (0-100)
  const [progress, setProgress] = useState(0);
  
  // State for current step index
  const [currentStep, setCurrentStep] = useState(0);

  // Analysis steps to display during loading
  const steps = [
    "Processing your recording...",
    "Analyzing speech patterns...",
    "Evaluating confidence levels...",
    "Generating personalized feedback...",
    "Finalizing your results..."
  ];

  // Progress bar animation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          if (autoComplete && onComplete) {
            // Complete loading after brief delay
            setTimeout(() => onComplete(), 500);
          }
          return 100;
        }
        // Increment progress by 2% every 100ms (5 seconds total)
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [onComplete, autoComplete]);

  // Step progression effect
  useEffect(() => {
    const stepTimer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepTimer);
          return prev;
        }
        // Move to next step every second
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(stepTimer);
  }, [steps.length]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          
          {/* Loading Icon */}
          <div className="flex justify-center mb-6">
            <LoadingIcon />
          </div>

          {/* Main Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Analyzing Your Speech
          </h2>

          {/* Current Processing Step */}
          <p className="text-gray-600 mb-6 h-6">
            {steps[currentStep]}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress Percentage */}
          <p className="text-sm text-gray-500">
            {Math.round(progress)}% Complete
          </p>

        
          
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 