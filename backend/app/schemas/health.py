"""Health check response schemas."""
from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class ComponentStatus(BaseModel):
    status: str = Field(..., description="Component state: healthy, degraded, connected, disconnected")
    latency_ms: Optional[float] = Field(None, description="Response latency in milliseconds")
    details: Optional[Dict[str, Any]] = None


class HealthResponse(BaseModel):
    status: str = Field("healthy", description="Overall application status")
    version: str = Field(..., description="Application version")
    project_name: str = Field(..., description="Project name")
    environment: str = Field(..., description="Current running environment")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    components: Dict[str, ComponentStatus] = Field(default_factory=dict)
