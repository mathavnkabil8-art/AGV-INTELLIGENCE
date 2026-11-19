"""
Comprehensive Unit Tests for Phase 7: Integrated AGV Optimization Controller & Deadlock Engine.

Test Cases:
1. No-conflict scenario (independent parallel paths).
2. Shared-cell conflict (simultaneous cell claim at tick t).
3. Edge-swap conflict (head-on edge traversal at tick t).
4. Circular waiting dependency (Wait-For Graph cycle detection).
5. Incompatible charging dock (Rook polynomial restriction).
6. Insufficient backup energy (OGF deficit reporting).
7. True route replanning (Dijkstra detour recovery without fake edge deletion).
8. Configurable multi-objective cost function Z = alpha*T + beta*C + gamma*E + delta*W.
9. End-to-end 12-step pipeline execution.
"""

import pytest
from backend.algorithms.graph_routing import WarehouseGridGraph
from backend.algorithms.integrated_controller import (
    IntegratedOptimizationController,
    ReservationTable,
    DeadlockRecoveryEngine,
    OptimizationWeights,
)
from backend.algorithms.rook_polynomial import RookPolynomialEngine
from backend.algorithms.generating_functions import BackupEnergyDistributionEngine
from backend.algorithms.deadlock_detection import DeadlockDetector


def test_1_no_conflict_scenario():
    """Test 1: Two AGVs on parallel tracks with zero spatio-temporal interference."""
    grid = WarehouseGridGraph(width=8, height=8, obstacles=set())
    chargers = [(0, 0), (7, 7)]
    controller = IntegratedOptimizationController(grid, chargers)

    robots_state = {
        "AGV-01": {"position": (0, 0), "destination": (0, 4), "battery": 90.0, "priority": 1.0},
        "AGV-02": {"position": (2, 0), "destination": (2, 4), "battery": 85.0, "priority": 1.0},
    }

    result = controller.run_integrated_pipeline(robots_state)
    assert result["status"] == "OPTIMIZATION_COMPLETE"
    assert result["conflict_scheduling"]["conflicts_count"] == 0
    assert result["deadlock_telemetry"]["deadlock_detected"] is False
    assert result["objective_breakdown"]["conflicts_count_C"] == 0


def test_2_shared_cell_conflict():
    """Test 2: Two AGVs attempting to occupy (2, 2) at the same time step."""
    grid = WarehouseGridGraph(width=8, height=8, obstacles=set())
    chargers = [(0, 0), (7, 7)]
    controller = IntegratedOptimizationController(grid, chargers)

    # AGV-01 moves (0, 2) -> (1, 2) -> (2, 2)
    # AGV-02 moves (2, 0) -> (2, 1) -> (2, 2)
    # Both land on (2, 2) at t = 2
    robots_state = {
        "AGV-01": {"position": (0, 2), "destination": (4, 2), "battery": 90.0, "priority": 2.0},
        "AGV-02": {"position": (2, 0), "destination": (2, 4), "battery": 80.0, "priority": 1.0},
    }

    result = controller.run_integrated_pipeline(robots_state)
    assert result["conflict_scheduling"]["conflicts_count"] >= 1
    # Check that reservation table caught the contention
    conflict_found = any(c["conflict_type"] == "VERTEX_COLLISION" for c in result["conflict_scheduling"]["conflicts_list"])
    assert conflict_found is True


def test_3_edge_swap_conflict():
    """Test 3: Head-on opposite-direction traversal of adjacent cells (1, 1) <-> (1, 2)."""
    grid = WarehouseGridGraph(width=8, height=8, obstacles=set())
    chargers = [(0, 0), (7, 7)]
    controller = IntegratedOptimizationController(grid, chargers)

    robots_state = {
        "AGV-01": {"position": (1, 1), "destination": (1, 3), "battery": 90.0, "priority": 2.0},
        "AGV-02": {"position": (1, 2), "destination": (1, 0), "battery": 85.0, "priority": 1.0},
    }

    result = controller.run_integrated_pipeline(robots_state)
    assert result["conflict_scheduling"]["conflicts_count"] >= 1
    swap_found = any(c["conflict_type"] == "EDGE_SWAP_COLLISION" for c in result["conflict_scheduling"]["conflicts_list"])
    assert swap_found is True


def test_4_circular_waiting_deadlock():
    """Test 4: 4-agent circular wait dependency A -> B -> C -> D -> A."""
    current_pos = {
        "AGV-01": (3, 3),
        "AGV-02": (3, 4),
        "AGV-03": (4, 4),
        "AGV-04": (4, 3)
    }
    desired_next = {
        "AGV-01": (3, 4), # wants cell held by AGV-02
        "AGV-02": (4, 4), # wants cell held by AGV-03
        "AGV-03": (4, 3), # wants cell held by AGV-04
        "AGV-04": (3, 3)  # wants cell held by AGV-01
    }

    wfg = DeadlockDetector.build_wait_for_graph(current_pos, desired_next)
    cycles = DeadlockDetector.find_deadlock_cycles(wfg)

    assert len(cycles) > 0
    cycle = cycles[0]
    assert len(cycle) == 4
    for r in ["AGV-01", "AGV-02", "AGV-03", "AGV-04"]:
        assert r in cycle


