from fastapi import HTTPException
from fastapi.responses import JSONResponse

from src.db.connection import get_connection
from src.get import get_settings

from utils.hash_pass import *
from utils.jwt import create_refresh_token, create_access_token

def post_register(req):
    settings = get_settings()

    if not settings["access"]["allow_registration"]:
        raise HTTPException(403, "Registration disabled")
    
    role = 'admin' if req.is_admin else 'user'

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # перевірка логіну
    cursor.execute(
        "SELECT id FROM users WHERE login = %s",
        (req.login,)
    )
    
    if cursor.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=409, detail="Login already exists")

    hashed_password = hash_password(req.password)

    cursor.execute(
        """
        INSERT INTO users (login, password, name, surname, role)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (req.login, hashed_password, req.name, req.surname, role)
    )

    conn.commit()

    user_id = cursor.lastrowid

    cursor.close()
    conn.close()

    token = create_access_token(
        {
            "sub": str(user_id),
            "role": "user"
        },
        int(settings["security"]["access_ttl"])
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

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT id, password, role, name, surname FROM users WHERE login = %s",
        (req.login,)
    )
    user = cursor.fetchone()

    if not user or not verify_password(req.password, user["password"]):
        cursor.close()
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid credentials")

    cursor.close()
    conn.close()

    access_token = create_access_token(
        {
            "sub": str(user["id"]),
            "role": user["role"],
            "type": "access"
        },
        int(settings["security"]["access_ttl"])
    )

    refresh_token = create_refresh_token({
        "sub": str(user["id"]),
        "role": user["role"]
    }, int(settings["security"]["refresh_ttl"]))

    response = JSONResponse(content={
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "surname": user["surname"],
            "role": user["role"]
        }
    })

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,  # 👉 True в проді
        samesite="none"
    )

    return response

def post_edit_user(user_id, login, name, surname, is_admin):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            return 'not_found'
        
        role = 'admin' if is_admin else 'user'

        cursor.execute("""
            UPDATE users
            SET
                name = %s,
                surname = %s,
                login = %s,
                role = %s
            WHERE id = %s
        """, (name, surname, login, role, user_id))

        conn.commit()
        return True

    except Exception as e:
        conn.rollback()
        raise e

    finally:
        cursor.close()
        conn.close()

def post_delete_user(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
    conn.commit()

    cursor.close()
    conn.close()

    return "deleted"