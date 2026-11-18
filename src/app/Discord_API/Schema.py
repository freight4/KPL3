from pydantic import BaseModel


class TeamCreate(BaseModel):
    discord_id: str
    discord_name: str
    team_name: str

class TeamNameRequest(BaseModel):
    team_name: str