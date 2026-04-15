from src.db.connection import get_connection

def get_trips_count():
    conn = get_connection("users_data")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(*)
        FROM trips
    """)

    res = cursor.fetchall()

    cursor.close()
    conn.close()

    return res