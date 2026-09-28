"""User domain model for Firestore."""
from datetime import datetime
from typing import Optional, List
from pydantic import Field, EmailStr
from app.db.base import FirestoreBaseModel


class User(FirestoreBaseModel):
    """User model for Firestore."""
    email: EmailStr = Field(..., max_length=255)
    full_name: str = Field(..., max_length=255)
    phone_number: Optional[str] = Field(None, max_length=32)
    is_active: bool = Field(default=True)
    
    # Denormalized counts for queries
    reservation_count: int = Field(default=0)
    waitlist_count: int = Field(default=0)
    feedback_count: int = Field(default=0)
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "john.doe@example.com",
                "full_name": "John Doe",
                "phone_number": "+1-555-0123",
                "is_active": True
            }
        }


# Firestore collection name
USERS_COLLECTION = "users"

# Indexes needed:
# - email (unique)
# - is_active
