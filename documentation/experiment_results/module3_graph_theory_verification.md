# Module 3: Graph Theory & Graph Coloring Verification Report

**Project Title:** AGV Intelligence – Mathematical Modelling and Optimization of Autonomous Guided Vehicle Traffic Routing and Smart Charging in Automated Warehouses  
**Course:** Discrete Mathematics and Graph Theory  
**Module:** 3 – Graph Theory and Graph Coloring (Warehouse Grid Graph, Conflict Graph $G_c$, Greedy Vertex Coloring, Brooks' Upper Bound, and Scheduling Phase Allocation)  
**Execution Timestamp:** 2026-11-09T11:28:00+05:30  
**Test Suite:** `backend/tests/test_graph_theory.py` & `backend/tests/test_algorithms.py`  

---

## 1. Executive Summary & Mathematical Rigor

Module 3 models multi-agent warehouse path planning and traffic interference using discrete mathematics and graph theory:
1. **Warehouse Grid Graph $G = (V, E)$**: An undirected 4-connected topology where vertices $V$ represent navigable grid intersections and edges $E$ represent collision-free pathways. Cells occupied by obstacles are pruned from the vertex set along with all incident edges. Shortest paths are evaluated via Breadth-First Search (BFS) and Dijkstra's algorithm.
2. **Conflict Graph $G_c = (V_c, E_c)$**: A conflict graph where each vertex $v_i \in V_c$ models an active AGV planned spatio-temporal route $\tau_i = \{(x_{i,t}, y_{i,t})\}_{t=0}^T$, and an undirected edge $(v_i, v_j) \in E_c$ models physical conflict:
   - **Vertex Collision**: $\exists t : \tau_i(t) = \tau_j(t)$ (simultaneous occupancy of the same cell).
   - **Edge Swap Collision**: $\exists t : \tau_i(t) = \tau_j(t-1) \land \tau_j(t) = \tau_i(t-1)$ (head-on crossing of adjacent cells).
   - **Resource Contention**: Contending for identical terminal docking stations or charging bays.
3. **Greedy Vertex Coloring & Scheduling Phases**: Greedy coloring partitions $V_c$ into independent sets $I_0, I_1, \dots, I_{k-1}$ such that no two adjacent vertices share the same color. Each color class constitutes an asynchronous scheduling phase.
4. **Brooks' Theorem Upper Bound**: $\chi(G_c) \le \Delta(G_c) + 1$, where $\Delta(G_c) = \max_{v \in V_c} \deg(v)$.
5. **Academic Precaution & Disclaimer**: Computing the exact chromatic number $\chi(G)$ is NP-hard. Greedy coloring runs in $O(|V_c| + |E_c|)$ and finds a valid upper bound. Furthermore, **graph coloring is a scheduling aid; it does not automatically guarantee deadlock freedom or collision-free execution unless spatial and temporal reservations are strictly enforced.**

---

## 2. Mathematical Formalism

### 2.1 Warehouse Grid Graph $G = (V, E)$
For grid dimensions $W \times H$ (here $8 \times 8$) and obstacle set $O \subset \{0, \dots, W-1\} \times \{0, \dots, H-1\}$:
$$V = \{(x, y) \in \mathbb{Z}^2 \mid 0 \le x < W,\; 0 \le y < H\} \setminus O$$
$$E = \{(u, v) \subset V \mid \|u - v\|_1 = 1\}$$
- Default unweighted movement cost: $c(e) = 1.0$ for all $e \in E$.
- Dijkstra's edge weight function supports non-uniform traversal resistance: $w(e) \ge 1.0$.

### 2.2 Conflict Graph $G_c = (V_c, E_c)$
For $n$ AGVs with scheduled routes $\tau_1, \tau_2, \dots, \tau_n$:
$$V_c = \{AGV_1, AGV_2, \dots, AGV_n\}$$
$$E_c = \{(AGV_i, AGV_j) \mid \text{Conflict}(\tau_i, \tau_j) = \text{True}\}$$
where:
$$\text{Conflict}(\tau_i, \tau_j) \iff \bigvee_{t} \Big( \tau_i(t) = \tau_j(t) \lor (\tau_i(t) = \tau_j(t-1) \land \tau_j(t) = \tau_i(t-1)) \lor (\text{dest}_i = \text{dest}_j) \Big)$$

### 2.3 Brooks' Theorem and Greedy Coloring
$$\chi(G_c) \le \Delta(G_c) + 1$$
For any connected undirected graph that is neither an odd cycle nor a complete graph $K_n$, Brooks' Theorem guarantees $\chi(G) \le \Delta(G)$. NetworkX greedy coloring provides an empirical coloring $c: V_c \to \{0, 1, \dots, k-1\}$ such that:
$$\forall (u, v) \in E_c, \quad c(u) \neq c(v)$$
Five heuristics are supported and compared:
1. `largest_first` (Welsh-Powell degree heuristic)
2. `smallest_last` (Matula-Beck degeneracy heuristic)
3. `random_sequential`
4. `connected_sequential_bfs`
5. `independent_set`

---

## 3. Test Suite Verification Results

Command executed:
```bash
python -m pytest backend/tests/test_graph_theory.py -v
```

Output:
```text
============================= test session starts =============================
platform win32 -- Python 3.13.5, pytest-8.3.4, pluggy-1.5.0
rootdir: E:\semester 3\discrete mathematics and graph theory\AGV-INTELLIGENCE
configfile: pytest.ini
collected 7 items

backend/tests/test_graph_theory.py::test_grid_graph_bfs_and_dijkstra PASSED [ 14%]
backend/tests/test_graph_theory.py::test_independent_routes_zero_conflicts PASSED [ 28%]
backend/tests/test_graph_theory.py::test_two_intersecting_routes_conflict PASSED [ 42%]
backend/tests/test_graph_theory.py::test_multiple_conflicting_routes_k3 PASSED [ 57%]
backend/tests/test_graph_theory.py::test_disconnected_warehouse_sections PASSED [ 71%]
backend/tests/test_graph_theory.py::test_obstacle_detour_pathfinding PASSED [ 85%]
backend/tests/test_graph_theory.py::test_coloring_strategies_and_brooks_bound PASSED [100%]

============================== 7 passed in 2.46s ==============================
```

All 25 unit tests across the entire application pass cleanly (`python -m pytest backend/tests -q`).

---

## 4. API Endpoints Verified

| Method | Endpoint | Description | Status |
|---|---|---|---|
| `GET` | `/api/algorithms/grid-graph` | Structural metadata of $G=(V, E)$, $|V|$, $|E|$, degrees, components | Verified 200 OK |
| `POST` | `/api/algorithms/grid-graph/path` | BFS and Dijkstra path computation between arbitrary $(x_1, y_1)$ and $(x_2, y_2)$ | Verified 200 OK |
| `GET` | `/api/algorithms/conflict-graph` | Conflict graph $G_c$ and greedy coloring with strategy parameter on fleet routes | Verified 200 OK |
| `POST` | `/api/algorithms/conflict-graph/custom` | Evaluates multi-agent conflicts and chromatic phases on custom user trajectories | Verified 200 OK |

---

## 5. Artifacts & Visual Diagrams Generated

1. `documentation/screenshots/grid_graph_module3.svg`  
   - Visualizes the 8x8 undirected 4-connected grid graph $G=(V, E)$, pruned obstacle nodes, and BFS shortest path trajectory.
2. `documentation/screenshots/conflict_graph_module3.svg`  
   - Visualizes conflict graph $G_c=(V_c, E_c)$, circular layout, chromatic phase badges, Brooks' bound audit, and academic disclaimer.
