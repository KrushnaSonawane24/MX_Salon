from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

_client = None

def _client_instance():
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.MONGO_URI)
    return _client

async def get_db():
    client = _client_instance()
    return client.get_default_database()
