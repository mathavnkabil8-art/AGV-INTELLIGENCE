"""Warehouse Digital Twin API."""
from typing import Tuple, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.simulation.engine import simulation_engine
from backend.config import settings

router = APIRouter(prefix="/warehouse", tags=["Warehouse Digital Twin"])


class ObstacleRequest(BaseModel):
    x: int = Field(..., ge=0, description="Grid X coordinate")
    y: int = Field(..., ge=0, description="Grid Y coordinate")


class WarehouseConfigRequest(BaseModel):
    movement_cost: Optional[float] = Field(None, gt=0, description="Movement cost per cell")


@router.get("/layout")
@router.get("/state")
def get_warehouse_layout():
    """Returns 8x8 grid dimensions, storage zones, charging pads, and obstacles."""
    return simulation_engine.warehouse.model_dump()


@router.get("/config")
def get_warehouse_config():
    """Returns central configuration parameters for the warehouse and fleet."""
    return {
        "warehouse": settings.warehouse.model_dump(),
        "fleet": settings.fleet.model_dump(),
        "simulation": settings.simulation.model_dump()
    }


@router.post("/config")
def update_warehouse_config(req: WarehouseConfigRequest):
    """Updates dynamic warehouse configuration like movement cost."""
    if req.movement_cost is not None:
        simulation_engine.warehouse.set_movement_cost(req.movement_cost)
    return {
        "message": "Warehouse configuration updated successfully",
        "warehouse": simulation_engine.warehouse.model_dump()
    }


@router.post("/obstacle/toggle")
def toggle_obstacle(req: ObstacleRequest):
    """Toggles obstacle presence at (x, y) and replans fleet BFS routes."""
    try:
        is_added = simulation_engine.toggle_obstacle(req.x, req.y)
        return {
            "x": req.x,
            "y": req.y,
            "is_obstacle": is_added,
            "message": "Obstacle added" if is_added else "Obstacle removed",
            "state": simulation_engine.get_state()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/obstacle/add")
def add_obstacle(req: ObstacleRequest):
    """Adds an obstacle at (x, y)."""
    try:
        if (req.x, req.y) not in set(simulation_engine.warehouse.obstacles):
            simulation_engine.toggle_obstacle(req.x, req.y)
        return {
            "message": f"Obstacle placed at ({req.x}, {req.y})",
            "state": simulation_engine.get_state()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/obstacle/remove")
def remove_obstacle(req: ObstacleRequest):
    """Removes an obstacle at (x, y)."""
    try:
        if (req.x, req.y) in set(simulation_engine.warehouse.obstacles):
            simulation_engine.toggle_obstacle(req.x, req.y)
        return {
            "message": f"Obstacle removed at ({req.x}, {req.y})",
            "state": simulation_engine.get_state()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
