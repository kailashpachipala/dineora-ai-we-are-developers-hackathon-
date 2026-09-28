"""Table/Resource domain model for Firestore."""
from datetime import datetime
from typing import Optional, List
from pydantic import Field
from app.db.base import FirestoreBaseModel


class Table(FirestoreBaseModel):
    """Table model for Firestore."""
    restaurant_id: str = Field(..., description="Reference to restaurant document ID")
    table_number: str = Field(..., max_length=50)
    min_capacity: int = Field(default=2, ge=1)
    max_capacity: int = Field(default=4, ge=1)
    seating_area: str = Field(
        default="indoor",
        max_length=50,
        description="indoor, outdoor, patio, counter, bar, private_booth"
    )
    is_active: bool = Field(default=True)
    
    # Denormalized restaurant info for queries
    restaurant_name: Optional[str] = None
    restaurant_slug: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "restaurant_id": "rest_abc123",
                "table_number": "T1",
                "min_capacity": 2,
                "max_capacity": 4,
                "seating_area": "indoor",
                "is_active": True
            }
        }


# Firestore collection name
TABLES_COLLECTION = "tables"

# Indexes needed:
# - restaurant_id + is_active
# - restaurant_id + table_number (unique per restaurant)
