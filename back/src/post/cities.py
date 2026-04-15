from src.db.connection import get_connection

def post_add_city(city):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM cities WHERE city = %s", (city, ))
    is_city = cursor.fetchone()

    if is_city:
        return "exists"
    
    cursor.execute("INSERT INTO cities(city) VALUES (%s)", (city, ))

    conn.commit()

    cursor.close()
    conn.close()

def post_delete_city(city_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # 1. Перевірка існування міста
        cursor.execute(
            "SELECT id FROM cities WHERE id = %s",
            (city_id,)
        )
        city = cursor.fetchone()

        if not city:
            return {
                "success": False,
                "message": "city not found"
            }

        # 2. Перевірка використання в маршрутах
        cursor.execute(
            """
            SELECT id
            FROM routes
            WHERE from_city_id = %s OR to_city_id = %s
            LIMIT 1
            """,
            (city_id, city_id)
        )
        used = cursor.fetchone()

        if used:
            return {
                "success": False,
                "message": "city has routes"
            }
        
        cursor.execute("""
            SELECT id
            FROM trip_stations
            WHERE city_id = %s
        """, (city_id, ))
        used = cursor.fetchone()

        if used:
            return {
                "success": False,
                "message": "city has routes"
            }

        # 3. Видалення
        cursor.execute(
            "DELETE FROM cities WHERE id = %s",
            (city_id,)
        )
        conn.commit()

        return {"success": True}

    except Exception as e:
        conn.rollback()
        print("Delete city error:", e)
        return {
            "success": False,
            "message": "internal error"
        }

    finally:
        cursor.close()
        conn.close()

def post_city_stations(city_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT id FROM cities WHERE id = %s", (city_id, ))
    city = cursor.fetchone()

    if not city:
        return {
            "success": False,
            "message": "city not found"
        }

    cursor.execute("""
        SELECT id, station_name, station_address
        FROM city_stations
        WHERE city_id = %s;
    """, (city_id, ))

    stations = cursor.fetchall()

    cursor.close()
    conn.close()

    return {
        "success": True,
        "stations": stations
    }

def post_update_city_stations(city_id, stations):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM cities WHERE id = %s", (city_id, ))
    city = cursor.fetchone()

    if not city:
        return {
            "success": False,
            "message": "city not found"
        }

    try:
        # Видалення існуючих станцій
        cursor.execute("""
            DELETE FROM city_stations
            WHERE city_id = %s;
        """, (city_id, ))

        # Додавання нових станцій
        for station in stations:
            cursor.execute("""
                INSERT INTO city_stations (city_id, station_name, station_address)
                VALUES (%s, %s, %s);
            """, (city_id, station['station_name'], station['station_address']))

        conn.commit()

        return {
            "success": True,
            "message": "stations updated"
        }

    except Exception as e:
        conn.rollback()
        print("Update city stations error:", e)
        return {
            "success": False,
            "message": "internal error"
        }

    finally:
        cursor.close()
        conn.close()

def post_search_cities(q):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT id, city
        FROM cities
        WHERE city LIKE %s
        LIMIT 20
    """, (q + '%',))
    
    res = cursor.fetchall()
    cursor.close()
    conn.close()

    return res

def post_search_citie_station(q, city_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT id, station_name, station_address
        FROM city_stations
        WHERE (station_name LIKE %s OR station_address LIKE %s) AND city_id = %s
        LIMIT 20
    """, (q + '%', q + '%', city_id))
    
    res = cursor.fetchall()
    cursor.close()
    conn.close()

    return res