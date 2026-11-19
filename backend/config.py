"""
Central Configuration Module for AGV Intelligence.

Manages 8x8 warehouse grid topology, 8 AGV fleet properties, charging stations,
storage zones, and discrete-event simulation parameters.
"""

from typing import List, Tuple, Union
from pydantic import BaseModel, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class WarehouseConfig(BaseModel):
    """Warehouse grid topology and operational zone coordinates."""
    grid_width: int = Field(default=8, ge=4, description="Width of grid in discrete cells (X-axis)")
    grid_height: int = Field(default=8, ge=4, description="Height of grid in discrete cells (Y-axis)")
    cell_size_meters: float = Field(default=1.5, gt=0, description="Physical dimensions of each square cell in meters")
    movement_cost: float = Field(default=1.0, gt=0, description="Configurable movement cost between adjacent cells")
    
    # 4 Charging stations placed strategically (e.g. outer perimeter pads)
    charging_stations: List[Tuple[int, int]] = Field(
        default=[(0, 0), (0, 7), (7, 0), (7, 7)],
        description="Coordinates of the 4 inductive charging pads"
    )

    # 6 Storage zones
    storage_zones: List[Tuple[int, int]] = Field(
        default=[(2, 2), (2, 3), (2, 5), (5, 2), (5, 4), (5, 5)],
        description="Coordinates of the 6 storage rack delivery/retrieval bays"
    )

    # Legacy alias support for pickup/dropoff zones
    pickup_zones: List[Tuple[int, int]] = Field(
        default=[(2, 2), (2, 3), (2, 5)],
        description="Pickup zones"
    )
    dropoff_zones: List[Tuple[int, int]] = Field(
        default=[(5, 2), (5, 4), (5, 5)],
        description="Dropoff delivery docks"
    )

    # Configurable obstacles (storage racks / structural barriers)
    obstacle_cells: List[Tuple[int, int]] = Field(
        default=[(3, 2), (3, 3), (3, 5), (4, 2), (4, 4), (4, 5)],
        description="Blocked grid locations (inaccessible cells)"
    )


class FleetConfig(BaseModel):
    """AGV Fleet technical specifications and power thresholds."""
    robot_count: int = Field(default=8, ge=1, le=16, description="Total active AGVs deployed (8 robots)")
    nominal_speed_mps: float = Field(default=1.0, gt=0, description="Nominal travel velocity in m/s")
    max_battery_capacity_kwh: float = Field(default=10.0, gt=0, description="AGV battery storage capacity")
    low_battery_threshold: float = Field(default=25.0, ge=5.0, le=50.0, description="Battery percentage triggering charge rerouting")
    critical_battery_threshold: float = Field(default=10.0, ge=1.0, le=20.0, description="Emergency stop threshold percentage")
    battery_drain_per_move: float = Field(default=0.5, description="Battery percentage consumed per single cell transition")
    battery_charge_per_tick: float = Field(default=4.0, description="Battery percentage recovered per charging tick")


class SimulationConfig(BaseModel):
    """Temporal and execution parameters for the discrete-time simulation."""
    tick_interval_ms: int = Field(default=800, ge=100, le=5000, description="Time step duration in milliseconds")
    max_simulation_steps: int = Field(default=1000, ge=10, description="Safety cutoff for simulation execution")
    allow_diagonal_moves: bool = Field(default=False, description="4-directional movement only")
    deadlock_detection_interval: int = Field(default=1, ge=1, description="Interval in ticks between cycle detection scans")


class Settings(BaseSettings):
    """Global Application Settings."""
    app_name: str = "AGV Intelligence Platform"
    app_version: str = "2.0.0"
    api_prefix: str = "/api"
    debug: bool = True
    cors_origins: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """Supports comma-separated string or JSON array from environment variables."""
        if isinstance(v, str):
            v_stripped = v.strip()
            if v_stripped.startswith("[") and v_stripped.endswith("]"):
                import json
                try:
                    return json.loads(v_stripped)
                except Exception:
                    pass
            return [origin.strip() for origin in v_stripped.split(",") if origin.strip()]
        return v
    
    # Sub-configurations
    warehouse: WarehouseConfig = WarehouseConfig()
    fleet: FleetConfig = FleetConfig()
    simulation: SimulationConfig = SimulationConfig()

    model_config = SettingsConfigDict(
        env_prefix="AGV_",
        env_nested_delimiter="__",
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False
    )


# Singleton instance
settings = Settings()
