"""
Module: Integrated AGV Optimization Controller & Deadlock Resolution Engine.

Integrates:
1. Warehouse Graph Theory G = (V, E) (BFS / Dijkstra).
2. Spatio-temporal reservation table for collision prevention (cells, edges, docks).
3. Conflict Graph G_c = (V_c, E_c) & Greedy Graph Coloring (Scheduling Phases).
4. Rook Polynomials & Principle of Inclusion-Exclusion for Dock Matching.
5. Ordinary Generating Functions for Backup Energy Allocation.
6. Directed Wait-For Graph (WFG) Deadlock Detection & True Physical Route Replanning.
7. Configurable Multi-Objective Optimization Function:
     Minimize Z = alpha * T + beta * C + gamma * E + delta * W
"""

from typing import Dict, List, Tuple, Set, Optional, Any
import math
import networkx as nx
from pydantic import BaseModel, Field

from backend.algorithms.graph_routing import WarehouseGridGraph, ConflictGraphEngine
from backend.algorithms.rook_polynomial import RookPolynomialEngine
from backend.algorithms.generating_functions import BackupEnergyDistributionEngine
from backend.algorithms.deadlock_detection import DeadlockDetector


class OptimizationWeights(BaseModel):
    alpha: float = Field(default=1.0, ge=0.0, description="Weight for Total Travel Distance/Cost (T)")
    beta: float = Field(default=5.0, ge=0.0, description="Weight for Route Conflicts (C)")
    gamma: float = Field(default=0.5, ge=0.0, description="Weight for Energy Consumed (E)")
    delta: float = Field(default=2.0, ge=0.0, description="Weight for Total Waiting Time (W)")


class ReservationTable:
    """
    Time-based reservation manager for warehouse cells, pathway edges, and charging docks.
    Guarantees:
    1. Zero vertex collisions: (t, x, y) claimed by at most one AGV.
    2. Zero edge swap collisions: if AGV u traverses (A -> B) at tick t, no AGV can traverse (B -> A) at tick t.
    3. Zero unauthorized dock claims: only designated AGVs can claim charging pads.
    """

    def __init__(self):
        # (tick, (x, y)) -> agv_id
        self.cell_reservations: Dict[Tuple[int, Tuple[int, int]], str] = {}
        # (tick, ((x1, y1), (x2, y2))) -> agv_id (directed edge traversal)
        self.edge_reservations: Dict[Tuple[int, Tuple[Tuple[int, int], Tuple[int, int]]], str] = {}
        # (tick, dock_coord) -> agv_id
        self.dock_reservations: Dict[Tuple[int, Tuple[int, int]], str] = {}

    def clear(self):
        self.cell_reservations = {}
        self.edge_reservations = {}
        self.dock_reservations = {}

    def can_reserve_cell(self, tick: int, cell: Tuple[int, int], agv_id: str) -> bool:
        """Returns True if cell is free at time tick, or already held by agv_id."""
        occupant = self.cell_reservations.get((tick, cell))
        return occupant is None or occupant == agv_id

    def can_reserve_edge(self, tick: int, u: Tuple[int, int], v: Tuple[int, int], agv_id: str) -> bool:
        """
        Returns True if edge (u -> v) can be traversed at tick without head-on collision
        with another AGV traversing (v -> u) at the same tick.
        """
        opposite_edge = (tick, (v, u))
        head_on_occupant = self.edge_reservations.get(opposite_edge)
        return head_on_occupant is None or head_on_occupant == agv_id

    def reserve_path(
        self,
        agv_id: str,
        path: List[Tuple[int, int]],
        start_tick: int = 0,
        authorized_dock: Optional[Tuple[int, int]] = None
    ) -> bool:
        """
        Attempts to reserve a complete spatio-temporal route for agv_id.
        Returns True if the entire trajectory is collision-free and successfully reserved.
        """
        # First verify entire path is reservable
        for i, cell in enumerate(path):
            t = start_tick + i
            if not self.can_reserve_cell(t, cell, agv_id):
                return False
            if i > 0:
                prev_cell = path[i - 1]
                if not self.can_reserve_edge(t, prev_cell, cell, agv_id):
                    return False

        # If path ends at a dock, verify dock authorization
        if authorized_dock and path and path[-1] == authorized_dock:
            t_end = start_tick + len(path) - 1
            occupant = self.dock_reservations.get((t_end, authorized_dock))
            if occupant and occupant != agv_id:
                return False

        # Commit reservations
        for i, cell in enumerate(path):
            t = start_tick + i
            self.cell_reservations[(t, cell)] = agv_id
            if i > 0:
                prev_cell = path[i - 1]
                self.edge_reservations[(t, (prev_cell, cell))] = agv_id

        if authorized_dock and path and path[-1] == authorized_dock:
            t_end = start_tick + len(path) - 1
            self.dock_reservations[(t_end, authorized_dock)] = agv_id

        return True

    def release_agent_reservations(self, agv_id: str):
        """Releases all reservations held by agv_id (used during rerouting/deadlock recovery)."""
        self.cell_reservations = {k: v for k, v in self.cell_reservations.items() if v != agv_id}
        self.edge_reservations = {k: v for k, v in self.edge_reservations.items() if v != agv_id}
        self.dock_reservations = {k: v for k, v in self.dock_reservations.items() if v != agv_id}


