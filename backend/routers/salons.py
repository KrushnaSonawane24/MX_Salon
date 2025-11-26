from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, List
from pydantic import BaseModel
from database.mongo import get_db
from core.auth import require_role

router = APIRouter()

class SalonIn(BaseModel):
    name: str
    city: str
    address: str
    rating: float = 0.0
    pricing_level: int = 2
    opening_hours: dict = {}
    services: list = []
    images: list = []
    max_daily_bookings: int = 20

@router.get("")
async def list_salons(city: Optional[str] = None):
    db = await get_db()
    q = {"city": city} if city else {}
    items = []
    async for s in db.salons.find(q):
        s["id"] = str(s.pop("_id"))
        items.append(s)
    return items

@router.get("/{salon_id}")
async def get_salon(salon_id: str):
    from bson import ObjectId
    db = await get_db()
    s = await db.salons.find_one({"_id": ObjectId(salon_id)})
    if not s:
        raise HTTPException(status_code=404, detail="Salon not found")
    s["id"] = str(s.pop("_id"))
    return s

@router.post("")
async def create_salon(data: SalonIn, authorization: str | None = Header(default=None)):
    await require_role(authorization, roles=["owner", "admin"])  # owner or admin
    db = await get_db()
    res = await db.salons.insert_one(data.dict())
    return {"id": str(res.inserted_id)}

@router.put("/{salon_id}")
async def update_salon(salon_id: str, data: SalonIn, authorization: str | None = Header(default=None)):
    await require_role(authorization, roles=["owner", "admin"])  # role check
    from bson import ObjectId
    db = await get_db()
    await db.salons.update_one({"_id": ObjectId(salon_id)}, {"$set": data.dict()})
    return {"ok": True}

@router.delete("/{salon_id}")
async def delete_salon(salon_id: str, authorization: str | None = Header(default=None)):
    await require_role(authorization, roles=["admin"])  # admin-only
    from bson import ObjectId
    db = await get_db()
    await db.salons.delete_one({"_id": ObjectId(salon_id)})
    return {"ok": True}