def test_5_incompatible_charging_dock():
    """Test 5: Rook polynomial rejects incompatible robot-dock pairings."""
    # 4 AGVs and 4 Docks with diagonal forbidden
    forbidden = {(0, 0), (1, 1), (2, 2), (3, 3)}
    engine = RookPolynomialEngine(num_agvs=4, num_destinations=4, forbidden_cells=forbidden)
    audit = engine.audit_and_verify()

    assert audit["forbidden_count"] == 4
    assert audit["pie_total"] == 9

    # Verify no valid assignment maps AGV-i to Dock-i
    for assign in audit["valid_assignments"]:
        for pair in assign["pairs"]:
            assert pair["robot_index"] != pair["dock_index"]


def test_6_insufficient_backup_energy():
    """Test 6: OGF reports 0 feasible allocations when R < n * m."""
    # 4 bays, min reserve 15 kWh (requires 60 kWh), but available is 50 kWh
    engine = BackupEnergyDistributionEngine(num_bays=4, total_energy=50, min_reserve=15)
    telemetry = engine.get_full_telemetry()

    assert telemetry["is_feasible"] is False
    assert telemetry["scenario_status"] == "CRITICAL_DEFICIT"
    assert telemetry["exact_allocation_count"] == 0
    assert telemetry["deficit_kwh"] == 10


def test_7_deadlock_recovery_true_route_replanning():
    """
    Test 7: True physical route replanning recovery.
    Does NOT delete graph edges; instead detours the yielding robot around the blockage.
    """
    grid = WarehouseGridGraph(width=8, height=8, obstacles=set())
    current_pos = {
        "AGV-01": (3, 3),
        "AGV-02": (3, 4),
        "AGV-03": (4, 4),
        "AGV-04": (4, 3)
    }
    desired_next = {
        "AGV-01": (3, 4),
        "AGV-02": (4, 4),
        "AGV-03": (4, 3),
        "AGV-04": (3, 3)
    }
    trajectories = {
        "AGV-01": [(3, 3), (3, 4)],
        "AGV-02": [(3, 4), (4, 4)],
        "AGV-03": [(4, 4), (4, 3)],
        "AGV-04": [(4, 3), (3, 3)]
    }
    destinations = {
        "AGV-01": (0, 7),
        "AGV-02": (7, 7),
        "AGV-03": (7, 0),
        "AGV-04": (0, 0)
    }
    priorities = {
        "AGV-01": 2.0,
        "AGV-02": 3.0,
        "AGV-03": 4.0,
        "AGV-04": 1.0 # Lowest priority -> yields
    }

    result = DeadlockRecoveryEngine.identify_and_resolve_deadlock(
        grid_graph=grid,
        current_positions=current_pos,
        desired_next_cells=desired_next,
        trajectories=trajectories,
        destinations=destinations,
        priorities=priorities
    )

    assert result["deadlock_detected"] is True
    assert result["recovery_action"] is not None
    assert result["recovery_action"]["yield_robot"] == "AGV-04"
    assert result["recovery_action"]["success"] is True

    new_route = result["recovery_action"]["replanned_route"]
    assert new_route is not None
    assert len(new_route) > 1
    # Verify the replanned route does NOT immediately step into (3, 3) occupied by AGV-01
    assert new_route[1] != (3, 3)


def test_8_configurable_objective_function():
    """
    Test 8: Validates objective cost function Z = alpha*T + beta*C + gamma*E + delta*W.
    """
    grid = WarehouseGridGraph(width=8, height=8, obstacles=set())
    chargers = [(0, 0), (7, 7)]
    custom_weights = OptimizationWeights(alpha=2.0, beta=10.0, gamma=1.0, delta=4.0)

    controller = IntegratedOptimizationController(
        grid_graph=grid,
        charging_stations=chargers,
        weights=custom_weights
    )

    robots_state = {
        "AGV-01": {"position": (0, 0), "destination": (2, 0), "battery": 100.0, "priority": 1.0},
        "AGV-02": {"position": (7, 7), "destination": (5, 7), "battery": 100.0, "priority": 1.0},
    }

    result = controller.run_integrated_pipeline(robots_state)
    breakdown = result["objective_breakdown"]
    T = breakdown["travel_distance_T"]
    C = breakdown["conflicts_count_C"]
    E = breakdown["energy_consumed_E"]
    W = breakdown["waiting_time_W"]

    expected_z = round(2.0 * T + 10.0 * C + 1.0 * E + 4.0 * W, 3)
    assert result["objective_score_z"] == expected_z


