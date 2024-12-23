from pydantic import BaseModel, Field, field_validator
from .script_generation import Script
from typing import List, Tuple


class VideosInput(BaseModel):
    scripts: List[Script] = Field(..., title="Scripts to generate voice")
    voices: List[str] = Field(..., title="Voices for the scripts.")
    images: List[List[Tuple[str, str]]] = Field(..., title="List of list of images")
    background_image: str = Field(..., title="Background image for videos")

    @field_validator("images", mode="before")
    def images_reshape(cls, v):
        if not isinstance(v, list):
            raise ValueError("Input must be a list")
        if len(v) % 5 != 0:
            raise ValueError("List length must be a multiple of 5.")
        
        return [
            v[i:i+5] for i in range(0, len(v), 5)
        ]

class Video(BaseModel):
    name: str = Field(..., title="Name of the video")
    url: str = Field(..., title="Path of the video")
    duration: float = Field(..., title="Duration of the video")
    size: int = Field(..., title="Size of the video")
    image: str = Field(..., title="Preview Image of the video")    
