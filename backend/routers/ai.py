from fastapi import APIRouter
from pydantic import BaseModel
from core.ai_waittime import predict_wait_time

router = APIRouter()

class WaitIn(BaseModel):
    queue_length: int
    avg_service_time: float
    time_of_day: int
    day_of_week: int

@router.post("/waittime")
async def waittime(data: WaitIn):
    pred = await predict_wait_time([data.queue_length, data.avg_service_time, data.time_of_day, data.day_of_week])
    return {"predicted_minutes": pred}

class RecommendIn(BaseModel):
    lat: float
    lng: float

@router.post("/recommend")
async def recommend(_: RecommendIn):
    # Placeholder recommendation logic
    return {"salons": []}
