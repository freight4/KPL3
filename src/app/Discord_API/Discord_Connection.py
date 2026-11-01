import os
from fastapi import FastAPI, Request, HTTPException
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth

app = FastAPI()

app.add_middleware(
    SessionMiddleware,
    secret_key=os.environ["SESSION_SECRET"],
    same_site="lax",
    #Change to true before deploying False is meant for local
    https_only=False
)

oauth = OAuth()

oauth.register(
    name="discord",
    client_id=os.environ["DISCORD_CLIENT_ID"],
    client_secret=os.environ["DISCORD_CLIENT_SECRET"],
    authorize_url="https://discord.com/oauth2/authorize",
    access_token_url="https://discord.com/api/oauth2/token",
    api_base_url="https://discord.com/api/",
    client_kwargs={"scope": "identify"}
)