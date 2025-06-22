/**
 * Utility Functions
 * 
 * This file contains reusable utility functions used throughout the application
 * for time formatting, file handling, and media recording operations.
 */

/**
 * Formats seconds into MM:SS time format
 * 
 * @param {number} seconds - The number of seconds to format
 * @returns {string} Time formatted as MM:SS (e.g., "3:45")
 * 
 * @example
 * formatTime(125) // returns "2:05"
 * formatTime(65)  // returns "1:05"
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Generates a timestamped filename for recordings
 * 
 * @param {string} prefix - Optional prefix for the filename (default: 'recording')
 * @returns {string} Filename with timestamp (e.g., "recording-2024-01-15T10-30-45.webm")
 * 
 * @example
 * generateFilename()           // returns "recording-2024-01-15T10-30-45.webm"
 * generateFilename('speech')   // returns "speech-2024-01-15T10-30-45.webm"
 */
export const generateFilename = (prefix = 'recording') => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${prefix}-${timestamp}.webm`;
};

/**
 * Finds the best supported MIME type from a list of options
 * 
 * @param {string[]} mimeTypes - Array of MIME types to check, in order of preference
 * @returns {string|null} The first supported MIME type, or null if none are supported
 * 
 * @example
 * getBestMimeType(['video/webm;codecs=vp9', 'video/webm'])
 * // returns the first supported format
 */
export const getBestMimeType = (mimeTypes) => {
  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }
  return null;
};

/**
 * Downloads a blob as a file
 * 
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The name for the downloaded file
 * 
 * @example
 * downloadBlob(recordingBlob, 'my-speech.webm')
 */
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Checks if the getUserMedia API is supported in the current browser
 * 
 * @returns {boolean} True if getUserMedia is supported, false otherwise
 * 
 * @example
 * if (isGetUserMediaSupported()) {
 *   // Proceed with recording
 * } else {
 *   // Show unsupported message
 * }
 */
export const isGetUserMediaSupported = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}; 