"""Tests for Health Check and System Diagnostics."""
from backend.api.routes.health import get_health_status
from backend.main import app, root


def test_health_check_function():
    data = get_health_status()
    assert data["status"] == "healthy"
    assert "uptime_seconds" in data
    assert "modules" in data
    assert data["modules"]["graph_routing"] == "ACTIVE"
    assert data["modules"]["rook_polynomial"] == "ACTIVE"


def test_routes_registered():
    route_paths = [route.path for route in app.routes]
    assert "/api/health" in route_paths
    assert "/api/warehouse/layout" in route_paths
    assert "/api/simulation/state" in route_paths
    assert "/api/algorithms/rook-polynomial" in route_paths
    assert "/api/experiments" in route_paths


def test_root_endpoint():
    data = root()
    assert "routes" in data
    assert "experiments" in data["routes"]
    assert data["routes"]["experiments"] == "/api/experiments"
