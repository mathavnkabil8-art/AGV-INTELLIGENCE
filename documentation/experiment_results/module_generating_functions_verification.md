# Module Verification Report: Ordinary Generating Functions for Backup Energy Distribution

**Project Title:** AGV Intelligence – Mathematical Modelling and Optimization of Autonomous Guided Vehicle Traffic Routing and Smart Charging in Automated Warehouses  
**Course:** Discrete Mathematics and Graph Theory  
**Module:** Ordinary Generating Functions (OGFs) for Backup Energy Distribution  
**Timestamp:** 2026-11-09T12:28:00+05:30  
**Test Suite:** `backend/tests/test_generating_functions.py`  

---

## 1. Executive Summary & Mathematical Rigor

This module models the allocation of limited backup electricity across warehouse charging stations using **Ordinary Generating Functions (OGFs)** and the **Negative Binomial Theorem**.

### Mathematical Model
We seek the number of non-negative integer solutions to the Diophantine equation:
$$x_1 + x_2 + \dots + x_n = R$$
subject to lower-bound capacity constraints:
$$x_i \ge m \quad \forall i \in \{1, \dots, n\}$$
where:
- $n$: number of active charging bays
- $R$: total backup energy (kWh)
- $m$: minimum energy reserve required per bay (kWh)

### Step 1: Variable Substitution
By defining the flexible surplus for each bay $y_i = x_i - m \ge 0$:
$$y_1 + y_2 + \dots + y_n = R - mn = R'$$
where $R' = R - mn$ represents the remaining distributable energy after every bay's mandatory reserve is satisfied.

### Step 2: Ordinary Generating Function (OGF) Construction
Each bay's permissible power choices correspond to the infinite geometric formal power series:
$$f(x) = x^m + x^{m+1} + x^{m+2} + \dots = x^m (1 + x + x^2 + \dots) = \frac{x^m}{1 - x}$$

For $n$ independent charging bays, the joint generating function is the $n$-fold product:
$$G(x) = [f(x)]^n = \left( \frac{x^m}{1 - x} \right)^n = \frac{x^{mn}}{(1 - x)^n}$$

### Step 3: Negative Binomial Expansion
By the Negative Binomial Theorem:
$$\frac{1}{(1 - x)^n} = (1 - x)^{-n} = \sum_{k=0}^\infty \binom{k + n - 1}{n - 1} x^k$$

Multiplying by $x^{mn}$ shifts exponents by $mn$:
$$G(x) = \sum_{k=0}^\infty \binom{k + n - 1}{n - 1} x^{k + mn}$$

### Step 4: Extracting the Target Coefficient $[x^R] G(x)$
Setting the exponent $k + mn = R \implies k = R - mn$:
$$[x^R] G(x) = \begin{cases}
\dbinom{(R - mn) + n - 1}{n - 1} & \text{if } R \ge mn \\
0 & \text{if } R < mn \quad (\text{Insufficient Energy / Deficit})
\end{cases}$$

---

## 2. Official Benchmark Verification (n=4, R=100 kWh, m=15 kWh)

Substituting the university default parameters:
- $n = 4$ charging bays
- $R = 100$ kWh backup energy
- $m = 15$ kWh minimum reserve per bay
- Allocation unit $\Delta = 1$ kWh

1. **Combined Minimum Reserve:**
   $$mn = 4 \times 15 = 60 \text{ kWh}$$
2. **Remaining Distributable Energy:**
   $$R' = R - mn = 100 - 60 = 40 \text{ kWh}$$
3. **Combinatorial Coefficient Extraction:**
   $$[x^{100}] \left(\frac{x^{15}}{1 - x}\right)^4 = [x^{40}] \frac{1}{(1 - x)^4} = \binom{40 + 4 - 1}{4 - 1} = \binom{43}{3}$$
4. **Exact Integer Evaluation:**
   $$\binom{43}{3} = \frac{43 \times 42 \times 41}{3 \times 2 \times 1} = \frac{74,046}{6} = \mathbf{12,341}$$
5. **SymPy Symbolic Series Verification:**
   Using SymPy Taylor series expansion around $x=0$ up to order 101:
   $$\text{coeff}\left( \text{series}\left( \frac{x^{60}}{(1 - x)^4}, x, 0, 101 \right), x, 100 \right) \equiv \mathbf{12,341}$$
   $$\text{Combinatorial Result } (12,341) \equiv \text{SymPy Expansion } (12,341) \quad \checkmark \text{ VERIFIED}$$

---

## 3. Operational Scenarios Validated

| Scenario | Parameters ($n, R, m, \Delta$) | Reserve / Surplus | Mathematical Expression | Total Valid Allocations | Status |
|---|---|---|---|---|---|
| **1. Normal Availability** | $n=4, R=100, m=15, \Delta=1$ | $60 \text{ kWh} / +40 \text{ kWh}$ | $\binom{40 + 3}{3} = \binom{43}{3}$ | **12,341** | `FEASIBLE_SURPLUS` |
| **2. Limited Margin** | $n=4, R=68, m=15, \Delta=1$ | $60 \text{ kWh} / +8 \text{ kWh}$ | $\binom{8 + 3}{3} = \binom{11}{3}$ | **165** | `LIMITED_MARGIN` |
| **3. Critical Shortage** | $n=4, R=50, m=15, \Delta=1$ | $60 \text{ kWh} / -10 \text{ kWh}$ | $R < mn$ | **0** | `CRITICAL_DEFICIT` |
| **4. 5 kWh Quantization** | $n=4, R=100, m=15, \Delta=5$ | $12 \text{ units} / +8 \text{ units}$ | $\binom{8 + 3}{3} = \binom{11}{3}$ | **165** | `DISCRETIZED_STEP` |

---

## 4. Test Suite Execution Results

Command executed:
```bash
python -m pytest backend/tests/test_generating_functions.py -v
```

Output:
```text
============================= test session starts =============================
platform win32 -- Python 3.13.5, pytest-8.3.4, pluggy-1.6.0
rootdir: E:\semester 3\discrete mathematics and graph theory\AGV-INTELLIGENCE
collected 10 items

backend/tests/test_generating_functions.py::test_1_default_benchmark_12341 PASSED [ 10%]
backend/tests/test_generating_functions.py::test_2_minimum_possible_energy PASSED [ 20%]
backend/tests/test_generating_functions.py::test_3_insufficient_energy_deficit PASSED [ 30%]
backend/tests/test_generating_functions.py::test_4_single_charging_bay PASSED [ 40%]
backend/tests/test_generating_functions.py::test_5_different_bay_counts PASSED [ 50%]
backend/tests/test_generating_functions.py::test_6_different_minimum_reserves PASSED [ 60%]
backend/tests/test_generating_functions.py::test_7_energy_allocation_unit_scaling PASSED [ 70%]
backend/tests/test_generating_functions.py::test_8_input_validation_errors PASSED [ 80%]
backend/tests/test_generating_functions.py::test_9_backtracking_enumeration_exact_match PASSED [ 90%]
backend/tests/test_generating_functions.py::test_10_energy_scenarios_validation PASSED [100%]

============================= 10 passed in 4.60s ==============================
```

Full project test suite:
```text
============================= 44 passed in 11.25s ==============================
```

---

## 5. Artifacts Generated
- Diagram: `documentation/screenshots/generating_functions_derivation.svg`
