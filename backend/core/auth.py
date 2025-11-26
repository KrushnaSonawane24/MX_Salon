from fastapi import Header, HTTPException
import jwt
from core.config import settings

async def require_role(authorization: str | None = Header(default=None), roles: list[str] | None = None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization")
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if roles and payload.get("role") not in roles:
        raise HTTPException(status_code=403, detail="Forbidden")
    return payload
