from src.db.connection import get_connection

import json

def get_settings():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT `type`, `value` FROM settings")
    rows = cursor.fetchall()

    settings = {}
    for row in rows:
        settings[row["type"]] = json.loads(row["value"])

    return settings

def get_load_settings():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT `type`, `value` FROM settings")
    rows = cursor.fetchall()

    settings = {}

    for row in rows:
        settings[row["type"]] = json.loads(row["value"])

    return settings
