SELECT JSON_OBJECT(
    'cities', (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', c.id,
                'city', c.city
            )
        )
        FROM cities c
    ),

    'routes', (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', r.id,
                'from_city', cf.city,
                'to_city', ct.city
            )
        )
        FROM routes r
        JOIN cities cf ON cf.id = r.from_city_id
        JOIN cities ct ON ct.id = r.to_city_id
    ),

    'trips', (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', t.id,
                'date', t.date,
                'time', t.time,
                'status', t.status,
                'max_passengers_count', t.max_passengers_count,
                'created_at', t.created_at,

                'route', JSON_OBJECT(
                    'from_city', cf.city,
                    'to_city', ct.city
                ),

                'trip_stations', (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'city', c.city,
                            'order', co.city_order
                        )
                        ORDER BY co.city_order
                    )
                    FROM trip_stations co
                    JOIN cities c ON c.id = co.city_id
                    WHERE co.trip_id = t.id
                ),

                'passengers', (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', p.id,
                            'first_name', p.first_name,
                            'last_name', p.last_name,
                            'phone', p.phone,
                            'date_of_birth', p.date_of_birth,
                            'note', n.note
                        )
                    )
                    FROM trip_passengers tp
                    JOIN passengers p ON p.id = tp.passenger_id
                    LEFT JOIN notes n ON n.passenger_id = p.id
                    WHERE tp.trip_id = t.id
                )
            )
        )
        FROM trips t
        JOIN routes r ON r.id = t.route_id
        JOIN cities cf ON cf.id = r.from_city_id
        JOIN cities ct ON ct.id = r.to_city_id
    )
) AS full_db_json;