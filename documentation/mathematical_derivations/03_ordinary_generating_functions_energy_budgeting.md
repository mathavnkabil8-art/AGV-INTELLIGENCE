# Module 3: Ordinary Generating Functions for Backup Energy Distribution

**Course:** Discrete Mathematics & Graph Theory  
**Module:** Formal Power Series & Combinatorial Integer Partitioning for Grid Backup Power  
**System:** AGV-INTELLIGENCE Industrial Digital Twin  

---

## 1. Problem Formulation: Discrete Energy Partitioning

### 1.1 Scenario Definition
During warehouse microgrid brownouts or primary grid peak-shaving periods, a fixed total quantity of backup electrical energy $R$ (in kWh) must be distributed across $n$ active charging bays:
- Let $x_i \in \mathbb{Z}_{\ge 0}$ denote the integer amount of electrical energy (in kWh) allocated to charging bay $i \in \{1, 2, \dots, n\}$.
- The total energy conservation constraint requires:
  $$x_1 + x_2 + \dots + x_n = R$$
- Each charging bay requires a mandatory minimum energy reserve $m$ (in kWh) to maintain critical telemetry, cooling, and battery pre-conditioning:
  $$x_i \ge m \quad \forall i \in \{1, 2, \dots, n\}$$
- When an energy allocation unit $u > 1$ is configured, all physical values scale as $x_i = u \cdot x_i'$ with $R = u \cdot R'$ and $m = u \cdot m'$.

---

## 2. Ordinary Generating Function (OGF) Model

### 2.1 Single Bay Representation
For an individual charging bay $i$, the allowed energy allocations are $x_i \in \{m, m+1, m+2, \dots\}$. The generating function for this constraint is the formal power series:
$$g_i(x) = x^m + x^{m+1} + x^{m+2} + \dots = \sum_{j=m}^\infty x^j$$
Factoring out the minimum reserve $x^m$:
$$g_i(x) = x^m \left(1 + x + x^2 + \dots\right) = \frac{x^m}{1 - x} \quad \text{for } |x| < 1$$

### 2.2 Aggregate System Generating Function
Since allocations across the $n$ charging bays are independent, the joint generating function $G(x)$ for the sum $x_1 + x_2 + \dots + x_n$ is the product of the individual generating functions:
$$G(x) = \prod_{i=1}^n g_i(x) = \left(\frac{x^m}{1 - x}\right)^n = \frac{x^{mn}}{(1 - x)^n}$$

The number of valid energy distribution configurations is the coefficient of $x^R$ in the expansion of $G(x)$:
$$N(n, R, m) = [x^R] G(x) = [x^R] \frac{x^{mn}}{(1 - x)^n}$$

---

## 3. Negative Binomial Series Expansion & Closed-Form Solution

### 3.1 Series Expansion
Using the index shift property of generating functions:
$$[x^R] x^{mn} (1 - x)^{-n} = [x^{R - mn}] (1 - x)^{-n}$$
Applying the negative binomial theorem:
$$(1 - x)^{-n} = \sum_{k=0}^\infty \binom{k + n - 1}{n - 1} x^k$$
Extracting the coefficient at $k = R - mn$:
$$[x^{R - mn}] (1 - x)^{-n} = \binom{(R - mn) + n - 1}{n - 1}$$

### 3.2 Closed-Form Combinatorial Formula
$$N(n, R, m) = \begin{cases} \binom{R - mn + n - 1}{n - 1} & \text{if } R \ge mn \\ 0 & \text{if } R < mn \end{cases}$$

### 3.3 Evaluation for the Official Benchmark Configuration
Parameters:
- Number of charging bays: $n = 4$
- Total backup energy: $R = 100$ kWh
- Minimum reserve per bay: $m = 15$ kWh
- Energy unit: $u = 1$ kWh

#### Step 1: Minimum Reserve Requirement Check
$$\text{Aggregate Reserve} = nm = 4 \times 15 = 60\text{ kWh}$$
Since $R = 100 \ge 60$, the system is feasible ($R - mn = 100 - 60 = 40$ kWh of surplus energy).

#### Step 2: Binomial Coefficient Calculation
$$N = \binom{40 + 4 - 1}{4 - 1} = \binom{43}{3}$$
$$\binom{43}{3} = \frac{43 \times 42 \times 41}{3 \times 2 \times 1} = \frac{74,046}{6} = 43 \times 7 \times 41 = 301 \times 41 = \mathbf{12,341}$$

### 3.4 Operational Regimes and Deficit Handling
1. **Surplus Regime ($R = 100$ kWh, $m = 15$ kWh, $n = 4$):**
   $$R - mn = 40 \implies \binom{43}{3} = 12,341 \text{ valid distributions}$$
2. **Nominal / Limited Margin ($R = 68$ kWh, $m = 15$ kWh, $n = 4$):**
   $$R - mn = 8 \implies \binom{8 + 3}{3} = \binom{11}{3} = \frac{11 \times 10 \times 9}{6} = 165 \text{ valid distributions}$$
3. **Critical Energy Shortage ($R = 50$ kWh, $m = 15$ kWh, $n = 4$):**
   $$R < mn \iff 50 < 60\text{ kWh}$$
   Deficit $\Delta = 60 - 50 = 10$ kWh.
   $$N = 0 \text{ feasible configurations}$$
   The OGF closed-form equation immediately detects the shortage and triggers safety interlocks before fleet dispatch.
