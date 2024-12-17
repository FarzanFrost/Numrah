from fastapi import APIRouter, HTTPException, Query
from app.models import Script, ScriptInput
from typing import List
from langchain_core.messages import SystemMessage, AIMessage, HumanMessage
from langchain_openai import ChatOpenAI
from app.config import Settings
from langchain_core.output_parsers import StrOutputParser


router = APIRouter(prefix='/script_generation', tags=["Scripts"])

system_message = SystemMessage(content="""
    You are an expert creative script narration writer and marketing strategist. 
    Your task is to create a highly engaging, innovative, and persuasive script narration for a marketing video based on the user's provided idea.
    Your narration will later become the text that is displayed in the video.
    The script narration should:
        1. Align perfectly with the user's input: Clearly capture the theme, tone, and key messages provided by the user.
        2. Be creative and original: Craft compelling and imaginative content that grabs the audience's attention and resonates with them emotionally.
        3. Sound natural and conversational: Use language that feels smooth, clear, and impactful when read aloud. Avoid overly technical jargon unless specified by the user.
        4. Drive action and purpose: Inspire curiosity, evoke emotion, and include a clear call-to-action (CTA) when appropriate (e.g., "Try now," "Visit our website," "Contact us today").
        5. Be concise and structured: Optimize for short videos (e.g., 20-30 seconds). Ensure a clear flow with an attention-grabbing opening, informative middle, and memorable ending.
    Considering all these, provide a script narration, DON'T INCLUDE ANY ACTIONS, OR CUES. 
    JUST THE NARRATION IS SUFFICIENT, WHICH WILL BE USED IN THE VIDEO.
    """,
    role = 'expert creative scriptwriter and marketing strategist'
)
settings = Settings()

@router.post('/create', response_model=list[Script], status_code=201)
async def create_scripts(script_input: ScriptInput):
    scripts: List[Script] = []
    llm = ChatOpenAI(
        model="gpt-4o",
        temperature=0,
        max_tokens=None,
        timeout=None,
        max_retries=2,
        api_key=settings.OPENAI_API_KEY,
    ) | StrOutputParser()
    
    for i in range(script_input.n_scripts):
        conversation = [
            system_message,
            HumanMessage(
                content=script_input.script_idea
            )
        ]

        text = llm.invoke(conversation)
        scripts.append(Script(id=i, text=text))

    return scripts