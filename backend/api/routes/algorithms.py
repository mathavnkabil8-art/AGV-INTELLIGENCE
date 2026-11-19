"""API Endpoints exposing discrete mathematics and graph theory algorithms."""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Tuple, Dict, Optional, Any
from backend.algorithms.graph_routing import (
    WarehouseGridGraph,
    ConflictGraphEngine,
    ConflictGraphColoring,
)
from backend.algorithms.rook_polynomial import RookPolynomialEngine
from backend.algorithms.generating_functions import (
    GeneratingFunctionEngine,
    BackupEnergyDistributionEngine,
)
from backend.algorithms.deadlock_detection import DeadlockDetector
from backend.algorithms.optimization import FleetOptimizer
from backend.simulation.engine import simulation_engine

router = APIRouter(prefix="/algorithms", tags=["Mathematical Algorithms"])


# -------------------------------------------------------------
# PART A: WAREHOUSE GRID GRAPH G = (V, E)
# -------------------------------------------------------------

class PathQueryRequest(BaseModel):
    start_x: int = Field(..., ge=0, le=7)
    start_y: int = Field(..., ge=0, le=7)
    target_x: int = Field(..., ge=0, le=7)
    target_y: int = Field(..., ge=0, le=7)
    algorithm: str = Field(default="bfs", description="'bfs' or 'dijkstra'")


@router.get("/grid-graph")
def get_grid_graph():
    """Returns the structural representation of warehouse grid graph G = (V, E)."""
    grid_graph = WarehouseGridGraph(
        width=simulation_engine.warehouse.width,
        height=simulation_engine.warehouse.height,
        obstacles=simulation_engine.warehouse.get_obstacle_set(),
        default_cost=simulation_engine.warehouse.movement_cost
    )
    metadata = grid_graph.get_graph_metadata()
    return {
        "graph_type": "Undirected Planar Grid Graph G = (V, E)",
        "width": grid_graph.width,
        "height": grid_graph.height,
        "metadata": metadata,
        "mathematical_definition": (
            "G = (V, E) where V subset of [width] x [height] excludes obstacle cells, "
            "and E contains undirected orthogonal edges between adjacent accessible cells."
        )
    }


@router.post("/grid-graph/path")
def calculate_grid_path(req: PathQueryRequest):
    """Calculates shortest path using BFS or Dijkstra."""
    grid_graph = WarehouseGridGraph(
        width=simulation_engine.warehouse.width,
        height=simulation_engine.warehouse.height,
        obstacles=simulation_engine.warehouse.get_obstacle_set(),
        default_cost=simulation_engine.warehouse.movement_cost
    )
    start = (req.start_x, req.start_y)
    target = (req.target_x, req.target_y)

    if req.algorithm.lower() == "dijkstra":
        res = grid_graph.find_shortest_path_dijkstra(start, target)
        if not res:
            raise HTTPException(status_code=400, detail=f"No navigable path exists between {start} and {target}.")
        path, cost = res
        return {
            "algorithm": "Dijkstra (Weighted Shortest Path)",
            "start": list(start),
            "target": list(target),
            "path": [list(p) for p in path],
            "hop_count": len(path) - 1,
            "cost": cost
        }
    else:
        path = grid_graph.find_shortest_path_bfs(start, target)
        if not path:
            raise HTTPException(status_code=400, detail=f"No navigable path exists between {start} and {target}.")
        return {
            "algorithm": "BFS (Breadth-First Search)",
            "start": list(start),
            "target": list(target),
            "path": [list(p) for p in path],
            "hop_count": len(path) - 1,
            "cost": float(len(path) - 1) * grid_graph.default_cost
        }


# -------------------------------------------------------------
# PART B & C: CONFLICT GRAPH G_c & GRAPH COLORING
# -------------------------------------------------------------

class CustomConflictRequest(BaseModel):
    trajectories: Dict[str, List[Tuple[int, int]]] = Field(
        ...,
        description="Map of AGV IDs to ordered list of (x, y) coordinates"
    )
    strategy: str = Field(default="largest_first", description="Coloring strategy")


@router.get("/conflict-graph")
def get_conflict_graph(
    strategy: str = Query("largest_first", description="Greedy coloring strategy: largest_first, smallest_last, random_sequential, connected_sequential_bfs, independent_set")
):
    """
    Constructs conflict graph G_c = (V_c, E_c) from current active AGV planned routes.
    Detects vertex collisions, edge swap collisions, and resource contention.
    Applies greedy vertex coloring using the requested strategy.
    """
    trajectories = {
        agv_id: robot.route if robot.route else [robot.position]
        for agv_id, robot in simulation_engine.robots.items()
    }
    destinations = {
        agv_id: robot.destination for agv_id, robot in simulation_engine.robots.items()
        if robot.destination is not None
    }

    result = ConflictGraphEngine.compute_graph_coloring(
        trajectories=trajectories,
        strategy=strategy,
        destinations=destinations
    )

    # Add legacy compatibility fields
    result["vertex_coloring"] = result["coloring"]
    result["chromatic_number_estimate"] = result["num_colors_used"]
    result["conflicts_detected"] = [
        {"agv1": c["agv1"], "agv2": c["agv2"], "step": c["time_step"], "type": c["conflict_type"]}
        for c in result["conflicts"]
    ]
    return result


