from src.db.connection import get_connection

def get_journal():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT users.login AS login, users.name, users.surname, journal.entity_type, journal.action, journal.description, journal.event_time
        FROM journal
        LEFT JOIN users ON journal.user_id = users.id
        ORDER BY journal.event_time DESC
    """)

    res = cursor.fetchall()

    cursor.close()
    conn.close()

    return res

def get_clear_journal():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("TRUNCATE TABLE journal;")

    cursor.close()
    conn.close()

    return 'ok'