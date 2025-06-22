import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from src.text_feedback.text_gemini import analyze_transcript
from src.text_feedback.schemas import SpeechAnalysisResult


def main():
    """
    Runs the speech analysis tool with a hardcoded transcript.
    """
    # Hardcoded transcript for direct testing
    transcript = (
        "Hi everyone, so, my presentation is about... um... our new project, Articula. "
        "Basically, it's like... an AI tool that helps people with public speaking. "
        "We think it's really important because, you know, a lot of students feel anxious. "
        "So, the main feature is, uh, it analyzes your video and gives you, like, "
        "feedback on filler words and... and eye contact. We think it could, um, "
        "really help people gain confidence before a big interview or something. "
        "Yeah, that's the idea."
    )

    try:
        print("Analyzing transcript... (This may take a moment)")

        result: SpeechAnalysisResult = analyze_transcript(transcript)

        print("\n--- Analysis Complete ---")
        # Use model_dump_json for a JSON output
        print(result.model_dump_json(indent=2))
        print("--- End of Analysis ---")

    except Exception as e:
        print(f"An unexpected error occurred: {e}")


if __name__ == "__main__":
    main()

