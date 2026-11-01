from fastapi import FastAPI, HTTPException
from Schema import TeamCreate
from db_connection import get_db_connection
import bcrypt
import json
import mysql.connector

app = FastAPI()
# -------------------------
# Create Team
# -------------------------

@app.post("/teams")
def create_team(team_data: TeamCreate):


    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        query = """
            INSERT INTO Team_Info
            (discord_id, discord_name, team_name, role)
            VALUES (%s, %s, %s, %s)
        """

        values = (
            team_data.discord_id,
            team_data.discord_name,
            team_data.team_name,
            'Player'
        )

        cursor.execute(query, values)
        connection.commit()

        team_id = cursor.lastrowid

        cursor.close()
        connection.close()

        return {
            "message": "Team created successfully"
        }

    except mysql.connector.Error as error:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {error}"
        )

