"""
Module: Rook Polynomials & Principle of Inclusion-Exclusion (PIE) for AGV Smart Charging.

Mathematical Foundations:
- Let B subset of {1..n} x {1..m} represent the set of forbidden assignments
  (e.g., AGV_i cannot dock at Charger_j due to clearance, voltage mismatch, or hazardous zone).
- The Rook Polynomial for board B is defined as:
    R(x, B) = sum_{k=0}^{min(n, m)} r_k(B) * x^k
  where r_k(B) is the number of ways to place k non-attacking rooks on forbidden cells of B.
  A placement of k rooks is non-attacking if no two rooks share the same row or column.
  By convention, r_0(B) = 1 (empty placement).

- Principle of Inclusion-Exclusion (PIE):
  When n == m (bijective matching of n AGVs to n Chargers):
    N = sum_{k=0}^n (-1)^k * r_k(B) * (n - k)!
  When n < m (injective matching of n AGVs to m Chargers):
    N = sum_{k=0}^n (-1)^k * r_k(B) * P(m - k, n - k)
      = sum_{k=0}^n (-1)^k * r_k(B) * (m - k)! / (m - n)!
  When n > m (more AGVs than Chargers):
    By the Pigeonhole Principle, no one-to-one assignment can assign all AGVs to distinct chargers,
    so N = 0.
"""

from typing import List, Tuple, Set, Dict, Optional, Any
import math
from itertools import combinations, permutations
import sympy as sp


