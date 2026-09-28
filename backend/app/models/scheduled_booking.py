"""Scheduled booking model for automated reservation agents (Firestore)."""
from datetime import date, time, datetime
from typing import Optional
from pydantic import Field
from app.db.base import FirestoreBaseModel


class ScheduledBooking(FirestoreBaseModel):
    """Scheduled booking model for Firestore."""
    user_id: str = Field(..., description="Reference to user document ID")
    restaurant_id: Optional[str] = Field(None, description="Reference to restaurant document ID")
    natural_language_prompt: str = Field(..., min_length=1)
    target_date: str = Field(..., description="ISO format date string (YYYY-MM-DD)")
    preferred_time: str = Field(..., description="ISO format time string (HH:MM)")
    party_size: int = Field(..., ge=1, le=20)

    # Status: pending, processing, completed, failed, cancelled
    execution_status: str = Field(default="pending", max_length=32)
    attempts: int = Field(default=0, ge=0)
    last_error: Optional[str] = None
    scheduled_for: str = Field(..., description="ISO format datetime string")
    
    # Denormalized fields for queries
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    restaurant_name: Optional[str] = None
    restaurant_slug: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_xyz789",
                "restaurant_id": "rest_abc123",
                "natural_language_prompt": "Book a table for 2 at an Italian restaurant tomorrow at 7pm",
                "target_date": "2026-10-15",
                "preferred_time": "19:00",
                "party_size": 2,
                "execution_status": "pending",
                "attempts": 0,
                "scheduled_for": "2026-10-14T10:00:00Z"
            }
        }


# Firestore collection name
SCHEDULED_BOOKINGS_COLLECTION = "scheduled_bookings"

# Indexes needed:
# - user_id + execution_status + scheduled_for
# - execution_status + scheduled_for
# - restaurant_id + execution_status
