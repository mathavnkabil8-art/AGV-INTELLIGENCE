"""
Module: Graph Theory & Graph Coloring for AGV Routing, Conflict Graphs & Scheduling.

Mathematical Foundations:
- Warehouse Grid Graph G = (V, E):
  V: Set of all accessible warehouse intersection cells (x, y) where cell is not an obstacle.
  E: Set of undirected edges { (u, v) } connecting orthogonal adjacent cells with weight c(u, v).
  Obstacle cells remove all incident edges.
- Conflict Graph G_c = (V_c, E_c):
  V_c: Set of AGV tasks / planned trajectories { T_1, T_2, ..., T_k }.
  E_c: Conflict edges (T_i, T_j) representing mutual incompatibility:
       1. Vertex conflict: pos_i(t) == pos_j(t) at time step t.
       2. Edge swap conflict: pos_i(t) == pos_j(t+1) and pos_i(t+1) == pos_j(t).
       3. Shared restricted resource: destination contention or overlapping dock access.
- Vertex Coloring & Scheduling:
  c: V_c -> {0, 1, ..., P-1} such that (u, v) in E_c ==> c(u) != c(v).
  Colors represent scheduling phases (time windows).
  Chromatic number chi(G_c) <= Delta(G_c) + 1 (Brooks' Theorem upper bound).
"""

from typing import Dict, List, Set, Tuple, Optional, Any
from collections import deque
import networkx as nx


class WarehouseGridGraph:
    """
    Part A: Warehouse Grid Graph G = (V, E).
    Represents navigable warehouse intersections and orthogonal pathways.
    """

    def __init__(self, width: int = 8, height: int = 8, obstacles: Optional[Set[Tuple[int, int]]] = None, default_cost: float = 1.0):
        self.width = width
        self.height = height
        self.obstacles: Set[Tuple[int, int]] = set(obstacles or [])
        self.default_cost = default_cost
        self.graph = self._construct_graph()

    def _construct_graph(self) -> nx.Graph:
        """Constructs unweighted/weighted 4-connected grid graph G = (V, E)."""
        g = nx.Graph()

        # Add all accessible vertices V
        for y in range(self.height):
            for x in range(self.width):
                if (x, y) not in self.obstacles:
                    g.add_node((x, y))

        # Add orthogonal edges E between accessible adjacent vertices
        directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
        for u in list(g.nodes()):
            ux, uy = u
            for dx, dy in directions:
                v = (ux + dx, uy + dy)
                if 0 <= v[0] < self.width and 0 <= v[1] < self.height:
                    if v not in self.obstacles:
                        if not g.has_edge(u, v):
                            g.add_edge(u, v, weight=self.default_cost)

        return g

    def update_obstacles(self, obstacles: Set[Tuple[int, int]]):
        """Updates obstacle set and reconstructs the graph."""
        self.obstacles = set(obstacles)
        self.graph = self._construct_graph()

    def find_shortest_path(self, start: Tuple[int, int], target: Tuple[int, int]) -> Optional[List[Tuple[int, int]]]:
        """Calculates shortest path using BFS (alias for backward compatibility)."""
        return self.find_shortest_path_bfs(start, target)

    def find_shortest_path_bfs(self, start: Tuple[int, int], target: Tuple[int, int]) -> Optional[List[Tuple[int, int]]]:
        """
        Calculates shortest path using Breadth-First Search (BFS).
        Guarantees minimum hop count on unweighted graph.
        """
        if start not in self.graph or target not in self.graph:
            return None
        if start == target:
            return [start]

        queue = deque([start])
        visited = {start: None}

        while queue:
            curr = queue.popleft()
            if curr == target:
                break
            for neighbor in self.graph.neighbors(curr):
                if neighbor not in visited:
                    visited[neighbor] = curr
                    queue.append(neighbor)

        if target not in visited:
            return None

        # Reconstruct path
        path = []
        c = target
        while c is not None:
            path.append(c)
            c = visited[c]
        path.reverse()
        return path

    def find_shortest_path_dijkstra(self, start: Tuple[int, int], target: Tuple[int, int], weight: str = 'weight') -> Optional[Tuple[List[Tuple[int, int]], float]]:
        """
        Calculates shortest weighted path using Dijkstra's algorithm.
        Returns (path, total_cost).
        """
        if start not in self.graph or target not in self.graph:
            return None
        if start == target:
            return ([start], 0.0)

        try:
            length, path = nx.single_source_dijkstra(self.graph, start, target, weight=weight)
            return (path, float(length))
        except nx.NetworkXNoPath:
            return None

    def get_graph_metadata(self) -> Dict[str, Any]:
        """Produces formal graph structural telemetry."""
        nodes = list(self.graph.nodes())
        edges = list(self.graph.edges(data=True))
        degrees = dict(self.graph.degree())
        components = list(nx.connected_components(self.graph))

        return {
            "num_vertices": len(nodes),
            "num_edges": len(edges),
            "is_connected": len(components) <= 1,
            "connected_components_count": len(components),
            "max_degree": max(degrees.values()) if degrees else 0,
            "average_degree": round(sum(degrees.values()) / max(1, len(degrees)), 2),
            "nodes": [list(n) for n in nodes],
            "edges": [{"u": list(u), "v": list(v), "weight": d.get("weight", 1.0)} for u, v, d in edges],
            "disconnected_components": [list(list(n) for n in comp) for comp in components if len(comp) < len(nodes)]
        }


