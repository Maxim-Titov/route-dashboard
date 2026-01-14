CREATE DATABASE IF NOT EXISTS users_data
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE users_data;

-- ============================
--  Таблиця users
-- ============================
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    login VARCHAR(191) NOT NULL UNIQUE,
    password CHAR(60) NOT NULL COMMENT 'bcrypt hash',

    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,

    role ENUM('user','admin', 'moderator') NOT NULL DEFAULT 'user',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================
--  Таблиця settings
-- ============================
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,

    `key` VARCHAR(100) NOT NULL UNIQUE,
    `value` JSON NOT NULL,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================
--  Таблиця cities
-- ============================
CREATE TABLE IF NOT EXISTS cities (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,

    city VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ============================
--  Таблиця routes
-- ============================
CREATE TABLE IF NOT EXISTS routes (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,

    from_city_id BIGINT UNSIGNED NOT NULL,
    to_city_id BIGINT UNSIGNED NOT NULL,

    CHECK (from_city_id <> to_city_id),

    FOREIGN KEY (from_city_id) REFERENCES cities(id),
    FOREIGN KEY (to_city_id) REFERENCES cities(id),

    INDEX (from_city_id),
    INDEX (to_city_id),

    UNIQUE (from_city_id, to_city_id)
) ENGINE=InnoDB;

-- ============================
--  Таблиця trips
-- ============================
CREATE TABLE IF NOT EXISTS trips (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,

    route_id BIGINT UNSIGNED NOT NULL,

    max_passengers_count INT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status ENUM('planned','active','completed','cancelled') DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (route_id) REFERENCES routes(id)
) ENGINE=InnoDB;

-- ============================
--  Таблиця trip_stations
-- ============================
CREATE TABLE IF NOT EXISTS trip_stations (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,

    trip_id BIGINT UNSIGNED NOT NULL,
    city_id BIGINT UNSIGNED NOT NULL,

    city_order INT NOT NULL,

    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (city_id) REFERENCES cities(id),

    UNIQUE (trip_id, city_order)
) ENGINE=InnoDB;

-- ============================
--  Таблиця passengers
-- ============================
CREATE TABLE IF NOT EXISTS passengers (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,

    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    date_of_birth DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_passengers_first_name
ON passengers (first_name);

CREATE INDEX idx_passengers_last_name
ON passengers (last_name);

CREATE INDEX idx_passengers_full_name
ON passengers (first_name, last_name);

-- ============================
--  Таблиця trip_passengers
-- ============================
CREATE TABLE IF NOT EXISTS trip_passengers (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,

    trip_id BIGINT UNSIGNED,
    passenger_id BIGINT UNSIGNED,

    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (passenger_id) REFERENCES passengers(id) ON DELETE CASCADE,

    UNIQUE (trip_id, passenger_id)
) ENGINE=InnoDB;

-- ============================
--  Таблиця notes
-- ============================
CREATE TABLE IF NOT EXISTS notes (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,

    passenger_id BIGINT UNSIGNED NOT NULL,

    note TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (passenger_id) REFERENCES passengers(id) ON DELETE CASCADE,

    UNIQUE (passenger_id)
) ENGINE=InnoDB;