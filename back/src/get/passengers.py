from src.db.connection import get_connection

def get_passengers():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT passengers.id, first_name AS name, last_name AS surname, phone, date_of_birth, notes.note, COUNT(trip_passengers.passenger_id) AS trips_count
        FROM passengers

        LEFT JOIN notes ON passengers.id = notes.passenger_id
        LEFT JOIN trip_passengers ON passengers.id = trip_passengers.passenger_id

        GROUP BY passengers.id
        ORDER BY passengers.created_at DESC
    """)

    res = cursor.fetchall()

    cursor.close()
    conn.close()

    return res

def get_passengers_count():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM passengers")
    count = cursor.fetchone()[0]

    cursor.close()
    conn.close()

    return count