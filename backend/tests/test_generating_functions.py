"""
Comprehensive Unit Tests for Module: Ordinary Generating Functions for Backup Energy Distribution.

Test Cases:
1. Default benchmark: n=4, R=100 kWh, m=15 kWh -> C(43, 3) = 12341.
2. Minimum possible energy: R = n * m -> C(n-1, n-1) = 1.
3. Insufficient energy: R < n * m -> 0 allocations (Critical deficit).
4. One charging bay: n=1 boundary conditions.
5. Multiple charging bay configurations (n=2, 3, 5).
6. Varying minimum reserve requirements (m=0, 5, 20).
7. Energy allocation unit scaling (unit=5 kWh).
8. Input validation and error handling (indivisible units, negative values, 0 bays).
9. Exact equivalence between combinatorial formula and SymPy formal series expansion.
10. Backtracking enumeration ground-truth verification on small configurations.
"""

import pytest
import math
from backend.algorithms.generating_functions import (
    BackupEnergyDistributionEngine,
    GeneratingFunctionEngine,
)


def test_1_default_benchmark_12341():
    """
    Test 1: Official University Project Benchmark.
    n = 4 charging bays
    R = 100 kWh total backup energy
    m = 15 kWh minimum reserve per bay
    unit = 1 kWh
    R' = 100 - 4*15 = 40 kWh
    Expected coefficient: C(40 + 4 - 1, 4 - 1) = C(43, 3) = 12341.
    """
    engine = BackupEnergyDistributionEngine(num_bays=4, total_energy=100, min_reserve=15, unit=1)

    assert engine.is_feasible is True
    assert engine.remaining_energy == 40
    assert engine.combined_min_reserve == 60

    # Combinatorial formula: C(43, 3)
    exact_count = engine.calculate_exact_allocations()
    assert exact_count == 12341
    assert exact_count == math.comb(43, 3)

    # SymPy symbolic verification
    sympy_check = engine.verify_with_sympy()
    assert sympy_check["verified"] is True
    assert sympy_check["sympy_coefficient"] == 12341

    # Derivation terms check
    derivation = engine.get_derivation_steps()
    assert derivation["numerator_term"] == 43
    assert derivation["denominator_term"] == 3
    assert derivation["binomial_expression"] == "C(43, 3)"


def test_2_minimum_possible_energy():
    """
    Test 2: Exactly enough energy for minimum reserves (R = n * m = 60 kWh).
    R' = 0 kWh.
    Expected: C(0 + 3, 3) = C(3, 3) = 1 allocation ([15, 15, 15, 15]).
    """
    engine = BackupEnergyDistributionEngine(num_bays=4, total_energy=60, min_reserve=15, unit=1)

    assert engine.is_feasible is True
    assert engine.remaining_energy == 0
    assert engine.calculate_exact_allocations() == 1

    allocations = engine.enumerate_allocations(max_limit=10)
    assert len(allocations) == 1
    assert allocations[0]["physical_kwh"] == [15, 15, 15, 15]


def test_3_insufficient_energy_deficit():
    """
    Test 3: Total energy is strictly less than combined minimum reserve (R < n * m).
    n = 4, m = 15 (requires 60 kWh), but available energy R = 50 kWh.
    Deficit = 10 kWh. Expected count = 0.
    """
    engine = BackupEnergyDistributionEngine(num_bays=4, total_energy=50, min_reserve=15, unit=1)

    assert engine.is_feasible is False
    assert engine.remaining_energy == -10
    assert engine.calculate_exact_allocations() == 0

    allocations = engine.enumerate_allocations()
    assert len(allocations) == 0

    telemetry = engine.get_full_telemetry()
    assert telemetry["scenario_status"] == "CRITICAL_DEFICIT"
    assert telemetry["deficit_kwh"] == 10
    assert telemetry["exact_allocation_count"] == 0


