from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.schemas.prediction import PredictionResponse
from app.services.prediction import PredictionService
from app.core.config import settings
from app.api.deps import get_current_user
from app.db import db
from datetime import datetime
from bson import ObjectId
import base64
from app.services.gemini import GeminiService

router = APIRouter()
prediction_service = PredictionService(settings.MODEL_PATH)
gemini_service = GeminiService()

@router.post('/predict')
async def predict(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")
    
    try:
        content = await file.read()
        freshness, confidence, _ = prediction_service.predict(content)
        
        # Identify the actual produce name using Gemini
        category = gemini_service.identify_produce(content)
        
        # Format confidence as percentage
        confidence_str = f"{confidence * 100:.2f}%"
        
        # Save to history with image
        img_b64 = base64.b64encode(content).decode('utf-8')
        collection = db.db["history"]
        scan_record = {
            "user_email": current_user["email"],
            "date": datetime.now().strftime("%Y-%m-%d"),
            "item": category,
            "verdict": freshness,
            "confidence": confidence_str,
            "image": img_b64,
            "timestamp": datetime.now()
        }
        result = await collection.insert_one(scan_record)
        scan_id = str(result.inserted_id)
        
        return {
            'id': scan_id,
            'freshness': freshness, 
            'confidence': confidence_str,
            'category': category,
            'image': img_b64
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/explain')
async def explain_prediction(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")
    try:
        content = await file.read()
        overlay_b64 = prediction_service.explain(content)
        return {"explanation_image": overlay_b64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/history')
async def get_history(current_user: dict = Depends(get_current_user)):
    collection = db.db["history"]
    cursor = collection.find({"user_email": current_user["email"]}).sort("timestamp", -1)
    history = await cursor.to_list(length=100)
    
    # Format for frontend
    formatted_history = []
    for doc in history:
        formatted_history.append({
            "id": str(doc["_id"]), # Full ID for deletion
            "short_id": str(doc["_id"])[-6:].upper(), # Short ID for UI view
            "date": doc["date"],
            "item": doc.get("item", "Produce"),
            "verdict": doc["verdict"],
            "confidence": doc["confidence"],
            "image": doc.get("image", None)
        })
        
    return formatted_history

@router.delete('/history/{scan_id}')
async def delete_history(scan_id: str, current_user: dict = Depends(get_current_user)):
    collection = db.db["history"]
    try:
        obj_id = ObjectId(scan_id)
        # Verify it belongs to user
        record = await collection.find_one({"_id": obj_id, "user_email": current_user["email"]})
        if not record:
            raise HTTPException(status_code=404, detail="Record not found")
        await collection.delete_one({"_id": obj_id})
        return {"status": "success"}
    except Exception as e:
        # If scan_id isn't valid ObjectId
        raise HTTPException(status_code=400, detail="Invalid ID")

@router.delete('/history')
async def delete_all_history(current_user: dict = Depends(get_current_user)):
    collection = db.db["history"]
    await collection.delete_many({"user_email": current_user["email"]})
    return {"status": "success"}

@router.get('/guide/ask')
async def ask_guide(q: str):
    if not q:
        raise HTTPException(status_code=400, detail="Query parameter 'q' is required.")
    advice = gemini_service.get_storage_advice(q)
    return {"advice": advice}
