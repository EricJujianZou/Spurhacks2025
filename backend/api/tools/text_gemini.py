import os
from google import genai
from google.genai import types
from google.api_core import exceptions as google_exceptions
from tenacity import retry, stop_after_attempt, wait_random_exponential, retry_if_exception_type
from pydantic import ValidationError
from dotenv import load_dotenv

from models import SpeechAnalysisResult
from api.tools.prompts import get_analysis_prompt

from config import settings

# --- 1. Load Environment from .env---
# load_dotenv()
# API_KEY = os.getenv('GEMINI_API_KEY')
# if not API_KEY:
#     raise ValueError("GEMINI_API_KEY environment variable not set.")

# --- Centralized Client and Model Configuration w the API key.
# 
# REPLACE WITH YOUR OWN API KEY BY MAKING A .ENV!!!! ---

client = genai.Client(api_key=settings.gemini_api_key)

#error handling and retrying

RETRYABLE_EXCEPTIONS = (
    google_exceptions.InternalServerError,
    google_exceptions.ServiceUnavailable,
    google_exceptions.TooManyRequests,
    google_exceptions.ResourceExhausted,
)

@retry(
    retry=retry_if_exception_type(RETRYABLE_EXCEPTIONS),
    wait=wait_random_exponential(min=1, max=30),
    stop=stop_after_attempt(2)
)
def analyze_transcript(transcript: str, video_length: str) -> SpeechAnalysisResult:
    """
    Analyzes a speech transcript using the Gemini model and returns structured feedback.
    (Docstring and args remain the same)
    """
    prompt = get_analysis_prompt(transcript, video_length)

    try:
        response = client.models.generate_content(
            model = "gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=prompt
            )
            
        )
        if not response.text:
            raise ValueError("The AI model returned an empty response.")

        # LLMs sometimes wrap their JSON output in Markdown code blocks.
        # This removes the wrapper before parsing to prevent validation errors.
        cleaned_text = response.text.strip()
        if cleaned_text.startswith("```json"):
            # Remove the starting ```json and any leading newline
            cleaned_text = cleaned_text.lstrip("```json").lstrip()
        if cleaned_text.endswith("```"):
            # Remove the ending ``` and any trailing newline
            cleaned_text = cleaned_text.rstrip("```").rstrip()

        return SpeechAnalysisResult.model_validate_json(cleaned_text)

    except ValidationError as e:
        print(f"Pydantic validation failed for Gemini response: {e}\nRaw Response: {getattr(response, 'text', 'N/A')}")
        raise ValueError("The AI model returned a response with an invalid format.")
    except Exception as e:
        print(f"An unexpected error occurred during Gemini API call: {e}")
        raise