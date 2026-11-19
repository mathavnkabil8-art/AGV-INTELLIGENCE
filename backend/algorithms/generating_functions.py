"""
Module: Ordinary Generating Functions for Backup Energy Distribution.

Mathematical Foundations:
- Problem: Distribute R total units of backup energy across n charging bays,
  where each bay must receive at least m units of reserve energy:
    x_1 + x_2 + ... + x_n = R,   with x_i >= m for each i in {1, ..., n}.

- By substituting y_i = x_i - m >= 0:
    y_1 + y_2 + ... + y_n = R - m*n = R'
  where R' is the remaining distributable energy after satisfying all minimum reserves.

- Ordinary Generating Function (OGF):
  Each bay's energy choices correspond to formal power series:
    f(x) = x^m + x^(m+1) + x^(m+2) + ... = x^m * (1 + x + x^2 + ...) = x^m / (1 - x)
  For n independent charging bays:
    G(x) = [f(x)]^n = (x^m / (1 - x))^n = x^(m*n) / (1 - x)^n

- Negative Binomial Series Expansion:
  1 / (1 - x)^n = sum_{k=0}^infty binom(k + n - 1, n - 1) * x^k
  Therefore:
  G(x) = sum_{k=0}^infty binom(k + n - 1, n - 1) * x^(k + m*n)

- Coefficient of x^R:
  [x^R] G(x) = [x^(R - m*n)] 1 / (1 - x)^n
             = binom((R - m*n) + n - 1, n - 1)    if R >= m*n
             = 0                                   if R < m*n (Insufficient energy)

- Default Configuration:
  n = 4, R = 100 kWh, m = 15 kWh
  R' = 100 - 4*15 = 40 kWh
  [x^100] G(x) = binom(40 + 4 - 1, 4 - 1) = binom(43, 3) = 12341.
"""

from typing import List, Tuple, Dict, Optional, Any, Generator
import math
import sympy as sp


