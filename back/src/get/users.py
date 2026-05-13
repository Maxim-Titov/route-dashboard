from src.db.connection import get_connection

def get_users():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT id, login, name, surname, role, created_at
            FROM users

            ORDER BY created_at DESC
        """)
        users = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

    return users
