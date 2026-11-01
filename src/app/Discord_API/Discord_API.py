
# auth.py

import os

import mysql.connector
from fastapi import APIRouter, HTTPException, Request
from starlette.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth = OAuth()

oauth.register(
    name="discord",
    client_id=os.environ["DISCORD_CLIENT_ID"],
    client_secret=os.environ["DISCORD_CLIENT_SECRET"],
    authorize_url="https://discord.com/oauth2/authorize",
    access_token_url="https://discord.com/api/oauth2/token",
    api_base_url="https://discord.com/api/",
    client_kwargs={"scope": "identify"},
)


@router.get("/discord/login")
async def discord_login(request: Request):
    """Redirect the user to Discord to authenticate."""
    redirect_uri = os.environ["DISCORD_REDIRECT_URI"]

    return await oauth.discord.authorize_redirect(
        request,
        redirect_uri,
    )


@router.get("/discord/callback")
async def discord_callback(request: Request):
    """Authenticate with Discord and find or create the user's team."""

    # Exchange the authorization code for an access token.
    token = await oauth.discord.authorize_access_token(request)

    # Fetch the authenticated Discord user's identity.
    response = await oauth.discord.get("users/@me", token=token)
    discord_user = response.json()

    discord_id = str(discord_user["id"])
    discord_name = discord_user["username"]

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check whether this Discord account already has a team.
        cursor.execute(
            """
            SELECT discord_id, discord_name, team_name, role
            FROM Team_Info
            WHERE discord_id = %s
            """,
            (discord_id,),
        )
        team = cursor.fetchone()

        if team is None:
            # Create a default team for a new KPL user.
            cursor.execute(
                """
                INSERT INTO Team_Info
                    (discord_id, discord_name, team_name, role)
                VALUES (%s, %s, %s, %s)
                """,
                (
                    discord_id,
                    discord_name,
                    f"{discord_name}'s Team",
                    "captain",
                ),
            )
            conn.commit()

        else:
            # Keep the existing team, but update the Discord username.
            cursor.execute(
                """
                UPDATE Team_Info
                SET discord_name = %s
                WHERE discord_id = %s
                """,
                (discord_name, discord_id),
            )
            conn.commit()

        # Establish the user's authenticated session.
        request.session.clear()
        request.session["discord_id"] = discord_id

        frontend_url = os.environ["FRONTEND_URL"]

        return RedirectResponse(
            url=frontend_url,
            status_code=303,
        )

    except mysql.connector.Error:
        if conn is not None:
            conn.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve or create your KPL team.",
        )

    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()


@router.get("/me")
async def get_current_user(request: Request):
    """Return the current logged-in user's KPL team."""

    discord_id = request.session.get("discord_id")

    if not discord_id:
        raise HTTPException(
            status_code=401,
            detail="Not logged in. Please sign in with Discord.",
        )

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT discord_id, discord_name, team_name, role
            FROM Team_Info
            WHERE discord_id = %s
            """,
            (discord_id,),
        )
        team = cursor.fetchone()

        if team is None:
            request.session.clear()
            raise HTTPException(
                status_code=404,
                detail="KPL team not found.",
            )

        return team

    except mysql.connector.Error:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve your KPL team.",
        )

    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()


# Import your existing db_connection connection function.
from db_connection import get_db_connection
