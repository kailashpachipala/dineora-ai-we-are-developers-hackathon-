"""Table and Waitlist schemas."""
import uuid
from datetime import date, time, datetime
from typing import Optional
from pydantic import BaseModel, Field


class TableRead(BaseModel):
    id: uuid.UUID
    restaurant_id: uuid.UUID
    table_number: str
    min_capacity: int
    max_capacity: int
    seating_area: str
    is_active: bool

    class Config:
        from_attributes = True


class WaitlistCreate(BaseModel):
    user_id: uuid.UUID
    restaurant_id: uuid.UUID
    party_size: int = Field(..., ge=1, le=30)
    desired_date: date
    preferred_time_start: time
    preferred_time_end: time
    seating_preference: Optional[str] = None


class WaitlistRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    restaurant_id: uuid.UUID
    party_size: int
    desired_date: date
    preferred_time_start: time
    preferred_time_end: time
    seating_preference: Optional[str] = None
    status: str
    priority_score: int
    created_at: datetime

    class Config:
        from_attributes = True
