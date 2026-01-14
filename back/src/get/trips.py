from src.db.connection import get_connection

def get_trips():
    conn = get_connection("users_data")
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT trips.id, from_city.city AS from_city, to_city.city AS to_city, COUNT(trip_passengers.trip_id) AS passengers_count, max_passengers_count, date, time, status
        FROM trips
                   
        JOIN routes ON routes.id = trips.route_id
        JOIN cities AS from_city ON from_city.id = routes.from_city_id
        JOIN cities AS to_city ON to_city.id = routes.to_city_id
        LEFT JOIN trip_passengers ON trip_passengers.trip_id = trips.id
        
        GROUP BY trips.id
        ORDER BY trips.id DESC
    """)

    trips = cursor.fetchall()

    cursor.close()
    conn.close()

    return trips

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