"""
AGV Robot model, telemetry attributes, and BFS route planning.
"""

from collections import deque
from enum import Enum
from typing import List, Tuple, Optional, Set
from pydantic import BaseModel, Field
from backend.config import settings
from backend.simulation.warehouse import WarehouseState


class PayloadStatus(str, Enum):
    EMPTY = "EMPTY"
    CARRYING_PAYLOAD = "CARRYING_PAYLOAD"
    LOADING = "LOADING"
    UNLOADING = "UNLOADING"


class MovementStatus(str, Enum):
    IDLE = "IDLE"
    MOVING = "MOVING"
    CHARGING = "CHARGING"
    WAITING = "WAITING"
    BLOCKED = "BLOCKED"
    COMPLETED = "COMPLETED"


class AGVRobot(BaseModel):
    """
    Autonomous Guided Vehicle (AGV) Digital Twin model.
    Mandatory attributes:
    - unique ID
    - current position
    - destination
    - battery percentage
    - payload status
    - movement status
    - assigned charging station
    - current route
    - completion status
    """
    id: str
    position: Tuple[int, int]
    destination: Optional[Tuple[int, int]] = None
    battery: float = Field(default=100.0, ge=0.0, le=100.0)
    payload_status: PayloadStatus = PayloadStatus.EMPTY
    movement_status: MovementStatus = MovementStatus.IDLE
    assigned_charger: Tuple[int, int] = (0, 0)
    route: List[Tuple[int, int]] = Field(default_factory=list)
    is_completed: bool = False

    # Operational metrics
    priority: float = Field(default=1.0)
    total_distance_traveled: int = Field(default=0)
    color: str = Field(default="#06B6D4")

    # Backward compatibility properties
    @property
    def battery_level(self) -> float:
        return self.battery

    @battery_level.setter
    def battery_level(self, val: float):
        self.battery = max(0.0, min(100.0, val))

    @property
    def path(self) -> List[Tuple[int, int]]:
        return self.route

    @path.setter
    def path(self, val: List[Tuple[int, int]]):
        self.route = val

    @property
    def status(self) -> MovementStatus:
        return self.movement_status

    @status.setter
    def status(self, val: MovementStatus):
        self.movement_status = val

    @property
    def target_position(self) -> Optional[Tuple[int, int]]:
        return self.destination

    @target_position.setter
    def target_position(self, val: Optional[Tuple[int, int]]):
        self.destination = val

    def plan_bfs_route(
        self,
        warehouse: WarehouseState,
        dynamic_obstacles: Optional[Set[Tuple[int, int]]] = None
    ) -> List[Tuple[int, int]]:
        """
        Plans route using classic 4-directional Breadth-First Search (BFS).
        Guarantees shortest path on an unweighted grid while strictly preventing
        movement through obstacles.
        """
        if self.destination is None or self.destination == self.position:
            self.route = [self.position]
            self.is_completed = True
            return self.route

        start = self.position
        target = self.destination

        if not warehouse.is_valid_cell(target[0], target[1]):
            # Target is an obstacle or out of bounds
            self.route = [start]
            self.movement_status = MovementStatus.BLOCKED
            return self.route

        forbidden = warehouse.get_obstacle_set()
        if dynamic_obstacles:
            # Exclude start and target from dynamic obstacle set if needed
            forbidden = forbidden | (dynamic_obstacles - {start, target})

        queue = deque([start])
        visited = {start: None}

        # 4-Directional movements: Up, Down, Left, Right
        directions = [(0, 1), (0, -1), (-1, 0), (1, 0)]

        reached = False
        while queue:
            current = queue.popleft()
            if current == target:
                reached = True
                break

            for dx, dy in directions:
                nxt = (current[0] + dx, current[1] + dy)
                if (
                    warehouse.is_in_bounds(nxt[0], nxt[1])
                    and nxt not in forbidden
                    and nxt not in visited
                ):
                    visited[nxt] = current
                    queue.append(nxt)

        if not reached:
            # No path exists
            self.route = [start]
            self.movement_status = MovementStatus.BLOCKED
            return self.route

        # Reconstruct path from target back to start
        path = []
        curr = target
        while curr is not None:
            path.append(curr)
            curr = visited[curr]
        path.reverse()

        self.route = path
        self.is_completed = False
        self.movement_status = MovementStatus.MOVING if len(path) > 1 else MovementStatus.IDLE
        return self.route

    def set_destination(self, target: Tuple[int, int], warehouse: WarehouseState):
        """Sets new destination with strict validation."""
        if not warehouse.is_in_bounds(target[0], target[1]):
            raise ValueError(f"Destination {target} is out of warehouse bounds.")
        if warehouse.is_obstacle(target[0], target[1]):
            raise ValueError(f"Destination {target} is an obstacle location.")

        self.destination = target
        self.is_completed = False
        self.plan_bfs_route(warehouse)

    def next_cell(self) -> Tuple[int, int]:
        """Returns the next scheduled waypoint along the planned route."""
        if self.route and len(self.route) > 1:
            return self.route[1]
        return self.position

    def execute_move(self, new_pos: Tuple[int, int], movement_cost: float = 1.0):
        """Advances robot to new position and updates battery and completion status."""
        self.position = new_pos
        if self.route and len(self.route) > 1 and self.route[1] == new_pos:
            self.route.pop(0)

        self.total_distance_traveled += 1
        # Drain battery by movement cost factor
        drain = settings.fleet.battery_drain_per_move * movement_cost
        self.battery = max(0.0, self.battery - drain)

        if self.position == self.destination:
            self.is_completed = True
            self.movement_status = MovementStatus.COMPLETED
        else:
            self.movement_status = MovementStatus.MOVING

    def recharge(self, charge_amount: float = 4.0):
        """Charges battery at inductive charging pad."""
        self.battery = min(100.0, self.battery + charge_amount)
        if self.battery >= 99.0:
            self.movement_status = MovementStatus.IDLE
        else:
            self.movement_status = MovementStatus.CHARGING
