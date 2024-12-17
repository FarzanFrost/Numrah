from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    OPENAI_API_KEY: str = Field(env="OPENAI_API_KEY")
    ELEVENLABS_API_KEY: str = Field(env="ELEVENLABS_API_KEY")
    RUNWARE_API_KEY: str = Field(env="RUNWARE_API_KEY")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

