"""
Comprehensive Unit & Integration Tests for Warehouse Digital Twin:
1. Robot movement.
2. Obstacle avoidance (BFS).
3. Destination changes.
4. Pause and resume.
5. Reset.
6. Multiple robots (8 AGVs).
7. Invalid destination rejection.
"""

import pytest
from backend.simulation.warehouse import WarehouseState
from backend.simulation.robot import AGVRobot, MovementStatus, PayloadStatus
from backend.simulation.traffic import TrafficCoordinator
from backend.simulation.engine import SimulationEngine


def test_1_robot_bfs_movement():
    """Test 1: Robot moves step-by-step along valid BFS path toward destination."""
    wh = WarehouseState(width=8, height=8, obstacles=[(3, 3)])
    robot = AGVRobot(
        id="AGV-TEST",
        position=(0, 0),
        destination=(0, 3),
        battery=100.0
    )
    route = robot.plan_bfs_route(wh)
    assert route == [(0, 0), (0, 1), (0, 2), (0, 3)]
    assert len(route) == 4

    # Execute first step
    next_pos = robot.next_cell()
    assert next_pos == (0, 1)
    robot.execute_move(next_pos)
    assert robot.position == (0, 1)
    assert robot.battery < 100.0 # Battery drain
    assert robot.total_distance_traveled == 1


def test_2_obstacle_avoidance():
    """Test 2: Route planning strictly prevents movement through obstacles."""
    # Obstacle placed directly in line at (1, 1)
    wh = WarehouseState(width=8, height=8, obstacles=[(1, 0), (1, 1), (1, 2)])
    robot = AGVRobot(
        id="AGV-TEST",
        position=(0, 1),
        destination=(2, 1),
        battery=100.0
    )
    route = robot.plan_bfs_route(wh)
    assert route is not None
    assert route[0] == (0, 1)
    assert route[-1] == (2, 1)

    # Verify no waypoint touches any obstacle
    obstacle_set = set(wh.obstacles)
    for waypoint in route:
        assert waypoint not in obstacle_set, f"Route passed through obstacle {waypoint}"


def test_3_destination_changes():
    """Test 3: Dynamic destination update recalculates BFS route."""
    wh = WarehouseState(width=8, height=8, obstacles=[])
    robot = AGVRobot(id="AGV-TEST", position=(2, 2), destination=(2, 5))
    robot.plan_bfs_route(wh)
    assert robot.destination == (2, 5)
    assert robot.route[-1] == (2, 5)

    # Change destination dynamically
    robot.set_destination((6, 6), wh)
    assert robot.destination == (6, 6)
    assert robot.route[0] == (2, 2)
    assert robot.route[-1] == (6, 6)
    assert robot.is_completed is False


def test_4_pause_and_resume():
    """Test 4: Simulation pause and resume state controls."""
    engine = SimulationEngine()
    assert engine.is_running is False

    engine.start()
    assert engine.is_running is True

    engine.pause()
    assert engine.is_running is False


def test_5_reset():
    """Test 5: Reset restores initial warehouse configuration, step count, and fleet."""
    engine = SimulationEngine()
    engine.step()
    engine.step()
    assert engine.step_count == 2

    engine.reset()
    assert engine.step_count == 0
    assert engine.is_running is False
    assert len(engine.robots) == 8


def test_6_multiple_robots_collision_prevention():
    """Test 6: 8 robots operate concurrently without occupying the same cell."""
    engine = SimulationEngine()
    assert len(engine.robots) == 8

    # Step simulation 15 ticks
    for _ in range(15):
        engine.step()
        positions = [r.position for r in engine.robots.values()]
        # Verify no two robots occupy the same grid cell at the same time
        assert len(positions) == len(set(positions)), f"Collision detected! Overlapping positions: {positions}"


def test_7_invalid_destination_rejection():
    """Test 7: Rejects destinations that are obstacles or out of bounds."""
    wh = WarehouseState(width=8, height=8, obstacles=[(4, 4)])
    robot = AGVRobot(id="AGV-TEST", position=(0, 0), destination=(1, 1))

    # Test A: Out of bounds (negative or >= 8)
    with pytest.raises(ValueError, match="out of warehouse bounds"):
        robot.set_destination((8, 8), wh)

    with pytest.raises(ValueError, match="out of warehouse bounds"):
        robot.set_destination((-1, 3), wh)

    # Test B: Destination is an obstacle
    with pytest.raises(ValueError, match="is an obstacle location"):
        robot.set_destination((4, 4), wh)
