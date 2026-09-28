"""Structured reservation intent schemas for LLM extraction and validation."""
from datetime import date, time
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


class StructuredReservationIntent(BaseModel):
    """Structured reservation requirements extracted from natural language."""
    party_size: Optional[int] = Field(None, ge=1, le=30, description="Number of guests in the dining party")
    target_date: Optional[date] = Field(None, description="Requested reservation calendar date (YYYY-MM-DD)")
    preferred_time: Optional[time] = Field(None, description="Preferred dining time (HH:MM)")
    time_window_minutes: int = Field(60, ge=15, le=180, description="Acceptable time window around preferred time")
    occasion: Optional[str] = Field(None, description="Dining occasion, e.g., Birthday, Anniversary, Business, Date Night")
    seating_preference: Optional[str] = Field("any", description="Seating area preference: indoor, outdoor, patio, counter, bar, quiet, window, any")
    location: Optional[str] = Field(None, description="Preferred city, neighborhood, or area")
    max_budget_per_person: Optional[float] = Field(None, ge=5.0, description="Budget target per person in local currency")
    restaurant_preference: Optional[str] = Field(None, description="Optional specific restaurant name or cuisine type")
    special_notes: Optional[str] = Field(None, description="Dietary restrictions or special accommodations")


class IntentValidationResult(BaseModel):
    """Result of schema and business validation for extracted intent."""
    is_valid: bool
    missing_fields: List[str] = Field(default_factory=list)
    validation_warnings: List[str] = Field(default_factory=list)
    confidence_score: float = Field(1.0, ge=0.0, le=1.0)
    sanitized_intent: Optional[StructuredReservationIntent] = None
