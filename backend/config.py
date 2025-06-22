from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ffmpeg_binary: str = "ffmpeg"
    sample_rate: int = 16000
    audio_channels: int = 1
    whisper_model_size: str = "base"

settings = Settings()
