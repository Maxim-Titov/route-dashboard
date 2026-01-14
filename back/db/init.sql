USE users_data;

INSERT INTO settings (`key`, `value`)
VALUES (
	'general',
	JSON_OBJECT(
		'site_name', 'Route Dashboard'
	)
),
(
	'security',
	JSON_OBJECT(
		'jwt_ttl', 60,
		'allow_multiple_sessions', FALSE
	)
),
(
	'access',
	JSON_OBJECT(
		'allow_registration', TRUE,
		'default_role', 'user'
	)
);


INSERT INTO cities (city)
VALUES ('Київ'),
    ('Львів'),
    ('Луцьк'),
    ('Варшава'),
    ('Берлін'),
    ('Лондон'),
    ('Одеса'),
    ('Полтава'),
    ('Барселона'),
    ('Мадрид');



INSERT INTO routes (from_city_id, to_city_id)
VALUES (1, 4),
    (3, 9),
    (2, 5);



INSERT INTO trips (route_id, max_passengers_count, date, time, status)
VALUES (1, 4, '2025-12-30', '08:00:00', 'planned'),
    (2, 3, '2025-12-31', '10:00:00', 'planned'),
    (3, 4, '2025-12-28', '07:00:00', 'completed'),
    (2, 6, '2025-12-28', '12:00:00', 'completed');



INSERT INTO trip_stations (trip_id, city_id, city_order)
VALUES (1, 3, 1),
    (2, 4, 1),
    (2, 5, 2),
    (3, 3, 1),
    (3, 4, 2);



INSERT INTO passengers (first_name, last_name, phone, date_of_birth)
VALUES ('Іван', 'Іванов', '380123456781', '2000-02-20'),
    ('Павло', 'Павлов', '380876543211', '2003-12-05'),
    ('Жанна', 'Іванова', '380567812345', '2000-02-20'),
    ('Тарас', 'Тарасов', '380098768650', '2000-02-20'),
    ('Анна', 'Тарасова', '380568741698', '2000-02-20');



INSERT INTO trip_passengers (trip_id, passenger_id)
VALUES (1, 1),
    (2, 2),
    (1, 3),
    (3, 4),
    (3, 5),
    (4, 2);



INSERT INTO notes (passenger_id, note)
VALUES (1, 'Гарний настрій'),
    (2, 'Укачує в дорозі'),
    (3, 'Любить спати в дорозі'),
    (4, "Завжди п'яний"),
    (5, 'Соромно за чоловіка');