# Backward-compatible alias
GraphRouter = WarehouseGridGraph


class ConflictGraphEngine:
    """
    Part B & C: Conflict Graph G_c = (V_c, E_c) and Greedy Graph Coloring.
    Detects vertex collisions, edge swap conflicts, and resource contention,
    then applies graph coloring to establish conflict-free scheduling phases.
    """

    COLORING_STRATEGIES = [
        "largest_first",          # Welsh-Powell algorithm (sort by descending degree)
        "smallest_last",          # Matula-Beck algorithm
        "random_sequential",      # Random vertex ordering
        "connected_sequential_bfs", # Breadth-first search tree ordering
        "independent_set",        # Successive maximal independent sets
    ]

    @staticmethod
    def detect_spatio_temporal_conflicts(
        trajectories: Dict[str, List[Tuple[int, int]]],
        destinations: Optional[Dict[str, Tuple[int, int]]] = None
    ) -> List[Dict[str, Any]]:
        """
        Detects all spatio-temporal interference across planned multi-agent trajectories:
        1. Vertex conflict: simultaneous cell occupancy at tick t.
        2. Edge swap conflict: opposite-direction traversal of same edge at tick t.
        3. Shared restricted resource: destination contention.
        """
        conflicts = []
        agv_ids = list(trajectories.keys())
        n = len(agv_ids)

        for i in range(n):
            for j in range(i + 1, n):
                id1, id2 = agv_ids[i], agv_ids[j]
                path1, path2 = trajectories[id1], trajectories[id2]
                max_t = max(len(path1), len(path2))

                for t in range(max_t):
                    pos1 = path1[min(t, len(path1) - 1)]
                    pos2 = path2[min(t, len(path2) - 1)]

                    # Condition 1: Vertex collision (simultaneous cell occupancy)
                    if pos1 == pos2:
                        conflicts.append({
                            "agv1": id1,
                            "agv2": id2,
                            "time_step": t,
                            "conflict_type": "VERTEX_COLLISION",
                            "location": list(pos1),
                            "description": f"{id1} and {id2} occupy cell ({pos1[0]}, {pos1[1]}) simultaneously at tick {t}."
                        })

                    # Condition 2: Edge swap collision (crossing adjacent cells in opposite directions)
                    if t > 0:
                        prev1 = path1[min(t - 1, len(path1) - 1)]
                        prev2 = path2[min(t - 1, len(path2) - 1)]
                        if pos1 == prev2 and pos2 == prev1 and pos1 != pos2:
                            conflicts.append({
                                "agv1": id1,
                                "agv2": id2,
                                "time_step": t,
                                "conflict_type": "EDGE_SWAP_COLLISION",
                                "location": [list(prev1), list(pos1)],
                                "description": f"{id1} ({prev1}->{pos1}) and {id2} ({prev2}->{pos2}) cross opposite directions at tick {t}."
                            })

                # Condition 3: Shared restricted resource / destination contention
                if destinations and id1 in destinations and id2 in destinations:
                    dest1 = destinations[id1]
                    dest2 = destinations[id2]
                    if dest1 == dest2:
                        conflicts.append({
                            "agv1": id1,
                            "agv2": id2,
                            "time_step": max_t,
                            "conflict_type": "RESOURCE_CONTENTION",
                            "location": list(dest1),
                            "description": f"{id1} and {id2} contend for identical target/dock resource ({dest1[0]}, {dest1[1]})."
                        })

        return conflicts

    @classmethod
    def build_conflict_graph(
        cls,
        trajectories: Dict[str, List[Tuple[int, int]]],
        destinations: Optional[Dict[str, Tuple[int, int]]] = None
    ) -> Tuple[nx.Graph, List[Dict[str, Any]]]:
        """
        Constructs G_c = (V_c, E_c).
        Vertices: AGV tasks.
        Edges: Pairwise conflicts.
        """
        cg = nx.Graph()
        for agv_id in trajectories.keys():
            cg.add_node(agv_id)

        conflicts = cls.detect_spatio_temporal_conflicts(trajectories, destinations)
        for c in conflicts:
            cg.add_edge(c["agv1"], c["agv2"], conflict_type=c["conflict_type"])

        return cg, conflicts

    @classmethod
    def compute_graph_coloring(
        cls,
        trajectories: Dict[str, List[Tuple[int, int]]],
        strategy: str = "largest_first",
        destinations: Optional[Dict[str, Tuple[int, int]]] = None
    ) -> Dict[str, Any]:
        """
        Constructs G_c and executes greedy vertex coloring using specified strategy.
        Assigns scheduling phases (Color 0, Color 1, ...).
        Returns full graph telemetry, coloring map, chromatic upper bound, and conflict audit.
        """
        if strategy not in cls.COLORING_STRATEGIES:
            strategy = "largest_first"

        cg, conflicts = cls.build_conflict_graph(trajectories, destinations)

        # Execute greedy coloring with NetworkX
        coloring: Dict[str, int] = {}
        if len(cg.nodes()) > 0:
            coloring = nx.coloring.greedy_color(cg, strategy=strategy)

        num_colors = (max(coloring.values()) + 1) if coloring else 0
        degrees = dict(cg.degree())
        max_deg = max(degrees.values()) if degrees else 0
        # Brooks' Theorem Upper Bound: chi(G) <= Delta(G) + 1
        brooks_bound = max_deg + 1

        # Group AGVs by scheduling phase
        phases: Dict[int, List[str]] = {}
        for agv_id, color in coloring.items():
            phases.setdefault(color, []).append(agv_id)

        # Step-by-step coloring breakdown for explanation
        coloring_steps = []
        # Sort nodes by coloring strategy order for inspection
        sorted_nodes = sorted(cg.nodes(), key=lambda n: (-degrees.get(n, 0), n))
        for node in sorted_nodes:
            assigned_color = coloring.get(node, 0)
            neighbor_colors = {coloring[neighbor] for neighbor in cg.neighbors(node) if neighbor in coloring}
            coloring_steps.append({
                "vertex": node,
                "degree": degrees.get(node, 0),
                "neighbors": list(cg.neighbors(node)),
                "neighbor_colors_prohibited": sorted(list(neighbor_colors)),
                "assigned_color": assigned_color,
                "phase_name": f"Phase {assigned_color}"
            })

        return {
            "strategy": strategy,
            "nodes": list(cg.nodes()),
            "edges": [{"u": u, "v": v} for u, v in cg.edges()],
            "conflicts": conflicts,
            "total_conflicts": len(conflicts),
            "coloring": coloring,
            "num_colors_used": num_colors,
            "max_degree_delta": max_deg,
            "brooks_upper_bound": brooks_bound,
            "scheduling_phases": {f"Phase {k}": v for k, v in sorted(phases.items())},
            "coloring_steps": coloring_steps,
            "mathematical_disclaimer": (
                "IMPORTANT: Graph coloring is a scheduling aid. It partitions conflicting tasks into "
                "discrete execution phases, but does not automatically guarantee deadlock freedom or "
                "collision-free execution unless spatial and temporal cell reservations are also enforced."
            )
        }


# Backward-compatible wrapper
class ConflictGraphColoring:
    @staticmethod
    def detect_conflicts(trajectories: Dict[str, List[Tuple[int, int]]]) -> List[Tuple[str, str, int, str]]:
        raw = ConflictGraphEngine.detect_spatio_temporal_conflicts(trajectories)
        return [(c["agv1"], c["agv2"], c["time_step"], c["conflict_type"]) for c in raw]

    @classmethod
    def build_conflict_graph(cls, trajectories: Dict[str, List[Tuple[int, int]]]) -> nx.Graph:
        cg, _ = ConflictGraphEngine.build_conflict_graph(trajectories)
        return cg

    @classmethod
    def allocate_time_slots(cls, trajectories: Dict[str, List[Tuple[int, int]]]) -> Dict[str, int]:
        result = ConflictGraphEngine.compute_graph_coloring(trajectories, strategy="largest_first")
        return result["coloring"]
