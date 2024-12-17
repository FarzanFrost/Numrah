from pydantic import BaseModel, Field

class Script(BaseModel):
    id: int = Field(..., title='Id of the script')
    text: str = Field(..., title='Script content')


class ScriptInput(BaseModel):
    script_idea: str = Field(..., title='Idea for the script.')
    n_scripts: int = Field(..., title='Number of scripts required')