def test_4_single_charging_bay():
    """Test 4: Single charging bay boundary case (n = 1)."""
    # Case A: Sufficient energy (R = 50, m = 15) -> exactly 1 way (the bay takes all 50)
    engine_a = BackupEnergyDistributionEngine(num_bays=1, total_energy=50, min_reserve=15)
    assert engine_a.calculate_exact_allocations() == 1
    alloc_a = engine_a.enumerate_allocations()
    assert len(alloc_a) == 1
    assert alloc_a[0]["physical_kwh"] == [50]

    # Case B: Insufficient energy (R = 10, m = 15) -> 0 ways
    engine_b = BackupEnergyDistributionEngine(num_bays=1, total_energy=10, min_reserve=15)
    assert engine_b.calculate_exact_allocations() == 0


def test_5_different_bay_counts():
    """Test 5: Testing varied fleet bay counts: n = 2, 3, 5."""
    # n = 2, R = 50, m = 10 -> R' = 30 -> C(30 + 1, 1) = 31
    engine_2 = BackupEnergyDistributionEngine(num_bays=2, total_energy=50, min_reserve=10)
    assert engine_2.calculate_exact_allocations() == 31

    # n = 3, R = 30, m = 5 -> R' = 15 -> C(15 + 2, 2) = C(17, 2) = 136
    engine_3 = BackupEnergyDistributionEngine(num_bays=3, total_energy=30, min_reserve=5)
    assert engine_3.calculate_exact_allocations() == 136

    # n = 5, R = 100, m = 10 -> R' = 50 -> C(50 + 4, 4) = C(54, 4) = 316251
    engine_5 = BackupEnergyDistributionEngine(num_bays=5, total_energy=100, min_reserve=10)
    assert engine_5.calculate_exact_allocations() == 316251


def test_6_different_minimum_reserves():
    """Test 6: Testing varied minimum reserves: m = 0, 5, 20."""
    # m = 0 (Unconstrained non-negative integer partitions / classical Stars and Bars)
    # n = 4, R = 10, m = 0 -> C(10 + 3, 3) = C(13, 3) = 286
    engine_zero = BackupEnergyDistributionEngine(num_bays=4, total_energy=10, min_reserve=0)
    assert engine_zero.calculate_exact_allocations() == 286

    # m = 20
    # n = 4, R = 100, m = 20 -> R' = 20 -> C(20 + 3, 3) = C(23, 3) = 1771
    engine_20 = BackupEnergyDistributionEngine(num_bays=4, total_energy=100, min_reserve=20)
    assert engine_20.calculate_exact_allocations() == 1771


def test_7_energy_allocation_unit_scaling():
    """
    Test 7: Energy allocation unit step scaling.
    R = 100 kWh, m = 15 kWh, unit = 5 kWh.
    R_disc = 20, m_disc = 3.
    R'_disc = 20 - 4*3 = 8.
    C(8 + 3, 3) = C(11, 3) = 165.
    """
    engine = BackupEnergyDistributionEngine(num_bays=4, total_energy=100, min_reserve=15, unit=5)
    assert engine.R == 20
    assert engine.m == 3
    assert engine.remaining_energy == 8
    assert engine.calculate_exact_allocations() == 165

    allocations = engine.enumerate_allocations(max_limit=200)
    assert len(allocations) == 165
    # Verify every allocated bay gets a multiple of 5 kWh >= 15 kWh
    for alloc in allocations:
        assert sum(alloc["physical_kwh"]) == 100
        for bay_val in alloc["physical_kwh"]:
            assert bay_val >= 15
            assert bay_val % 5 == 0


def test_8_input_validation_errors():
    """Test 8: Rejection of invalid inputs."""
    with pytest.raises(ValueError, match="charging bays"):
        BackupEnergyDistributionEngine(num_bays=0, total_energy=100, min_reserve=15)

    with pytest.raises(ValueError, match="negative"):
        BackupEnergyDistributionEngine(num_bays=4, total_energy=-50, min_reserve=15)

    with pytest.raises(ValueError, match="negative"):
        BackupEnergyDistributionEngine(num_bays=4, total_energy=100, min_reserve=-5)

    with pytest.raises(ValueError, match="allocation unit"):
        BackupEnergyDistributionEngine(num_bays=4, total_energy=100, min_reserve=15, unit=0)

    # Indivisible total energy by unit
    with pytest.raises(ValueError, match="divisible by the allocation unit"):
        BackupEnergyDistributionEngine(num_bays=4, total_energy=103, min_reserve=15, unit=5)

    # Indivisible reserve by unit
    with pytest.raises(ValueError, match="divisible by the allocation unit"):
        BackupEnergyDistributionEngine(num_bays=4, total_energy=100, min_reserve=17, unit=5)


