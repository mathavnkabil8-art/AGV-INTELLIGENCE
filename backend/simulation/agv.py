"""
Backward-compatibility module exposing AGVAgent and AGVStatus mapped to AGVRobot.
"""

from backend.simulation.robot import (
    AGVRobot as AGVAgent,
    MovementStatus as AGVStatus,
    PayloadStatus
)

__all__ = ["AGVAgent", "AGVStatus", "PayloadStatus"]
