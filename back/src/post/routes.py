from src.db.connection import get_connection

def post_add_route(from_city, to_city):
    conn = get_connection("users_data")
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

        conn.commit()
        return cursor.lastrowid

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()

def post_delete_route(id):
    conn = get_connection("users_data")
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM trips WHERE route_id = %s", (id,))

    trips_count = cursor.fetchone()[0]

    if trips_count > 0:
        cursor.close()
        conn.close()

        return "route has trips"

    cursor.execute("DELETE FROM routes WHERE id = %s", (id,))
    conn.commit()

    cursor.close()
    conn.close()

    return "deleted"

def post_filter_routes(
    sort_by='desc',
    trips_count_from=None,
    trips_count_to=None,
    city_from=None,
    city_to=None
):
    conn = get_connection("users_data")
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