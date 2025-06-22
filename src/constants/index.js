/**
 * Application Constants
 * 
 * This file contains all the constant values used throughout the application
 * including media recording settings and mock data for components.
 */

/**
 * Media recording constraints for getUserMedia API
 * Defines the video and audio settings for recording
 */
export const MEDIA_CONSTRAINTS = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user' // Use front-facing camera
  },
  audio: {
    echoCancellation: true,  // Reduce echo
    noiseSuppression: true,  // Reduce background noise
    autoGainControl: true    // Automatically adjust volume
  }
};

/**
 * Supported MIME types for video recording
 * Listed in order of preference
 */
export const MIME_TYPES = {
  preferred: 'video/webm;codecs=vp9,opus', // Best quality and compression
  fallback: 'video/webm'                   // Basic WebM format
};

/**
 * Mock dashboard data for the landing page preview
 * This is used only for the static preview on the main page
 */
export const DASHBOARD_DATA = {
  title: "Speech Analysis Dashboard",
  revenue: "$24,500",
  activities: [
    "New recording uploaded",
    "Analysis completed",
    "Report generated",
    "Feedback sent"
  ],
  chartData: [20, 45, 30, 60, 40, 80, 55, 90, 75, 95]
}; 