class BackupEnergyDistributionEngine:
    """
    Computes exact backup energy distribution configurations using Ordinary Generating Functions
    and the Negative Binomial theorem.
    """

    def __init__(self, num_bays: int = 4, total_energy: int = 100, min_reserve: int = 15, unit: int = 1):
        if num_bays < 1:
            raise ValueError("Number of charging bays (n) must be at least 1.")
        if total_energy < 0:
            raise ValueError("Total backup energy (R) cannot be negative.")
        if min_reserve < 0:
            raise ValueError("Minimum reserve per bay (m) cannot be negative.")
        if unit < 1:
            raise ValueError("Energy allocation unit must be at least 1 kWh.")

        if total_energy % unit != 0:
            raise ValueError(f"Total backup energy ({total_energy} kWh) must be divisible by the allocation unit ({unit} kWh).")
        if min_reserve % unit != 0:
            raise ValueError(f"Minimum reserve ({min_reserve} kWh) must be divisible by the allocation unit ({unit} kWh).")

        self.n = num_bays
        self.raw_total_energy = total_energy
        self.raw_min_reserve = min_reserve
        self.unit = unit

        # Discrete normalized units
        self.R = total_energy // unit
        self.m = min_reserve // unit
        self.combined_min_reserve = self.n * self.m
        self.remaining_energy = self.R - self.combined_min_reserve

    @property
    def is_feasible(self) -> bool:
        """Returns True if available energy satisfies the combined minimum reserve."""
        return self.R >= self.combined_min_reserve

    def calculate_exact_allocations(self) -> int:
        """
        Calculates exact number of valid allocations via the negative binomial coefficient:
        [x^R] G(x) = binom((R - m*n) + n - 1, n - 1) if R >= m*n else 0.
        """
        if not self.is_feasible:
            return 0
        k = self.remaining_energy
        return math.comb(k + self.n - 1, self.n - 1)

    def verify_with_sympy(self) -> Dict[str, Any]:
        """
        Independently computes the coefficient [x^R] in G(x) using SymPy series expansion
        to confirm mathematical exactness.
        """
        if not self.is_feasible:
            return {
                "sympy_coefficient": 0,
                "combinatorial_count": 0,
                "verified": True,
                "method": "Zero (R < n*m deficit)"
            }

        x = sp.Symbol('x')
        # G(x) = (x^m / (1 - x))^n = x^(m*n) / (1 - x)^n
        # [x^R] G(x) == [x^(R - m*n)] (1 - x)^(-n)
        k = self.remaining_energy
        # Use formal series expansion of (1 - x)^(-n)
        series_expansion = sp.series((1 - x) ** (-self.n), x, 0, k + 1)
        sympy_val = int(series_expansion.coeff(x, k))
        comb_val = self.calculate_exact_allocations()

        return {
            "sympy_coefficient": sympy_val,
            "combinatorial_count": comb_val,
            "verified": (sympy_val == comb_val),
            "method": f"SymPy [x^{self.R}] (x^{self.m}/(1-x))^{self.n} series expansion"
        }

    def get_generating_function_str(self) -> Dict[str, str]:
        """Returns symbolic and expanded LaTeX/text forms of the Ordinary Generating Function."""
        mn = self.n * self.m
        return {
            "product_form": f"(x^{self.m} / (1 - x))^{self.n}",
            "compact_ogf": f"x^{mn} / (1 - x)^{self.n}",
            "series_form": f"(x^{self.m} + x^{self.m + 1} + x^{self.m + 2} + ...)^{self.n}",
            "expanded_series_preview": (
                f"x^{mn} * sum_{{k=0}}^\\infty C(k + {self.n - 1}, {self.n - 1}) * x^k"
            )
        }

    def get_derivation_steps(self) -> Dict[str, Any]:
        """Provides full algebraic derivation for educational and auditing purposes."""
        k = max(0, self.remaining_energy)
        numerator_term = k + self.n - 1
        denominator_term = self.n - 1

        exact_count = self.calculate_exact_allocations()

        steps = [
            {
                "step_number": 1,
                "title": "Diophantine Equation Formulation",
                "description": f"x_1 + x_2 + ... + x_{self.n} = {self.R} with x_i >= {self.m} for all i.",
                "formula": f"sum_{{i=1}}^{self.n} x_i = {self.R},  x_i in [{self.m}, {self.R}]"
            },
            {
                "step_number": 2,
                "title": "Minimum Reserve Deduction & Variable Shift",
                "description": f"Deduct minimum reserve {self.m} per bay: y_i = x_i - {self.m} >= 0.",
                "formula": f"sum_{{i=1}}^{self.n} y_i = {self.R} - ({self.n} * {self.m}) = {self.remaining_energy}"
            },
            {
                "step_number": 3,
                "title": "Ordinary Generating Function Construction",
                "description": "Each bay contributes formal power series x^m / (1 - x).",
                "formula": f"G(x) = (x^{self.m} / (1 - x))^{self.n} = x^{self.n * self.m} * (1 - x)^(-{self.n})"
            },
            {
                "step_number": 4,
                "title": "Negative Binomial Theorem Application",
                "description": "Expand (1 - x)^(-n) using Stars and Bars combinatorial coefficients.",
                "formula": f"(1 - x)^(-{self.n}) = sum_{{k=0}}^\\infty C(k + {self.n - 1}, {self.n - 1}) * x^k"
            },
            {
                "step_number": 5,
                "title": "Target Power Extraction [x^R] G(x)",
                "description": (
                    f"Extract power x^{self.R} by setting k = {self.R} - {self.n * self.m} = {k}."
                    if self.is_feasible
                    else f"Power x^{self.R} cannot be formed because total energy {self.R} is less than {self.n * self.m}."
                ),
                "formula": (
                    f"[x^{self.R}] G(x) = C({k} + {self.n} - 1, {self.n} - 1) = C({numerator_term}, {denominator_term}) = {exact_count}"
                    if self.is_feasible
                    else "[x^R] G(x) = 0 (Empty solution set)"
                )
            }
        ]

        return {
            "n": self.n,
            "R": self.R,
            "m": self.m,
            "unit": self.unit,
            "combined_min_reserve": self.combined_min_reserve,
            "remaining_energy": self.remaining_energy,
            "is_feasible": self.is_feasible,
            "numerator_term": numerator_term,
            "denominator_term": denominator_term,
            "exact_allocations": exact_count,
            "binomial_expression": f"C({numerator_term}, {denominator_term})",
            "steps": steps
        }

    def enumerate_allocations(self, max_limit: int = 100) -> List[Dict[str, Any]]:
        """
        Generates actual integer partition tuples (x_1, ..., x_n) satisfying constraints:
        sum x_i = R, x_i >= m.
        Caps output to max_limit to prevent high memory usage on large configurations.
        """
        if not self.is_feasible:
            return []

        results = []

        def backtrack(bay_idx: int, current_sum: int, current_alloc: List[int]):
            if len(results) >= max_limit:
                return

            if bay_idx == self.n - 1:
                last_val = self.R - current_sum
                if last_val >= self.m:
                    full_alloc = current_alloc + [last_val]
                    # Convert back to physical kWh units
                    physical_alloc = [val * self.unit for val in full_alloc]
                    results.append({
                        "allocation_id": len(results) + 1,
                        "discrete_units": full_alloc,
                        "physical_kwh": physical_alloc,
                        "description": ", ".join(f"Bay-{i + 1}: {val} kWh" for i, val in enumerate(physical_alloc))
                    })
                return

            # Remaining bays after this one
            remaining_bays = self.n - 1 - bay_idx
            # Upper bound for current bay: leave at least min_reserve for all future bays
            max_for_current = self.R - current_sum - (remaining_bays * self.m)

            for val in range(self.m, max_for_current + 1):
                if len(results) >= max_limit:
                    break
                backtrack(bay_idx + 1, current_sum + val, current_alloc + [val])

        backtrack(0, 0, [])
        return results

    def get_full_telemetry(self) -> Dict[str, Any]:
        """Provides full simulation and mathematical audit payload for API & UI."""
        derivation = self.get_derivation_steps()
        sympy_check = self.verify_with_sympy()
        exact_count = self.calculate_exact_allocations()

        # Enumerate only if exact_count is reasonable (e.g. <= 2000), otherwise fetch top 50
        allocations = self.enumerate_allocations(max_limit=50)

        # Scenarios metadata
        scenario_status = "FEASIBLE_SURPLUS"
        if not self.is_feasible:
            scenario_status = "CRITICAL_DEFICIT"
        elif self.remaining_energy <= self.n * 2:
            scenario_status = "LIMITED_MARGIN"

        return {
            "num_bays": self.n,
            "total_backup_energy_kwh": self.raw_total_energy,
            "min_reserve_per_bay_kwh": self.raw_min_reserve,
            "energy_allocation_unit_kwh": self.unit,
            "combined_min_reserve_kwh": self.combined_min_reserve * self.unit,
            "remaining_distributable_energy_kwh": self.remaining_energy * self.unit if self.is_feasible else 0,
            "deficit_kwh": abs(self.remaining_energy * self.unit) if not self.is_feasible else 0,
            "is_feasible": self.is_feasible,
            "scenario_status": scenario_status,
            "generating_function": self.get_generating_function_str(),
            "exact_allocation_count": exact_count,
            "binomial_expression": derivation["binomial_expression"],
            "verification": sympy_check,
            "derivation_steps": derivation["steps"],
            "enumerated_sample": allocations,
            "is_enumerated_complete": (len(allocations) == exact_count and exact_count <= 50)
        }


