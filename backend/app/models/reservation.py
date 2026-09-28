"""Reservation domain model for Firestore."""
from datetime import date, time, datetime
from typing import Optional
from pydantic import Field
from app.db.base import FirestoreBaseModel


class Reservation(FirestoreBaseModel):
    """Reservation model for Firestore."""
    reservation_code: str = Field(..., max_length=32, description="Unique human-readable reservation code")
    user_id: Optional[str] = Field(None, description="Reference to user document ID")
    restaurant_id: str = Field(..., description="Reference to restaurant document ID")
    table_id: str = Field(..., description="Reference to table document ID")

    # Party & Timing
    party_size: int = Field(..., ge=1, le=20)
    reservation_date: str = Field(..., description="ISO format date string (YYYY-MM-DD)")
    start_time: str = Field(..., description="ISO format time string (HH:MM)")
    end_time: str = Field(..., description="ISO format time string (HH:MM)")

    # Status: pending, confirmed, seated, completed, cancelled, no_show
    status: str = Field(default="confirmed", max_length=32)

    # Occasion & Preferences
    occasion: Optional[str] = Field(None, max_length=100)
    seating_preference: Optional[str] = Field(None, max_length=50)
    special_requests: Optional[str] = Field(None, max_length=500)

    # Budget & Pricing
    estimated_spend: Optional[float] = Field(None, ge=0)

    # Concurrency & Idempotency
    idempotency_key: Optional[str] = Field(None, max_length=128)
    version: int = Field(default=1, ge=1)
    
    # Denormalized fields for queries
    restaurant_name: Optional[str] = None
    restaurant_slug: Optional[str] = None
    table_number: Optional[str] = None
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "reservation_code": "STK-ABC123",
                "user_id": "user_xyz789",
                "restaurant_id": "rest_abc123",
                "table_id": "table_def456",
                "party_size": 4,
                "reservation_date": "2026-10-15",
                "start_time": "19:30",
                "end_time": "21:30",
                "status": "confirmed",
                "occasion": "Anniversary",
                "seating_preference": "window",
                "special_requests": "Quiet table preferred",
                "estimated_spend": 200.0,
                "idempotency_key": "idem_abc123",
                "version": 1
            }
        }


# Firestore collection name
RESERVATIONS_COLLECTION = "reservations"

# Indexes needed:
# - user_id + status + reservation_date
# - restaurant_id + status + reservation_date
# - table_id + reservation_date + start_time + end_time (for conflict checking)
# - reservation_code (unique)
# - idempotency_key (unique)
# - status + reservation_date