def test_9_end_to_end_pipeline():
    """Test 9: Full 12-step integrated pipeline with 8 AGVs."""
    grid = WarehouseGridGraph(width=8, height=8, obstacles={(3, 2), (4, 2)})
    chargers = [(0, 0), (0, 7), (7, 0), (7, 7)]
    controller = IntegratedOptimizationController(
        grid_graph=grid,
        charging_stations=chargers,
        backup_energy_kwh=100,
        min_reserve_per_bay_kwh=15
    )

    robots_state = {
        f"AGV-{i+1:02d}": {
            "position": (i, 0),
            "destination": (i, 7),
            "battery": 100.0 - i * 8.0,
            "priority": 1.0 + i * 0.2
        }
        for i in range(8)
    }

    result = controller.run_integrated_pipeline(robots_state)
    assert result["status"] == "OPTIMIZATION_COMPLETE"
    assert "objective_score_z" in result
    assert result["conflict_scheduling"]["strategy"] == "largest_first"
    assert result["charging_matching"]["verified"] is True
    assert result["backup_energy"]["is_feasible"] is True
    assert "NOTE ON OPTIMALITY" in result["limitations_note"]


def test_10_directed_acyclic_wait_for_graph_no_deadlock():
    """
    Test 10: Directed Acyclic Wait-For Graph (DAG).
    AGV-01 waits for cell of AGV-02, AGV-02 waits for AGV-03, AGV-03 moves to empty cell.
    Acyclic dependency chain: 01 -> 02 -> 03 (No cycles, No deadlock).
    """
    import networkx as nx
    current_pos = {
        "AGV-01": (1, 1),
        "AGV-02": (1, 2),
        "AGV-03": (1, 3),
    }
    desired_next = {
        "AGV-01": (1, 2),  # waits on AGV-02
        "AGV-02": (1, 3),  # waits on AGV-03
        "AGV-03": (1, 4),  # moves to unoccupied cell (1, 4)
    }

    wfg = DeadlockDetector.build_wait_for_graph(current_pos, desired_next)
    assert nx.is_directed_acyclic_graph(wfg) is True
    cycles = DeadlockDetector.find_deadlock_cycles(wfg)
    assert len(cycles) == 0

    sccs = DeadlockDetector.get_strongly_connected_components(wfg)
    assert len(sccs) == 0


def test_11_deadlock_recovery_failure_when_trapped():
    """
    Test 11: Recovery Failure Scenario.
    When yielding robot is completely boxed in by structural obstacles and other robots,
    the recovery engine must honestly report that no feasible physical detour exists.
    """
    # Create grid with obstacles completely boxing in (0, 0)
    # Neighbors of (0, 0) are (1, 0) and (0, 1)
    # If both (1, 0) and (0, 1) are blocked by obstacles/robots, robot at (0, 0) is trapped!
    trapping_obstacles = {(1, 0)}  # Obstacle blocks East
    grid = WarehouseGridGraph(width=8, height=8, obstacles=trapping_obstacles)

    current_pos = {
        "AGV-01": (0, 1),  # North of AGV-02
        "AGV-02": (0, 0),  # In corner (0, 0). East is obstacle (1, 0), North is AGV-01
    }
    desired_next = {
        "AGV-01": (0, 0),  # AGV-01 wants (0, 0) held by AGV-02
        "AGV-02": (0, 1),  # AGV-02 wants (0, 1) held by AGV-01
    }
    trajectories = {
        "AGV-01": [(0, 1), (0, 0)],
        "AGV-02": [(0, 0), (0, 1)]
    }
    destinations = {
        "AGV-01": (0, 7),
        "AGV-02": (7, 7)
    }
    priorities = {
        "AGV-01": 2.0,
        "AGV-02": 1.0  # Lowest priority -> AGV-02 yields
    }

    result = DeadlockRecoveryEngine.identify_and_resolve_deadlock(
        grid_graph=grid,
        current_positions=current_pos,
        desired_next_cells=desired_next,
        trajectories=trajectories,
        destinations=destinations,
        priorities=priorities
    )

    assert result["deadlock_detected"] is True
    assert result["recovery_action"]["yield_robot"] == "AGV-02"
    # AGV-02 is trapped (East is obstacle (1, 0), North is AGV-01, West & South are grid boundaries)
    assert result["recovery_action"]["success"] is False
    assert result["recovery_action"]["strategy"] == "NO_FEASIBLE_DETOUR"
    assert result["resolved"] is False
    assert "could not find safe immediate detour" in result["recovery_action"]["explanation"]
