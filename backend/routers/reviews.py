from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from database.mongo import get_db
from core.ai_sentiment import analyze_sentiment

router = APIRouter()

class ReviewIn(BaseModel):
    user_id: str
    rating: int
    text: str

@router.post("/{salon_id}")
async def add_review(salon_id: str, data: ReviewIn):
    db = await get_db()
    sentiment = await analyze_sentiment(data.text)
    doc = {"salon_id": salon_id, "user_id": data.user_id, "rating": data.rating, "text": data.text, "sentiment": sentiment}
    res = await db.reviews.insert_one(doc)
    return {"id": str(res.inserted_id), "sentiment": sentiment}

@router.get("/{salon_id}")
async def list_reviews(salon_id: str):
    db = await get_db()
    items = []
    async for r in db.reviews.find({"salon_id": salon_id}).sort("_id", -1):
        r["id"] = str(r.pop("_id"))
        items.append(r)
    return items
