"""Base model and utilities for Firestore documents."""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from uuid import uuid4


class TimestampMixin:
    """Mixin providing created_at and updated_at timestamps."""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    def update_timestamp(self):
        """Update the updated_at timestamp to now."""
        self.updated_at = datetime.utcnow()


class FirestoreBaseModel(BaseModel, TimestampMixin):
    """Base model for all Firestore documents."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary for Firestore storage."""
        data = self.model_dump(by_alias=True)
        # Convert datetime objects to ISO format strings for Firestore
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any], doc_id: Optional[str] = None) -> "FirestoreBaseModel":
        """Create model instance from Firestore document data."""
        if doc_id:
            data["id"] = doc_id
        # Convert ISO format strings back to datetime objects
        for key, value in data.items():
            if isinstance(value, str) and key.endswith("_at"):
                try:
                    data[key] = datetime.fromisoformat(value)
                except ValueError:
                    pass
        return cls(**data)
