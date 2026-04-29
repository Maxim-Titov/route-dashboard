from src.db.connection import get_connection

def post_get_ticket_price(trip_id, passenger_id, city_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT route_id FROM trips WHERE id = %s", (trip_id, ))
    row = cursor.fetchone()
    if row is None:
        cursor.close()
        conn.close()
        return None
    route_id = row["route_id"]

    cursor.execute("""
        SELECT city_id
        FROM city_stations
        JOIN trips ON city_stations.id = trips.to_city_station_id
        WHERE trips.id = %s
    """, (trip_id, ))
    row = cursor.fetchone()
    if row is None:
        cursor.close()
        conn.close()
        return None
    to_city_id = row["city_id"]

    cursor.execute("""
        SELECT price
        FROM pricing
        WHERE route_id = %s
            AND to_city_id = %s
            AND from_city_id = %s
    """, (route_id, to_city_id, city_id))
    price = cursor.fetchone()

    cursor.close()
    conn.close()

    return price["price"] if price else None
