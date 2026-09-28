"""Database session and connection engine setup - Firebase Firestore."""
import logging
from typing import AsyncGenerator, Dict, Any
from app.core.config import settings
from app.db.firebase import (
    get_firestore_client,
    get_firestore_session,
    check_firestore_health,
    Collections,
)

logger = logging.getLogger(__name__)

# Re-export collections for convenience
__all__ = [
    "get_firestore_client",
    "get_firestore_session", 
    "check_firestore_health",
    "Collections",
    "get_db",
]


async def get_db() -> AsyncGenerator:
    """Dependency for obtaining a Firestore client per request."""
    async with get_firestore_session() as client:
        yield client


async def check_db_health() -> Dict[str, Any]:
    """Check Firestore database connection health and measure latency."""
    return await check_firestore_health()
