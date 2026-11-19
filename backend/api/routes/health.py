"""Health Check and Diagnostics API."""
from fastapi import APIRouter
from datetime import datetime, timezone
import sys
import platform
from backend.config import settings

router = APIRouter(prefix="/health", tags=["Health & Diagnostics"])

START_TIME = datetime.now(timezone.utc)


@router.get("")
def get_health_status():
    """
    Health check endpoint returning system status, uptime,
    active configuration, and environment details.
    """
    now = datetime.now(timezone.utc)
    uptime_seconds = (now - START_TIME).total_seconds()

    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "timestamp": now.isoformat(),
        "uptime_seconds": round(uptime_seconds, 2),
        "environment": {
            "python_version": sys.version.split()[0],
            "platform": platform.platform(),
            "debug_mode": settings.debug
        },
        "modules": {
            "graph_routing": "ACTIVE",
            "rook_polynomial": "ACTIVE",
            "generating_functions": "ACTIVE",
            "deadlock_detection": "ACTIVE",
            "mathematical_optimization": "ACTIVE",
            "simulation_engine": "ACTIVE"
        }
    }
