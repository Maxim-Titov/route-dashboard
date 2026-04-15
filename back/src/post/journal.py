from src.db.connection import get_connection

def post_write(user_id, entity_type, action, description):
    conn = get_connection("users_data")
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO journal (user_id, entity_type, action, description)
            VALUES (%s, %s, %s, %s)
        """, (user_id, entity_type, action, description))

        conn.commit()

        return 'Success'
    except Exception as e:
        conn.rollback()
    
        return 'Fail'
    finally:
        cursor.close()
        conn.close()
