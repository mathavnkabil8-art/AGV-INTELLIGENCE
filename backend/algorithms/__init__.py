"""
Discrete Mathematics & Graph Theory Algorithm Modules for AGV Intelligence.

Includes:
- Warehouse Grid Graph G = (V, E)
- Conflict Graph G_c = (V_c, E_c) & Greedy Graph Coloring
- Rook Polynomials & Inclusion-Exclusion
- Generating Functions
- Deadlock Detection (Wait-For-Graphs)
- Mathematical Optimization (Bipartite Matching)
"""

from .graph_routing import (
    WarehouseGridGraph,
    ConflictGraphEngine,
    GraphRouter,
    ConflictGraphColoring,
)
from .rook_polynomial import RookPolynomialEngine
from .generating_functions import GeneratingFunctionEngine, BackupEnergyDistributionEngine
from .deadlock_detection import DeadlockDetector
from .optimization import FleetOptimizer
from .integrated_controller import (
    IntegratedOptimizationController,
    ReservationTable,
    DeadlockRecoveryEngine,
    OptimizationWeights,
)

__all__ = [
    "WarehouseGridGraph",
    "ConflictGraphEngine",
    "GraphRouter",
    "ConflictGraphColoring",
    "RookPolynomialEngine",
    "GeneratingFunctionEngine",
    "BackupEnergyDistributionEngine",
    "DeadlockDetector",
    "FleetOptimizer",
    "IntegratedOptimizationController",
    "ReservationTable",
    "DeadlockRecoveryEngine",
    "OptimizationWeights",
]
