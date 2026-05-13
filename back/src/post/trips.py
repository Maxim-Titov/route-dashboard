from src.db.connection import get_connection

def post_get_trips(user_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT role FROM users WHERE id = %s", (user_id,))
        role = cursor.fetchone()

        if role and role['role'] == 'admin':
            cursor.execute("""
                SELECT trips.id, trips.route_id, from_city.city AS from_city, to_city.city AS to_city, from_station.station_name AS from_station_name, to_station.station_name AS to_station_name, from_station.station_address AS from_station_address, to_station.station_address AS to_station_address, COUNT(trip_passengers.trip_id) AS passengers_count, max_passengers_count, date, time, status, users.name AS user_name, users.surname AS user_surname, users.login AS user_login
                FROM trips

                LEFT JOIN routes ON routes.id = trips.route_id
                LEFT JOIN cities AS from_city ON from_city.id = trips.from_city_id
                LEFT JOIN cities AS to_city ON to_city.id = trips.to_city_id
                LEFT JOIN city_stations AS from_station ON from_station.id = trips.from_city_station_id
                LEFT JOIN city_stations AS to_station ON to_station.id = trips.to_city_station_id
                LEFT JOIN trip_passengers ON trip_passengers.trip_id = trips.id
                LEFT JOIN users ON users.id = trips.user_id

                GROUP BY trips.id
                ORDER BY trips.id DESC
            """)
        else:
            cursor.execute("""
                SELECT trips.id, trips.route_id, from_city.city AS from_city, to_city.city AS to_city, from_station.station_name AS from_station_name, to_station.station_name AS to_station_name, from_station.station_address AS from_station_address, to_station.station_address AS to_station_address, COUNT(trip_passengers.trip_id) AS passengers_count, max_passengers_count, date, time, status, users.name AS user_name, users.surname AS user_surname, users.login AS user_login
                FROM trips

                LEFT JOIN routes ON routes.id = trips.route_id
                LEFT JOIN cities AS from_city ON from_city.id = trips.from_city_id
                LEFT JOIN cities AS to_city ON to_city.id = trips.to_city_id
                LEFT JOIN city_stations AS from_station ON from_station.id = trips.from_city_station_id
                LEFT JOIN city_stations AS to_station ON to_station.id = trips.to_city_station_id
                LEFT JOIN trip_passengers ON trip_passengers.trip_id = trips.id
                LEFT JOIN users ON users.id = trips.user_id

                WHERE users.id = %s
                GROUP BY trips.id
                ORDER BY trips.id DESC
            """, (user_id,))

        trips = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

    return trips

def _get_loyalty_status(cursor, route_id):
    if route_id is None:
        return False
    cursor.execute("SELECT loyalty_enabled FROM routes WHERE id = %s", (route_id,))
    row = cursor.fetchone()
    return bool(row and row['loyalty_enabled'])

def _get_ride_count(cursor, passenger_id, route_id):
    cursor.execute(
        "SELECT ride_count FROM passenger_loyalty WHERE passenger_id = %s AND route_id = %s",
        (passenger_id, route_id)
    )
    row = cursor.fetchone()
    return row['ride_count'] if row else 0

def _increment_loyalty(cursor, passenger_id, route_id):
    cursor.execute("""
        INSERT INTO passenger_loyalty (passenger_id, route_id, ride_count)
        VALUES (%s, %s, 1)
        ON DUPLICATE KEY UPDATE ride_count = ride_count + 1
    """, (passenger_id, route_id))

def _decrement_loyalty(cursor, passenger_id, route_id):
    cursor.execute("""
        UPDATE passenger_loyalty
        SET ride_count = GREATEST(ride_count - 1, 0)
        WHERE passenger_id = %s AND route_id = %s
    """, (passenger_id, route_id))

def post_add_trip(route_id, from_city_id, to_city_id, from_station_id, to_station_id, date, time, max_passengers, passenger_ids, passenger_stations, stations):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        if route_id is not None:
            cursor.execute("SELECT id FROM routes WHERE id = %s", (route_id,))
            route = cursor.fetchone()
            if not route:
                return 'route not exists'
            route_id = route['id']

        cursor.execute("""
            INSERT INTO trips (route_id, from_city_id, to_city_id, from_city_station_id, to_city_station_id, max_passengers_count, date, time)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (route_id, from_city_id, to_city_id, from_station_id, to_station_id, max_passengers, date, time))

        trip_id = cursor.lastrowid

        if passenger_stations:
            seats = [ps.get("seat_number") for ps in passenger_stations if ps.get("seat_number")]
            if len(seats) != len(set(seats)):
                return 'duplicate_seats'

        loyalty_active = _get_loyalty_status(cursor, route_id)

        for i in range(len(passenger_ids)):
            pid = passenger_ids[i]
            seat = passenger_stations[i].get("seat_number") if passenger_stations else None
            is_bonus = False

            if loyalty_active:
                ride_count = _get_ride_count(cursor, pid, route_id)
                is_bonus = (ride_count % 8 == 7)
                _increment_loyalty(cursor, pid, route_id)

            if passenger_stations is None:
                cursor.execute("""
                    INSERT INTO trip_passengers (trip_id, passenger_id, is_bonus_ride)
                    VALUES (%s, %s, %s)
                """, (trip_id, pid, is_bonus))
            else:
                cursor.execute("""
                    INSERT INTO trip_passengers (trip_id, passenger_id, city_id, station_id, seat_number, is_bonus_ride)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (trip_id, pid, passenger_stations[i].get("city_id"), passenger_stations[i].get("station_id"), seat, is_bonus))

        for station in stations:
            cursor.execute("""
                INSERT INTO trip_stations (trip_id, city_id, city_station_id, city_order)
                VALUES (%s, %s, %s, %s)
            """, (trip_id, station.city_id, station.station_id, station.order))

        conn.commit()

        return 'added'

    except Exception as e:
        conn.rollback()
        raise e

    finally:
        cursor.close()
        conn.close()

def post_edit_trip(trip_id, route_id, from_city_id, to_city_id, from_station_id, to_station_id, date, time, max_passengers, passenger_ids, passenger_stations, stations, status):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        if route_id is not None:
            cursor.execute("SELECT id FROM routes WHERE id = %s", (route_id,))
            route = cursor.fetchone()
            if not route:
                return 'route not exists'
            route_id = route['id']

        # Отримуємо старий маршрут і пасажирів для відкату лояльності
        cursor.execute("SELECT route_id FROM trips WHERE id = %s", (trip_id,))
        old_trip = cursor.fetchone()
        old_route_id = old_trip['route_id'] if old_trip else None

        if old_route_id and _get_loyalty_status(cursor, old_route_id):
            cursor.execute(
                "SELECT passenger_id FROM trip_passengers WHERE trip_id = %s",
                (trip_id,)
            )
            old_passengers = [r['passenger_id'] for r in cursor.fetchall()]
            for pid in old_passengers:
                _decrement_loyalty(cursor, pid, old_route_id)

        cursor.execute("""
            UPDATE trips
            SET
                route_id = %s,
                from_city_id = %s,
                to_city_id = %s,
                from_city_station_id = %s,
                to_city_station_id = %s,
                max_passengers_count = %s,
                date = %s,
                time = %s,
                status = %s
            WHERE id = %s
        """, (route_id, from_city_id, to_city_id, from_station_id, to_station_id, max_passengers, date, time, status, trip_id))

        cursor.execute(
            "DELETE FROM trip_passengers WHERE trip_id = %s",
            (trip_id,)
        )

        if passenger_stations:
            seats = [ps.get("seat_number") for ps in passenger_stations if ps.get("seat_number")]
            if len(seats) != len(set(seats)):
                return 'duplicate_seats'

        loyalty_active = _get_loyalty_status(cursor, route_id)

        for i in range(len(passenger_ids)):
            pid = passenger_ids[i]
            seat = passenger_stations[i].get("seat_number") if passenger_stations else None
            is_bonus = False

            if loyalty_active:
                ride_count = _get_ride_count(cursor, pid, route_id)
                is_bonus = (ride_count % 8 == 7)
                _increment_loyalty(cursor, pid, route_id)

            if passenger_stations is None:
                cursor.execute("""
                    INSERT INTO trip_passengers (trip_id, passenger_id, is_bonus_ride)
                    VALUES (%s, %s, %s)
                """, (trip_id, pid, is_bonus))
            else:
                cursor.execute("""
                    INSERT INTO trip_passengers (trip_id, passenger_id, city_id, station_id, seat_number, is_bonus_ride)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (trip_id, pid, passenger_stations[i].get("city_id"), passenger_stations[i].get("station_id"), seat, is_bonus))

        cursor.execute(
            "DELETE FROM trip_stations WHERE trip_id = %s",
            (trip_id,)
        )

        for station in stations:
            cursor.execute("""
                INSERT INTO trip_stations (trip_id, city_id, city_station_id, city_order)
                VALUES (%s, %s, %s, %s)
            """, (trip_id, station.city_id, station.station_id, station.order))

        conn.commit()
        return 'edited'

    except Exception as e:
        conn.rollback()
        raise e

    finally:
        cursor.close()
        conn.close()

def post_delete_trip(id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM trips WHERE id = %s", (id,))
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

    return "deleted"

def post_trip_stations(id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT cities.city, trip_stations.city_order, city_stations.station_name, city_stations.station_address FROM trip_stations
            JOIN cities ON cities.id = trip_stations.city_id
            LEFT JOIN city_stations ON city_stations.id = trip_stations.city_station_id
            WHERE trip_stations.trip_id = %s
        """, (id, ))
        res = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

    return res

def post_trip_passengers(id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT passengers.id, passengers.first_name, passengers.last_name, passengers.phone, passengers.date_of_birth
            FROM trip_passengers
            JOIN passengers ON passengers.id = trip_passengers.passenger_id
            WHERE trip_passengers.trip_id = %s
        """, (id, ))
        passengers = cursor.fetchall()

        cursor.execute("""
            SELECT trip_passengers.city_id, cities.city, trip_passengers.station_id,
                   city_stations.station_name AS station, city_stations.station_address,
                   trip_passengers.seat_number, trip_passengers.is_bonus_ride
            FROM trip_passengers
            LEFT JOIN cities ON cities.id = trip_passengers.city_id
            LEFT JOIN city_stations ON city_stations.id = trip_passengers.station_id
            WHERE trip_passengers.trip_id = %s
        """, (id, ))
        stations = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

    return {
        "passengers": passengers,
        "passenger_stations": stations
    }

def post_trip_set_status(id, status):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE trips
            SET status = %s
            WHERE id = %s
                AND status != %s
        """, (status, id, status))
        conn.commit()
        updated = cursor.rowcount > 0
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

    return updated

def post_filter_trips(req):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT role FROM users WHERE id = %s", (req.user_id,))
        role = cursor.fetchone()

        sort_map = {'asc': 'ASC', 'desc': 'DESC'}
        sort_order = sort_map.get(req.sort_by, 'DESC')

        query = """
            SELECT
                t.id,
                t.route_id,
                t.date,
                t.time,
                t.status,
                t.max_passengers_count,

                cf.city AS from_city,
                ct.city AS to_city,
                csf.station_name AS from_station_name,
                cst.station_name AS to_station_name,
                csf.station_address AS from_station_address,
                cst.station_address AS to_station_address,

                COALESCE(tp.passengers_count, 0) AS passengers_count
            FROM trips t
            JOIN routes r ON r.id = t.route_id
            JOIN cities cf ON cf.id = r.from_city_id
            JOIN cities ct ON ct.id = r.to_city_id

            LEFT JOIN city_stations csf ON csf.id = t.from_city_station_id
            LEFT JOIN city_stations cst ON cst.id = t.to_city_station_id

            LEFT JOIN (
                SELECT trip_id, COUNT(*) AS passengers_count
                FROM trip_passengers
                GROUP BY trip_id
            ) tp ON tp.trip_id = t.id

            WHERE 1=1
        """

        params = []

        if req.user_id and role and role['role'] != 'admin':
            query += " AND t.user_id = %s"
            params.append(req.user_id)

        if req.date_from:
            query += " AND t.date >= %s"
            params.append(req.date_from)

        if req.date_to:
            query += " AND t.date <= %s"
            params.append(req.date_to)

        if req.time_from:
            query += " AND t.time >= %s"
            params.append(req.time_from)

        if req.time_to:
            query += " AND t.time <= %s"
            params.append(req.time_to)

        if req.status:
            placeholders = ",".join(["%s"] * len(req.status))
            query += f" AND t.status IN ({placeholders})"
            params.extend(req.status)

        if req.route_id:
            query += " AND t.route_id = %s"
            params.append(req.route_id)

        if req.city_from:
            query += " AND cf.city = %s"
            params.append(req.city_from)

        if req.city_to:
            query += " AND ct.city = %s"
            params.append(req.city_to)

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

        if req.passengers_from is not None:
            query += " AND COALESCE(tp.passengers_count, 0) >= %s"
            params.append(req.passengers_from)

        if req.passengers_to is not None:
            query += " AND COALESCE(tp.passengers_count, 0) <= %s"
            params.append(req.passengers_to)

        if req.has_free_seats:
            query += " AND COALESCE(tp.passengers_count, 0) < t.max_passengers_count"

        query += f" ORDER BY t.date {sort_order}, t.time {sort_order}"

        cursor.execute(query, params)
        result = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

    return result
