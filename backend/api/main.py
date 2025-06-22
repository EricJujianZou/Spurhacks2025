from fastapi import APIRouter

# from .routes.transcribe import router as transcribe_router

api_router = APIRouter()
api_router.include_router(
    transcribe_router,
    prefix="/transcribe",
    tags=["transcription"]
)
