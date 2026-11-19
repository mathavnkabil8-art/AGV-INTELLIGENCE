"""
Module: Deadlock Detection in AGV Multi-Agent Routing using Graph Theory.

Mathematical Foundations:
- Wait-For Graph (WFG) is a directed graph D = (V_A, E_W):
    V_A: Active AGVs.
    E_W: Directed edge (u -> v) exists if AGV u is blocked waiting to enter
         a grid coordinate currently occupied or reserved by AGV v.
- Deadlock Theorem: A system of discrete resource allocations is in a deadlock
  state if and only if the Wait-For Graph contains at least one directed cycle C:
    v_1 -> v_2 -> ... -> v_k -> v_1.
- Analysis via:
  1. Strongly Connected Components (SCC via Tarjan / Kosaraju).
  2. Directed simple cycle enumeration.
  3. Cycle resolution via priority-based yield / detour re-routing.
"""

from typing import Dict, List, Set, Tuple
import networkx as nx


class DeadlockDetector:
    """Constructs and analyzes Wait-For Graphs to detect and isolate circular waits."""

    @staticmethod
    def build_wait_for_graph(
        current_positions: Dict[str, Tuple[int, int]],
        desired_next_cells: Dict[str, Tuple[int, int]]
    ) -> nx.DiGraph:
        """
        Builds directed WFG D = (V, E) where:
        (u -> v) in E iff desired_next_cells[u] == current_positions[v] and u != v.
        """
        wfg = nx.DiGraph()
        for agv_id in current_positions.keys():
            wfg.add_node(agv_id)

        # Inverted index: cell -> occupying AGV
        cell_to_occupant = {pos: agv_id for agv_id, pos in current_positions.items()}

        for agv_u, target_pos in desired_next_cells.items():
            if target_pos in cell_to_occupant:
                agv_v = cell_to_occupant[target_pos]
                if agv_u != agv_v:
                    wfg.add_edge(agv_u, agv_v)

        return wfg

    @classmethod
    def find_deadlock_cycles(cls, wfg: nx.DiGraph) -> List[List[str]]:
        """Returns all simple directed cycles found in the Wait-For Graph."""
        try:
            return list(nx.simple_cycles(wfg))
        except Exception:
            return []

    @classmethod
    def get_strongly_connected_components(cls, wfg: nx.DiGraph) -> List[Set[str]]:
        """
        Identifies strongly connected components with cardinality > 1,
        pinpointing localized deadlocked clusters.
        """
        sccs = list(nx.strongly_connected_components(wfg))
        return [scc for scc in sccs if len(scc) > 1]

    @classmethod
    def suggest_yield_agent(cls, cycle: List[str], priorities: Dict[str, float]) -> str:
        """
        Determines which AGV in a deadlocked cycle should yield / back off,
        selecting the agent with the lowest priority or lowest task criticality.
        """
        if not cycle:
            raise ValueError("Cycle must contain at least one agent.")
        return min(cycle, key=lambda agv_id: priorities.get(agv_id, 0.0))
