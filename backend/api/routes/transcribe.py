import tempfile
import subprocess

import os, sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, File, UploadFile, Depends
from fastapi.responses import JSONResponse

import whisper

from config import settings
from exceptions import (
    UnsupportedFileType,
    AudioExtractionError,
    TranscriptionError
)
from models import TranscriptionResponse

router = APIRouter()
# _model = whisper.load_model(settings.whisper_model_size)

@router.post("", response_model=TranscriptionResponse)
async def transcribe_video(file: UploadFile = File(...)):
    client = OpenAI(
        api_key=settings.speechapi,
        base_url="https://api.lemonfox.ai/v1",
    )
    try:
        transcript = client.audio.transcriptions.create(
            model="Whisper-1",
            file=file,
            language="en"
        )       
        text = transcript
        print(text)
    except Exception as e:
        raise TranscriptionError(str(e))
    finally:
        # cleanup temp files
        for p in (video_path, audio_path):
            if os.path.exists(p):
                os.remove(p)

    return JSONResponse(content={"transcription": text})
