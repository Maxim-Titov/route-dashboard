from mysql.connector import pooling, errors
from dotenv import load_dotenv
import os

load_dotenv()

_pool = pooling.MySQLConnectionPool(
    pool_name="main_pool",
    pool_size=5,
    pool_reset_session=True,
    host=os.getenv("DB_HOST"),
    port=int(os.getenv("DB_PORT", 3306)),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
    connection_timeout=10,
)

def get_connection():
    conn = _pool.get_connection()
    try:
        conn.ping(reconnect=True, attempts=3, delay=1)
    except errors.Error:
        pass
    return conn
