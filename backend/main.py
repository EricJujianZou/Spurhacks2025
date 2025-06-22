import uvicorn
from fastapi import FastAPI
from config import settings
from api.main import api_router

app = FastAPI(
    title="Video Speech Consulting AI",
    version="1.0.0"
)

# mount all routes under /api/v1
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def health_check():
    return {"status": "SPURHACKS TEAM - Speech Consulting", "model": settings.whisper_model_size}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
