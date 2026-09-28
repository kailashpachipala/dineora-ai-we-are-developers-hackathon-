"""Feedback and dining review model for Firestore."""
from datetime import datetime
from typing import Optional
from pydantic import Field
from app.db.base import FirestoreBaseModel


class Feedback(FirestoreBaseModel):
    """Feedback model for Firestore."""
    reservation_id: str = Field(..., description="Reference to reservation document ID")
    restaurant_id: str = Field(..., description="Reference to restaurant document ID")
    user_id: str = Field(..., description="Reference to user document ID")

    rating: float = Field(..., ge=1.0, le=5.0)
    comments: Optional[str] = None
    food_rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    service_rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    ambiance_rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    
    # Denormalized fields for queries
    restaurant_name: Optional[str] = None
    restaurant_slug: Optional[str] = None
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "reservation_id": "res_abc123",
                "restaurant_id": "rest_abc123",
                "user_id": "user_xyz789",
                "rating": 4.5,
                "comments": "Excellent food and service!",
                "food_rating": 5.0,
                "service_rating": 4.0,
                "ambiance_rating": 4.5
            }
        }


# Firestore collection name
FEEDBACKS_COLLECTION = "feedbacks"

# Indexes needed:
# - reservation_id (unique)
# - restaurant_id + rating
# - user_id + created_at (descending)
