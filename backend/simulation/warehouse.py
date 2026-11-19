"""
Warehouse digital twin state, grid topology, storage locations, and obstacle management.
"""

from typing import List, Tuple, Set, Optional, Dict
from pydantic import BaseModel, Field
from backend.config import settings


class WarehouseState(BaseModel):
    """
    Representation of the physical warehouse floor.
    Grid size: 8x8.
    Features: 4 Charging Stations, 6 Storage Zones, Configurable Obstacles, Configurable Movement Cost.
    """
    width: int = Field(default_factory=lambda: settings.warehouse.grid_width)
    height: int = Field(default_factory=lambda: settings.warehouse.grid_height)
    cell_size: float = Field(default_factory=lambda: settings.warehouse.cell_size_meters)
    movement_cost: float = Field(default_factory=lambda: settings.warehouse.movement_cost)

    # 4 Charging stations
    charging_stations: List[Tuple[int, int]] = Field(default_factory=lambda: list(settings.warehouse.charging_stations))

    # 6 Storage zones
    storage_zones: List[Tuple[int, int]] = Field(default_factory=lambda: list(settings.warehouse.storage_zones))

    # Backward compatibility aliases for pickup/dropoff
    pickup_zones: List[Tuple[int, int]] = Field(default_factory=lambda: list(settings.warehouse.pickup_zones))
    dropoff_zones: List[Tuple[int, int]] = Field(default_factory=lambda: list(settings.warehouse.dropoff_zones))

    # Configurable obstacles
    obstacles: List[Tuple[int, int]] = Field(default_factory=lambda: list(settings.warehouse.obstacle_cells))

    def is_in_bounds(self, x: int, y: int) -> bool:
        """Checks if (x, y) coordinates lie within the 8x8 grid boundary."""
        return 0 <= x < self.width and 0 <= y < self.height

    def is_obstacle(self, x: int, y: int) -> bool:
        """Checks if cell contains a stationary obstacle."""
        return (x, y) in set(self.obstacles)

    def is_valid_cell(self, x: int, y: int) -> bool:
        """Checks if candidate cell is navigable (in bounds and obstacle-free)."""
        return self.is_in_bounds(x, y) and not self.is_obstacle(x, y)

    def get_obstacle_set(self) -> Set[Tuple[int, int]]:
        return set(self.obstacles)

    def get_charging_set(self) -> Set[Tuple[int, int]]:
        return set(self.charging_stations)

    def get_storage_set(self) -> Set[Tuple[int, int]]:
        return set(self.storage_zones)

    def add_obstacle(self, x: int, y: int) -> bool:
        """Adds an obstacle at (x, y). Rejects out-of-bounds or charging stations."""
        if not self.is_in_bounds(x, y):
            raise ValueError(f"Cell ({x}, {y}) is outside warehouse bounds.")
        if (x, y) in self.get_charging_set():
            raise ValueError(f"Cannot place obstacle on charging station ({x}, {y}).")
        if (x, y) not in set(self.obstacles):
            self.obstacles.append((x, y))
            return True
        return False

    def remove_obstacle(self, x: int, y: int) -> bool:
        """Removes an obstacle at (x, y)."""
        if (x, y) in set(self.obstacles):
            self.obstacles.remove((x, y))
            return True
        return False

    def toggle_obstacle(self, x: int, y: int) -> bool:
        """Toggles obstacle presence at (x, y). Returns new state (True if added, False if removed)."""
        if (x, y) in set(self.obstacles):
            self.remove_obstacle(x, y)
            return False
        else:
            self.add_obstacle(x, y)
            return True

    def get_4_neighbors(self, x: int, y: int) -> List[Tuple[int, int]]:
        """Returns adjacent 4-directional orthogonal neighbors (Up, Down, Left, Right)."""
        directions = [(0, 1), (0, -1), (-1, 0), (1, 0)]
        neighbors = []
        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if self.is_valid_cell(nx, ny):
                neighbors.append((nx, ny))
        return neighbors

    def set_movement_cost(self, cost: float):
        if cost <= 0:
            raise ValueError("Movement cost must be positive.")
        self.movement_cost = cost
