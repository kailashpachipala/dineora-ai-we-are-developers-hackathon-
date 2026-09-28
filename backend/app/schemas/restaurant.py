"""Restaurant schemas."""
import uuid
from typing import Optional, List
from pydantic import BaseModel, Field


class RestaurantBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    cuisine_type: str
    address: str
    city: str
    neighborhood: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_tier: str = "$$"
    average_spend_per_person: float = 45.0
    rating: float = 4.5
    review_count: int = 0
    opening_time: str = "17:00"
    closing_time: str = "23:00"
    is_active: bool = True


class RestaurantRead(RestaurantBase):
    id: uuid.UUID

    class Config:
        from_attributes = True
