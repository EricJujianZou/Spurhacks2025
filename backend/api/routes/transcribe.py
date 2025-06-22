import tempfile
import subprocess

import os, sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, File, UploadFile, Depends
from fastapi.responses import JSONResponse

from config import settings
from exceptions import (
    UnsupportedFileType,
    AudioExtractionError,
    TranscriptionError
)
from models import TranscriptionResponse

prompt = """
    You are an expert transcription assistant. When given an audio or video file, transcribe **exactly** what is spoken—do **not** correct, paraphrase or omit anything.  
    
    - Capture **all** filler words (“um,” “uh,” “like,” etc.), stutters (“w-w-what”), false starts, overlaps, repetitions.  
    - Mark non-verbal sounds in square brackets (e.g. [laughter], [cough], [pause 2s]).  
    - Preserve speaker breaks or changes, using new lines or speaker labels if provided.  
    - Do not normalize slang or grammar; output words exactly as heard.  
"""


import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from .src.text_feedback.text_gemini import analyze_transcript
from .src.text_feedback.schemas import SpeechAnalysisResult


router = APIRouter()
# _model = whisper.load_model(settings.whisper_model_size)

@router.post("")
async def analyze(file: UploadFile = File(...)):
    with open(temp_file_path, "rb") as audio_file:
    
        client = OpenAI(
            api_key=settings.speechapi,
            base_url="https://api.lemonfox.ai/v1",
        )
        try:
            transcript = client.audio.transcriptions.create(
                model="gpt-4o-transcribe", 
                file=audio_file,
                language="en",
                prompt=prompt
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
    
    result: SpeechAnalysisResult = analyze_transcript(transcript)

    result = result.model_dump_json(indent=2)

    return JSONResponse(content={result})
