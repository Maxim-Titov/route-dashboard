FROM mysql:8.0

# Ініціалізація БД
COPY init.sql /docker-entrypoint-initdb.d/