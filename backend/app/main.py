from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.endpoints import router as api_router
from app.api.auth import router as auth_router
from app.api.insights import router as insights_router
from app.db import connect_to_mongo, close_mongo_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/health')
def health_check():
    return {'status': 'ok'}

app.include_router(auth_router, prefix='/api/auth', tags=['auth'])
app.include_router(api_router, prefix='/api', tags=['api'])
app.include_router(insights_router, prefix='/api/insights', tags=['insights'])
