import os
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

from core.config import settings
from routers import auth, salons, queue, reviews, ai

fastapi_app = FastAPI(title="MX_Salon API", version="0.1.0")

origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fastapi_app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
fastapi_app.include_router(salons.router, prefix="/api/salons", tags=["salons"])
fastapi_app.include_router(queue.router, prefix="/api/queue", tags=["queue"])
fastapi_app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
fastapi_app.include_router(ai.router, prefix="/api/ai", tags=["ai"])

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=origins or "*")
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)

@fastapi_app.get("/health")
async def health():
    return JSONResponse({"status": "ok"})

# Expose sio for other modules
from routers.queue import set_socket_server  # noqa: E402
set_socket_server(sio)

# Socket.IO room management
@sio.event
async def connect(sid, environ, auth):
    # Connection established
    pass

@sio.event
async def join(sid, data):
    room = None
    if isinstance(data, dict):
        room = data.get("room")
    elif isinstance(data, str):
        room = data
    if room:
        await sio.enter_room(sid, room)

@sio.event
async def disconnect(sid):
    # Rooms are auto-cleaned up by server on disconnect
    pass
