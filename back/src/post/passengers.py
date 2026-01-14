from src.db.connection import get_connection

def post_add_passenger(name, surname, phone, date_of_birth, trip_id=None, note=None):
    conn = get_connection("users_data")
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT id FROM passengers WHERE phone = %s", (phone, ))
        is_passenger = cursor.fetchone()

        if is_passenger:
            return 'exists'

        cursor.execute("""
            INSERT INTO passengers (first_name, last_name, phone, date_of_birth)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                first_name = VALUES(first_name),
                last_name = VALUES(last_name),
                date_of_birth = VALUES(date_of_birth)
        """, (name, surname, phone, date_of_birth))

        if cursor.lastrowid:
            passenger_id = cursor.lastrowid
        else:
            cursor.execute("SELECT id FROM passengers WHERE phone = %s", (phone,))

            passenger_id = cursor.fetchone()["id"]

        if trip_id:
            cursor.execute("SELECT id FROM trips WHERE id = %s", (trip_id,))
            is_trip = cursor.fetchone()

            if not is_trip:
                return 'trip not exists'
        
            cursor.execute("""
                INSERT INTO trip_passengers (trip_id, passenger_id)
                VALUES (%s, %s)
            """, (trip_id, passenger_id))

        if note:
            cursor.execute("""
                INSERT INTO notes (passenger_id, note)
                VALUES (%s, %s)
                ON DUPLICATE KEY UPDATE
                    note = VALUES(note)
            """, (passenger_id, note))

        conn.commit()

        return passenger_id

    except Exception as e:
        conn.rollback()
        raise e

    finally:
        cursor.close()
        conn.close()

def post_edit_passenger(id, name, surname, phone, date_of_birth, note=None):
    conn = get_connection("users_data")
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT id FROM passengers WHERE id = %s", (id,))
        passenger = cursor.fetchone()

        if not passenger:
            return 'not_found'

        cursor.execute("""
            UPDATE passengers
            SET
                first_name = %s,
                last_name = %s,
                phone = %s,
                date_of_birth = %s
            WHERE id = %s
        """, (name, surname, phone, date_of_birth, id))

        if note:
            cursor.execute("""
                INSERT INTO notes (passenger_id, note)
                VALUES (%s, %s)
                ON DUPLICATE KEY UPDATE
                    note = VALUES(note)
            """, (id, note))

        conn.commit()
        return True

    except Exception as e:
        conn.rollback()
        raise e

    finally:
        cursor.close()
        conn.close()

def post_delete_passenger(id):
    conn = get_connection("users_data")
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM passengers WHERE id = %s", (id, ))

    row = cursor.fetchone()

    if row:
        cursor.execute("DELETE FROM passengers WHERE id = %s", (id, ))

        conn.commit()

    cursor.close()
    conn.close()

def post_search_passengers(name=None, surname=None, phone=None):
    conn = get_connection("users_data")
    cursor = conn.cursor(dictionary=True)

    if phone:
        cursor.execute("""
            SELECT id, first_name, last_name, phone
            FROM passengers
            WHERE phone LIKE %s
            LIMIT 20
        """, (phone + '%',))

        res = cursor.fetchall()
        cursor.close()
        conn.close()
        return res

    conditions = []
    params = []

    if name:
        if not surname:
            conditions.append("first_name LIKE %s OR last_name LIKE %s")
            params.append(name + '%')
            params.append(name + '%')
        else:
            print(surname)
            conditions.append("first_name LIKE %s")
            params.append(name + '%')

    if surname:
        conditions.append("last_name LIKE %s")
        params.append(surname + '%')

    if not conditions:
        return []

    sql = f"""
        SELECT id, first_name, last_name, phone
        FROM passengers
        WHERE {' OR '.join(conditions)}
        LIMIT 20
    """

    cursor.execute(sql, params)
    res = cursor.fetchall()

    cursor.close()
    conn.close()
    return res

def post_filter_passengers(
    sort_by='desc',
    age_from=None,
    age_to=None,
    city_from=None,
    city_to=None
):
    conn = get_connection("users_data")
    cursor = conn.cursor(dictionary=True)

    sort_map = {
        'asc': 'ASC',
        'desc': 'DESC'
    }
    sort_order = sort_map.get(sort_by, 'DESC')

    query = """
        SELECT
            p.id,
            p.first_name AS name,
            p.last_name AS surname,
            p.phone,
            p.date_of_birth,
            nt.note,
            cf.city AS city_from,
            ct.city AS city_to,
            COUNT(tp.passenger_id) AS trips_count
        FROM passengers p
        LEFT JOIN trip_passengers tp ON p.id = tp.passenger_id
        LEFT JOIN trips t ON tp.trip_id = t.id
        LEFT JOIN routes r ON r.id = t.route_id
        LEFT JOIN cities cf ON r.from_city_id = cf.id
        LEFT JOIN cities ct ON r.to_city_id = ct.id
        LEFT JOIN notes nt ON nt.passenger_id = p.id
        WHERE 1=1
    """

    params = []

    # ---------------------------
    # AGE FILTERS (INDEX FRIENDLY)
    # ---------------------------
    if age_from:
        query += """
            AND p.date_of_birth <= DATE_SUB(CURDATE(), INTERVAL %s YEAR)
        """
        params.append(age_from)

    if age_to:
        query += """
            AND p.date_of_birth >= DATE_SUB(CURDATE(), INTERVAL %s YEAR)
        """
        params.append(age_to)

    # ---------------------------
    # CITY FILTERS
    # ---------------------------
    if city_from:
        query += " AND cf.city = %s"
        params.append(city_from)

    if city_to:
        query += " AND ct.city = %s"
        params.append(city_to)

    query += "GROUP BY p.id, p.first_name, p.last_name, p.phone, cf.city, ct.city, nt.note"

    # ---------------------------
    # SORTING
    # ---------------------------
    query += f" ORDER BY t.created_at {sort_order}"

    cursor.execute(query, params)
    result = cursor.fetchall()

    cursor.close()
    conn.close()

    return result

def post_search_cities(q):
    conn = get_connection("users_data")
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