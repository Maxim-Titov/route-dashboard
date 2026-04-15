FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD=1111
ENV MYSQL_DATABASE=users_data
ENV MYSQL_USER=maxim
ENV MYSQL_PASSWORD=1111

# Ініціалізація БД
COPY init.sql /docker-entrypoint-initdb.d/