@router.post("/conflict-graph/custom")
def evaluate_custom_conflict_graph(req: CustomConflictRequest):
    """Evaluates conflict graph and graph coloring for custom arbitrary trajectories."""
    result = ConflictGraphEngine.compute_graph_coloring(
        trajectories=req.trajectories,
        strategy=req.strategy
    )
    return result


# -------------------------------------------------------------
# ROOK POLYNOMIAL, GENERATING FUNCTIONS, DEADLOCK, OPTIMIZATION
# -------------------------------------------------------------

class RookPolyRequest(BaseModel):
    num_agvs: int = Field(default=4, ge=1, le=8)
    num_destinations: int = Field(default=4, ge=1, le=8)
    forbidden_pairs: Optional[List[Tuple[int, int]]] = Field(
        default=None,
        description="Forbidden (agv_index, destination_index) assignment pairs"
    )
    matrix: Optional[List[List[int]]] = Field(
        default=None,
        description="Optional n x m binary matrix where 1 = forbidden and 0 = allowed"
    )

@router.post("/rook-polynomial")
def compute_rook_polynomial(req: RookPolyRequest):
    """
    Computes rook polynomial coefficients, step-by-step PIE expansion,
    and enumerates valid one-to-one robot-to-charger assignments.
    """
    try:
        if req.matrix is not None:
            engine = RookPolynomialEngine.from_matrix(req.matrix)
        else:
            pairs = req.forbidden_pairs if req.forbidden_pairs is not None else [(i, i) for i in range(min(req.num_agvs, req.num_destinations))]
            engine = RookPolynomialEngine(req.num_agvs, req.num_destinations, set(pairs))

        audit = engine.audit_and_verify()

        return {
            "num_agvs": engine.n,
            "num_destinations": engine.m,
            "coefficients": audit["rook_coefficients"],
            "polynomial_str": audit["polynomial_str"],
            "pie_valid_assignments_count": audit["pie_total"],
            "explicit_valid_assignments_count": audit["enumerated_total"],
            "pie_expansion": audit["pie_expansion"],
            "valid_assignments": audit["valid_assignments"],
            "sample_placements": audit["sample_placements"],
            "board_matrix": audit["board_matrix"],
            "forbidden_count": audit["forbidden_count"],
            "unrestricted_total": audit["unrestricted_total"],
            "verified": audit["verified"],
            "formula_used": audit["formula_used"],
            "mathematical_formula": "R(x, B) = sum_{k=0}^{min(n, m)} r_k(B) x^k; N = sum_{k=0}^n (-1)^k r_k (n - k)!",
            "explanation": (
                f"Evaluation for {engine.n} AGVs and {engine.m} charging stations under {audit['forbidden_count']} forbidden constraints."
            )
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class BackupEnergyRequest(BaseModel):
    num_bays: int = Field(default=4, ge=1, le=16, description="Number of charging bays n")
    total_energy: int = Field(default=100, ge=0, le=2000, description="Total backup energy R in kWh")
    min_reserve: int = Field(default=15, ge=0, le=500, description="Minimum reserve per bay m in kWh")
    unit: int = Field(default=1, ge=1, le=50, description="Energy allocation unit in kWh")


@router.post("/backup-energy-distribution")
def compute_backup_energy_distribution(req: BackupEnergyRequest):
    """
    Evaluates Ordinary Generating Function for backup energy distribution across charging bays:
    G(x) = (x^m / (1 - x))^n = x^(mn) / (1 - x)^n.
    Extracts [x^R] G(x) = binom(R - mn + n - 1, n - 1).
    Default benchmark: n=4, R=100, m=15 yields C(43, 3) = 12341.
    """
    try:
        engine = BackupEnergyDistributionEngine(
            num_bays=req.num_bays,
            total_energy=req.total_energy,
            min_reserve=req.min_reserve,
            unit=req.unit
        )
        return engine.get_full_telemetry()
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class GeneratingFunctionRequest(BaseModel):
    total_energy: int = Field(default=100, ge=0, le=2000)
    agv_bounds: Optional[List[Tuple[int, int]]] = Field(
        default=None,
        description="Optional list of (min_units, max_units) required per AGV"
    )
    num_bays: Optional[int] = Field(default=None, ge=1, le=16)
    min_reserve: Optional[int] = Field(default=None, ge=0, le=500)
    unit: Optional[int] = Field(default=1, ge=1, le=50)

@router.post("/generating-function")
def compute_generating_function(req: GeneratingFunctionRequest):
    """Evaluates discrete energy/task distributions using formal power series or OGF backup distribution."""
    try:
        # If legacy fleet bounds format is supplied
        if req.agv_bounds is not None:
            engine = GeneratingFunctionEngine()
            gf = engine.build_allocation_gf(req.agv_bounds)
            ways = engine.count_allocations(req.total_energy, req.agv_bounds)
            spectrum = engine.get_distribution_spectrum(req.agv_bounds)

            return {
                "total_energy": req.total_energy,
                "admissible_configurations_count": ways,
                "energy_spectrum": spectrum,
                "generating_polynomial": str(gf.as_expr()),
                "mathematical_formula": "G(x) = prod_{i=1}^k (sum_{j=L_i}^{U_i} x^j); [x^E] G(x)"
            }

        # Otherwise evaluate OGF backup energy distribution model
        num_bays = req.num_bays or 4
        min_reserve = req.min_reserve if req.min_reserve is not None else 15
        unit = req.unit or 1

        engine = BackupEnergyDistributionEngine(
            num_bays=num_bays,
            total_energy=req.total_energy,
            min_reserve=min_reserve,
            unit=unit
        )
        telemetry = engine.get_full_telemetry()
        # Combine keys for backward compatibility
        telemetry["admissible_configurations_count"] = telemetry["exact_allocation_count"]
        telemetry["generating_polynomial"] = telemetry["generating_function"]["compact_ogf"]
        telemetry["mathematical_formula"] = "G(x) = (x^m / (1 - x))^n = x^(mn) / (1 - x)^n; [x^R] G(x) = C(R - mn + n - 1, n - 1)"
        return telemetry
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/deadlock-check")
def check_deadlocks():
    """Inspects the active Wait-For Graph (WFG) and reports cycles and SCCs."""
    current_pos = {agv_id: robot.position for agv_id, robot in simulation_engine.robots.items()}
    desired_next = {agv_id: robot.next_cell() for agv_id, robot in simulation_engine.robots.items()}
    wfg = DeadlockDetector.build_wait_for_graph(current_pos, desired_next)
    cycles = DeadlockDetector.find_deadlock_cycles(wfg)
    sccs = [list(scc) for scc in DeadlockDetector.get_strongly_connected_components(wfg)]

    return {
        "wait_for_graph": {
            "nodes": list(wfg.nodes()),
            "edges": list(wfg.edges())
        },
        "deadlock_detected": len(cycles) > 0,
        "cycles": cycles,
        "strongly_connected_clusters": sccs
    }


@router.get("/optimize-charging")
def optimize_charging():
    """Solves minimum weight bipartite matching for AGVs to charging pads."""
    agv_list = [
        {"id": robot.id, "position": robot.position, "battery": robot.battery}
        for robot in simulation_engine.robots.values()
    ]
    matching = FleetOptimizer.match_agvs_to_chargers(
        agv_list,
        simulation_engine.warehouse.charging_stations
    )
    return {
        "matching": [
            {"agv_id": m[0], "charger_coord": m[1], "cost": m[2]}
            for m in matching
        ]
    }


class IntegratedOptimizationRequest(BaseModel):
    alpha: float = Field(default=1.0, ge=0.0, description="Travel Distance/Cost Weight")
    beta: float = Field(default=5.0, ge=0.0, description="Conflict Penalty Weight")
    gamma: float = Field(default=0.5, ge=0.0, description="Energy Consumed Weight")
    delta: float = Field(default=2.0, ge=0.0, description="Waiting Time Weight")
    backup_energy_kwh: int = Field(default=100, ge=0, description="Total Backup Energy in kWh")
    min_reserve_per_bay_kwh: int = Field(default=15, ge=0, description="Min Reserve per Bay in kWh")


@router.post("/integrated-optimization")
def run_integrated_optimization(req: IntegratedOptimizationRequest):
    """
    Phase 7: End-to-End Integrated AGV Optimization Controller.
    Connects:
    1. Warehouse Grid Graph (BFS/Dijkstra)
    2. Conflict Graph & Graph Coloring (Welsh-Powell)
    3. Rook Polynomials & PIE (Charging Dock Matching)
    4. Ordinary Generating Functions (Backup Energy Allocation)
    5. Deadlock Detection & True Physical Replanning
    6. Multi-Objective Cost Minimization Z = alpha*T + beta*C + gamma*E + delta*W
    """
    from backend.algorithms.integrated_controller import (
        IntegratedOptimizationController,
        OptimizationWeights
    )

    grid_graph = WarehouseGridGraph(
        width=simulation_engine.warehouse.width,
        height=simulation_engine.warehouse.height,
        obstacles=simulation_engine.warehouse.get_obstacle_set(),
        default_cost=simulation_engine.warehouse.movement_cost
    )

    weights = OptimizationWeights(
        alpha=req.alpha,
        beta=req.beta,
        gamma=req.gamma,
        delta=req.delta
    )

    controller = IntegratedOptimizationController(
        grid_graph=grid_graph,
        charging_stations=simulation_engine.warehouse.charging_stations,
        backup_energy_kwh=req.backup_energy_kwh,
        min_reserve_per_bay_kwh=req.min_reserve_per_bay_kwh,
        weights=weights
    )

    robots_state = {
        r_id: {
            "position": robot.position,
            "destination": robot.destination,
            "battery": robot.battery,
            "priority": robot.priority
        }
        for r_id, robot in simulation_engine.robots.items()
    }

    result = controller.run_integrated_pipeline(robots_state)
    return result