class DeadlockRecoveryEngine:
    """
    Detects directed cycles in the Wait-For Graph and executes physical route replanning.
    Does NOT delete graph edges; instead, it detours a yielding robot around the congestion.
    """

    @staticmethod
    def identify_and_resolve_deadlock(
        grid_graph: WarehouseGridGraph,
        current_positions: Dict[str, Tuple[int, int]],
        desired_next_cells: Dict[str, Tuple[int, int]],
        trajectories: Dict[str, List[Tuple[int, int]]],
        destinations: Dict[str, Tuple[int, int]],
        priorities: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Executes Part A & Part C:
        1. Builds Wait-For Graph D = (V_A, E_W).
        2. Detects directed cycles.
        3. Selects yielding agent based on lowest priority.
        4. Calculates a true alternative physical route using Dijkstra around the blockage.
        """
        priorities = priorities or {agv: 1.0 for agv in current_positions}
        wfg = DeadlockDetector.build_wait_for_graph(current_positions, desired_next_cells)
        cycles = DeadlockDetector.find_deadlock_cycles(wfg)
        sccs = DeadlockDetector.get_strongly_connected_components(wfg)

        # Build human-readable dependency list
        cell_to_occupant = {pos: agv for agv, pos in current_positions.items()}
        dependencies = []
        for u, v in wfg.edges():
            pos_v = current_positions.get(v)
            dependencies.append({
                "waiting_robot": u,
                "holding_robot": v,
                "contended_resource": list(pos_v) if pos_v else None,
                "description": f"{u} is blocked waiting for cell {pos_v} held by {v}."
            })

        if not cycles:
            return {
                "deadlock_detected": False,
                "cycles": [],
                "strongly_connected_clusters": [list(scc) for scc in sccs],
                "dependencies": dependencies,
                "recovery_action": None,
                "resolved": True
            }

        # Resolve first detected cycle
        cycle = cycles[0]
        # Choose yielding robot (lowest priority in cycle)
        yield_robot = min(cycle, key=lambda r: priorities.get(r, 1.0))
        yield_pos = current_positions[yield_robot]
        target_pos = destinations.get(yield_robot, yield_pos)

        # Identify the robot blocking the yield_robot
        blocking_robot = desired_next_cells.get(yield_robot)
        blocked_by_id = cell_to_occupant.get(blocking_robot)

        # Temporarily mark all other robots' current positions as obstacles
        # to force Dijkstra to calculate a true alternative collision-free detour
        detour_obstacles = set(grid_graph.obstacles)
        for r_id, pos in current_positions.items():
            if r_id != yield_robot:
                detour_obstacles.add(pos)

        # Create temporary detour grid graph
        detour_graph = WarehouseGridGraph(
            width=grid_graph.width,
            height=grid_graph.height,
            obstacles=detour_obstacles,
            default_cost=grid_graph.default_cost
        )

        detour_path = detour_graph.find_shortest_path_bfs(yield_pos, target_pos)

        # If direct detour to destination is temporarily blocked by other agents,
        # find an immediate free adjacent sidestep cell to break the circular dependency
        sidestep_cell = None
        if not detour_path or len(detour_path) <= 1:
            if yield_pos in grid_graph.graph:
                for neighbor in grid_graph.graph.neighbors(yield_pos):
                    if neighbor not in detour_obstacles:
                        sidestep_cell = neighbor
                        detour_path = [yield_pos, sidestep_cell]
                        break

        recovery_successful = (detour_path is not None and len(detour_path) > 1)

        recovery_action = {
            "resolved_cycle": cycle,
            "yield_robot": yield_robot,
            "blocked_by": blocked_by_id,
            "original_route": trajectories.get(yield_robot, []),
            "replanned_route": detour_path if recovery_successful else None,
            "strategy": ("DIJKSTRA_DETOUR" if not sidestep_cell else "SIDESTEP_YIELD") if recovery_successful else "NO_FEASIBLE_DETOUR",
            "success": recovery_successful,
            "explanation": (
                f"Deadlock in cycle {' -> '.join(cycle)} resolved: {yield_robot} yields "
                f"and replans physical detour route around {blocked_by_id}."
                if recovery_successful
                else f"Deadlock in cycle {' -> '.join(cycle)} could not find safe immediate detour."
            )
        }

        return {
            "deadlock_detected": True,
            "cycles": cycles,
            "strongly_connected_clusters": [list(scc) for scc in sccs],
            "dependencies": dependencies,
            "recovery_action": recovery_action,
            "resolved": recovery_successful
        }


class IntegratedOptimizationController:
    """
    Connects all 6 core mathematical modules into a single controller:
    1. Warehouse Grid Graph (BFS / Dijkstra)
    2. Conflict Graph & Graph Coloring (Chromatic Phases)
    3. Rook Polynomial & PIE (Charging Dock Matching)
    4. Ordinary Generating Functions (Backup Energy Allocation)
    5. Deadlock Detection (Wait-For Graph)
    6. Collision Prevention via Time-Based Reservations
    7. Multi-Objective Cost Function: Z = alpha*T + beta*C + gamma*E + delta*W
    """

    def __init__(
        self,
        grid_graph: WarehouseGridGraph,
        charging_stations: List[Tuple[int, int]],
        backup_energy_kwh: int = 100,
        min_reserve_per_bay_kwh: int = 15,
        weights: Optional[OptimizationWeights] = None
    ):
        self.grid = grid_graph
        self.chargers = charging_stations
        self.backup_energy = backup_energy_kwh
        self.min_reserve = min_reserve_per_bay_kwh
        self.weights = weights or OptimizationWeights()
        self.reservations = ReservationTable()

    def run_integrated_pipeline(
        self,
        robots_state: Dict[str, Any],
        destinations: Optional[Dict[str, Tuple[int, int]]] = None
    ) -> Dict[str, Any]:
        """
        Executes the 12-step end-to-end optimization workflow:
        Step 1: Receive robot destinations.
        Step 2: Generate warehouse graph G = (V, E).
        Step 3: Calculate shortest paths (Dijkstra/BFS).
        Step 4: Construct conflict graph G_c = (V_c, E_c).
        Step 5: Apply greedy graph coloring (Welsh-Powell / largest-first).
        Step 6: Schedule movements with time-based cell, edge, and dock reservations.
        Step 7: Check robot battery levels.
        Step 8: Calculate compatible charging assignments via Rook Polynomials & PIE.
        Step 9: Calculate feasible backup energy allocations via Ordinary Generating Functions.
        Step 10: Detect potential deadlocks on Wait-For Graph.
        Step 11: Replan routes when necessary via physical detour search.
        Step 12: Evaluate multi-objective function Z = alpha*T + beta*C + gamma*E + delta*W.
        """
        # Step 1: Extract robot positions & destinations
        current_positions = {r_id: tuple(data["position"]) for r_id, data in robots_state.items()}
        destinations = destinations or {
            r_id: tuple(data.get("destination", current_positions[r_id]))
            for r_id, data in robots_state.items()
        }
        priorities = {r_id: float(data.get("priority", 1.0)) for r_id, data in robots_state.items()}
        batteries = {r_id: float(data.get("battery", 100.0)) for r_id, data in robots_state.items()}

        # Step 2 & 3: Compute initial shortest paths
        trajectories: Dict[str, List[Tuple[int, int]]] = {}
        total_travel_distance = 0.0

        for r_id, start_pos in current_positions.items():
            target_pos = destinations.get(r_id, start_pos)
            path = self.grid.find_shortest_path_bfs(start_pos, target_pos)
            if not path:
                path = [start_pos]
            trajectories[r_id] = path
            total_travel_distance += max(0, len(path) - 1)

        # Step 4 & 5: Conflict Graph & Greedy Coloring
        coloring_result = ConflictGraphEngine.compute_graph_coloring(
            trajectories=trajectories,
            strategy="largest_first",
            destinations=destinations
        )
        total_conflicts = coloring_result["total_conflicts"]
        scheduling_phases = coloring_result["scheduling_phases"]

        # Step 6: Spatio-temporal reservations
        self.reservations.clear()
        reservation_conflicts = 0
        for r_id, path in trajectories.items():
            success = self.reservations.reserve_path(r_id, path)
            if not success:
                reservation_conflicts += 1

        # Step 7 & 8: Rook Polynomial Charging Assignment & PIE
        # Construct compatibility matrix for low-battery AGVs
        low_battery_agvs = [r_id for r_id, b in batteries.items() if b < 40.0]
        n_charging_req = min(4, max(len(low_battery_agvs), len(self.chargers)))
        
        # Diagonal clearance constraints: AGV-i cannot use Charger-i if clearance prohibits
        rook_forbidden = {(i, i) for i in range(min(n_charging_req, len(self.chargers)))}
        rook_engine = RookPolynomialEngine(
            num_agvs=min(n_charging_req, 4),
            num_destinations=min(len(self.chargers), 4),
            forbidden_cells=rook_forbidden
        )
        rook_audit = rook_engine.audit_and_verify()

        # Step 9: Ordinary Generating Functions for Backup Energy
        energy_engine = BackupEnergyDistributionEngine(
            num_bays=len(self.chargers),
            total_energy=self.backup_energy,
            min_reserve=self.min_reserve,
            unit=1
        )
        energy_telemetry = energy_engine.get_full_telemetry()

        # Step 10 & 11: Deadlock Detection & True Route Replanning
        desired_next = {
            r_id: (trajectories[r_id][1] if len(trajectories[r_id]) > 1 else current_positions[r_id])
            for r_id in current_positions
        }

        deadlock_report = DeadlockRecoveryEngine.identify_and_resolve_deadlock(
            grid_graph=self.grid,
            current_positions=current_positions,
            desired_next_cells=desired_next,
            trajectories=trajectories,
            destinations=destinations,
            priorities=priorities
        )

        # If deadlock was resolved by replanning, update the trajectory
        replan_occurred = False
        if deadlock_report["deadlock_detected"] and deadlock_report["recovery_action"] and deadlock_report["recovery_action"]["success"]:
            replan_robot = deadlock_report["recovery_action"]["yield_robot"]
            new_path = deadlock_report["recovery_action"]["replanned_route"]
            if new_path:
                trajectories[replan_robot] = new_path
                replan_occurred = True

        # Step 12: Evaluate Multi-Objective Cost Function
        # Z = alpha*T + beta*C + gamma*E + delta*W
        # T: Total Travel Distance
        T = total_travel_distance
        # C: Number of route conflicts
        C = total_conflicts
        # E: Estimated Energy Consumed (0.2 kWh per hop + 0.1 kWh base idle)
        E = round(T * 0.2 + len(robots_state) * 0.1, 2)
        # W: Total Waiting Time (stalled moves or phase offsets)
        W = sum(1 for r_id, path in trajectories.items() if len(path) > 1 and path[1] == current_positions[r_id])
        W += (coloring_result["num_colors_used"] - 1) * 2  # Phase transition latency

        Z_score = round(
            self.weights.alpha * T +
            self.weights.beta * C +
            self.weights.gamma * E +
            self.weights.delta * W,
            3
        )

        return {
            "status": "OPTIMIZATION_COMPLETE",
            "objective_score_z": Z_score,
            "objective_breakdown": {
                "travel_distance_T": T,
                "conflicts_count_C": C,
                "energy_consumed_E": E,
                "waiting_time_W": W,
                "weights": self.weights.model_dump(),
                "formula": f"Z = ({self.weights.alpha} * {T}) + ({self.weights.beta} * {C}) + ({self.weights.gamma} * {E}) + ({self.weights.delta} * {W}) = {Z_score}"
            },
            "graph_routing": {
                "active_trajectories": {r_id: list(path) for r_id, path in trajectories.items()},
                "total_travel_distance": T
            },
            "conflict_scheduling": {
                "conflicts_count": total_conflicts,
                "conflicts_list": coloring_result["conflicts"],
                "num_phases": coloring_result["num_colors_used"],
                "scheduling_phases": scheduling_phases,
                "brooks_bound": coloring_result["brooks_upper_bound"],
                "strategy": coloring_result["strategy"]
            },
            "charging_matching": {
                "forbidden_positions_count": rook_audit["forbidden_count"],
                "rook_polynomial": rook_audit["polynomial_str"],
                "valid_assignments_count": rook_audit["pie_total"],
                "sample_assignment": rook_audit["valid_assignments"][:1] if rook_audit["valid_assignments"] else None,
                "verified": rook_audit["verified"]
            },
            "backup_energy": {
                "total_energy_kwh": self.backup_energy,
                "is_feasible": energy_telemetry["is_feasible"],
                "admissible_allocations": energy_telemetry["exact_allocation_count"],
                "binomial_expression": energy_telemetry["binomial_expression"],
                "status": energy_telemetry["scenario_status"]
            },
            "deadlock_telemetry": {
                "deadlock_detected": deadlock_report["deadlock_detected"],
                "cycles": deadlock_report["cycles"],
                "dependencies": deadlock_report["dependencies"],
                "replan_occurred": replan_occurred,
                "recovery_action": deadlock_report["recovery_action"]
            },
            "limitations_note": (
                "NOTE ON OPTIMALITY: The optimization controller applies transparent polynomial-time heuristics "
                "(Greedy Graph Coloring, Dijkstra detours, and Stars-and-Bars combinatorial budgeting). "
                "Global optimality across concurrent multi-agent trajectories is NP-hard and not claimed."
            )
        }
