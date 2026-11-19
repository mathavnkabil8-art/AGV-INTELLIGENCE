"""
Comprehensive Unit Tests for Module: Rook Polynomials & Principle of Inclusion-Exclusion (PIE).

Test Cases:
1. No forbidden positions (R(x) = 1, N = n!).
2. One forbidden position (R(x) = 1 + x, N = n! - (n-1)!).
3. Four diagonal forbidden positions (4x4 derangement, R(x) = 1 + 4x + 6x^2 + 4x^3 + x^4, N = 9).
4. Multiple forbidden positions in one row.
5. Multiple forbidden positions in one column.
6. Completely forbidden row (N = 0).
7. Completely forbidden board (N = 0).
8. Unequal numbers of robots and docks (n < m, and n > m Pigeonhole Principle).
9. Exact step-by-step PIE expansion terms verification.
10. Audit consistency check between algebraic PIE and brute-force permutation search.
"""

import pytest
import math
from backend.algorithms.rook_polynomial import RookPolynomialEngine


def test_1_no_forbidden_positions():
    """Test 1: Empty forbidden board B = empty set. R(x) = 1, N = n!"""
    n = 4
    engine = RookPolynomialEngine(num_agvs=n, num_destinations=n, forbidden_cells=set())
    coeffs = engine.calculate_rook_coefficients()
    assert coeffs == [1, 0, 0, 0, 0]
    assert engine.get_polynomial_string() == "1"

    pie_count = engine.count_valid_assignments_via_pie()
    assert pie_count == math.factorial(n)  # 24

    explicit = engine.get_explicit_valid_assignments()
    assert len(explicit) == 24
    assert pie_count == len(explicit)


def test_2_one_forbidden_position():
    """Test 2: Single forbidden position at (0, 0). R(x) = 1 + x, N = 4! - 3! = 18"""
    n = 4
    forbidden = {(0, 0)}
    engine = RookPolynomialEngine(num_agvs=n, num_destinations=n, forbidden_cells=forbidden)
    coeffs = engine.calculate_rook_coefficients()
    assert coeffs == [1, 1, 0, 0, 0]
    assert engine.get_polynomial_string() == "1 + x"

    # PIE: 24 - 1*(6) = 18
    pie_count = engine.count_valid_assignments_via_pie()
    assert pie_count == 18

    explicit = engine.get_explicit_valid_assignments()
    assert len(explicit) == 18
    # Ensure no assignment puts AGV 0 at Dock 0
    for assign in explicit:
        assert assign["mapping"][0] != 0


def test_3_four_diagonal_forbidden_positions_validation():
    """
    Test 3: University Project Benchmark.
    4x4 board with four diagonal forbidden positions:
    (0, 0), (1, 1), (2, 2), (3, 3)
    Rook Polynomial: R(x) = 1 + 4x + 6x^2 + 4x^3 + x^4
    Valid assignment count: 24 - 24 + 12 - 4 + 1 = 9
    """
    n = 4
    forbidden = {(0, 0), (1, 1), (2, 2), (3, 3)}
    engine = RookPolynomialEngine(num_agvs=n, num_destinations=n, forbidden_cells=forbidden)

    # Rook coefficients: r_k = binom(4, k)
    coeffs = engine.calculate_rook_coefficients()
    assert coeffs == [1, 4, 6, 4, 1]
    assert engine.get_polynomial_string() == "1 + 4x + 6x^2 + 4x^3 + x^4"

    # Step-by-step PIE expansion terms
    expansion = engine.calculate_pie_expansion()
    terms = expansion["terms"]
    assert len(terms) == 5

    # k=0: +1 * 1 * 4! = 24
    assert terms[0]["k"] == 0
    assert terms[0]["sign"] == 1
    assert terms[0]["r_k"] == 1
    assert terms[0]["permutation_factor"] == 24
    assert terms[0]["term_value"] == 24

    # k=1: -1 * 4 * 3! = -24
    assert terms[1]["k"] == 1
    assert terms[1]["sign"] == -1
    assert terms[1]["r_k"] == 4
    assert terms[1]["permutation_factor"] == 6
    assert terms[1]["term_value"] == -24

    # k=2: +1 * 6 * 2! = +12
    assert terms[2]["k"] == 2
    assert terms[2]["sign"] == 1
    assert terms[2]["r_k"] == 6
    assert terms[2]["permutation_factor"] == 2
    assert terms[2]["term_value"] == 12

    # k=3: -1 * 4 * 1! = -4
    assert terms[3]["k"] == 3
    assert terms[3]["sign"] == -1
    assert terms[3]["r_k"] == 4
    assert terms[3]["permutation_factor"] == 1
    assert terms[3]["term_value"] == -4

    # k=4: +1 * 1 * 0! = +1
    assert terms[4]["k"] == 4
    assert terms[4]["sign"] == 1
    assert terms[4]["r_k"] == 1
    assert terms[4]["permutation_factor"] == 1
    assert terms[4]["term_value"] == 1

    # Total PIE summation: 24 - 24 + 12 - 4 + 1 = 9
    assert expansion["total_valid_assignments"] == 9
    assert engine.count_valid_assignments_via_pie() == 9

    # Independent brute-force permutation verification
    explicit = engine.get_explicit_valid_assignments()
    assert len(explicit) == 9
    assert explicit[0]["mapping"] != [0, 1, 2, 3]

    # Verify each enumerated assignment violates no diagonal forbidden pair
    for assign in explicit:
        mapping = assign["mapping"]
        for r, c in enumerate(mapping):
            assert (r, c) not in forbidden


