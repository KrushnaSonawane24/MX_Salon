from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from database.mongo import get_db
from database.redis import get_redis
from core.auth import require_role
from bson import ObjectId

router = APIRouter()
_sio = None

def set_socket_server(sio):
    global _sio
    _sio = sio

async def _broadcast_queue(salon_id: str):
    if _sio:
        await _sio.emit("queue:update", await get_queue_state(salon_id), room=f"salon:{salon_id}")

async def get_queue_state(salon_id: str):
    r = await get_redis()
    qkey = f"queue:{salon_id}"
    members = await r.lrange(qkey, 0, -1)
    return {"salon_id": salon_id, "queue": [m.decode() for m in members]}

@router.post("/join/{salon_id}")
async def join_queue(salon_id: str, user_id: str):
    # Prevent banned users from joining
    db = await get_db()
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user and user.get("banned"):
            raise HTTPException(status_code=403, detail="User is banned due to repeated no-shows")
    except Exception:
        # if user_id is not ObjectId or user not found, allow join
        pass
    r = await get_redis()
    await r.rpush(f"queue:{salon_id}", user_id)
    await _broadcast_queue(salon_id)
    return {"ok": True}

@router.post("/leave/{salon_id}")
async def leave_queue(salon_id: str, user_id: str):
    r = await get_redis()
    await r.lrem(f"queue:{salon_id}", 0, user_id)
    await _broadcast_queue(salon_id)
    return {"ok": True}

@router.get("/{salon_id}")
async def get_queue(salon_id: str):
    return await get_queue_state(salon_id)

@router.post("/noshow/{salon_id}")
async def mark_no_show(salon_id: str, user_id: str, authorization: str | None = Header(default=None)):
    # Owner/Admin only
    await require_role(authorization, roles=["owner", "admin"])
    db = await get_db()
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user_id")
    user = await db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    no_shows = int(user.get("no_shows", 0)) + 1
    update = {"no_shows": no_shows}
    if no_shows >= 3:
        update["banned"] = True
    await db.users.update_one({"_id": oid}, {"$set": update})
    # remove from queue if present
    r = await get_redis()
    await r.lrem(f"queue:{salon_id}", 0, user_id)
    await _broadcast_queue(salon_id)
    return {"ok": True, "no_shows": no_shows, "banned": update.get("banned", False)}

@router.post("/complete/{salon_id}")
async def complete_service(salon_id: str, user_id: str, authorization: str | None = Header(default=None)):
    # Owner/Admin only
    await require_role(authorization, roles=["owner", "admin"])
    db = await get_db()
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user_id")
    user = await db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    loyalty = int(user.get("loyalty", 0)) + 10
    await db.users.update_one({"_id": oid}, {"$set": {"loyalty": loyalty}})
    r = await get_redis()
    await r.lrem(f"queue:{salon_id}", 0, user_id)
    await _broadcast_queue(salon_id)
    return {"ok": True, "loyalty": loyalty}
