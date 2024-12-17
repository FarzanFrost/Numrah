from elevenlabs import ElevenLabs
from fastapi import APIRouter
from app.config import Settings
from elevenlabs.types import GetVoicesResponse

router = APIRouter(prefix="/voice_selection", tags=["voices"])
settings = Settings()

@router.get('/voices', response_model=GetVoicesResponse, status_code=200)
async def voices():
    client = ElevenLabs(
        api_key=settings.ELEVENLABS_API_KEY
    )

    return client.voices.get_all()
