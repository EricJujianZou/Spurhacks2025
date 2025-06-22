# Backend Integration Guide

This document explains how the frontend is set up to integrate with the backend API for speech analysis.

## 🎯 Current Integration Status

✅ **Frontend Ready**: The frontend is configured to make API calls to the backend  
🔧 **Backend Needed**: Your partner needs to ensure the backend is running and accessible

## 🚀 API Endpoint

The frontend calls this endpoint when "Analyze Speech" is clicked:

```
POST http://localhost:8000/api/v1/transcribe
```

**Request Format:**
- Content-Type: `multipart/form-data`
- Body: Form data with a `file` field containing the video blob
- File format: WebM video with audio

**Expected Response:**
```json
{
  "overallPercentage": 82.3,
  "confidenceScore": 88,
  "eyeContactScore": 76,
  "clarityScore": 90,
  "engagementScore": 80,
  "wordsSpoken": 724,
  "speakingRate": 145.6,
  "fillerWordCount": 9,
  "pauses": 12,
  "speechComposition": {
    "persuasive": 45,
    "informative": 40,
    "demonstrative": 15
  },
  "strengths": "Your voice projected confidence and clarity...",
  "weaknesses": "Eye contact was inconsistent...",
  "nextSteps": [
    "Practice maintaining steady eye contact...",
    "Rehearse with a metronome...",
    "Record and review practice sessions..."
  ]
}
```

## 📁 Integration Files

### Frontend API Configuration
- **`src/constants/index.js`**: Contains `API_CONFIG` with base URL and endpoints
- **`src/utils/api.js`**: API utility functions including `transcribeVideo()`
- **`src/components/Recorder.js`**: Handles the API call in `handleAnalyzeSpeech()`

### Backend Files (Already Present)
- **`backend/main.py`**: FastAPI application entry point
- **`backend/api/routes/transcribe.py`**: Transcription endpoint implementation
- **`backend/models.py`**: Response models (TranscriptionResponse)

## 🔧 Setup Instructions

### 1. Start the Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

The backend should be running on `http://localhost:8000`

### 2. Test the API
You can test the health endpoint:
```bash
curl http://localhost:8000/
```

Expected response:
```json
{
  "status": "SPURHACKS TEAM - Speech Consulting",
  "model": "base"
}
```

### 3. Frontend Configuration
The frontend is already configured to call the backend. Check these settings in `src/constants/index.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  ENDPOINTS: {
    TRANSCRIBE: '/api/v1/transcribe',
    HEALTH: '/'
  }
};
```

## 🎬 How It Works

1. **User Records**: User records speech using the webcam
2. **User Reviews**: User can preview and re-record if needed
3. **User Clicks "Analyze Speech"**: This triggers the API call
4. **Frontend Sends Video**: The recorded video blob is sent to the backend
5. **Backend Processes**: Backend analyzes the video using AI (speech recognition, analysis, etc.)
6. **Frontend Receives**: Frontend receives the complete analysis result (same format as mockdata.json)
7. **Continue to Dashboard**: User sees the analysis dashboard (will use real data from backend)

## 📝 Console Logs

When testing, check the browser console for these messages:

```
🚀 Starting speech analysis...
📡 Sending video to backend for analysis...
🎯 API URL: http://localhost:8000/api/v1/transcribe
📦 File size: 2.34 MB
✅ Speech analysis result: {overallPercentage: 82.3, confidenceScore: 88, ...}
🎯 Integration ready! Backend returned: {...}
📊 Overall Score: 82.3%
💬 Words Spoken: 724
💡 Strengths: Your voice projected confidence and clarity...
```

If the backend is not running, you'll see:
```
❌ API call failed: Error message
🔧 Make sure the backend is running on http://localhost:8000
📝 Continuing with mock data for demo...
```

## 🔄 Next Steps for Full Integration

1. **Test the Connection**: Ensure the backend API responds to the transcription endpoint
2. **Add Authentication**: Add API keys or JWT tokens if needed (see comments in `api.js`)
3. **Enhanced Analysis**: Extend the backend to provide more detailed speech analysis
4. **Error Handling**: Improve error messages and user feedback
5. **Production URLs**: Update `API_CONFIG.BASE_URL` for production deployment

## 🛠️ Troubleshooting

**"API call failed" Error:**
- Check if backend is running on port 8000
- Verify CORS settings in FastAPI allow requests from frontend
- Check backend logs for any errors

**"No video blob" Error:**
- User needs to record a video first
- Check that recording completed successfully

**Network Errors:**
- Verify the API URL in browser DevTools
- Check if firewall is blocking the connection

## 📞 Need Help?

The API integration is ready on the frontend side. The main file to check is:
- `src/components/Recorder.js` (line ~255, `handleAnalyzeSpeech` function)
- `src/utils/api.js` (contains the `analyzeVideo` function)
- `src/mockdata.json` (shows the exact format expected from backend)

All the hard work of setting up the API call, form data, and error handling is already done! 🎉 