"""Restaurant intelligence and analytics model for Firestore."""
from datetime import date, datetime
from typing import Optional, Dict, Any
from pydantic import Field
from app.db.base import FirestoreBaseModel


class RestaurantInsight(FirestoreBaseModel):
    """Restaurant insight model for Firestore."""
    restaurant_id: str = Field(..., description="Reference to restaurant document ID")
    metric_date: str = Field(..., description="ISO format date string (YYYY-MM-DD)")

    # Aggregated metrics for restaurant intelligence
    total_searches: int = Field(default=0, ge=0)
    total_bookings: int = Field(default=0, ge=0)
    total_cancellations: int = Field(default=0, ge=0)
    average_party_size: float = Field(default=2.0, ge=0)
    occupancy_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # JSON breakdown of popular slots and dining patterns
    slot_distribution: Optional[Dict[str, Any]] = None
    
    # Denormalized fields for queries
    restaurant_name: Optional[str] = None
    restaurant_slug: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "restaurant_id": "rest_abc123",
                "metric_date": "2026-10-15",
                "total_searches": 150,
                "total_bookings": 45,
                "total_cancellations": 3,
                "average_party_size": 3.2,
                "occupancy_rate": 0.78,
                "slot_distribution": {
                    "18:00": 12,
                    "19:00": 18,
                    "20:00": 15
                }
            }
        }


# Firestore collection name
INSIGHTS_COLLECTION = "restaurant_insights"

# Indexes needed:
# - restaurant_id + metric_date (unique composite)
# - metric_date + total_bookings (descending)
