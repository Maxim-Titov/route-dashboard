from fastapi import HTTPException

from src.db.connection import get_connection
from src.get import get_settings

from utils.hash_pass import *
from utils.jwt import create_access_token

def post_register(req):
    settings = get_settings()

    if not settings["access"]["allow_registration"]:
        raise HTTPException(403, "Registration disabled")
    
    default_role = settings["access"]["default_role"]

    conn = get_connection("users_data")
    cursor = conn.cursor(dictionary=True)

    # перевірка логіну
    cursor.execute(
        "SELECT id FROM users WHERE login = %s",
        (req.login,)
    )
    if cursor.fetchone():
        raise HTTPException(status_code=409, detail="Login already exists")

    hashed_password = hash_password(req.password)

    cursor.execute(
        """
        INSERT INTO users (login, password, name, surname, role)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (req.login, hashed_password, req.name, req.surname, default_role)
    )

    conn.commit()

    user_id = cursor.lastrowid

    token = create_access_token(
        {
            "sub": str(user_id),
            "role": "user"
        },
        int(settings["security"]["jwt_ttl"])
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": req.name,
            "surname": req.surname,
            "role": "user"
        }
    }

def post_login(req):
    settings = get_settings()

    conn = get_connection("users_data")
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT id, password, role, name, surname FROM users WHERE login = %s",
        (req.login,)
    )
    user = cursor.fetchone()

    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(
        {
            "sub": str(user["id"]),
            "role": user["role"]
        },
        int(settings["security"]["jwt_ttl"])
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "surname": user["surname"],
            "role": user["role"]
        }
    }