def test_4_multiple_forbidden_positions_in_one_row():
    """
    Test 4: Multiple forbidden positions in one row.
    AGV 0 cannot take Dock 0 or Dock 1.
    """
    n = 3
    forbidden = {(0, 0), (0, 1)}
    engine = RookPolynomialEngine(num_agvs=n, num_destinations=n, forbidden_cells=forbidden)
    coeffs = engine.calculate_rook_coefficients()
    # Cannot place 2 non-attacking rooks on the same row! So r_2 = 0
    assert coeffs == [1, 2, 0, 0]

    # PIE: 3! - 2*2! + 0 - 0 = 6 - 4 = 2
    pie_count = engine.count_valid_assignments_via_pie()
    assert pie_count == 2
    explicit = engine.get_explicit_valid_assignments()
    assert len(explicit) == 2
    for a in explicit:
        assert a["mapping"][0] == 2


def test_5_multiple_forbidden_positions_in_one_column():
    """
    Test 5: Multiple forbidden positions in one column.
    Dock 0 cannot be used by AGV 0 or AGV 1.
    """
    n = 3
    forbidden = {(0, 0), (1, 0)}
    engine = RookPolynomialEngine(num_agvs=n, num_destinations=n, forbidden_cells=forbidden)
    coeffs = engine.calculate_rook_coefficients()
    # Cannot place 2 non-attacking rooks on the same column! So r_2 = 0
    assert coeffs == [1, 2, 0, 0]

    # Dock 0 can only be taken by AGV 2 (or none).
    # Total valid assignments: 3! - 2*2! = 6 - 4 = 2
    pie_count = engine.count_valid_assignments_via_pie()
    assert pie_count == 2
    explicit = engine.get_explicit_valid_assignments()
    assert len(explicit) == 2


def test_6_completely_forbidden_row():
    """Test 6: Completely forbidden row. Robot 0 cannot take any dock. Valid assignments N = 0."""
    n = 4
    forbidden = {(0, c) for c in range(n)}
    engine = RookPolynomialEngine(num_agvs=n, num_destinations=n, forbidden_cells=forbidden)

    # Since all cells in row 0 are forbidden, no 2 rooks can be placed in row 0.
    coeffs = engine.calculate_rook_coefficients()
    assert coeffs[1] == 4
    assert coeffs[2] == 0
    assert coeffs[3] == 0
    assert coeffs[4] == 0

    # PIE: 4! - 4 * 3! = 24 - 24 = 0
    pie_count = engine.count_valid_assignments_via_pie()
    assert pie_count == 0

    explicit = engine.get_explicit_valid_assignments()
    assert len(explicit) == 0


