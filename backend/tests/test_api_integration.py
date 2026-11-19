"""
End-to-End Router Function Integration Tests for AGV Intelligence.
Tests all endpoint handler functions directly with Pydantic request models,
verifying business logic, status structures, mathematical results, and error handling
without requiring un-sandboxed socket binding.
"""

import pytest
from backend.main import root
from backend.api.routes.health import get_health_status
from backend.api.routes.warehouse import get_warehouse_layout, get_warehouse_config
from backend.api.routes.simulation import (
    get_simulation_state,
    step_simulation,
    reset_simulation,
    inject_intentional_deadlock,
    recover_deadlock,
)
from backend.api.routes.algorithms import (
    PathQueryRequest,
    calculate_grid_path,
    RookPolyRequest,
    compute_rook_polynomial,
    BackupEnergyRequest,
    compute_backup_energy_distribution,
    IntegratedOptimizationRequest,
    run_integrated_optimization,
    check_deadlocks,
)
from backend.api.routes.experiments import (
    list_experiments,
    get_experiment_evaluation,
    export_experiment_csv,
    export_experiment_json,
)


def test_root_endpoint():
    data = root()
    assert "version" in data
    assert data["documentation"] == "/docs"
    assert "/api/experiments" in data["routes"]["experiments"]


def test_health_endpoint():
    data = get_health_status()
    assert data["status"] == "healthy"
    assert data["modules"]["graph_routing"] == "ACTIVE"
    assert data["modules"]["rook_polynomial"] == "ACTIVE"


def test_warehouse_layout_and_config():
    layout = get_warehouse_layout()
    assert layout["width"] == 8
    assert layout["height"] == 8
    assert len(layout["charging_stations"]) == 4

    cfg = get_warehouse_config()
    assert "warehouse" in cfg
    assert "fleet" in cfg


def test_simulation_lifecycle():
    # Reset
    reset_res = reset_simulation()
    assert reset_res["state"]["step"] == 0
    assert len(reset_res["state"]["agvs"]) == 8

    # State
    state = get_simulation_state()
    assert len(state["agvs"]) == 8

    # Step
    new_state = step_simulation()
    assert new_state["step"] >= 1


def test_graph_routing_pathfinding():
    # BFS
    bfs_req = PathQueryRequest(start_x=0, start_y=0, target_x=0, target_y=4, algorithm="bfs")
    bfs_res = calculate_grid_path(bfs_req)
    assert bfs_res["hop_count"] == 4
    assert len(bfs_res["path"]) == 5

    # Dijkstra
    dijkstra_req = PathQueryRequest(start_x=0, start_y=0, target_x=0, target_y=4, algorithm="dijkstra")
    dijkstra_res = calculate_grid_path(dijkstra_req)
    assert dijkstra_res["cost"] == 4.0


def test_rook_polynomial_api():
    matrix = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ]
    req = RookPolyRequest(num_agvs=4, num_destinations=4, matrix=matrix)
    data = compute_rook_polynomial(req)
    assert data["coefficients"] == [1, 4, 6, 4, 1]
    assert data["pie_valid_assignments_count"] == 9
    assert data["explicit_valid_assignments_count"] == 9
    assert data["verified"] is True


def test_generating_functions_api():
    # n=4, R=100, m=15 -> C(43, 3) = 12341
    req = BackupEnergyRequest(num_bays=4, total_energy=100, min_reserve=15, unit=1)
    data = compute_backup_energy_distribution(req)
    assert data["exact_allocation_count"] == 12341
    assert data["is_feasible"] is True
    assert data["scenario_status"] == "FEASIBLE_SURPLUS"


def test_deadlock_detection_and_resolution_api():
    # Baseline check
    chk = check_deadlocks()
    assert "deadlock_detected" in chk

    # Inject intentional deadlock
    inj = inject_intentional_deadlock()
    assert inj["deadlock_detected"] is True

    # Recover
    rec = recover_deadlock()
    assert rec["recovered"] is True

    # Reset
    reset_simulation()


def test_integrated_optimization_api():
    req = IntegratedOptimizationRequest(
        alpha=1.0, beta=5.0, gamma=0.5, delta=2.0,
        backup_energy_kwh=100, min_reserve_per_bay_kwh=15
    )
    data = run_integrated_optimization(req)
    assert data["status"] == "OPTIMIZATION_COMPLETE"
    assert "objective_score_z" in data
    assert data["objective_breakdown"]["travel_distance_T"] >= 0


def test_experiments_catalog_and_execution_api():
    catalog = list_experiments()
    assert len(catalog) == 5

    for exp in catalog:
        eid = exp["experiment_id"]
        edata = get_experiment_evaluation(eid)
        assert "baseline_metrics" in edata
        assert "optimized_metrics" in edata

        csv_res = export_experiment_csv(eid)
        assert csv_res.media_type == "text/csv"
        assert len(csv_res.body) > 0

        json_res = export_experiment_json(eid)
        assert json_res.media_type == "application/json"
        assert len(json_res.body) > 0