def test_9_backtracking_enumeration_exact_match():
    """
    Test 9: Ground truth verification that enumeration count equals combinatorial count
    on a small configuration.
    n = 3, R = 15, m = 3 -> R' = 6 -> C(6 + 2, 2) = C(8, 2) = 28.
    """
    engine = BackupEnergyDistributionEngine(num_bays=3, total_energy=15, min_reserve=3)
    exact_count = engine.calculate_exact_allocations()
    assert exact_count == 28

    enumerated = engine.enumerate_allocations(max_limit=100)
    assert len(enumerated) == 28

    # Ensure every single enumerated tuple sums to 15 and has elements >= 3
    for alloc in enumerated:
        assert sum(alloc["physical_kwh"]) == 15
        for val in alloc["physical_kwh"]:
            assert val >= 3


def test_10_energy_scenarios_validation():
    """Test 10: Validation of the 3 specified operational energy scenarios."""
    # Scenario 1: Normal Availability (R = 100 kWh, m = 15 kWh, n = 4)
    normal = BackupEnergyDistributionEngine(num_bays=4, total_energy=100, min_reserve=15)
    telemetry_normal = normal.get_full_telemetry()
    assert telemetry_normal["scenario_status"] == "FEASIBLE_SURPLUS"
    assert telemetry_normal["exact_allocation_count"] == 12341

    # Scenario 2: Limited Availability (R = 68 kWh, m = 15 kWh, n = 4)
    # R' = 8 -> C(11, 3) = 165
    limited = BackupEnergyDistributionEngine(num_bays=4, total_energy=68, min_reserve=15)
    telemetry_limited = limited.get_full_telemetry()
    assert telemetry_limited["scenario_status"] == "LIMITED_MARGIN"
    assert telemetry_limited["exact_allocation_count"] == 165

    # Scenario 3: Critical Energy Shortage (R = 50 kWh, m = 15 kWh, n = 4)
    critical = BackupEnergyDistributionEngine(num_bays=4, total_energy=50, min_reserve=15)
    telemetry_critical = critical.get_full_telemetry()
    assert telemetry_critical["scenario_status"] == "CRITICAL_DEFICIT"
    assert telemetry_critical["exact_allocation_count"] == 0
    assert telemetry_critical["deficit_kwh"] == 10


def test_11_independent_exact_integer_combinatorics_stars_and_bars():
    """
    Test 11: Independent First-Principles Integer Combinatorics (Stars and Bars).
    Problem:
      x1 + x2 + x3 + x4 = 100,  xi >= 15.
    Transform:
      yi = xi - 15 >= 0  =>  y1 + y2 + y3 + y4 = 40.
    Formula:
      C(M + k - 1, k - 1) = C(40 + 4 - 1, 4 - 1) = C(43, 3).
    Manual Arithmetic:
      43 * 42 * 41 / (3 * 2 * 1) = 43 * 7 * 41 = 301 * 41 = 12341.
    """
    # 1. First-principles integer arithmetic
    manual_calc = (43 * 42 * 41) // (3 * 2 * 1)
    assert manual_calc == 12341

    # 2. Python math.comb
    import math
    assert math.comb(43, 3) == 12341

    # 3. Independent SymPy series coefficient
    import sympy as sp
    x = sp.Symbol('x')
    # OGF G(x) = (x^15 / (1 - x))^4 = x^60 / (1 - x)^4
    # Expand up to x^100
    ogf_expanded = sp.series(x**60 / (1 - x)**4, x, 0, 101)
    coeff_100 = ogf_expanded.coeff(x, 100)
    assert int(coeff_100) == 12341

    # 4. DP count of non-negative compositions of 40 into 4 parts
    # dp[i][s] = number of ways to partition s using i non-negative variables
    dp = [1] + [0] * 40
    for _ in range(4):
        new_dp = [0] * 41
        for s in range(41):
            for val in range(41 - s):
                new_dp[s + val] += dp[s]
        dp = new_dp
    assert dp[40] == 12341
