from fastapi import APIRouter
from runware import Runware, IImageInference
from runware.types import IOutputType, IImage
from app.config import Settings
from typing import Union, List
from app.models import ImageInput


router = APIRouter(prefix='/image_generation', tags=["Images"])
settings = Settings()

# @router.post('/create_images', response_model=Union[List[IImage], None], status_code=201)
@router.post('/create_images', status_code=201)
async def generate_images(data: ImageInput):
    # return [data.input_image]
    runware = Runware(
        api_key=settings.RUNWARE_API_KEY
    )
    await runware.connect()
    request_image = IImageInference(
        positivePrompt="a beautiful sunset over the mountains",
        model="civitai:36520@76907",
        numberResults=2,
        negativePrompt="cloudy, rainy",
        height=512,
        width=512,
        outputType=IOutputType["base64Data"]
    )
    images = await runware.imageInference(requestImage=request_image)
    return images