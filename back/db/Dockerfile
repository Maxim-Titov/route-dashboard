FROM mysql:8.0

COPY schema.sql /docker-entrypoint-initdb.d/1-schema.sql
COPY init.sql /docker-entrypoint-initdb.d/2-init.sql