# Phase 7 Verification Report: Integrated AGV Optimization Controller & Deadlock Engine

**Project Title:** AGV Intelligence – Mathematical Modelling and Optimization of Autonomous Guided Vehicle Traffic Routing and Smart Charging in Automated Warehouses  
**Course:** Discrete Mathematics and Graph Theory  
**Phase:** 7 – Integrated AGV Optimization Controller, Spatio-Temporal Reservations, Wait-For Graph Deadlocks, and Multi-Objective Function $Z$  
**Timestamp:** 2026-11-09T12:37:00+05:30  
**Test Suite:** `backend/tests/test_integrated_optimization.py`  

---

## 1. Executive Summary & Architectural Overview

Phase 7 realizes the comprehensive, unified orchestration layer of the AGV Intelligence system. It connects all previously developed mathematical disciplines:
1. **Warehouse Graph Theory $G = (V, E)$:** Planar grid graph with Manhattan shortest-path routing (BFS/Dijkstra).
2. **Conflict Graph $G_c = (V_c, E_c)$ & Greedy Graph Coloring:** Chromatic phase scheduling satisfying Brooks' Theorem $\chi(G_c) \le \Delta(G_c) + 1$.
3. **Rook Polynomials & Inclusion-Exclusion:** Exact one-to-one robot-to-charger matching under clearance constraints ($R(x, B)$ and derangements).
4. **Ordinary Generating Functions (OGFs):** Exact integer power distribution using negative binomial formal power series ($[x^{100}] G(x) = \binom{43}{3} = 12,341$).
5. **Directed Wait-For Graph (WFG) & True Route Replanning:** Real-time deadlock cycle detection ($D = (V_A, E_W)$) and physical Dijkstra detour replanning without artificial edge deletion.
6. **Spatio-Temporal Reservation Table:** Guarantees zero vertex collisions, zero edge swap collisions, and zero unauthorized dock claims across continuous discrete ticks.
7. **Multi-Objective Cost Minimization:** Configurable objective function:
   $$\min Z = \alpha \cdot T + \beta \cdot C + \gamma \cdot E + \delta \cdot W$$

---

## 2. Multi-Objective Cost Formulation & Weights

$$\min Z = \alpha \cdot T + \beta \cdot C + \gamma \cdot E + \delta \cdot W$$
Where:
- $T$: Total travel distance / hops across all planned routes.
- $C$: Total spatio-temporal route conflicts (edges in $G_c$).
- $E$: Total estimated energy consumed ($0.2\text{ kWh/hop} + 0.1\text{ kWh base idle}$).
- $W$: Total waiting time (stalled ticks and phase delay offsets).
- Default weights: $\alpha = 1.0, \beta = 5.0, \gamma = 0.5, \delta = 2.0$.

### Note on Optimality & Honest Academic Limitations
> [!NOTE]
> Global multi-agent path finding (MAPF) and chromatic optimization are known to be **NP-hard**. The integrated controller applies transparent, polynomial-time heuristics:
> - Shortest-path routing via Dijkstra / BFS.
> - Vertex coloring via Welsh-Powell largest-first degree heuristic.
> - Deadlock recovery via prioritized single-agent detour routing.
> 
> Global Pareto optimality across all concurrent dimensions is not claimed unless mathematically proven for specific constrained instances.

---

## 3. End-to-End 12-Step Optimization Pipeline

1. **Mission Ingestion:** Ingests active AGV locations, battery levels, and warehouse targets.
2. **Graph Construction:** Builds 4-connected planar grid graph $G = (V, E)$, pruning obstacle cells.
3. **Shortest-Path Trajectories:** Computes initial BFS/Dijkstra shortest paths for each AGV.
4. **Spatio-Temporal Reservations:** Populates `ReservationTable` for cells $(t, x, y)$, directed edges $(t, u, v)$, and dock positions.
5. **Conflict Graph $G_c$:** Identifies vertex collisions, opposite-direction edge swaps, and resource contention.
6. **Greedy Graph Coloring:** Partitions trajectories into conflict-free temporal scheduling phases.
7. **Battery Telemetry Check:** Identifies AGVs requiring immediate recharge ($< 40\%$).
8. **Rook Polynomial Dock Matching:** Solves restricted bipartite matching using $R(x, B)$ and PIE.
9. **OGF Backup Energy Distribution:** Calculates exact power partitions via negative binomial coefficients ($C(43, 3) = 12,341$).
10. **Deadlock Detection:** Constructs Wait-For Graph $D = (V_A, E_W)$ and detects directed simple cycles.
11. **Physical Detour Recovery:** Detours the lowest-priority yielding robot around the blockage using Dijkstra without fake edge deletion.
12. **Objective Scoring:** Evaluates multi-objective function $Z = \alpha T + \beta C + \gamma E + \delta W$.

---

## 4. Test Suite Execution Results

Command executed:
```bash
python -m pytest backend/tests/test_integrated_optimization.py -v
```

Output:
```text
============================= test session starts =============================
platform win32 -- Python 3.13.5, pytest-8.3.4, pluggy-1.6.0
rootdir: E:\semester 3\discrete mathematics and graph theory\AGV-INTELLIGENCE
collected 9 items

backend/tests/test_integrated_optimization.py::test_1_no_conflict_scenario PASSED [ 11%]
backend/tests/test_integrated_optimization.py::test_2_shared_cell_conflict PASSED [ 22%]
backend/tests/test_integrated_optimization.py::test_3_edge_swap_conflict PASSED [ 33%]
backend/tests/test_integrated_optimization.py::test_4_circular_waiting_deadlock PASSED [ 44%]
backend/tests/test_integrated_optimization.py::test_5_incompatible_charging_dock PASSED [ 55%]
backend/tests/test_integrated_optimization.py::test_6_insufficient_backup_energy PASSED [ 66%]
backend/tests/test_integrated_optimization.py::test_7_deadlock_recovery_true_route_replanning PASSED [ 77%]
backend/tests/test_integrated_optimization.py::test_8_configurable_objective_function PASSED [ 88%]
backend/tests/test_integrated_optimization.py::test_9_end_to_end_pipeline PASSED [100%]

============================== 9 passed in 3.12s ==============================
```

Full project test suite:
```text
============================= 53 passed in 5.72s ==============================
```

---

## 5. Artifacts Generated
- Diagram: `documentation/screenshots/integrated_optimization_controller.svg`
