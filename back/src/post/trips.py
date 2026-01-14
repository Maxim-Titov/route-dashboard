from src.db.connection import get_connection

def post_add_trip(city_from, city_to, date, time, max_passengers, passenger_ids, stations):
    conn = get_connection("users_data")
    cursor = conn.cursor(dictionary=True)

    try:
        # --- from city ---
        cursor.execute(
            "SELECT id FROM cities WHERE city = %s",
            (city_from,)
        )
        from_row = cursor.fetchone()
        if not from_row:
            return 'unknown from city'

        from_city_id = from_row['id']

        # --- to city ---
        cursor.execute(
            "SELECT id FROM cities WHERE city = %s",
            (city_to,)
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
        if not route:
            return 'route not exists'
        
        route_id = route['id']

        cursor.execute("""
            INSERT INTO trips (route_id, max_passengers_count, date, time)
            VALUES (%s, %s, %s, %s)
        """, (route_id, max_passengers, date, time))

        trip_id = cursor.lastrowid

        for id in passenger_ids:
            cursor.execute("""
                INSERT INTO trip_passengers (trip_id, passenger_id)
                VALUES (%s, %s)
            """, (trip_id, id))

        for station in stations:
            cursor.execute("""
                INSERT INTO trip_stations (trip_id, city_id, city_order)
                VALUES (%s, %s, %s)
            """, (trip_id, station.id, station.order))

        conn.commit()

        return 'added'

    except Exception as e:
        conn.rollback()
        raise e

    finally:
        cursor.close()
        conn.close()

def post_edit_trip(trip_id, city_from, city_to, date, time, max_passengers, passenger_ids, stations, status):
    conn = get_connection("users_data")
    cursor = conn.cursor(dictionary=True)

    try:
        # --- from city ---
        cursor.execute(
            "SELECT id FROM cities WHERE city = %s",
            (city_from,)
        )
        from_row = cursor.fetchone()
        if not from_row:
            return 'unknown from city'

        from_city_id = from_row['id']

        # --- to city ---
        cursor.execute(
            "SELECT id FROM cities WHERE city = %s",
            (city_to,)
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
        if not route:
            return 'route not exists'

        route_id = route['id']

        # --- update trip ---
        cursor.execute("""
            UPDATE trips
            SET
                route_id = %s,
                max_passengers_count = %s,
                date = %s,
                time = %s,
                status = %s
            WHERE id = %s
        """, (route_id, max_passengers, date, time, status, trip_id))

        # --- passengers ---
        cursor.execute(
            "DELETE FROM trip_passengers WHERE trip_id = %s",
            (trip_id,)
        )

        for passenger_id in passenger_ids:
            cursor.execute("""
                INSERT INTO trip_passengers (trip_id, passenger_id)
                VALUES (%s, %s)
            """, (trip_id, passenger_id))

        # --- stations ---
        cursor.execute(
            "DELETE FROM trip_stations WHERE trip_id = %s",
            (trip_id,)
        )

        for station in stations:
            cursor.execute("""
                INSERT INTO trip_stations (trip_id, city_id, city_order)
                VALUES (%s, %s, %s)
            """, (trip_id, station.id, station.order))

        conn.commit()
        return 'edited'

    except Exception as e:
        conn.rollback()
        raise e

    finally:
        cursor.close()
        conn.close()

def post_delete_trip(id):
    conn = get_connection("users_data")
    cursor = conn.cursor()

    cursor.execute("DELETE FROM trips WHERE id = %s", (id,))
    conn.commit()

    cursor.close()
    conn.close()

    return "deleted"

def post_trip_stations(id):
    conn = get_connection("users_data")
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT cities.city, trip_stations.city_order FROM trip_stations
        JOIN cities ON cities.id = trip_stations.city_id
        WHERE trip_stations.trip_id = %s
    """, (id, ))

    res = cursor.fetchall()

    cursor.close()
    conn.close()

    return res

def post_trip_passengers(id):
    conn = get_connection("users_data")
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT passengers.id, passengers.first_name, passengers.last_name, passengers.phone, passengers.date_of_birth
        FROM trip_passengers
        JOIN passengers ON passengers.id = trip_passengers.passenger_id
        WHERE trip_passengers.trip_id = %s
    """, (id, ))

    res = cursor.fetchall()

    cursor.close()
    conn.close()

    return res

def post_trip_set_status(id, status):
    conn = get_connection("users_data")
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE trips
        SET status = %s
        WHERE id = %s
            AND status != %s
    """, (status, id, status))

    conn.commit()

    updated = cursor.rowcount > 0

    cursor.close()
    conn.close()

    return updated

def post_filter_trips(req):
    conn = get_connection("users_data")
    cursor = conn.cursor(dictionary=True)

    sort_map = {'asc': 'ASC', 'desc': 'DESC'}
    sort_order = sort_map.get(req.sort_by, 'DESC')

    query = """
        SELECT
            t.id,
            t.date,
            t.time,
            t.status,
            t.max_passengers_count,

            cf.city AS from_city,
            ct.city AS to_city,

            COALESCE(tp.passengers_count, 0) AS passengers_count
        FROM trips t
        JOIN routes r ON r.id = t.route_id
        JOIN cities cf ON cf.id = r.from_city_id
        JOIN cities ct ON ct.id = r.to_city_id

        LEFT JOIN (
            SELECT trip_id, COUNT(*) AS passengers_count
            FROM trip_passengers
            GROUP BY trip_id
        ) tp ON tp.trip_id = t.id

        WHERE 1=1
    """

    params = []

    # -------- DATE --------
    if req.date_from:
        query += " AND t.date >= %s"
        params.append(req.date_from)

    if req.date_to:
        query += " AND t.date <= %s"
        params.append(req.date_to)

    # -------- TIME --------
    if req.time_from:
        query += " AND t.time >= %s"
        params.append(req.time_from)

    if req.time_to:
        query += " AND t.time <= %s"
        params.append(req.time_to)

    # -------- STATUS --------
    if req.status:
        placeholders = ",".join(["%s"] * len(req.status))
        query += f" AND t.status IN ({placeholders})"
        params.extend(req.status)

    # -------- ROUTE --------
    if req.city_from:
        query += " AND cf.city = %s"
        params.append(req.city_from)

    if req.city_to:
        query += " AND ct.city = %s"
        params.append(req.city_to)

    # -------- STATIONS (EXISTS) --------
    if req.station_city:
        query += """
            AND EXISTS (
                SELECT 1
                FROM trip_stations ts
                JOIN cities cs ON cs.id = ts.city_id
                WHERE ts.trip_id = t.id
                  AND cs.city = %s
            )
        """
        params.append(req.station_city)

    # -------- PASSENGERS --------
    if req.passengers_from is not None:
        query += " AND COALESCE(tp.passengers_count, 0) >= %s"
        params.append(req.passengers_from)

    if req.passengers_to is not None:
        query += " AND COALESCE(tp.passengers_count, 0) <= %s"
        params.append(req.passengers_to)

    if req.has_free_seats:
        query += " AND COALESCE(tp.passengers_count, 0) < t.max_passengers_count"

    # -------- SORT --------
    query += f" ORDER BY t.date {sort_order}, t.time {sort_order}"

    cursor.execute(query, params)
    result = cursor.fetchall()

    cursor.close()
    conn.close()

    return result

