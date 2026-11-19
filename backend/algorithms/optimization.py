"""
Module: Mathematical Optimization for AGV Task & Charger Assignment.

Mathematical Foundations:
- Bipartite Matching Problem:
  Let G = (U, V, E) be a bipartite graph where:
    U: AGVs requiring service / charging.
    V: Available charging stations or delivery zones.
    E: Weighted edges (u, v) with weight w(u, v) = Manhattan_Distance(u, v) + Battery_Penalty(u).
- Minimum Weight Bipartite Matching (Assignment Problem / Hungarian Algorithm):
  Find bijection M subset of E minimizing sum_{(u, v) in M} w(u, v).
"""

from typing import Dict, List, Tuple
import numpy as np
import networkx as nx


class FleetOptimizer:
    """Solves multi-agent assignment optimization using bipartite graph matching."""

    @staticmethod
    def calculate_distance_matrix(
        agv_positions: List[Tuple[int, int]],
        target_positions: List[Tuple[int, int]]
    ) -> np.ndarray:
        """Computes Manhattan distance matrix C where C[i, j] = |x_i - x_j| + |y_i - y_j|."""
        n = len(agv_positions)
        m = len(target_positions)
        cost_matrix = np.zeros((n, m), dtype=float)

        for i, (ax, ay) in enumerate(agv_positions):
            for j, (tx, ty) in enumerate(target_positions):
                cost_matrix[i, j] = abs(ax - tx) + abs(ay - ty)

        return cost_matrix

    @classmethod
    def match_agvs_to_chargers(
        cls,
        agvs: List[Dict[str, any]],
        chargers: List[Tuple[int, int]]
    ) -> List[Tuple[str, Tuple[int, int], float]]:
        """
        Solves minimum weight bipartite matching between AGVs with low battery
        and available charging stations.
        Returns list of (agv_id, assigned_charger_coord, assignment_cost).
        """
        if not agvs or not chargers:
            return []

        # Construct bipartite graph in NetworkX
        bipartite_graph = nx.Graph()
        
        for agv in agvs:
            agv_node = f"agv_{agv['id']}"
            bipartite_graph.add_node(agv_node, bipartite=0)
            
            # Weight incorporates Manhattan distance plus battery deficit penalty
            ax, ay = agv["position"]
            battery = agv.get("battery", 100.0)
            urgency_factor = max(0.0, 100.0 - battery) * 0.1

            for j, (cx, cy) in enumerate(chargers):
                charger_node = f"charger_{j}"
                bipartite_graph.add_node(charger_node, bipartite=1)
                
                dist = abs(ax - cx) + abs(ay - cy)
                weight = dist + (10.0 if battery < 20.0 else urgency_factor)
                bipartite_graph.add_edge(agv_node, charger_node, weight=weight)

        # Minimum weight full matching via NetworkX
        matching = nx.algorithms.bipartite.matching.minimum_weight_full_matching(
            bipartite_graph,
            top_nodes=[f"agv_{a['id']}" for a in agvs]
        )

        results = []
        for agv in agvs:
            agv_node = f"agv_{agv['id']}"
            if agv_node in matching:
                charger_node = matching[agv_node]
                charger_idx = int(charger_node.split("_")[1])
                target_coord = chargers[charger_idx]
                cost = bipartite_graph[agv_node][charger_node]["weight"]
                results.append((agv["id"], target_coord, cost))

        return results
