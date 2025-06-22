from fastapi import HTTPException

class UnsupportedFileType(HTTPException):
    def __init__(self, filename: str):
        super().__init__(status_code=400,
                         detail=f"Unsupported file type: {filename}")

class AudioExtractionError(HTTPException):
    def __init__(self, message: str):
        super().__init__(status_code=500,
                         detail=f"Audio extraction failed: {message}")

class TranscriptionError(HTTPException):
    def __init__(self, message: str):
        super().__init__(status_code=500,
                         detail=f"Transcription failed: {message}")
