from src.db.connection import get_connection

def post_get_ticket_price(trip_id, passenger_id, city_id):
    conn = get_connection("users_data")
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT route_id FROM trips WHERE id = %s", (trip_id, ))
    route_id = cursor.fetchone()["route_id"]

    cursor.execute("""
        SELECT city_id
        FROM city_stations
        JOIN trips ON city_stations.id = trips.to_city_station_id
        WHERE trips.id = %s
    """, (trip_id, ))
    to_city_id = cursor.fetchone()["city_id"]

    if route_id is None or to_city_id is None:
        return None

    cursor.execute("""
        SELECT price
        FROM pricing
        WHERE route_id = %s
            AND to_city_id = %s
            AND from_city_id = %s
    """, (route_id, to_city_id, city_id))
    price = cursor.fetchone()

    return price["price"] if price else None