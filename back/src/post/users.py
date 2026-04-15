from src.db.connection import get_connection

def post_search_users(q):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT id, login, name, surname
        FROM users
        WHERE login LIKE %s
        LIMIT 20
    """, (q + '%',))
    
    res = cursor.fetchall()
    cursor.close()
    conn.close()

    return res

def post_set_user(user_id, trip_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        if user_id == 0:
            cursor.execute("""
                UPDATE trips
                SET user_id = NULL
                WHERE id = %s
            """, (trip_id,))
        else:
            cursor.execute("""
                UPDATE trips
                SET user_id = %s
                WHERE id = %s
            """, (user_id, trip_id))

        conn.commit()

        return {"status": "success"}

    except Exception as e:
        conn.rollback()
        return {"status": "error", "detail": str(e)}

    finally:
        cursor.close()
        conn.close()