import subprocess
from typing import Union, Tuple
import re
import math
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from config import settings
from exceptions import AudioExtractionError, TranscriptionError, UnsupportedFileType
from models import SpeechAnalysisResult
from openai import OpenAI
from api.tools.text_gemini import analyze_transcript
from api.tools.prompts import get_transcriber_prompt

router = APIRouter()

_TIME_REGEX = re.compile(r"time=(\d+):(\d+):(\d+\.?\d*)")

def _parse_hms_to_seconds(h: str, m: str, s: str) -> float:
    return int(h) * 3600 + int(m) * 60 + float(s)

def convert_webm_blob_to_mp3_bytes(
    webm_blob: bytes,
    ffmpeg_binary: str = settings.ffmpeg_binary,
    sample_rate: int = settings.sample_rate,
    audio_channels: int = settings.audio_channels,
) -> Tuple[bytes, float]:
    """
    Convert an in-memory WebM blob into MP3 via ffmpeg pipes,
    and return (mp3_bytes, duration_seconds).

    First tries ffprobe; if that yields 'N/A', falls back to ffmpeg-null-decode.
    """
    # Derive ffprobe from ffmpeg path
    ffprobe = getattr(settings, "ffprobe_binary", None) or ffmpeg_binary.replace("ffmpeg", "ffprobe")

    # --- 1) Probe with ffprobe ---
    probe_cmd = [
        ffprobe,
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        "-i", "pipe:0",
    ]
    try:
        p = subprocess.run(
            probe_cmd,
            input=webm_blob,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            check=True,
        )
        out = p.stdout.decode().strip()
        duration = float(out)
    except (subprocess.CalledProcessError, ValueError):
        # ffprobe didn’t give us a number
        duration = 0.0

    # --- 2) Fallback: ffmpeg decode to null ---
    if duration <= 0.0:
        null_cmd = [
            ffmpeg_binary,
            "-i", "pipe:0",
            "-f", "null", "-"      # decode everything, but don’t write output
        ]
        try:
            # We capture stderr because progress goes there
            p = subprocess.run(
                null_cmd,
                input=webm_blob,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                check=True,
            )
            stderr = p.stderr.decode()
            # Find the last “time=HH:MM:SS.mm”
            matches = _TIME_REGEX.findall(stderr)
            if matches:
                h, m, s = matches[-1]
                duration = _parse_hms_to_seconds(h, m, s)
        except subprocess.CalledProcessError as e:
            # If even this fails, just leave duration=0.0
            pass

    # --- 3) Actual conversion ---
    conv_cmd = [
        ffmpeg_binary,
        "-i", "pipe:0",
        "-vn",
        "-acodec", "libmp3lame",
        "-ar", str(sample_rate),
        "-ac", str(audio_channels),
        "-f", "mp3",
        "pipe:1",
    ]
    try:
        p = subprocess.run(
            conv_cmd,
            input=webm_blob,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True,
        )
        mp3_bytes = p.stdout
    except subprocess.CalledProcessError as e:
        raise AudioExtractionError(f"ffmpeg failed: {e.stderr.decode(errors='ignore')}") from e

    return mp3_bytes, duration

@router.post("")
async def analyze(file: UploadFile = File(...)):
    if file.content_type != "video/webm":
        raise UnsupportedFileType("Please upload a WebM file (content_type=video/webm).")

    webm_bytes = await file.read()
    mp3_data, duration = convert_webm_blob_to_mp3_bytes(webm_bytes)

    client = OpenAI(
        api_key=settings.openai_api,
        base_url="https://api.lemonfox.ai/v1",
    )
    try:
        transcript = client.audio.transcriptions.create(
            model="gpt-4o-transcribe",
            file=mp3_data,
            language="en",
            prompt=get_transcriber_prompt().strip(),
        )
    except Exception as e:
        raise TranscriptionError("Failed to transcribe audio") from e
    print(duration)
    print(transcript)
    analysis: SpeechAnalysisResult = analyze_transcript(transcript, video_length=str(duration))
    result_dict = analysis.model_dump()
    
    total_secs = round(duration)
    hours   = total_secs // 3600
    minutes = (total_secs % 3600) // 60
    seconds = total_secs % 60

    time_str = f"{minutes:02d}:{seconds:02d}"

    result_dict["speechLength"] = str(time_str)

    print(result_dict)
    return JSONResponse(content=result_dict, status_code=200)
