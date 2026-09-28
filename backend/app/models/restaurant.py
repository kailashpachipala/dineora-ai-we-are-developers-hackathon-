"""Restaurant domain model for Firestore."""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import Field
from app.db.base import FirestoreBaseModel


class Restaurant(FirestoreBaseModel):
    """Restaurant model for Firestore."""
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=255)
    description: Optional[str] = None
    cuisine_type: str = Field(..., max_length=100)
    
    # Location
    address: str = Field(..., max_length=255)
    city: str = Field(..., max_length=100)
    neighborhood: Optional[str] = Field(None, max_length=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # Pricing & Metrics
    price_tier: str = Field(default="$$", max_length=10)  # $, $$, $$$, $$$$
    average_spend_per_person: float = Field(default=45.0)
    rating: float = Field(default=4.5)
    review_count: int = Field(default=0)

    # Operating hours
    opening_time: str = Field(default="17:00", max_length=10)
    closing_time: str = Field(default="23:00", max_length=10)

    # Status & Flags
    is_active: bool = Field(default=True)
    
    # Computed/denormalized fields for queries
    table_count: int = Field(default=0)
    active_reservation_count: int = Field(default=0)
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "The Golden Fork",
                "slug": "the-golden-fork",
                "description": "Fine dining with a modern twist",
                "cuisine_type": "Modern European",
                "address": "123 Main Street",
                "city": "San Francisco",
                "neighborhood": "SoMa",
                "latitude": 37.7749,
                "longitude": -122.4194,
                "price_tier": "$$$",
                "average_spend_per_person": 85.0,
                "rating": 4.7,
                "review_count": 234,
                "opening_time": "17:00",
                "closing_time": "23:00",
                "is_active": True
            }
        }


# Firestore collection name
RESTAURANTS_COLLECTION = "restaurants"

# Indexes needed (for documentation - Firestore creates single-field indexes automatically)
# Composite indexes needed:
# - city + is_active
# - cuisine_type + is_active
# - rating + is_active (descending)
# - slug (unique)
