from src.db.connection import get_connection

def get_trips_count():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(*)
        FROM trips
    """)

    res = cursor.fetchall()

    cursor.close()
    conn.close()

    return res