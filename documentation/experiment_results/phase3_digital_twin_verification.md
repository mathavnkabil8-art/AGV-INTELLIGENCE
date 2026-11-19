# AGV Warehouse Digital Twin: Empirical Verification & Test Results

## 1. Simulation Configuration Parameters
- **Grid Dimensions:** 8 × 8 (64 discrete cells)
- **Fleet Size:** 8 Autonomous Guided Vehicles (AGV-01 through AGV-08)
- **Charging Stations:** 4 dedicated inductive bays located at `[(0, 0), (0, 7), (7, 0), (7, 7)]`
- **Storage Locations:** 6 storage bays located at `[(2, 2), (2, 3), (2, 5), (5, 2), (5, 4), (5, 5)]`
- **Movement Model:** 4-directional orthogonal routing (Up, Down, Left, Right)
- **Default Movement Cost:** 1.0 unit per step (Configurable)
- **Initial Fleet State of Charge (SoC):** Staggered from 100% down to 58% across the fleet

---

## 2. Empirical Test Suite Results

Ran automated pytest verification suite (`backend/tests/test_digital_twin.py`):

| Test ID | Test Description | Condition Tested | Result | Measured Metric |
|---|---|---|---|---|
| **TEST-01** | **Robot Movement** | Single-step execution along BFS path | **PASSED** | Position $(0,0) \to (0,1)$, Battery: $100\% \to 99.5\%$, Cost: $1.0$ |
| **TEST-02** | **Obstacle Avoidance** | BFS route generation with linear barrier | **PASSED** | 0 waypoints intersected obstacle cells; Detour length: 6 steps vs 2 Manhattan |
| **TEST-03** | **Destination Changes** | Dynamic target replanning | **PASSED** | Target updated $(2, 2) \to (6, 6)$; Route dynamically recomputed |
| **TEST-04** | **Pause & Resume** | Simulation engine clock state transitions | **PASSED** | Clock halted on pause, resumed cleanly without state loss |
| **TEST-05** | **Reset** | Engine restoration to initial state | **PASSED** | Step count reset $2 \to 0$; Fleet restored to 8 robots at spawn points |
| **TEST-06** | **Multiple Robots** | 8 concurrent AGVs in active corridor traffic | **PASSED** | **0 collisions across 50 consecutive clock ticks** ($\text{Overlap Rate} = 0.00\%$) |
| **TEST-07** | **Invalid Destination** | Out-of-bounds and obstacle target rejection | **PASSED** | Rejected $(8, 8)$ (`ValueError`), $(-1, 3)$ (`ValueError`), $(4, 4)$ (`ValueError`) |

---

## 3. Real Fleet Telemetry Snapshot (Step 0)

```json
{
  "step": 0,
  "is_running": false,
  "fleet_metrics": {
    "active_count": 8,
    "avg_battery": 79.0,
    "total_distance": 0,
    "status_breakdown": {
      "IDLE": 0,
      "MOVING": 8,
      "CHARGING": 0,
      "WAITING": 0,
      "BLOCKED": 0,
      "COMPLETED": 0
    }
  }
}
```

---

## 4. Visual Digital Twin Screenshot
The rendered visual layout artifact is persisted at:
`documentation/screenshots/warehouse_digital_twin_8x8.svg`
