from src.db.connection import get_connection

def post_add_city(city):
    conn = get_connection("users_data")
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
    conn = get_connection("users_data")
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