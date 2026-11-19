"""
Main Application Entrypoint for AGV Intelligence Platform.

Discrete Mathematics & Graph Theory Experiential Learning System.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.config import settings
from backend.api.routes import health, warehouse, simulation, algorithms, experiments

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Mathematical Modelling and Optimization of AGV Traffic Routing & Smart Charging",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for React frontend communication
is_wildcard_cors = "*" in settings.cors_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=not is_wildcard_cors,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler for clean error reporting
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "message": str(exc),
            "path": request.url.path,
        }
    )

# Include API Routers under standard prefix
app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(warehouse.router, prefix=settings.api_prefix)
app.include_router(simulation.router, prefix=settings.api_prefix)
app.include_router(algorithms.router, prefix=settings.api_prefix)
app.include_router(experiments.router, prefix=settings.api_prefix)


@app.get("/")
def root():
    """Root endpoint summarizing the AGV Intelligence platform."""
    return {
        "title": settings.app_name,
        "version": settings.app_version,
        "description": "Discrete Mathematics & Graph Theory AGV Routing & Smart Charging System",
        "documentation": "/docs",
        "health_check": f"{settings.api_prefix}/health",
        "routes": {
            "warehouse": f"{settings.api_prefix}/warehouse",
            "simulation": f"{settings.api_prefix}/simulation",
            "algorithms": f"{settings.api_prefix}/algorithms",
            "experiments": f"{settings.api_prefix}/experiments"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
