"""Waitlist domain model for Firestore."""
from datetime import date, time, datetime
from typing import Optional
from pydantic import Field
from app.db.base import FirestoreBaseModel


class WaitlistEntry(FirestoreBaseModel):
    """Waitlist entry model for Firestore."""
    user_id: str = Field(..., description="Reference to user document ID")
    restaurant_id: str = Field(..., description="Reference to restaurant document ID")
    party_size: int = Field(..., ge=1, le=20)
    desired_date: str = Field(..., description="ISO format date string (YYYY-MM-DD)")
    preferred_time_start: str = Field(..., description="ISO format time string (HH:MM)")
    preferred_time_end: str = Field(..., description="ISO format time string (HH:MM)")
    seating_preference: Optional[str] = Field(None, max_length=50)

    # Status: active, notified, converted, expired, cancelled
    status: str = Field(default="active", max_length=32)
    priority_score: int = Field(default=100, ge=0, le=1000)
    
    # Denormalized fields for queries
    restaurant_name: Optional[str] = None
    restaurant_slug: Optional[str] = None
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_xyz789",
                "restaurant_id": "rest_abc123",
                "party_size": 2,
                "desired_date": "2026-10-15",
                "preferred_time_start": "19:00",
                "preferred_time_end": "20:00",
                "seating_preference": "outdoor",
                "status": "active",
                "priority_score": 100
            }
        }


# Firestore collection name
WAITLIST_ENTRIES_COLLECTION = "waitlist_entries"

# Indexes needed:
# - user_id + status + desired_date
# - restaurant_id + status + desired_date
# - status + desired_date + priority_score (descending)
