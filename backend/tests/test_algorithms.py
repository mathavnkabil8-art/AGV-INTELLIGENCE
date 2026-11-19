"""
Independent Unit Tests for Discrete Mathematics and Graph Theory Algorithms.
"""

import networkx as nx
from backend.algorithms.graph_routing import GraphRouter, ConflictGraphColoring
from backend.algorithms.rook_polynomial import RookPolynomialEngine
from backend.algorithms.generating_functions import GeneratingFunctionEngine
from backend.algorithms.deadlock_detection import DeadlockDetector
from backend.algorithms.optimization import FleetOptimizer


# 1. Graph Routing & A* Search
def test_graph_router_shortest_path():
    router = GraphRouter(width=5, height=5, obstacles={(2, 1), (2, 2), (2, 3)})
    path = router.find_shortest_path((1, 2), (3, 2))
    assert path is not None
    assert path[0] == (1, 2)
    assert path[-1] == (3, 2)
    # Ensure path goes around obstacles
    for p in path:
        assert p not in router.obstacles


# 2. Conflict Graph & Vertex Coloring
def test_conflict_graph_coloring():
    # AGV 1 and AGV 2 cross paths at step 2
    trajectories = {
        "AGV_1": [(0, 0), (0, 1), (0, 2), (0, 3)],
        "AGV_2": [(1, 2), (0, 2), (0, 1), (0, 0)]
    }
    conflicts = ConflictGraphColoring.detect_conflicts(trajectories)
    assert len(conflicts) > 0

    cg = ConflictGraphColoring.build_conflict_graph(trajectories)
    assert cg.has_edge("AGV_1", "AGV_2")

    coloring = ConflictGraphColoring.allocate_time_slots(trajectories)
    assert coloring["AGV_1"] != coloring["AGV_2"]


# 3. Rook Polynomial & Principle of Inclusion-Exclusion
def test_rook_polynomial_and_pie():
    # 3 AGVs and 3 Docks with forbidden diagonal matching (derangement)
    forbidden = {(0, 0), (1, 1), (2, 2)}
    engine = RookPolynomialEngine(num_agvs=3, num_destinations=3, forbidden_cells=forbidden)
    
    coeffs = engine.calculate_rook_coefficients()
    # For 3x3 diagonal: r_0=1, r_1=3, r_2=3, r_3=1 -> (1 + x)^3
    assert coeffs == [1, 3, 3, 1]

    # Derangement of 3 elements: !3 = 2
    pie_count = engine.count_valid_assignments_via_pie()
    assert pie_count == 2

    explicit = engine.get_explicit_valid_assignments()
    assert len(explicit) == 2


# 4. Generating Functions for Energy Distribution
def test_generating_functions():
    engine = GeneratingFunctionEngine()
    # 2 AGVs each needing between 1 and 3 units of energy
    bounds = [(1, 3), (1, 3)]
    
    # Polynomial: (x + x^2 + x^3)^2 = x^2 + 2x^3 + 3x^4 + 2x^5 + x^6
    gf = engine.build_allocation_gf(bounds)
    assert gf is not None

    # Ways to distribute 4 units: (1+3, 2+2, 3+1) -> 3 ways
    ways = engine.count_allocations(total_energy=4, bounds=bounds)
    assert ways == 3

    # Ways to distribute 2 units: (1+1) -> 1 way
    assert engine.count_allocations(total_energy=2, bounds=bounds) == 1


# 5. Deadlock Detection (Wait-For Graph)
def test_deadlock_detection():
    # Circular wait: AGV_1 wants (1, 1) held by AGV_2; AGV_2 wants (0, 0) held by AGV_1
    positions = {"AGV_1": (0, 0), "AGV_2": (1, 1)}
    desired = {"AGV_1": (1, 1), "AGV_2": (0, 0)}

    wfg = DeadlockDetector.build_wait_for_graph(positions, desired)
    assert wfg.has_edge("AGV_1", "AGV_2")
    assert wfg.has_edge("AGV_2", "AGV_1")

    cycles = DeadlockDetector.find_deadlock_cycles(wfg)
    assert len(cycles) == 1
    assert set(cycles[0]) == {"AGV_1", "AGV_2"}

    # Resolving yield agent
    priorities = {"AGV_1": 1.0, "AGV_2": 2.5}
    yield_agv = DeadlockDetector.suggest_yield_agent(cycles[0], priorities)
    assert yield_agv == "AGV_1"


# 6. Fleet Optimization (Bipartite Matching)
def test_fleet_optimizer():
    agvs = [
        {"id": "A1", "position": (0, 0), "battery": 15.0},
        {"id": "A2", "position": (10, 10), "battery": 90.0}
    ]
    chargers = [(0, 1), (10, 9)]
    
    matching = FleetOptimizer.match_agvs_to_chargers(agvs, chargers)
    assert len(matching) == 2
    match_dict = {m[0]: m[1] for m in matching}
    assert match_dict["A1"] == (0, 1)
    assert match_dict["A2"] == (10, 9)