class RookPolynomialEngine:
    """
    Rook Polynomial and Principle of Inclusion-Exclusion Engine.
    Computes rook coefficients, symbolic polynomials, step-by-step PIE expansions,
    and enumerates valid assignments with verification.
    """

    def __init__(self, num_agvs: int, num_destinations: int, forbidden_cells: Set[Tuple[int, int]]):
        if num_agvs < 1 or num_destinations < 1:
            raise ValueError("AGV count and destination count must be at least 1.")
        self.n = num_agvs
        self.m = num_destinations
        # Filter forbidden cells to only those within bounds
        self.forbidden_cells = {
            (r, c) for r, c in forbidden_cells
            if 0 <= r < self.n and 0 <= c < self.m
        }
        self.x = sp.Symbol('x')

    @classmethod
    def from_matrix(cls, matrix: List[List[int]]) -> 'RookPolynomialEngine':
        """Constructs engine from an n x m binary matrix where 1 represents forbidden cell."""
        n = len(matrix)
        if n == 0:
            raise ValueError("Matrix cannot be empty.")
        m = len(matrix[0])
        forbidden = set()
        for r in range(n):
            for c in range(m):
                if matrix[r][c] == 1:
                    forbidden.add((r, c))
        return cls(n, m, forbidden)

    def calculate_rook_coefficients(self) -> List[int]:
        """
        Computes r_k(B) for k = 0, 1, ..., min(n, m).
        r_0 is always 1 (empty placement).
        r_k is the number of ways to choose k non-attacking rooks on forbidden cells.
        """
        max_k = min(self.n, self.m)
        coefficients = [1] + [0] * max_k
        forbidden_list = sorted(list(self.forbidden_cells))

        for k in range(1, max_k + 1):
            if k > len(forbidden_list):
                coefficients[k] = 0
                continue
            valid_k_placements = 0
            for subset in combinations(forbidden_list, k):
                # Verify non-attacking: distinct rows and distinct columns
                rows = {r for r, _ in subset}
                cols = {c for _, c in subset}
                if len(rows) == k and len(cols) == k:
                    valid_k_placements += 1
            coefficients[k] = valid_k_placements

        return coefficients

    def get_sample_rook_placements(self, max_samples_per_k: int = 5) -> Dict[int, List[List[Tuple[int, int]]]]:
        """
        Returns sample non-attacking rook configurations for each k.
        Helpful for step-by-step visual inspection of rook arrangements.
        """
        max_k = min(self.n, self.m)
        placements: Dict[int, List[List[Tuple[int, int]]]] = {0: [[]]}
        forbidden_list = sorted(list(self.forbidden_cells))

        for k in range(1, max_k + 1):
            placements[k] = []
            if k > len(forbidden_list):
                continue
            for subset in combinations(forbidden_list, k):
                rows = {r for r, _ in subset}
                cols = {c for _, c in subset}
                if len(rows) == k and len(cols) == k:
                    placements[k].append(list(subset))
                    if len(placements[k]) >= max_samples_per_k:
                        break

        return placements

    def get_rook_polynomial(self) -> sp.Poly:
        """Returns the symbolic rook polynomial R(x, B) = sum r_k x^k."""
        coeffs = self.calculate_rook_coefficients()
        expr = sum(c * (self.x ** k) for k, c in enumerate(coeffs))
        return sp.Poly(expr, self.x)

    def get_polynomial_string(self) -> str:
        """Returns formatted polynomial string, e.g. '1 + 4x + 6x^2 + 4x^3 + x^4'."""
        coeffs = self.calculate_rook_coefficients()
        terms = []
        for k, c in enumerate(coeffs):
            if c == 0:
                continue
            if k == 0:
                terms.append(str(c))
            elif k == 1:
                terms.append(f"{c}x" if c != 1 else "x")
            else:
                terms.append(f"{c}x^{k}" if c != 1 else f"x^{k}")
        return " + ".join(terms) if terms else "0"

    def calculate_pie_expansion(self) -> Dict[str, Any]:
        """
        Computes the Principle of Inclusion-Exclusion (PIE) expansion step-by-step:
        For n == m:
            N = sum_{k=0}^n (-1)^k * r_k * (n - k)!
        For n < m:
            N = sum_{k=0}^n (-1)^k * r_k * P(m - k, n - k)
        For n > m:
            N = 0 (Pigeonhole Principle).
        """
        coeffs = self.calculate_rook_coefficients()
        terms = []
        cumulative_sum = 0
        unequal_status = None

        if self.n > self.m:
            unequal_status = f"Pigeonhole Principle: {self.n} robots exceed {self.m} charging docks. One-to-one assignment impossible."
            return {
                "n": self.n,
                "m": self.m,
                "is_square": False,
                "pigeonhole_impossible": True,
                "coefficients": coeffs,
                "polynomial_str": self.get_polynomial_string(),
                "terms": [],
                "total_valid_assignments": 0,
                "formula_used": "N = 0 (n > m, Pigeonhole Principle)",
                "explanation": unequal_status
            }

        is_square = (self.n == self.m)

        for k, r_k in enumerate(coeffs):
            sign = (-1) ** k
            if is_square:
                # (n - k)!
                perm_factor = math.factorial(self.n - k)
                perm_label = f"({self.n} - {k})! = {self.n - k}!"
            else:
                # P(m - k, n - k) = (m - k)! / (m - n)!
                perm_factor = math.perm(self.m - k, self.n - k)
                perm_label = f"P({self.m} - {k}, {self.n} - {k}) = {perm_factor}"

            term_value = sign * r_k * perm_factor
            cumulative_sum += term_value

            terms.append({
                "k": k,
                "sign": sign,
                "sign_str": "+" if sign > 0 else "-",
                "r_k": r_k,
                "permutation_factor": perm_factor,
                "factor_label": perm_label,
                "term_value": term_value,
                "running_sum": cumulative_sum,
                "term_expression": f"({'+' if sign > 0 else '-'}{abs(sign)}) * {r_k} * {perm_factor} = {term_value:+d}"
            })

        formula_str = (
            "N = sum_{k=0}^n (-1)^k * r_k * (n - k)!"
            if is_square
            else "N = sum_{k=0}^n (-1)^k * r_k * P(m - k, n - k)"
        )

        return {
            "n": self.n,
            "m": self.m,
            "is_square": is_square,
            "pigeonhole_impossible": False,
            "coefficients": coeffs,
            "polynomial_str": self.get_polynomial_string(),
            "terms": terms,
            "total_valid_assignments": int(cumulative_sum),
            "formula_used": formula_str,
            "explanation": (
                "Exact count derived via de Montmort Principle of Inclusion-Exclusion on restricted board B."
                if is_square
                else f"Generalized PIE matching {self.n} robots into {self.m} docks."
            )
        }

    def count_valid_assignments_via_pie(self) -> int:
        """Convenience method returning total valid assignments via PIE."""
        expansion = self.calculate_pie_expansion()
        return expansion["total_valid_assignments"]

    def get_explicit_valid_assignments(self, max_results: int = 1000) -> List[Dict[str, Any]]:
        """
        Enumerates all valid one-to-one assignments using permutation search / backtracking.
        Ground truth verification against the PIE result.
        Returns:
            List of valid assignments with robot-to-charger mappings.
        """
        if self.n > self.m:
            return []

        valid = []
        # Permutations of size n from m docks: each robot i receives p[i]
        for p in permutations(range(self.m), self.n):
            is_allowed = True
            for i, dock in enumerate(p):
                if (i, dock) in self.forbidden_cells:
                    is_allowed = False
                    break
            if is_allowed:
                assignment_pairs = [
                    {
                        "robot_index": i,
                        "robot_id": f"AGV-{i + 1}",
                        "dock_index": dock,
                        "dock_id": f"Charger-{dock + 1}"
                    }
                    for i, dock in enumerate(p)
                ]
                valid.append({
                    "assignment_id": len(valid) + 1,
                    "mapping": list(p),
                    "pairs": assignment_pairs,
                    "description": ", ".join(f"AGV-{i + 1} -> Pad-{dock + 1}" for i, dock in enumerate(p))
                })
                if len(valid) >= max_results:
                    break

        return valid

    def audit_and_verify(self) -> Dict[str, Any]:
        """
        Runs comprehensive mathematical validation:
        1. Calculates rook coefficients.
        2. Evaluates PIE formula.
        3. Independently enumerates valid permutations.
        4. Verifies PIE count == Enumerated count.
        """
        pie_data = self.calculate_pie_expansion()
        explicit = self.get_explicit_valid_assignments(max_results=5000)
        
        pie_count = pie_data["total_valid_assignments"]
        enum_count = len(explicit)
        verified = (pie_count == enum_count)

        # Unrestricted total assignments:
        # If n == m: n!
        # If n < m: P(m, n)
        # If n > m: 0
        if self.n > self.m:
            unrestricted = 0
        elif self.n == self.m:
            unrestricted = math.factorial(self.n)
        else:
            unrestricted = math.perm(self.m, self.n)

        # Build board representation for UI
        board_matrix = []
        for r in range(self.n):
            row = []
            for c in range(self.m):
                row.append(1 if (r, c) in self.forbidden_cells else 0)
            board_matrix.append(row)

        return {
            "n": self.n,
            "m": self.m,
            "board_matrix": board_matrix,
            "forbidden_count": len(self.forbidden_cells),
            "unrestricted_total": unrestricted,
            "rook_coefficients": pie_data["coefficients"],
            "polynomial_str": pie_data["polynomial_str"],
            "pie_expansion": pie_data["terms"],
            "pie_total": pie_count,
            "enumerated_total": enum_count,
            "verified": verified,
            "formula_used": pie_data["formula_used"],
            "sample_placements": self.get_sample_rook_placements(),
            "valid_assignments": explicit[:100],  # first 100 for UI display
            "total_valid_assignments": enum_count
        }
