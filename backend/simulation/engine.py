"""
Discrete-time simulation engine orchestrating 8 AGVs in an 8x8 warehouse grid.
Features BFS route planning, basic collision prevention, dynamic obstacle management,
and real-time telemetry streaming.
"""

from typing import Dict, List, Tuple, Optional, Set
from backend.config import settings
from backend.simulation.warehouse import WarehouseState
from backend.simulation.robot import AGVRobot, MovementStatus, PayloadStatus
from backend.simulation.traffic import TrafficCoordinator


# Visual identities (8 distinct colors for 8 robots)
ROBOT_PALETTE = [
    "#06B6D4", # AGV-01: Cyan
    "#3B82F6", # AGV-02: Blue
    "#10B981", # AGV-03: Emerald
    "#F59E0B", # AGV-04: Amber
    "#EC4899", # AGV-05: Pink
    "#8B5CF6", # AGV-06: Purple
    "#14B8A6", # AGV-07: Teal
    "#F97316", # AGV-08: Orange
]


class SimulationEngine:
    """Coordinates discrete-time execution loop for the multi-AGV warehouse digital twin."""

    def __init__(self):
        self.warehouse = WarehouseState()
        self.step_count = 0
        self.is_running = False
        self.speed_ms = settings.simulation.tick_interval_ms
        self.robots: Dict[str, AGVRobot] = {}
        self.event_log: List[Dict[str, any]] = []
        self._initialize_fleet()

    # Alias for backward compatibility
    @property
    def agvs(self) -> Dict[str, AGVRobot]:
        return self.robots

    def _initialize_fleet(self):
        """Spawns 8 AGVs with unique IDs, distinct colors, and starting missions."""
        self.robots.clear()
        chargers = self.warehouse.charging_stations # 4 stations: [(0,0), (0,7), (7,0), (7,7)]
        storages = self.warehouse.storage_zones    # 6 zones

        # 8 Default spawn locations along outer perimeter / access lanes
        spawn_slots = [
            (0, 1), (0, 6), (7, 1), (7, 6),
            (1, 0), (6, 0), (1, 7), (6, 7)
        ]

        robot_count = min(settings.fleet.robot_count, len(spawn_slots))

        for i in range(robot_count):
            robot_id = f"AGV-{i + 1:02d}"
            start_pos = spawn_slots[i]
            # Assign nearest charging station
            assigned_charger = min(
                chargers,
                key=lambda c: abs(start_pos[0] - c[0]) + abs(start_pos[1] - c[1])
            )
            # Assign initial storage zone target
            initial_target = storages[i % len(storages)]

            robot = AGVRobot(
                id=robot_id,
                position=start_pos,
                destination=initial_target,
                battery=100.0 - (i * 6.0), # Diverse initial state of charge
                payload_status=PayloadStatus.EMPTY if i % 2 == 0 else PayloadStatus.CARRYING_PAYLOAD,
                movement_status=MovementStatus.IDLE,
                assigned_charger=assigned_charger,
                color=ROBOT_PALETTE[i % len(ROBOT_PALETTE)],
                priority=1.0 + (i * 0.1)
            )

            # Plan initial route using BFS
            robot.plan_bfs_route(self.warehouse)
            self.robots[robot_id] = robot

        self._log_event("INITIALIZATION", f"Spawned {len(self.robots)} AGVs on {self.warehouse.width}x{self.warehouse.height} warehouse floor.")

    def step(self) -> Dict[str, any]:
        """Advances the simulation by exactly one discrete clock tick."""
        self.step_count += 1

        # 1. Coordinate moves & resolve collisions
        approved_moves = TrafficCoordinator.resolve_conflicts(self.robots)

        # 2. Execute approved moves and battery dynamics
        for r_id, robot in self.robots.items():
            approved_pos = approved_moves.get(r_id, robot.position)

            # Check if robot is currently at a charging station
            if robot.position in self.warehouse.get_charging_set():
                if robot.battery < 99.0 and (robot.destination == robot.position or robot.movement_status == MovementStatus.CHARGING):
                    robot.recharge(settings.fleet.battery_charge_per_tick)
                    self._log_event("CHARGING", f"{robot.id} recharging at pad {robot.position} ({Math_round(robot.battery)}%).")
                    continue

            # Movement execution
            if approved_pos != robot.position:
                robot.execute_move(approved_pos, movement_cost=self.warehouse.movement_cost)
            else:
                # Robot held position
                if robot.movement_status == MovementStatus.MOVING:
                    robot.movement_status = MovementStatus.WAITING

            # Battery threshold check
            if robot.battery < settings.fleet.low_battery_threshold and robot.destination not in self.warehouse.charging_stations:
                # Low battery! Re-route to assigned charger
                self._log_event("LOW_BATTERY", f"{robot.id} low battery ({Math_round(robot.battery)}%). Re-routing to charger {robot.assigned_charger}.")
                robot.set_destination(robot.assigned_charger, self.warehouse)

            # Check if mission completed; if so, assign new storage target
            if robot.is_completed and robot.movement_status == MovementStatus.COMPLETED:
                self._reassign_mission(robot)

        return self.get_state()

    def _reassign_mission(self, robot: AGVRobot):
        """Reassigns next destination when robot completes current task."""
        if robot.position in self.warehouse.get_charging_set() and robot.battery < 95.0:
            # Remain charging
            robot.movement_status = MovementStatus.CHARGING
            return

        storages = self.warehouse.storage_zones
        # Pick next storage zone cyclically or toggle payload
        current_idx = 0
        if robot.position in storages:
            current_idx = storages.index(robot.position)
        next_target = storages[(current_idx + 1) % len(storages)]

        robot.payload_status = (
            PayloadStatus.CARRYING_PAYLOAD if robot.payload_status == PayloadStatus.EMPTY else PayloadStatus.EMPTY
        )
        robot.set_destination(next_target, self.warehouse)
        self._log_event("MISSION", f"{robot.id} completed mission. Dispatched to storage {next_target}.")

    def set_robot_destination(self, robot_id: str, destination: Tuple[int, int]) -> AGVRobot:
        """User action: Manually changes an AGV's destination with BFS replanning."""
        if robot_id not in self.robots:
            raise KeyError(f"Robot '{robot_id}' does not exist.")

        robot = self.robots[robot_id]
        robot.set_destination(destination, self.warehouse)
        self._log_event("DESTINATION_CHANGE", f"Manual target set for {robot_id} -> {destination}.")
        return robot

    def add_robot(
        self,
        start_pos: Optional[Tuple[int, int]] = None,
        destination: Optional[Tuple[int, int]] = None,
        robot_id: Optional[str] = None
    ) -> AGVRobot:
        """User action: Dynamically adds a new AGV to the warehouse."""
        if len(self.robots) >= 16:
            raise ValueError("Maximum fleet size (16) reached.")

        new_id = robot_id or f"AGV-{len(self.robots) + 1:02d}"
        if new_id in self.robots:
            new_id = f"AGV-{len(self.robots) + 1:02d}-B"

        # Determine start position
        if start_pos is None:
            # Find first available navigable cell not occupied
            occupied = {r.position for r in self.robots.values()}
            found = False
            for y in range(self.warehouse.height):
                for x in range(self.warehouse.width):
                    if self.warehouse.is_valid_cell(x, y) and (x, y) not in occupied:
                        start_pos = (x, y)
                        found = True
                        break
                if found:
                    break
            if not found:
                raise ValueError("No free grid cells available to spawn robot.")

        if not self.warehouse.is_valid_cell(start_pos[0], start_pos[1]):
            raise ValueError(f"Spawn cell {start_pos} is invalid or blocked by obstacle.")

        # Determine destination
        if destination is None:
            destination = self.warehouse.storage_zones[0]

        assigned_charger = self.warehouse.charging_stations[0]
        color = ROBOT_PALETTE[len(self.robots) % len(ROBOT_PALETTE)]

        robot = AGVRobot(
            id=new_id,
            position=start_pos,
            destination=destination,
            battery=100.0,
            payload_status=PayloadStatus.EMPTY,
            movement_status=MovementStatus.IDLE,
            assigned_charger=assigned_charger,
            color=color,
            priority=1.0
        )
        robot.plan_bfs_route(self.warehouse)
        self.robots[new_id] = robot
        self._log_event("ROBOT_ADDED", f"Spawned {new_id} at {start_pos}.")
        return robot

    def remove_robot(self, robot_id: str) -> bool:
        """User action: Removes an AGV from active fleet."""
        if robot_id in self.robots:
            del self.robots[robot_id]
            self._log_event("ROBOT_REMOVED", f"Removed {robot_id} from warehouse floor.")
            return True
        return False

    def toggle_obstacle(self, x: int, y: int) -> bool:
        """User action: Adds or removes obstacle at (x, y) and triggers fleet BFS replanning."""
        occupied = {r.position for r in self.robots.values()}
        if (x, y) in occupied:
            raise ValueError(f"Cannot place obstacle at ({x}, {y}) while occupied by a robot.")

        new_state = self.warehouse.toggle_obstacle(x, y)
        action_name = "Added" if new_state else "Removed"
        self._log_event("OBSTACLE_CHANGE", f"{action_name} obstacle at ({x}, {y}). Replanning active fleet routes.")

        # Re-plan paths for all active robots so they avoid the newly placed/removed obstacle
        for robot in self.robots.values():
            if robot.destination:
                robot.plan_bfs_route(self.warehouse)

        return new_state

    def start(self):
        """Starts continuous simulation."""
        self.is_running = True
        self._log_event("SIMULATION_CONTROL", "Simulation resumed/started.")

    def pause(self):
        """Pauses continuous simulation."""
        self.is_running = False
        self._log_event("SIMULATION_CONTROL", "Simulation paused.")

    def trigger_intentional_deadlock_scenario(self) -> Dict[str, any]:
        """
        Part A: Demonstrates an intentional 4-agent circular wait deadlock.
        Positions 4 AGVs in a closed cycle where each AGV contends for the cell held by the next:
        AGV-01 (3,3) -> wants (3,4) held by AGV-02
        AGV-02 (3,4) -> wants (4,4) held by AGV-03
        AGV-03 (4,4) -> wants (4,3) held by AGV-04
        AGV-04 (4,3) -> wants (3,3) held by AGV-01
        """
        self.pause()
        cycle_positions = [
            ("AGV-01", (3, 3), (3, 4)),
            ("AGV-02", (3, 4), (4, 4)),
            ("AGV-03", (4, 4), (4, 3)),
            ("AGV-04", (4, 3), (3, 3)),
        ]

        # Ensure cycle positions are clear of structural obstacles
        for _, pos, _ in cycle_positions:
            if pos in set(self.warehouse.obstacles):
                self.warehouse.remove_obstacle(*pos)

        for agv_id, pos, next_target in cycle_positions:
            if agv_id in self.robots:
                robot = self.robots[agv_id]
                robot.position = pos
                robot.destination = next_target
                robot.route = [pos, next_target]
                robot.movement_status = MovementStatus.WAITING

        self._log_event("INTENTIONAL_DEADLOCK", "Injected 4-robot circular wait dependency cycle.")
        return self.get_state()

    def recover_from_deadlock(self) -> Dict[str, any]:
        """
        Part C: Executes true physical route replanning to recover from a detected deadlock cycle.
        Selects the yielding agent and reroutes it around the congestion.
        """
        from backend.algorithms.integrated_controller import DeadlockRecoveryEngine
        from backend.algorithms.graph_routing import WarehouseGridGraph

        grid_graph = WarehouseGridGraph(
            width=self.warehouse.width,
            height=self.warehouse.height,
            obstacles=self.warehouse.get_obstacle_set(),
            default_cost=self.warehouse.movement_cost
        )

        current_pos = {r_id: robot.position for r_id, robot in self.robots.items()}
        desired_next = {
            r_id: (robot.route[1] if robot.route and len(robot.route) > 1 else robot.position)
            for r_id, robot in self.robots.items()
        }
        destinations = {r_id: robot.destination for r_id, robot in self.robots.items()}
        priorities = {r_id: robot.priority for r_id, robot in self.robots.items()}
        trajectories = {r_id: (robot.route if robot.route else [robot.position]) for r_id, robot in self.robots.items()}

        resolution = DeadlockRecoveryEngine.identify_and_resolve_deadlock(
            grid_graph=grid_graph,
            current_positions=current_pos,
            desired_next_cells=desired_next,
            trajectories=trajectories,
            destinations=destinations,
            priorities=priorities
        )

        if resolution["deadlock_detected"] and resolution["recovery_action"] and resolution["recovery_action"]["success"]:
            action = resolution["recovery_action"]
            yield_id = action["yield_robot"]
            new_route = action["replanned_route"]

            if yield_id in self.robots and new_route:
                robot = self.robots[yield_id]
                robot.route = new_route
                robot.movement_status = MovementStatus.MOVING
                self._log_event("DEADLOCK_RECOVERY", f"Successfully replanned route for {yield_id} to resolve cycle.")

        return {
            "resolution": resolution,
            "recovered": resolution.get("resolved", False),
            "state": self.get_state()
        }

    def reset(self):
        """Resets the simulation to initial warehouse configuration."""
        self.step_count = 0
        self.is_running = False
        self.robots.clear()
        self.event_log.clear()
        self._initialize_fleet()
        self._log_event("RESET", "Simulation state reset to origin.")

    def _log_event(self, event_type: str, message: str):
        self.event_log.append({
            "step": self.step_count,
            "type": event_type,
            "message": message
        })
        if len(self.event_log) > 100:
            self.event_log.pop(0)

    def get_state(self) -> Dict[str, any]:
        """Produces a JSON-serializable snapshot of the warehouse digital twin."""
        robots_dict = {r_id: robot.model_dump() for r_id, robot in self.robots.items()}
        avg_battery = (
            sum(r.battery for r in self.robots.values()) / max(1, len(self.robots))
            if self.robots else 0.0
        )
        total_dist = sum(r.total_distance_traveled for r in self.robots.values())

        return {
            "step": self.step_count,
            "is_running": self.is_running,
            "speed_ms": self.speed_ms,
            "warehouse": self.warehouse.model_dump(),
            "robots": robots_dict,
            "agvs": robots_dict, # Alias for backward compatibility
            "fleet_metrics": {
                "active_count": len(self.robots),
                "avg_battery": round(avg_battery, 1),
                "total_distance": total_dist,
                "status_breakdown": {
                    status.value: sum(1 for r in self.robots.values() if r.movement_status == status)
                    for status in MovementStatus
                }
            },
            "recent_events": self.event_log[-15:]
        }


def Math_round(val: float) -> int:
    return int(round(val))


# Global singleton instance for the API server session
simulation_engine = SimulationEngine()