# -------------------------------------------------------------------------
# Legacy GeneratingFunctionEngine preserved for backward compatibility
# -------------------------------------------------------------------------
class GeneratingFunctionEngine:
    """
    Backward-compatible GeneratingFunctionEngine wrapper
    preserving fleet bounds allocation polynomials while supporting the new backup energy distribution.
    """

    def __init__(self):
        self.x = sp.Symbol('x')

    def build_allocation_gf(self, bounds: List[Tuple[int, int]]) -> sp.Poly:
        """Constructs G(x) = prod_{i=1}^k (sum_{j=L_i}^{U_i} x^j)."""
        expr = sp.Integer(1)
        for lower, upper in bounds:
            if lower > upper:
                raise ValueError(f"Lower bound {lower} exceeds upper bound {upper}")
            polynomial_i = sum(self.x ** j for j in range(lower, upper + 1))
            expr *= polynomial_i
        return sp.Poly(sp.expand(expr), self.x)

    def count_allocations(self, total_energy: int, bounds: List[Tuple[int, int]]) -> int:
        """Returns coefficient of x^{total_energy} in fleet generating function."""
        gf = self.build_allocation_gf(bounds)
        coeff = gf.coeff_monomial(self.x ** total_energy)
        return int(coeff)

    def get_distribution_spectrum(self, bounds: List[Tuple[int, int]]) -> Dict[int, int]:
        """Returns complete spectrum of achievable energy partitions."""
        gf = self.build_allocation_gf(bounds)
        monomials = gf.as_dict()
        spectrum = {}
        for (power,), coeff in monomials.items():
            spectrum[int(power)] = int(coeff)
        return dict(sorted(spectrum.items()))
