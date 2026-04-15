from src.db.connection import get_connection

def get_users():
    conn = get_connection("users_data")
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT id, login, name, surname, role, created_at
        FROM users
        
        ORDER BY created_at DESC
    """)

    users = cursor.fetchall()

    cursor.close()
    conn.close()

    return users