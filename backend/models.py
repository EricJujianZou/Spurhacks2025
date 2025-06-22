from pydantic import BaseModel, Field
from typing import List

class SpeechComposition(BaseModel):
    """
    Percentage breakdown of the speech style; values should sum to 100.
    """
    persuasive: float = Field(..., ge=0, le=100)
    informative: float = Field(..., ge=0, le=100)
    demonstrative: float = Field(..., ge=0, le=100)

class SpeechAnalysisResult(BaseModel):
    """
    Standard output format in json format.
    """
    overallPercentage: float = Field(..., ge=0, le=100, description="Aggregate performance score (0–100).")
    confidenceScore: float = Field(..., ge=0, le=100, description="Perceived confidence while speaking (0–100).")
    eyeContactScore: float = Field(..., ge=0, le=100, description="Effectiveness of eye contact with audience (0–100).")
    clarityScore: float = Field(..., ge=0, le=100, description="Clarity of speech articulation (0–100).")
    engagementScore: float = Field(..., ge=0, le=100, description="Audience engagement level (0–100).")
    wordsSpoken: int = Field(..., ge=0, description="Total number of words spoken.")
    speakingRate: float = Field(..., ge=0, description="Speaking rate in words per minute.")
    fillerWordCount: int = Field(..., ge=0, description="Total occurrences of filler words (e.g., 'um', 'uh').")
    pauses: int = Field(..., ge=0, description="Number of significant pauses detected.")
    speechComposition: SpeechComposition
    strengths: str = Field(..., min_length=10, max_length=300, description="1–2 sentences summarizing key strengths.")
    weaknesses: str = Field(..., min_length=10, max_length=300, description="1–2 sentences summarizing key weaknesses.")
    nextSteps: List[str] = Field(..., min_length=3, max_length=3, description="Exactly three actionable improvement points.")
