import subprocess
from typing import Union

from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse

from config import settings
from exceptions import AudioExtractionError, TranscriptionError, UnsupportedFileType
from models import TranscriptionResponse
from openai import OpenAI
from src.text_feedback.text_gemini import analyze_transcript
from src.text_feedback.schemas import SpeechAnalysisResult

router = APIRouter()

PROMPT = """
You are an expert transcription assistant. When given an audio or video file, transcribe **exactly** what is spoken—do **not** correct, paraphrase or omit anything.

- Capture **all** filler words (“um,” “uh,” “like,” etc.), stutters (“w-w-what”), false starts, overlaps, repetitions.
- Mark non-verbal sounds in square brackets (e.g. [laughter], [cough], [pause 2s]).
- Preserve speaker breaks or changes, using new lines or speaker labels if provided.
- Do not normalize slang or grammar; output words exactly as heard.
"""


def convert_webm_blob_to_mp3_bytes(
    webm_blob: bytes,
    ffmpeg_binary: str = settings.ffmpeg_binary,
    sample_rate: int = settings.sample_rate,
    audio_channels: int = settings.audio_channels,
) -> bytes:
    """
    Convert an in-memory WebM blob into MP3 data via ffmpeg pipes.
    """
    cmd = [
        ffmpeg_binary,
        "-i", "pipe:0",            # read WebM from stdin
        "-vn",                      # drop video
        "-acodec", "libmp3lame",    # MP3 encoder
        "-ar", str(sample_rate),    # sample rate
        "-ac", str(audio_channels), # channels
        "-f", "mp3",                # force MP3 format
        "pipe:1",                   # write MP3 to stdout
    ]

    try:
        proc = subprocess.run(
            cmd,
            input=webm_blob,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True,
        )
    except subprocess.CalledProcessError as e:
        raise AudioExtractionError(f"ffmpeg failed: {e.stderr.decode()}") from e

    return proc.stdout


@router.post("", response_model=TranscriptionResponse)
async def analyze(file: UploadFile = File(...)):
    if file.content_type != "video/webm":
        raise UnsupportedFileType("Please upload a WebM file (content_type=video/webm).")

    webm_bytes = await file.read()
    mp3_bytes = convert_webm_blob_to_mp3_bytes(webm_bytes)

    client = OpenAI(
        api_key=settings.openai_api,
        base_url="https://api.lemonfox.ai/v1",
    )
    try:
        transcript = client.audio.transcriptions.create(
            model="gpt-4o-transcribe",
            file=mp3_bytes,
            language="en",
            prompt=PROMPT.strip(),
        )
    except Exception as e:
        raise TranscriptionError("Failed to transcribe audio") from e

    print(transcript)
    analysis: SpeechAnalysisResult = analyze_transcript(transcript)
    result_dict = analysis.model_dump()

    return JSONResponse(content=result_dict, status_code=200)
