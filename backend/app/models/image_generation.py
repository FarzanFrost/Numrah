from pydantic import BaseModel, Field
from typing import List


class ImageInput(BaseModel):
    input_image: str = Field(..., title="Base64 input image")
    styles: List[List[str]] = Field(..., title="List of list of styles.")
    prompt: str = Field(..., title="Prompt for the image generation.")