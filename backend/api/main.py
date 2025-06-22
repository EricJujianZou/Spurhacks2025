from fastapi import APIRouter

from api.routes.transcribe import router as analyze_router

api_router = APIRouter()
api_router.include_router(
    analyze_router,
    prefix="/analyze",
    tags=["analyze"]
)

@api_router.get("/")
async def check():
    return {"status": "API - OK"}
