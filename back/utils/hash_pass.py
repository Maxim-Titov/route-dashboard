import hashlib
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def hash_password(password: str) -> str:
    # bcrypt-safe prehash (always 32 bytes)
    password_bytes = password.encode("utf-8")
    sha = hashlib.sha256(password_bytes).hexdigest()
    return pwd_context.hash(sha)

def verify_password(password: str, hashed: str) -> bool:
    password_bytes = password.encode("utf-8")
    sha = hashlib.sha256(password_bytes).hexdigest()
    return pwd_context.verify(sha, hashed)
