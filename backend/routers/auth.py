from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
import jwt
from core.config import settings
from database.mongo import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter()

class SignupIn(BaseModel):
    email: EmailStr
    password: str
    role: str  # customer | owner | admin
    name: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

async def create_token(payload: dict, expires_minutes: int = settings.JWT_EXPIRE_MINUTES) -> str:
    to_encode = payload.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm="HS256")

async def get_current_user(token: str = Depends(lambda authorization: authorization.replace("Bearer ", "") if authorization else "")):
    import fastapi
    authorization = fastapi.Request.scope  # type: ignore
    return {}

async def _get_current_user(auth_header: Optional[str] = None):
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = auth_header.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

@router.post("/signup", response_model=TokenOut)
async def signup(data: SignupIn):
    db = await get_db()
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = pwd_context.hash(data.password)
    doc = {"email": data.email, "password": hashed, "role": data.role, "name": data.name, "loyalty": 0, "no_shows": 0}
    res = await db.users.insert_one(doc)
    token = await create_token({"sub": str(res.inserted_id), "email": data.email, "role": data.role, "name": data.name})
    return {"access_token": token}

@router.post("/login", response_model=TokenOut)
async def login(data: LoginIn):
    db = await get_db()
    user = await db.users.find_one({"email": data.email})
    if not user or not pwd_context.verify(data.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = await create_token({"sub": str(user["_id"]), "email": user["email"], "role": user.get("role", "customer"), "name": user.get("name", "")})
    return {"access_token": token}

@router.get("/me")
async def me(authorization: Optional[str] = Header(default=None)):
    # Read the Authorization header and validate the JWT
    payload = await _get_current_user(authorization)
    return payload
