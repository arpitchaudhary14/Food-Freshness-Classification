from pydantic import BaseModel
from typing import Optional

class PredictionResponse(BaseModel):
    freshness: str
    confidence: float
    category: Optional[str] = None
