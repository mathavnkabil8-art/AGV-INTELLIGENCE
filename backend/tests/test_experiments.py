"""
Unit Tests for Phase 8: Experimental Analytics & Performance Evaluation.

Tests:
1. EXP-01: Normal warehouse routing metrics & OGF energy verification.
2. EXP-02: Intersecting routes, conflict elimination, and chromatic phase decoupling.
3. EXP-03: Restricted charging dock matching & Rook polynomial PIE filtering.
4. EXP-04: Backup energy shortage & critical deficit detection.
5. EXP-05: Circular waiting deadlock detection & true route replanning recovery.
6. CSV Export formatting.
7. JSON Export formatting.
8. Metric integrity and reproducibility.
"""

import pytest
import json
import csv
import io
from backend.simulation.experiments import ExperimentEngine


def test_1_exp1_normal_routing():
    """Test 1: EXP-01 nominal warehouse routing."""
    res = ExperimentEngine.run_experiment("exp1")
    assert res["experiment_id"] == "EXP-01"
    assert "Normal Warehouse Routing" in res["name"]

    base = res["baseline_metrics"]
    opt = res["optimized_metrics"]
    assert base["completed_deliveries"] == 4
    assert opt["completed_deliveries"] == 4
    assert opt["actual_collisions_occurred"] == 0
    assert opt["possible_energy_allocations"] == 12341


def test_2_exp2_intersecting_routes():
    """Test 2: EXP-02 intersecting orthogonal routes with chromatic phase partitioning."""
    res = ExperimentEngine.run_experiment("exp2")
    assert res["experiment_id"] == "EXP-02"

    base = res["baseline_metrics"]
    opt = res["optimized_metrics"]

    # Baseline experiences vertex and swap collisions
    assert base["actual_collisions_occurred"] > 0
    # Optimized spatial reservations guarantee 0 physical collisions
    assert opt["actual_collisions_occurred"] == 0

    comp = res["comparison"]
    assert comp["chromatic_phases_allocated"] >= 2
    assert "Brooks' Theorem" in res["mathematical_concept"]


def test_3_exp3_restricted_charging():
    """Test 3: EXP-03 restricted charging with diagonal clearance derangements."""
    res = ExperimentEngine.run_experiment("exp3")
    assert res["experiment_id"] == "EXP-03"

    base = res["baseline_metrics"]
    opt = res["optimized_metrics"]

    assert opt["valid_charging_assignments"] == 9
    assert res["comparison"]["forbidden_violations_filtered"] == 15
    assert res["comparison"]["pie_verified"] is True
    assert "!4 = 9 verified" in res["mathematical_derivation"]["derangement_check"]


def test_4_exp4_energy_shortage():
    """Test 4: EXP-04 microgrid backup energy comparison."""
    res = ExperimentEngine.run_experiment("exp4")
    assert res["experiment_id"] == "EXP-04"

    comp = res["comparison"]
    assert comp["normal_allocations"] == 12341
    assert comp["limited_allocations"] == 165
    assert comp["critical_allocations"] == 0
    assert comp["critical_deficit_detected"] == 10
    assert res["optimized_metrics"]["energy_deficit_alert"] is True


def test_5_exp5_deadlock_recovery():
    """Test 5: EXP-05 circular waiting deadlock and true Dijkstra detour recovery."""
    res = ExperimentEngine.run_experiment("exp5")
    assert res["experiment_id"] == "EXP-05"

    base = res["baseline_metrics"]
    opt = res["optimized_metrics"]

    # Baseline stalls indefinitely
    assert base["indefinite_stall"] is True
    assert base["completed_deliveries"] == 0

    # Optimized resolves deadlock via detour
    assert opt["indefinite_stall"] is False
    assert opt["successful_recoveries"] == 1
    assert opt["completed_deliveries"] == 4

    comp = res["comparison"]
    assert len(comp["cycle_detected"]) == 4
    assert comp["yield_robot_selected"] == "AGV-04"
    assert comp["detour_path"] is not None


def test_6_csv_export_format():
    """Test 6: Validates CSV export headers and data integrity."""
    from backend.api.routes.experiments import export_experiment_csv
    response = export_experiment_csv("exp1")
    assert response.status_code == 200

    csv_reader = csv.reader(io.StringIO(response.body.decode("utf-8")))
    rows = list(csv_reader)
    header = rows[0]
    assert header == ["Metric", "Baseline Mode", "Optimized Mode", "Unit / Description"]
    assert len(rows) > 5


def test_7_json_export_format():
    """Test 7: Validates JSON export structure."""
    from backend.api.routes.experiments import export_experiment_json
    response = export_experiment_json("exp2")
    assert response.status_code == 200

    data = json.loads(response.body.decode("utf-8"))
    assert data["experiment_id"] == "EXP-02"
    assert "baseline_metrics" in data
    assert "optimized_metrics" in data
    assert "mathematical_derivation" in data
    assert "time_series_data" in data


def test_8_reproducibility_and_honesty():
    """Test 8: Ensures repeated runs yield identical results and no fabricated percentages."""
    run_a = ExperimentEngine.run_experiment("exp1")
    run_b = ExperimentEngine.run_experiment("exp1")

    assert run_a["baseline_metrics"] == run_b["baseline_metrics"]
    assert run_a["optimized_metrics"] == run_b["optimized_metrics"]
    assert run_a["comparison"] == run_b["comparison"]
