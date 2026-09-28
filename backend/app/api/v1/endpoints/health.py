"""Health check API endpoint."""
from datetime import datetime
from fastapi import APIRouter, status
from app.core.config import settings
from app.db.session import check_db_health
from app.schemas.health import HealthResponse, ComponentStatus

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="System and Component Health Check",
    description="Returns the operational status of the API server, database layer, and core services.",
)
async def get_health_status() -> HealthResponse:
    # Query database connectivity
    db_health = await check_db_health()

    components = {
        "api": ComponentStatus(
            status="healthy",
            latency_ms=0.1,
            details={"service": settings.PROJECT_NAME, "framework": "FastAPI"},
        ),
        "database": ComponentStatus(
            status=db_health.get("status", "unknown"),
            latency_ms=db_health.get("latency_ms"),
            details={
                "engine": db_health.get("engine", "firestore"),
                "database": db_health.get("database"),
                "error": db_health.get("error"),
            },
        ),
        "redis_cache": ComponentStatus(
            status="configured",
            details={"host": settings.REDIS_HOST, "port": settings.REDIS_PORT},
        ),
        "ai_engine": ComponentStatus(
            status="configured" if settings.GEMINI_API_KEY else "standby",
            details={"model": "gemini-3.8-flash", "provider": "Google GenAI"},
        ),
    }

    # If DB is disconnected, overall status is degraded but API remains reachable
    overall_status = "healthy" if db_health.get("status") == "connected" else "degraded"

    return HealthResponse(
        status=overall_status,
        version=settings.VERSION,
        project_name=settings.PROJECT_NAME,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.utcnow(),
        components=components,
    )
