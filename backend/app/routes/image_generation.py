from fastapi import APIRouter
from runware import Runware, IImageInference
from runware.types import IOutputType, IImage
from app.config import Settings
from typing import Union, List, Tuple
from app.models import ImageInput


router = APIRouter(prefix='/image_generation', tags=["Images"])
settings = Settings()

system_prompt = """
Take the input image and creatively transform its design elements while maintaining the original size, shape, structure, view and key architectural or physical features.
Modify only the stylistic aspects such as colors, textures, patterns, materials, and decor elements according to the specified design style.
Ensure the output looks visually cohesive, realistic, and aligns with the given style while preserving the core identity and layout of the original image.
"""

@router.post('/create_images', response_model=Union[List[Tuple[str, str]], None], status_code=201)
async def generate_images(data: ImageInput):
    
    runware = Runware(
        api_key=settings.RUNWARE_API_KEY
    )
    await runware.connect()
    
    results = []
    
    for styles in data.styles:
        for style in styles:
            request_image = IImageInference(
                positivePrompt=system_prompt + '\n' + data.prompt + '\n' + f'The image should be in {style} style.',
                model="civitai:36520@76907",
                numberResults=1,
                negativePrompt="cloudy, rainy",
                height=512,
                width=512,
                outputType="base64Data",
                seedImage=data.input_image,
            )
            images = await runware.imageInference(requestImage=request_image)
            results.extend([(image.imageBase64Data, style) for image in images])

    return results