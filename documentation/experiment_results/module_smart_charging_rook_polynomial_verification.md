# Module Verification Report: Smart Charging Assignment Using Rook Polynomials & Inclusion-Exclusion

**Project Title:** AGV Intelligence – Mathematical Modelling and Optimization of Autonomous Guided Vehicle Traffic Routing and Smart Charging in Automated Warehouses  
**Course:** Discrete Mathematics and Graph Theory  
**Module:** Smart Charging Assignment Using Rook Polynomials and Inclusion-Exclusion  
**Timestamp:** 2026-11-09T12:02:00+05:30  
**Test Suite:** `backend/tests/test_rook_polynomial.py`  

---

## 1. Executive Summary & Mathematical Validation

This module models the assignment of Autonomous Guided Vehicles (AGVs) to charging bays under physical compatibility, clearance, and operational restrictions using **Rook Polynomials on Restricted Boards** and the **Principle of Inclusion-Exclusion (PIE)**.

### Mathematical Formulation
1. **Compatibility Matrix & Restricted Board $B$:**
   Let $n$ AGVs and $m$ charging docks be represented by the cells of an $n \times m$ board:
   $$B \subseteq \{1, \dots, n\} \times \{1, \dots, m\}$$
   where cell $(i, j) \in B$ indicates that AGV $i$ cannot dock at charging station $j$.

2. **Rook Polynomial $R(x, B)$:**
   The generating function for placing non-attacking rooks on the forbidden cells of $B$ is:
   $$R(x, B) = \sum_{k=0}^{\min(n, m)} r_k(B) x^k$$
   where $r_k(B)$ is the number of ways to place $k$ mutually non-attacking rooks on $B$ (no two rooks sharing the same row or column). By definition, $r_0(B) = 1$.

3. **Principle of Inclusion-Exclusion (PIE):**
   - For a square board with $n = m$ (complete bijective assignment):
     $$N = \sum_{k=0}^n (-1)^k \cdot r_k(B) \cdot (n - k)!$$
   - For a rectangular board with $n < m$ (more docks than AGVs):
     $$N = \sum_{k=0}^n (-1)^k \cdot r_k(B) \cdot P(m - k, n - k) = \sum_{k=0}^n (-1)^k \cdot r_k(B) \cdot \frac{(m - k)!}{(m - n)!}$$
   - For $n > m$ (more AGVs than docks):
     By the **Pigeonhole Principle**, assigning $n$ robots to $m$ docks requires at least one dock to receive multiple robots; hence, $N = 0$ one-to-one assignments are possible.

4. **University Benchmark Validation (4 AGVs, 4 Docks, Diagonal Forbidden):**
   - Forbidden set: $B = \{(0, 0), (1, 1), (2, 2), (3, 3)\}$
   - Rook coefficients: $r_k = \binom{4}{k}$
     $$r_0 = 1, \quad r_1 = 4, \quad r_2 = 6, \quad r_3 = 4, \quad r_4 = 1$$
   - Rook Polynomial:
     $$R(x, B) = 1 + 4x + 6x^2 + 4x^3 + x^4$$
   - Inclusion-Exclusion Alternating Terms:
     $$\begin{aligned}
     k=0: & \quad +1 \cdot 1 \cdot 4! = +24 \\
     k=1: & \quad -1 \cdot 4 \cdot 3! = -24 \\
     k=2: & \quad +1 \cdot 6 \cdot 2! = +12 \\
     k=3: & \quad -1 \cdot 4 \cdot 1! = -4 \\
     k=4: & \quad +1 \cdot 1 \cdot 0! = +1
     \end{aligned}$$
   - Total Valid Assignments:
     $$N = 24 - 24 + 12 - 4 + 1 = 9$$
   - **Independent Brute-Force Permutation Verification:**  
     Exhaustive enumeration over all $4! = 24$ permutations reveals that exactly 9 permutations have no fixed points ($\pi(i) \neq i$), perfectly confirming the subfactorial $!4 = 9$.

---

## 2. All 9 Valid Permutations Enumerated

