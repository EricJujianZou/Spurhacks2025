import { API_CONFIG } from '../constants';

/**
 * Makes a POST request to upload and analyze a video file
 * 
 * @param {Blob} videoBlob - The recorded video blob to analyze
 * @returns {Promise<Object>} - Promise that resolves to the complete speech analysis
 */
export async function analyzeVideo(videoBlob) {
  if (!videoBlob) {
    throw new Error('No video blob provided');
  }

  const formData = new FormData();
  formData.append('file', videoBlob, 'recording.webm');

  const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYZE}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    body: formData,
    headers: {
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ Speech analysis result:', result);
  
  return result;
}

