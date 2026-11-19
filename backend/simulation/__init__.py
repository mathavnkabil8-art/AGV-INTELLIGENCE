"""
Simulation package: warehouse digital twin, robot fleet, and traffic coordination.
"""

from .warehouse import WarehouseState
from .robot import AGVRobot, MovementStatus, PayloadStatus
from .traffic import TrafficCoordinator
from .engine import SimulationEngine, simulation_engine

# Aliases for backward compatibility
AGVAgent = AGVRobot
AGVStatus = MovementStatus

__all__ = [
    "WarehouseState",
    "AGVRobot",
    "MovementStatus",
    "PayloadStatus",
    "TrafficCoordinator",
    "SimulationEngine",
    "simulation_engine",
    "AGVAgent",
    "AGVStatus",
]
