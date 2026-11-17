
import os
from dotenv import load_dotenv

import mysql.connector

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

from starlette.middleware.sessions import SessionMiddleware

from authlib.integrations.starlette_client import OAuth
from authlib.integrations.base_client.errors import MismatchingStateError
from Schema import TeamCreate, TeamNameRequest

import secrets
import time
from fastapi.responses import HTMLResponse
import json

# ==================================================
# 1. ENVIRONMENT VARIABLES
# ==================================================

load_dotenv()

DISCORD_CLIENT_ID = os.getenv("DISCORD_CLIENT_ID")
DISCORD_CLIENT_SECRET = os.getenv("DISCORD_CLIENT_SECRET")
DISCORD_REDIRECT_URI = os.getenv("DISCORD_REDIRECT_URI")

SESSION_SECRET = os.getenv("SESSION_SECRET")

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:8501"
)

required_variables = {
    "DISCORD_CLIENT_ID": DISCORD_CLIENT_ID,
    "DISCORD_CLIENT_SECRET": DISCORD_CLIENT_SECRET,
    "DISCORD_REDIRECT_URI": DISCORD_REDIRECT_URI,
    "SESSION_SECRET": SESSION_SECRET
}

missing = [
    name for name, value in required_variables.items()
    if not value
]

if missing:
    raise RuntimeError(
        f"Missing environment variables: {', '.join(missing)}"
    )


# ==================================================
# 2. FASTAPI CONFIGURATION
# ==================================================

app = FastAPI(title="KPL Discord Authentication API")
login_tickets = {}
app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET,
    session_cookie="kpl_session",
    same_site="lax",
    https_only=False,  # Local HTTP development only
    max_age=604800
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8501",
        "http://localhost:4200"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ==================================================
# 3. DISCORD OAUTH CONFIGURATION
# ==================================================

oauth = OAuth()

oauth.register(
    name="discord",
    client_id=DISCORD_CLIENT_ID,
    client_secret=DISCORD_CLIENT_SECRET,

    authorize_url="https://discord.com/oauth2/authorize",
    access_token_url="https://discord.com/api/oauth2/token",
    api_base_url="https://discord.com/api/v10/",

    client_kwargs={
        "scope": "identify email"
    }
)


# ==================================================
# 4. MYSQL CONNECTION
# ==================================================

def get_db_connection():

    return mysql.connector.connect(
        host=os.getenv("KPL_DB_HOST"),
        user=os.getenv("KPL_DB_USERNAME"),
        password=os.getenv("KPL_DB_PASSWORD"),
        database="dbmaster"
    )


# ==================================================
# 5. SAVE OR RETRIEVE KPL USER
# ==================================================


def save_or_get_team(id, username):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT * FROM Team_Info WHERE discord_id = %s",
            (id,)
        )
        existing_user = cursor.fetchone()

        if existing_user:
            cursor.execute(
                """
                UPDATE Team_Info
                SET discord_name = %s
                WHERE discord_id = %s
                """,
                (username, id)
            )
        else:
            cursor.execute(
                """
                INSERT INTO Team_Info
                (discord_id, discord_name, team_name, role)
                VALUES (%s, %s, NULL, 'Player')
                """,
                (id, username)
            )

        connection.commit()

        cursor.execute(
            """
            SELECT unique_id, discord_id, discord_name, team_name,
                   guest_name, role, created_at
            FROM Team_Info
            WHERE discord_id = %s
            """,
            (id,)
        )

        team = cursor.fetchone()

        if not team:
            raise Exception("Unable to retrieve team information.")

        if team.get("created_at"):
            team["created_at"] = team["created_at"].isoformat()

        # Determine whether the user needs to create a team name
        team["needs_team_name"] = not bool(team.get("team_name"))

        return team

    finally:
        cursor.close()
        connection.close()



# ==================================================
# 6. DISCORD LOGIN
# ==================================================

@app.get("/auth/discord/login")
async def discord_login(request: Request):

    return await oauth.discord.authorize_redirect(
        request,
        DISCORD_REDIRECT_URI
    )


# ==================================================
# 7. DISCORD CALLBACK
# ==================================================


@app.get("/auth/discord/callback")
async def discord_callback(request: Request):

    # Exchange authorization code for access token
    token = await oauth.discord.authorize_access_token(request)

    # Get authenticated Discord user information
    response = await oauth.discord.get(
        "users/@me",
        token=token
    )

    discord_user = response.json()

    # Extract Discord information
    user_profile_name = (
        discord_user.get("global_name")
        or discord_user.get("username")
    )

    user_email = discord_user.get("email")
    discord_id = discord_user.get("id")

    # Save or retrieve user in MySQL
    team = save_or_get_team(
        discord_id,
        user_profile_name
    )

    # Prepare user information
    user_data = {
        "discord_id": discord_id,
        "discord_name": user_profile_name,
        "email": user_email,
        "team_name": team.get("team_name"),
        "is_new_user": team.get("is_new_user")
    }

    # Store user information in session
    request.session["user"] = user_data

    # Safely serialize user information
    user_json = json.dumps(user_data).replace("<", "\\u003c")

    # Send information back to original Angular tab
    html = f"""
    <!DOCTYPE html>
    <html>
        <head>
            <title>KPL Discord Authentication</title>
        </head>
        <body>
            <h2>Discord Authentication Successful!</h2>
            <p>You can close this tab.</p>

            <script>
                if (window.opener) {{

                    window.opener.postMessage(
                        {{
                            type: "KPL_DISCORD_AUTH",
                            user: {user_json}
                        }},
                        "http://localhost:4200"
                    );

                    window.close();

                }} else {{
                    document.body.innerHTML +=
                        "<p>Unable to communicate with the original KPL tab.</p>";
                }}
            </script>
        </body>
    </html>
    """

    return HTMLResponse(content=html)



########################################################
# ==================================================
# 8. GET CURRENT AUTHENTICATED USER
# ==================================================

@app.get("/auth/me")
async def get_current_user(request: Request):

    user = request.session.get("user")

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    return {
        "discord_id": user.get("discord_id"),
        "discord_name": user.get("discord_name"),
        "email": user.get("email"),
        "team_name": user.get("team_name")
    }


# ==================================================
# 9. LOGOUT
# ==================================================

@app.post("/auth/logout")
async def logout(request: Request):

    request.session.clear()

    return {
        "message": "Successfully logged out.",
        "authenticated": False
    }


# ==================================================
# 10. Team Name Generator 
# ==================================================


@app.post("/auth/team-name")
async def update_team_name(
    request: Request,
    data: TeamNameRequest
):

    # Verify user is authenticated
    user = request.session.get("user")

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    # Validate team name
    team_name = data.team_name.strip()

    if not team_name:
        raise HTTPException(
            status_code=400,
            detail="Team name cannot be empty."
        )

    if len(team_name) > 100:
        raise HTTPException(
            status_code=400,
            detail="Team name cannot exceed 100 characters."
        )

    connection = get_db_connection()
    cursor = connection.cursor()

    try:

        # Update the authenticated user's team name
        cursor.execute(
            """
            UPDATE Team_Info
            SET team_name = %s
            WHERE discord_id = %s
            """,
            (team_name, user["discord_id"])
        )

        connection.commit()

        # Update session
        user["team_name"] = team_name
        request.session["user"] = user

        return {
            "success": True,
            "team_name": team_name
        }

    finally:

        cursor.close()
        connection.close()



