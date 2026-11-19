"""Simulation Loop, Multi-Agent Fleet Control, and Robot Navigation API."""
from typing import Tuple, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.simulation.engine import simulation_engine

router = APIRouter(prefix="/simulation", tags=["Simulation Execution"])


class DestinationRequest(BaseModel):
    x: int = Field(..., ge=0, description="Destination X coordinate")
    y: int = Field(..., ge=0, description="Destination Y coordinate")


class AddRobotRequest(BaseModel):
    id: Optional[str] = Field(None, description="Optional custom robot ID")
    start_x: Optional[int] = Field(None, ge=0, description="Spawn X coordinate")
    start_y: Optional[int] = Field(None, ge=0, description="Spawn Y coordinate")
    dest_x: Optional[int] = Field(None, ge=0, description="Destination X coordinate")
    dest_y: Optional[int] = Field(None, ge=0, description="Destination Y coordinate")


class SpeedRequest(BaseModel):
    speed_ms: int = Field(..., ge=100, le=5000, description="Tick interval duration in ms")


@router.get("/state")
def get_simulation_state():
    """Returns the current state snapshot of the warehouse digital twin and 8 AGV robots."""
    return simulation_engine.get_state()


@router.post("/start")
@router.post("/resume")
def start_simulation():
    """Starts / Resumes continuous simulation clock."""
    simulation_engine.start()
    return {"message": "Simulation started/resumed", "is_running": True}


@router.post("/pause")
def pause_simulation():
    """Pauses continuous simulation clock."""
    simulation_engine.pause()
    return {"message": "Simulation paused", "is_running": False}


@router.post("/step")
def step_simulation():
    """Advances the simulation by exactly one discrete clock tick."""
    return simulation_engine.step()


@router.post("/reset")
def reset_simulation():
    """Resets the simulation to the initial 8 AGV warehouse state."""
    simulation_engine.reset()
    return {
        "message": "Simulation reset successfully",
        "state": simulation_engine.get_state()
    }


@router.post("/speed")
def change_speed(req: SpeedRequest):
    """Adjusts the simulation tick interval speed in milliseconds."""
    simulation_engine.speed_ms = req.speed_ms
    return {"message": f"Simulation speed set to {req.speed_ms}ms", "speed_ms": req.speed_ms}


@router.post("/robot/{robot_id}/destination")
def update_robot_destination(robot_id: str, req: DestinationRequest):
    """
    Changes destination for a specified robot.
    Validates destination against warehouse boundaries and obstacles.
    Dynamically recalculates shortest BFS path.
    """
    try:
        robot = simulation_engine.set_robot_destination(robot_id, (req.x, req.y))
        return {
            "message": f"Updated destination for {robot_id} to ({req.x}, {req.y})",
            "robot": robot.model_dump(),
            "route": robot.route,
            "state": simulation_engine.get_state()
        }
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/robot/add")
def add_robot(req: AddRobotRequest):
    """Spawns an additional AGV robot on the warehouse floor."""
    try:
        start_pos = (req.start_x, req.start_y) if req.start_x is not None and req.start_y is not None else None
        dest_pos = (req.dest_x, req.dest_y) if req.dest_x is not None and req.dest_y is not None else None
        robot = simulation_engine.add_robot(start_pos=start_pos, destination=dest_pos, robot_id=req.id)
        return {
            "message": f"Successfully spawned robot {robot.id}",
            "robot": robot.model_dump(),
            "state": simulation_engine.get_state()
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/robot/{robot_id}")
def remove_robot(robot_id: str):
    """Removes a robot from the active fleet."""
    success = simulation_engine.remove_robot(robot_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Robot '{robot_id}' not found.")
    return {
        "message": f"Removed robot {robot_id}",
        "state": simulation_engine.get_state()
    }


@router.post("/deadlock/intentional")
def inject_intentional_deadlock():
    """
    Part A: Sets up an intentional 4-agent circular wait deadlock scenario
    for live demonstration and verification.
    """
    state = simulation_engine.trigger_intentional_deadlock_scenario()
    return {
        "message": "Intentional 4-robot deadlock scenario configured.",
        "deadlock_detected": state.get("deadlock_detected", True),
        "state": state
    }


@router.post("/deadlock/recover")
def recover_deadlock():
    """
    Part C: Executes true physical route replanning to break detected deadlock cycles.
    """
    result = simulation_engine.recover_from_deadlock()
    return result
