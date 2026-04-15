from src.db.connection import get_connection

import json

def get_settings():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT `key`, `value` FROM settings")
    rows = cursor.fetchall()

    settings = {}
    for row in rows:
        settings[row["key"]] = json.loads(row["value"])

    return settings

def get_load_settings():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT `key`, `value` FROM settings")
    rows = cursor.fetchall()

    settings = {}

    for row in rows:
        settings[row["key"]] = json.loads(row["value"])

    return settings
