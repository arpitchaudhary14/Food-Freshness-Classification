from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.api.deps import get_current_user
from app.services.gemini import GeminiService

router = APIRouter()
gemini_service = GeminiService()

class InsightRequest(BaseModel):
    verdict: str
    item: str = "Produce"

@router.post('/')
async def get_insights(request: InsightRequest, current_user: dict = Depends(get_current_user)):
    try:
        insights_text = gemini_service.get_insights(verdict=request.verdict, produce_type=request.item)
        return {"insights": insights_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
