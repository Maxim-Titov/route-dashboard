from datetime import datetime, timedelta
from jose import jwt, JWTError

import os

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = os.getenv("JWT_ALGORITHM")

def create_refresh_token(data: dict, ttl_days: int = 7):
    to_encode = data.copy()

    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])

    expire = datetime.utcnow() + timedelta(days=ttl_days)
    to_encode.update({
        "exp": expire,
        "type": "refresh"
    })

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_access_token(data: dict, ttl_minutes: int):
    to_encode = data.copy()

    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])

    expire = datetime.utcnow() + timedelta(minutes=ttl_minutes)
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