def test_7_completely_forbidden_board():
    """Test 7: Completely forbidden board. Every cell forbidden. Valid assignments N = 0."""
    n = 3
    forbidden = {(r, c) for r in range(n) for c in range(n)}
    engine = RookPolynomialEngine(num_agvs=n, num_destinations=n, forbidden_cells=forbidden)

    # On a full 3x3 board, r_k is (3! / (3-k)!)^2 / k! = binom(3, k)^2 * k!
    # r_0 = 1, r_1 = 9, r_2 = 18, r_3 = 6
    coeffs = engine.calculate_rook_coefficients()
    assert coeffs == [1, 9, 18, 6]

    # PIE: 6 - 9*2 + 18*1 - 6*1 = 6 - 18 + 18 - 6 = 0
    pie_count = engine.count_valid_assignments_via_pie()
    assert pie_count == 0

    explicit = engine.get_explicit_valid_assignments()
    assert len(explicit) == 0


def test_8_unequal_dimensions():
    """Test 8: Unequal dimensions: n < m (more docks than robots) and n > m (Pigeonhole)."""
    # Case A: 3 robots, 4 docks (n < m)
    # Unrestricted: P(4, 3) = 24
    # Forbidden: Robot 0 cannot use Dock 0
    engine_a = RookPolynomialEngine(num_agvs=3, num_destinations=4, forbidden_cells={(0, 0)})
    expansion_a = engine_a.calculate_pie_expansion()
    # PIE: P(4, 3) - 1 * P(3, 2) = 24 - 1*6 = 18
    assert expansion_a["total_valid_assignments"] == 18
    explicit_a = engine_a.get_explicit_valid_assignments()
    assert len(explicit_a) == 18

    # Case B: 4 robots, 3 docks (n > m)
    # Pigeonhole Principle -> 0 valid one-to-one assignments
    engine_b = RookPolynomialEngine(num_agvs=4, num_destinations=3, forbidden_cells=set())
    expansion_b = engine_b.calculate_pie_expansion()
    assert expansion_b["pigeonhole_impossible"] is True
    assert expansion_b["total_valid_assignments"] == 0
    explicit_b = engine_b.get_explicit_valid_assignments()
    assert len(explicit_b) == 0


def test_9_from_matrix_builder():
    """Test 9: Builder from matrix representation."""
    # 4x4 diagonal derangement matrix
    matrix = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ]
    engine = RookPolynomialEngine.from_matrix(matrix)
    audit = engine.audit_and_verify()

    assert audit["n"] == 4
    assert audit["m"] == 4
    assert audit["forbidden_count"] == 4
    assert audit["rook_coefficients"] == [1, 4, 6, 4, 1]
    assert audit["pie_total"] == 9
    assert audit["enumerated_total"] == 9
    assert audit["verified"] is True


def test_10_independent_first_principles_permutation_derangement():
    """
    Test 10: Independent First-Principles Verification.
    Directly enumerates all 4! = 24 permutations of (0, 1, 2, 3) using itertools.
    Filters for derangements (permutations where p[i] != i for all i).
    Verifies that:
      1. Exactly 9 derangements exist.
      2. The Rook Polynomial coefficients are exactly r_k = C(4, k) for diagonal forbidden positions.
      3. Formula N = sum (-1)^k * r_k * (4 - k)! equals 9.
    """
    import itertools

    all_perms = list(itertools.permutations(range(4)))
    assert len(all_perms) == 24

    derangements = [p for p in all_perms if all(p[i] != i for i in range(4))]
    assert len(derangements) == 9

    # Verify Rook polynomial coefficients for diagonal board
    # r_k is the number of ways to pick k non-attacking rooks on the diagonal
    # Since all diagonal cells are in different rows and different columns, ANY choice of k cells is non-attacking!
    # Therefore r_k = C(4, k)
    import math
    expected_rk = [math.comb(4, k) for k in range(5)]
    assert expected_rk == [1, 4, 6, 4, 1]

    # Verify PIE formula sum:
    pie_val = sum((-1)**k * expected_rk[k] * math.factorial(4 - k) for k in range(5))
    assert pie_val == 9
    assert pie_val == len(derangements)
