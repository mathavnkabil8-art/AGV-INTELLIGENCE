"""
API Endpoints for Phase 8: Experimental Analytics & Performance Evaluation.
"""

from fastapi import APIRouter, HTTPException, Response
from typing import Dict, Any, List
import json
import csv
import io

from backend.simulation.experiments import ExperimentEngine

router = APIRouter(prefix="/experiments", tags=["Experimental Analytics"])


@router.get("")
def list_experiments():
    """Lists all 5 predefined empirical experiments."""
    return list(ExperimentEngine.EXPERIMENT_CATALOG.values())


@router.get("/{experiment_id}")
def get_experiment_evaluation(experiment_id: str):
    """
    Executes and returns performance evaluation for the specified experiment:
    - Baseline vs Optimized metrics
    - Time-series progression
    - Mathematical derivations
    - Aim, Input, Algorithm, Result, and Conclusion documentation
    """
    try:
        return ExperimentEngine.run_experiment(experiment_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{experiment_id}/csv")
def export_experiment_csv(experiment_id: str):
    """Exports experiment comparison data as a downloadable CSV."""
    data = ExperimentEngine.run_experiment(experiment_id)
    base = data["baseline_metrics"]
    opt = data["optimized_metrics"]

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Metric", "Baseline Mode", "Optimized Mode", "Unit / Description"])

    metrics_labels = [
        ("Total Travel Distance", base.get("total_travel_distance"), opt.get("total_travel_distance"), "hops"),
        ("Average Travel Distance", base.get("avg_travel_distance"), opt.get("avg_travel_distance"), "hops/AGV"),
        ("Average Waiting Time", base.get("avg_waiting_time"), opt.get("avg_waiting_time"), "ticks/AGV"),
        ("Route Conflicts Detected", base.get("route_conflicts_detected"), opt.get("route_conflicts_detected"), "conflict edges in G_c"),
        ("Completed Deliveries", base.get("completed_deliveries"), opt.get("completed_deliveries"), "successful missions"),
        ("Deadlocks Detected", base.get("deadlocks_detected"), opt.get("deadlocks_detected"), "WFG directed cycles"),
        ("Successful Recoveries", base.get("successful_recoveries"), opt.get("successful_recoveries"), "Dijkstra physical detours"),
        ("Valid Charging Assignments", base.get("valid_charging_assignments"), opt.get("valid_charging_assignments"), "Rook polynomial PIE count"),
        ("Possible Energy Allocations", base.get("possible_energy_allocations"), opt.get("possible_energy_allocations"), "OGF [x^R] G(x)"),
        ("Actual Collisions Occurred", base.get("actual_collisions_occurred", 0), opt.get("actual_collisions_occurred", 0), "physical cell/edge overlaps"),
    ]

    for label, b_val, o_val, unit in metrics_labels:
        writer.writerow([label, b_val, o_val, unit])

    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={experiment_id}_results.csv"}
    )


@router.get("/{experiment_id}/json")
def export_experiment_json(experiment_id: str):
    """Exports complete experiment telemetry and mathematical derivations as JSON."""
    data = ExperimentEngine.run_experiment(experiment_id)
    return Response(
        content=json.dumps(data, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={experiment_id}_telemetry.json"}
    )