For 4 AGVs with diagonal forbidden positions (AGV $i$ cannot dock at Charger $i$):
1. **Assignment 1:** AGV-1 $\to$ Dock 2, AGV-2 $\to$ Dock 1, AGV-3 $\to$ Dock 4, AGV-4 $\to$ Dock 3  `[1, 0, 3, 2]`
2. **Assignment 2:** AGV-1 $\to$ Dock 2, AGV-2 $\to$ Dock 3, AGV-3 $\to$ Dock 4, AGV-4 $\to$ Dock 1  `[1, 2, 3, 0]`
3. **Assignment 3:** AGV-1 $\to$ Dock 2, AGV-2 $\to$ Dock 4, AGV-3 $\to$ Dock 1, AGV-4 $\to$ Dock 3  `[1, 3, 0, 2]`
4. **Assignment 4:** AGV-1 $\to$ Dock 3, AGV-2 $\to$ Dock 1, AGV-3 $\to$ Dock 4, AGV-4 $\to$ Dock 2  `[2, 0, 3, 1]`
5. **Assignment 5:** AGV-1 $\to$ Dock 3, AGV-2 $\to$ Dock 4, AGV-3 $\to$ Dock 1, AGV-4 $\to$ Dock 2  `[2, 3, 0, 1]`
6. **Assignment 6:** AGV-1 $\to$ Dock 3, AGV-2 $\to$ Dock 4, AGV-3 $\to$ Dock 2, AGV-4 $\to$ Dock 1  `[2, 3, 1, 0]`
7. **Assignment 7:** AGV-1 $\to$ Dock 4, AGV-2 $\to$ Dock 1, AGV-3 $\to$ Dock 2, AGV-4 $\to$ Dock 3  `[3, 0, 1, 2]`
8. **Assignment 8:** AGV-1 $\to$ Dock 4, AGV-2 $\to$ Dock 3, AGV-3 $\to$ Dock 1, AGV-4 $\to$ Dock 2  `[3, 2, 0, 1]`
9. **Assignment 9:** AGV-1 $\to$ Dock 4, AGV-2 $\to$ Dock 3, AGV-3 $\to$ Dock 2, AGV-4 $\to$ Dock 1  `[3, 2, 1, 0]`

---

## 3. Unit Test Suite Results

Test execution command:
```bash
python -m pytest backend/tests/test_rook_polynomial.py -v
```

Output:
```text
============================= test session starts =============================
platform win32 -- Python 3.13.5, pytest-8.3.4, pluggy-1.6.0
rootdir: E:\semester 3\discrete mathematics and graph theory\AGV-INTELLIGENCE
collected 9 items

backend/tests/test_rook_polynomial.py::test_1_no_forbidden_positions PASSED [ 11%]
backend/tests/test_rook_polynomial.py::test_2_one_forbidden_position PASSED [ 22%]
backend/tests/test_rook_polynomial.py::test_3_four_diagonal_forbidden_positions_validation PASSED [ 33%]
backend/tests/test_rook_polynomial.py::test_4_multiple_forbidden_positions_in_one_row PASSED [ 44%]
backend/tests/test_rook_polynomial.py::test_5_multiple_forbidden_positions_in_one_column PASSED [ 55%]
backend/tests/test_rook_polynomial.py::test_6_completely_forbidden_row PASSED [ 66%]
backend/tests/test_rook_polynomial.py::test_7_completely_forbidden_board PASSED [ 77%]
backend/tests/test_rook_polynomial.py::test_8_unequal_dimensions PASSED  [ 88%]
backend/tests/test_rook_polynomial.py::test_9_from_matrix_builder PASSED [100%]

============================== 9 passed in 3.35s ==============================
```

Full application test suite:
```text
============================= 34 passed in 8.12s ==============================
```

---

## 4. API Endpoint Specifications

### `POST /api/algorithms/rook-polynomial`
**Request Payload:**
```json
{
  "num_agvs": 4,
  "num_destinations": 4,
  "forbidden_pairs": [[0, 0], [1, 1], [2, 2], [3, 3]]
}
```
*Alternatively, pass `"matrix": [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]`.*

**Response Payload Highlights:**
```json
{
  "num_agvs": 4,
  "num_destinations": 4,
  "coefficients": [1, 4, 6, 4, 1],
  "polynomial_str": "1 + 4x + 6x^2 + 4x^3 + x^4",
  "pie_valid_assignments_count": 9,
  "explicit_valid_assignments_count": 9,
  "verified": true,
  "pie_expansion": [
    {"k": 0, "sign": 1, "r_k": 1, "permutation_factor": 24, "term_value": 24, "running_sum": 24},
    {"k": 1, "sign": -1, "r_k": 4, "permutation_factor": 6, "term_value": -24, "running_sum": 0},
    {"k": 2, "sign": 1, "r_k": 6, "permutation_factor": 2, "term_value": 12, "running_sum": 12},
    {"k": 3, "sign": -1, "r_k": 4, "permutation_factor": 1, "term_value": -4, "running_sum": 8},
    {"k": 4, "sign": 1, "r_k": 1, "permutation_factor": 1, "term_value": 1, "running_sum": 9}
  ],
  "valid_assignments": [ ... ]
}
```

---

## 5. Visual Artifacts
- Diagram: `documentation/screenshots/rook_polynomial_derivation.svg`
