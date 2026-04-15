from src.db.connection import *

def get_routes():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT routes.id, from_city.city AS from_city, to_city.city AS to_city, COUNT(trips.id) AS trips_count
        FROM routes
                   
        JOIN cities AS from_city ON routes.from_city_id = from_city.id
        JOIN cities AS to_city ON routes.to_city_id = to_city.id
        LEFT JOIN trips ON routes.id = trips.route_id
        
        GROUP BY routes.id  
        
        ORDER BY routes.id DESC
    """)

    res = cursor.fetchall()

    cursor.close()
    conn.close()

    return res

def get_routes_count():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(*)
        FROM routes
    """)

    res = cursor.fetchall()

    cursor.close()
    conn.close()

    return res

def get_popular_routes():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT from_city.city, to_city.city, COUNT(trips.route_id) as trip_count
        FROM routes
        JOIN cities AS from_city ON routes.from_city_id = from_city.id
        JOIN cities AS to_city ON routes.to_city_id = to_city.id
        JOIN trips ON routes.id = trips.route_id
        GROUP BY routes.id
        ORDER BY trip_count DESC
        LIMIT 5
    """)

    popular_routes = cursor.fetchall()

    cursor.close()
    conn.close()

    return popular_routes