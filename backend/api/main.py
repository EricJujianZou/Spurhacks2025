from fastapi import APIRouter

from .routes.transcribe import router as analuyze_router

api_router = APIRouter()
api_router.include_router(
    analuyze_router,
    prefix="/analyze",
    tags=["analyze"]
)

@api_router.get("/")
async def check():
    return {"status": "API - OK"}
