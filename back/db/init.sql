USE users_data;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE notes;
TRUNCATE TABLE trip_passengers;
TRUNCATE TABLE passengers;
TRUNCATE TABLE trip_stations;
TRUNCATE TABLE trips;
TRUNCATE TABLE routes;
TRUNCATE TABLE city_stations;
TRUNCATE TABLE cities;
TRUNCATE TABLE settings;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================
-- SETTINGS
-- ============================
INSERT INTO settings (`type`, `value`) VALUES
('general', JSON_OBJECT('site_name','Route Dashboard')),
('security', JSON_OBJECT('access_ttl',60, 'refresh_ttl',7)),
('access', JSON_OBJECT('allow_registration',TRUE));

-- ============================
-- USERS
-- ============================
INSERT INTO users (login, password, name, surname, role) VALUES
('admin', '$2b$12$EBINvHSeR1UP0ccDD4jT8.p3TmnElcWelDfK.r9bD4XPce1MYCckO', 'Admin', 'Admin', 'admin');

-- ============================
-- CITIES
-- ============================
INSERT INTO cities (city) VALUES
('Київ'),('Львів'),('Луцьк'),('Варшава'),
('Берлін'),('Лондон'),('Одеса'),('Полтава'),
('Барселона'),('Мадрид');

-- ============================
-- CITY STATIONS
-- ============================
INSERT INTO city_stations (city_id,station_name,station_address) VALUES
(1,'Автовокзал','вул. Шевченка, 10'),
(1,'Залізничний вокзал','вул. Вокзальна, 1'),
(2,'Центр','пл. Ринок, 1'),
(3,'Площа','вул. Центральна, 7'),
(4,'Dworzec','Aleje Jerozolimskie 54'),
(5,'ZOB','Europaplatz 1'),
(7,'Морпорт','вул. Приморська, 5');

-- ============================
-- ROUTES
-- ============================
INSERT INTO routes (from_city_id,to_city_id) VALUES
(1,4),(1,2),(2,5),(3,9),(7,1),(8,2);

-- ============================
-- TRIPS
-- ============================
INSERT INTO trips (route_id,max_passengers_count,date,time,status) VALUES
(1,40,'2026-01-10','08:00','planned'),
(2,30,'2026-01-11','09:30','active'),
(3,45,'2026-01-05','07:00','completed'),
(4,20,'2026-01-06','15:00','completed'),
(5,25,'2026-01-12','12:00','planned');

-- ============================
-- TRIP STATIONS
-- ============================
INSERT INTO trip_stations (trip_id,city_id,city_order) VALUES
(1,1,1),(1,4,2),
(2,1,1),(2,2,2),
(3,2,1),(3,5,2),
(4,3,1),(4,9,2),
(5,7,1),(5,1,2);

-- ============================
-- PASSENGERS
-- ============================
INSERT INTO passengers (first_name,last_name,phone,date_of_birth) VALUES
('Іван','Іванов','380111111111','2000-01-01'),
('Павло','Павлов','380222222222','2002-02-02'),
('Анна','Коваленко','380333333333','1999-05-10'),
('Тарас','Шевченко','380444444444','1995-09-21'),
('Марія','Бондар','380555555555','2001-12-12');

-- ============================
-- TRIP_PASSENGERS
-- ============================
INSERT INTO trip_passengers (trip_id,passenger_id) VALUES
(1,1),(1,2),(2,3),(3,4),(4,5),(5,1),(5,3);

-- ============================
-- NOTES
-- ============================
INSERT INTO notes (passenger_id,note) VALUES
(1,'Любить сидіти біля вікна'),
(2,'Боіться висоти'),
(3,'Часто запізнюється'),
(4,'Постійний клієнт'),
(5,'Потребує допомоги з багажем');
