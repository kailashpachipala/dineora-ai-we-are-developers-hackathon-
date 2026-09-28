"""Firebase Firestore client and connection management."""
import os
import logging
from typing import Optional
from contextlib import asynccontextmanager

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore import AsyncClient, Client

from app.core.config import settings

logger = logging.getLogger(__name__)

# Global Firebase app instance
_firebase_app: Optional[firebase_admin.App] = None
_firestore_client: Optional[AsyncClient] = None
_sync_firestore_client: Optional[Client] = None


def initialize_firebase() -> firebase_admin.App:
    """Initialize Firebase Admin SDK."""
    global _firebase_app
    
    if _firebase_app is not None:
        return _firebase_app
    
    # Check if running with emulator
    if settings.FIREBASE_EMULATOR_HOST:
        os.environ["FIRESTORE_EMULATOR_HOST"] = settings.FIREBASE_EMULATOR_HOST
        logger.info(f"Using Firestore emulator at {settings.FIREBASE_EMULATOR_HOST}")
    
    # Initialize with credentials if provided, otherwise use default credentials
    if settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        _firebase_app = firebase_admin.initialize_app(cred, {
            'projectId': settings.FIREBASE_PROJECT_ID,
        })
    else:
        # Use Application Default Credentials (ADC)
        _firebase_app = firebase_admin.initialize_app(options={
            'projectId': settings.FIREBASE_PROJECT_ID,
        })
    
    logger.info(f"Firebase initialized for project: {settings.FIREBASE_PROJECT_ID}")
    return _firebase_app


def get_firestore_client() -> AsyncClient:
    """Get async Firestore client."""
    global _firestore_client
    
    if _firestore_client is None:
        initialize_firebase()
        _firestore_client = firestore.AsyncClient(
            project=settings.FIREBASE_PROJECT_ID,
            database=settings.FIRESTORE_DATABASE,
        )
    
    return _firestore_client


def get_sync_firestore_client() -> Client:
    """Get synchronous Firestore client."""
    global _sync_firestore_client
    
    if _sync_firestore_client is None:
        initialize_firebase()
        _sync_firestore_client = firestore.Client(
            project=settings.FIREBASE_PROJECT_ID,
            database=settings.FIRESTORE_DATABASE,
        )
    
    return _sync_firestore_client


@asynccontextmanager
async def get_firestore_session():
    """Context manager for Firestore operations (for dependency injection)."""
    client = get_firestore_client()
    try:
        yield client
    except Exception as e:
        logger.error(f"Firestore session error: {e}")
        raise


async def check_firestore_health() -> dict:
    """Check Firestore connection health."""
    import time
    start_time = time.perf_counter()
    
    try:
        client = get_firestore_client()
        # Try a simple read operation
        await client.collection("_health_check").limit(1).get()
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        
        return {
            "status": "connected",
            "latency_ms": latency_ms,
            "engine": "firestore",
            "database": settings.FIRESTORE_DATABASE,
            "project_id": settings.FIREBASE_PROJECT_ID,
            "error": None,
        }
    except Exception as e:
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            "status": "disconnected",
            "latency_ms": latency_ms,
            "engine": "firestore",
            "database": settings.FIRESTORE_DATABASE,
            "project_id": settings.FIREBASE_PROJECT_ID,
            "error": str(e),
        }


# Collection names as constants
class Collections:
    RESTAURANTS = "restaurants"
    TABLES = "tables"
    RESERVATIONS = "reservations"
    USERS = "users"
    WAITLIST_ENTRIES = "waitlist_entries"
    FEEDBACKS = "feedbacks"
    INSIGHTS = "restaurant_insights"
    SCHEDULED_BOOKINGS = "scheduled_bookings"