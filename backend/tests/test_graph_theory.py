"""
Independent Unit Tests for Module 3: Graph Theory & Graph Coloring.

Verifies:
1. Two independent routes (disjoint paths, 0 conflicts, 1 color).
2. Two intersecting routes (shared cell or swap, conflict edge, 2 colors).
3. Multiple conflicting routes (complete or dense conflict graph).
4. Disconnected warehouse sections (unreachable targets).
5. Obstacles (incident edges removed, routes detour).
6. Empty conflict graph (0 active tasks).
7. Multiple graph coloring strategies (largest_first, smallest_last, etc.).
"""

import pytest
import networkx as nx
from backend.algorithms.graph_routing import WarehouseGridGraph, ConflictGraphEngine


# -------------------------------------------------------------
# TEST 1: Two Independent Routes
# -------------------------------------------------------------
def test_1_two_independent_routes():
    """Two completely disjoint routes that never share a cell or edge at the same time."""
    trajectories = {
        "AGV-01": [(0, 0), (0, 1), (0, 2), (0, 3)],
        "AGV-02": [(7, 7), (7, 6), (7, 5), (7, 4)]
    }

    conflicts = ConflictGraphEngine.detect_spatio_temporal_conflicts(trajectories)
    assert len(conflicts) == 0, "Independent routes should have zero conflicts."

    cg, _ = ConflictGraphEngine.build_conflict_graph(trajectories)
    assert len(cg.nodes()) == 2
    assert len(cg.edges()) == 0, "No conflict edge should exist between independent routes."

    result = ConflictGraphEngine.compute_graph_coloring(trajectories, strategy="largest_first")
    assert result["num_colors_used"] == 1, "Disjoint independent routes require only 1 color phase."
    # Both can run in the same phase
    assert result["coloring"]["AGV-01"] == result["coloring"]["AGV-02"]


# -------------------------------------------------------------
# TEST 2: Two Intersecting Routes
# -------------------------------------------------------------
def test_2_two_intersecting_routes():
    """Two routes intersecting at cell (3, 3) at step t=3."""
    trajectories = {
        # Horizontal traversal: enters (3,3) at t=3
        "AGV-H": [(0, 3), (1, 3), (2, 3), (3, 3), (4, 3)],
        # Vertical traversal: enters (3,3) at t=3
        "AGV-V": [(3, 0), (3, 1), (3, 2), (3, 3), (3, 4)]
    }

    conflicts = ConflictGraphEngine.detect_spatio_temporal_conflicts(trajectories)
    assert len(conflicts) >= 1
    vertex_conflicts = [c for c in conflicts if c["conflict_type"] == "VERTEX_COLLISION"]
    assert len(vertex_conflicts) == 1
    assert vertex_conflicts[0]["time_step"] == 3
    assert vertex_conflicts[0]["location"] == [3, 3]

    result = ConflictGraphEngine.compute_graph_coloring(trajectories, strategy="largest_first")
    assert result["num_colors_used"] == 2, "Intersecting routes must be assigned distinct colors (2 phases)."
    assert result["coloring"]["AGV-H"] != result["coloring"]["AGV-V"]


# -------------------------------------------------------------
# TEST 3: Multiple Conflicting Routes
# -------------------------------------------------------------
def test_3_multiple_conflicting_routes():
    """3 AGVs all attempting to occupy central cell (4, 4) at step 2 -> K_3 complete conflict graph."""
    trajectories = {
        "AGV-A": [(2, 4), (3, 4), (4, 4)],
        "AGV-B": [(4, 2), (4, 3), (4, 4)],
        "AGV-C": [(6, 4), (5, 4), (4, 4)]
    }

    cg, conflicts = ConflictGraphEngine.build_conflict_graph(trajectories)
    # Complete graph K_3 has 3 nodes and 3 edges
    assert len(cg.nodes()) == 3
    assert len(cg.edges()) == 3
    assert cg.has_edge("AGV-A", "AGV-B")
    assert cg.has_edge("AGV-B", "AGV-C")
    assert cg.has_edge("AGV-A", "AGV-C")

    result = ConflictGraphEngine.compute_graph_coloring(trajectories, strategy="largest_first")
    # Chromatic number of K_3 is 3
    assert result["num_colors_used"] == 3
    colors = set(result["coloring"].values())
    assert len(colors) == 3, "Each agent in K_3 conflict cluster must be in a distinct phase."


# -------------------------------------------------------------
# TEST 4: Disconnected Warehouse Sections
# -------------------------------------------------------------
def test_4_disconnected_warehouse_sections():
    """Wall of obstacles spanning entire column x=4, splitting the 8x8 grid into two components."""
    # Obstacles from (4, 0) to (4, 7)
    wall = {(4, y) for y in range(8)}
    grid_graph = WarehouseGridGraph(width=8, height=8, obstacles=wall)

    meta = grid_graph.get_graph_metadata()
    assert meta["is_connected"] is False, "Wall of obstacles must disconnect the graph."
    assert meta["connected_components_count"] == 2

    # Path from left side (0, 0) to right side (7, 7) must fail
    bfs_path = grid_graph.find_shortest_path_bfs((0, 0), (7, 7))
    assert bfs_path is None, "BFS must report None across disconnected sections."

    dijkstra_res = grid_graph.find_shortest_path_dijkstra((0, 0), (7, 7))
    assert dijkstra_res is None, "Dijkstra must report None across disconnected sections."


