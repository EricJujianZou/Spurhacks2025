/**
 * Application Constants
 * 
 * This file contains all the constant values used throughout the application
 * including media recording settings and mock data for components.
 */

/**
 * API Configuration
 * Update these URLs when deploying to production or changing backend location
 */
export const API_CONFIG = {
  BASE_URL: 'https://4d07-99-209-52-138.ngrok-free.app',
  ENDPOINTS: {
    ANALYZE: '/api/v1/analyze', // Backend endpoint for complete speech analysis
    HEALTH: '/'
  }
};

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
