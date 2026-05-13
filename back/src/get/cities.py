from src.db.connection import *

def get_cities():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT *
            FROM cities

            ORDER BY city DESC
        """)
        res = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

    return res

def get_cities_count():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT COUNT(*)
            FROM cities
        """)
        res = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

    return res
