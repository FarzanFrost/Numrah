from fastapi import APIRouter, HTTPException, Query
from app.models import Script, ScriptInput
from typing import List


router = APIRouter(prefix='/script_generation', tags=["Scripts"])

@router.post('/create', response_model=list[Script], status_code=201)
async def create_scripts(script_input: ScriptInput):
    print("hi")
    scripts: List[Script] = []
    for i in range(script_input.n_scripts):
        text = """
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae at molestias aliquam voluptatem ipsum, 
            eligendi aut eos ratione, unde reprehenderit dicta tempore perferendis, 
            reiciendis dolorum nulla. Harum laboriosam dolor iste.
        """
        scripts.append(Script(id=i, text=text))

    return scripts