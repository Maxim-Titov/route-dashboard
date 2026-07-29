from src.db.connection import get_connection

def post_add_route(from_city, to_city):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # --- from city ---
        cursor.execute(
            "SELECT id FROM cities WHERE city = %s",
            (from_city,)
        )
        from_row = cursor.fetchone()
        if not from_row:
            return 'unknown from city'

        from_city_id = from_row['id']

        # --- to city ---
        cursor.execute(
            "SELECT id FROM cities WHERE city = %s",
            (to_city,)
        )
        to_row = cursor.fetchone()
        if not to_row:
            return 'unknown to city'

        to_city_id = to_row['id']

        # --- route exists? ---
        cursor.execute("""
            SELECT id
            FROM routes
            WHERE from_city_id = %s AND to_city_id = %s
        """, (from_city_id, to_city_id))

        route = cursor.fetchone()
        if route:
            return 'exists'

        # --- insert ---
        cursor.execute("""
            INSERT INTO routes (from_city_id, to_city_id)
            VALUES (%s, %s)
        """, (from_city_id, to_city_id))

        route_id = cursor.lastrowid

        cursor.executemany("""
            INSERT INTO route_cities
            (route_id, city_id, type, sort_order)
            VALUES (%s, %s, %s, %s)
        """, [
            (route_id, from_city_id, "from", 0),
            (route_id, to_city_id, "to", 0)
        ])

        conn.commit()
        return route_id

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()

def post_toggle_loyalty(route_id, enabled):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE routes SET loyalty_enabled = %s WHERE id = %s",
            (enabled, route_id)
        )
        conn.commit()
        return cursor.rowcount > 0
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

