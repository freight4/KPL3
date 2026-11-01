
import mysql.connector
import os 
from dotenv import load_dotenv

load_dotenv()
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('KPL_DB_HOST'),
        user=os.getenv('KPL_DB_USERNAME'),
        password=os.getenv('KPL_DB_PASSWORD'),
        database="dbmaster"
    )