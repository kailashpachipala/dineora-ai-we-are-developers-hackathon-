"""Reservation request and response schemas."""
from datetime import date, time, datetime
import uuid
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class ReservationCreate(BaseModel):
    user_id: Optional[uuid.UUID] = None
    restaurant_id: uuid.UUID
    table_id: uuid.UUID
    party_size: int = Field(..., ge=1, le=30)
    reservation_date: date
    start_time: time
    end_time: time
    occasion: Optional[str] = None
    seating_preference: Optional[str] = None
    special_requests: Optional[str] = None
    idempotency_key: str = Field(..., min_length=8, max_length=128, description="Client-generated unique token preventing duplicate bookings")


class ReservationRead(BaseModel):
    id: uuid.UUID
    reservation_code: str
    user_id: Optional[uuid.UUID] = None
    restaurant_id: uuid.UUID
    restaurant_name: Optional[str] = None
    table_id: uuid.UUID
    table_number: Optional[str] = None
    party_size: int
    reservation_date: date
    start_time: time
    end_time: time
    status: str
    occasion: Optional[str] = None
    seating_preference: Optional[str] = None
    special_requests: Optional[str] = None
    estimated_spend: Optional[float] = Field(None, description="Estimated group spend (average spend per person x party size)")
    estimated_spend_notice: str = "Estimated total based on average spend per person. Not a guaranteed bill."
    idempotency_key: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