# -------------------------------------------------------------
# TEST 5: Obstacles and Detours
# -------------------------------------------------------------
def test_5_obstacles_and_detour():
    """Obstacle blocks direct path; shortest path detours around it."""
    # Direct path from (1, 1) to (3, 1) has (2, 1) blocked
    grid_graph = WarehouseGridGraph(width=8, height=8, obstacles={(2, 1)})
    
    # Vertices must not contain (2, 1)
    assert (2, 1) not in grid_graph.graph.nodes()
    
    path = grid_graph.find_shortest_path_bfs((1, 1), (3, 1))
    assert path is not None
    assert (2, 1) not in path, "Path must not cross obstacle cell (2, 1)."
    assert path[0] == (1, 1)
    assert path[-1] == (3, 1)
    # Detour must be at least 4 hops (e.g. (1,1)->(1,2)->(2,2)->(3,2)->(3,1))
    assert len(path) - 1 > 2


# -------------------------------------------------------------
# TEST 6: Empty Conflict Graph
# -------------------------------------------------------------
def test_6_empty_conflict_graph():
    """Empty trajectories or 0 active tasks produces an empty conflict graph."""
    result = ConflictGraphEngine.compute_graph_coloring({})
    assert result["num_colors_used"] == 0
    assert len(result["nodes"]) == 0
    assert len(result["edges"]) == 0
    assert result["total_conflicts"] == 0


# -------------------------------------------------------------
# TEST 7: Graph Coloring Strategies Verification
# -------------------------------------------------------------
def test_7_coloring_strategies():
    """Tests various greedy coloring strategies on a conflict graph."""
    trajectories = {
        "AGV-1": [(0, 0), (0, 1), (0, 2)],
        "AGV-2": [(1, 1), (0, 1), (0, 2)],
        "AGV-3": [(0, 2), (1, 2), (2, 2)],
        "AGV-4": [(7, 7), (7, 6)]
    }

    for strategy in ConflictGraphEngine.COLORING_STRATEGIES:
        res = ConflictGraphEngine.compute_graph_coloring(trajectories, strategy=strategy)
        coloring = res["coloring"]
        cg, _ = ConflictGraphEngine.build_conflict_graph(trajectories)

        # Mathematical verification: Adjacent vertices must have distinct colors
        for u, v in cg.edges():
            assert coloring[u] != coloring[v], (
                f"Strategy {strategy} failed validity: adjacent nodes {u} and {v} have same color {coloring[u]}."
            )
        # Upper bound: colors used <= max degree + 1
        assert res["num_colors_used"] <= res["brooks_upper_bound"]


# -------------------------------------------------------------
# TEST 8: Grid Vertices and Edges Generation (8x8 Graph)
# -------------------------------------------------------------
def test_8_grid_vertices_and_edges_generation():
    """
    Test 8: Exact Vertex and Edge generation for 8x8 Planar Grid Graph.
    Empty 8x8 grid has:
      |V| = 8 * 8 = 64 vertices.
      |E| = 2 * 8 * (8 - 1) = 112 edges.
    Corners (0,0), (0,7), (7,0), (7,7) have degree 2.
    Boundary edges have degree 3.
    Interior vertices have degree 4.
    With k obstacles, |V| = 64 - k and incident edges are removed.
    """
    empty_grid = WarehouseGridGraph(width=8, height=8, obstacles=set())
    assert len(empty_grid.graph.nodes()) == 64
    assert len(empty_grid.graph.edges()) == 112

    # Verify corner vertex degrees
    for corner in [(0, 0), (0, 7), (7, 0), (7, 7)]:
        assert empty_grid.graph.degree(corner) == 2

    # Verify interior vertex degree
    assert empty_grid.graph.degree((3, 3)) == 4

    # Verify boundary non-corner degree
    assert empty_grid.graph.degree((0, 3)) == 3
    assert empty_grid.graph.degree((3, 0)) == 3

    # Add 4 obstacles
    obstacles = {(2, 2), (2, 3), (3, 2), (3, 3)}
    obstacle_grid = WarehouseGridGraph(width=8, height=8, obstacles=obstacles)
    assert len(obstacle_grid.graph.nodes()) == 64 - 4
    for obs in obstacles:
        assert obs not in obstacle_grid.graph.nodes()
        # Ensure no edge contains an obstacle
        for u, v in obstacle_grid.graph.edges():
            assert u != obs and v != obs
