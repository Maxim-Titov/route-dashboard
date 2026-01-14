from src.db.connection import get_connection

import json

def post_update_setting(key: str, value: dict):
    conn = get_connection("users_data")
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO settings (`key`, `value`)
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE value = VALUES(value)
        """,
        (key, json.dumps(value))
    )

    conn.commit()
    return True
