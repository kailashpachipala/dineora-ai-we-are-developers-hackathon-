"""API v1 Router registry."""
from fastapi import APIRouter
from app.api.v1.endpoints import health
from app.api.v1.endpoints import booking

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health & System Status"])
api_router.include_router(booking.router, tags=["Reservations & Discovery"])
