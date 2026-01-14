from src.db.connection import *

def get_cities():
    conn = get_connection("users_data")
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT *
        FROM cities
                   
        ORDER BY city DESC
    """)

    res = cursor.fetchall()

    cursor.close()
    conn.close()

    return res

def get_cities_count():
    conn = get_connection("users_data")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(*)
        FROM cities
    """)

    res = cursor.fetchall()

    cursor.close()
    conn.close()

    return res