def post_get_passenger_loyalty(passenger_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT
                pl.route_id,
                cf.city AS from_city,
                ct.city AS to_city,
                pl.ride_count,
                (7 - (pl.ride_count % 8)) AS rides_until_bonus
            FROM passenger_loyalty pl
            JOIN routes r ON r.id = pl.route_id
            JOIN cities cf ON cf.id = r.from_city_id
            JOIN cities ct ON ct.id = r.to_city_id
            WHERE pl.passenger_id = %s
        """, (passenger_id,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

def post_delete_route(id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT COUNT(*) FROM trips WHERE route_id=%s",
            (id,)
        )

        if cursor.fetchone()[0] > 0:
            return "route has trips"

        cursor.execute(
            "DELETE FROM pricing WHERE route_id=%s",
            (id,)
        )

        cursor.execute(
            "DELETE FROM route_cities WHERE route_id=%s",
            (id,)
        )

        cursor.execute(
            "DELETE FROM routes WHERE id=%s",
            (id,)
        )

        conn.commit()

        return "deleted"

    except:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()

def post_filter_routes(
    sort_by='desc',
    trips_count_from=None,
    trips_count_to=None,
    city_from=None,
    city_to=None
):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    sort_map = {'asc': 'ASC', 'desc': 'DESC'}
    sort_order = sort_map.get(sort_by, 'DESC')

    query = """
        SELECT
            r.id AS route_id,
            cf.city AS from_city,
            ct.city AS to_city,
            COUNT(t.id) AS trips_count
        FROM routes r
        JOIN cities cf ON cf.id = r.from_city_id
        JOIN cities ct ON ct.id = r.to_city_id
        LEFT JOIN trips t ON t.route_id = r.id
        WHERE 1=1
    """

    params = []

    # -------- CITY FILTERS --------
    if city_from:
        query += " AND cf.city = %s"
        params.append(city_from)

    if city_to:
        query += " AND ct.city = %s"
        params.append(city_to)

    query += " GROUP BY r.id, cf.city, ct.city"

    # -------- HAVING --------
    having = []

    if trips_count_from is not None:
        having.append("COUNT(t.id) >= %s")
        params.append(trips_count_from)

    if trips_count_to is not None:
        having.append("COUNT(t.id) <= %s")
        params.append(trips_count_to)

    if having:
        query += " HAVING " + " AND ".join(having)

    # -------- SORT --------
    query += f" ORDER BY trips_count {sort_order}"

    cursor.execute(query, params)
    result = cursor.fetchall()

    cursor.close()
    conn.close()

    return result

def post_get_route_prices(route_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # cursor.execute("""
    #     SELECT pricing.route_id, pricing.from_city_id, pricing.to_city_id, pricing.price, pricing.price_pln, from_city_name.city AS from_city_name, to_city_name.city AS to_city_name
    #     FROM pricing

    #     JOIN cities AS from_city_name ON pricing.from_city_id = from_city_name.id
    #     JOIN cities AS to_city_name ON pricing.to_city_id = to_city_name.id

    #     WHERE pricing.route_id = %s
    # """, (route_id, ))
    # pricing = cursor.fetchall()

    cursor.execute("""
        SELECT rc.city_id, rc.type, rc.sort_order, c.city
        FROM route_cities rc

        JOIN cities c ON c.id=rc.city_id

        WHERE rc.route_id=%s

        ORDER BY rc.type, rc.sort_order;
    """, (route_id,))

    cities = cursor.fetchall()

    cursor.execute("""
        SELECT from_city_id, to_city_id, price, price_pln
        FROM pricing

        WHERE route_id=%s;
    """, (route_id,))

    pricing = cursor.fetchall()

    columns = [
        {
            "id": c["city_id"],
            "label": c["city"]
        }
        for c in cities
        if c["type"] == "from"
    ]

    rows = [
        {
            "id": c["city_id"],
            "name": c["city"]
        }
        for c in cities
        if c["type"] == "to"
    ]

    cursor.close()
    conn.close()

    return {
        "columns": columns,
        "rows": rows,
        "pricing": pricing
    }

def post_update_pricing(route_id, pricing):
    conn = get_connection()
    cursor = conn.cursor()

    try:

        if not pricing:
            return {"success": False, "message": "empty pricing"}

        # --- перевірка route ---
        cursor.execute(
            "SELECT id FROM routes WHERE id = %s",
            (route_id,)
        )

        if not cursor.fetchone():
            return {"success": False, "message": "route not found"}

        # --- очистка старих цін ---
        cursor.execute(
            "DELETE FROM pricing WHERE route_id = %s",
            (route_id,)
        )

        # --- insert нових ---
        insert_data = []

        for p in pricing:

            uah = p.price if p.price and p.price > 0 else None
            pln = p.price_pln if p.price_pln and p.price_pln > 0 else None

            if not uah and not pln:
                continue

            insert_data.append((
                p.route_id,
                p.from_city_id,
                p.to_city_id,
                uah,
                pln
            ))

        if insert_data:

            cursor.executemany("""
                INSERT INTO pricing
                (route_id, from_city_id, to_city_id, price, price_pln)
                VALUES (%s,%s,%s,%s,%s)
            """, insert_data)

        conn.commit()

        return {
            "success": True,
            "inserted": len(insert_data)
        }

    except Exception as e:

        conn.rollback()

        return {
            "success": False,
            "error": str(e)
        }

    finally:

        cursor.close()
        conn.close()

def post_update_route_order(route_id, columns, rows):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        # Видаляємо всі міста маршруту
        cursor.execute("""
            DELETE FROM route_cities
            WHERE route_id = %s
        """, (route_id,))

        # Додаємо міста відправлення
        for order, city in enumerate(columns):
            cursor.execute("""
                INSERT INTO route_cities
                (route_id, city_id, type, sort_order)
                VALUES (%s, %s, 'from', %s)
            """, (
                route_id,
                city["id"],
                order
            ))

        # Додаємо міста прибуття
        for order, city in enumerate(rows):
            cursor.execute("""
                INSERT INTO route_cities
                (route_id, city_id, type, sort_order)
                VALUES (%s, %s, 'to', %s)
            """, (
                route_id,
                city["id"],
                order
            ))

        conn.commit()
        return True

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()