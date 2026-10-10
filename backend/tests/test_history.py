import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db import db
from datetime import datetime
import asyncio
from bson import ObjectId
from app.core.security import create_access_token

@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.fixture
def auth_headers():
    token = create_access_token(data={"sub": "test@user.com"})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def auth_headers_other():
    token = create_access_token(data={"sub": "other@user.com"})
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.anyio
async def test_delete_history_owner(auth_headers):
    # Setup mock data directly in MongoDB if it's running
    if db.client is None:
        pytest.skip("MongoDB not connected")
        
    collection = db.db["history"]
    doc = {
        "user_email": "test@user.com",
        "date": "2026-01-01",
        "item": "Test Item",
        "verdict": "FRESH",
        "confidence": "99.99%",
        "timestamp": datetime.now()
    }
    result = await collection.insert_one(doc)
    scan_id = str(result.inserted_id)
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.delete(f"/api/history/{scan_id}", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["status"] == "success"
        
    # Verify it's gone
    deleted = await collection.find_one({"_id": result.inserted_id})
    assert deleted is None

@pytest.mark.anyio
async def test_delete_history_unauthorized_user(auth_headers, auth_headers_other):
    if db.client is None:
        pytest.skip("MongoDB not connected")
        
    collection = db.db["history"]
    doc = {
        "user_email": "test@user.com",
        "date": "2026-01-01",
        "item": "Test Item",
        "verdict": "FRESH",
        "confidence": "99.99%",
        "timestamp": datetime.now()
    }
    result = await collection.insert_one(doc)
    scan_id = str(result.inserted_id)
    
    # Other user tries to delete
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.delete(f"/api/history/{scan_id}", headers=auth_headers_other)
        assert response.status_code == 404 # Should not find it since user_email doesn't match
        
    # Verify it still exists
    exists = await collection.find_one({"_id": result.inserted_id})
    assert exists is not None

@pytest.mark.anyio
async def test_delete_all_history_scoped(auth_headers, auth_headers_other):
    if db.client is None:
        pytest.skip("MongoDB not connected")
        
    collection = db.db["history"]
    await collection.insert_one({"user_email": "test@user.com", "item": "A", "timestamp": datetime.now()})
    await collection.insert_one({"user_email": "other@user.com", "item": "B", "timestamp": datetime.now()})
    
    # test@user.com deletes all their history
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.delete("/api/history", headers=auth_headers)
        assert response.status_code == 200
        
    # Verify test@user.com has 0
    count_test = await collection.count_documents({"user_email": "test@user.com"})
    assert count_test == 0
    
    # Verify other@user.com still has 1
    count_other = await collection.count_documents({"user_email": "other@user.com"})
    assert count_other == 1
