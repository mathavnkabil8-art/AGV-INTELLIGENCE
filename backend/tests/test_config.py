"""Tests for Central Configuration."""
from backend.config import settings


def test_warehouse_config():
    assert settings.warehouse.grid_width >= 4
    assert settings.warehouse.grid_height >= 4
    assert len(settings.warehouse.charging_stations) >= 2
    assert len(settings.warehouse.obstacle_cells) > 0


def test_fleet_config():
    assert settings.fleet.robot_count >= 1
    assert settings.fleet.low_battery_threshold > settings.fleet.critical_battery_threshold


def test_simulation_config():
    assert settings.simulation.tick_interval_ms > 0
    assert settings.simulation.max_simulation_steps > 0
