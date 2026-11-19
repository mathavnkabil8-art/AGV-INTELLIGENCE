# Module 2: Rook Polynomials & Principle of Inclusion-Exclusion (PIE)

**Course:** Discrete Mathematics & Graph Theory  
**Module:** Restricted Board Bipartite Matching for Smart Charging Allocation  
**System:** AGV-INTELLIGENCE Industrial Digital Twin  

---

## 1. Problem Formulation: Incompatible AGV-to-Charger Matching

### 1.1 Scenario Definition
Consider a fleet of $n$ low-battery AGV robots $\mathcal{R} = \{R_1, R_2, \dots, R_n\}$ and $m$ inductive charging stations $\mathcal{D} = \{D_1, D_2, \dots, D_m\}$.
Certain robot-to-dock pairs $(R_i, D_j)$ are physically or electrically incompatible due to:
- Connector voltage mismatches,
- Physical docking pad dimensions,
- Clearance limitations or bay maintenance.

### 1.2 Forbidden Position Board $B$
The assignment problem is represented on an $n \times m$ chessboard:
- Row $i \in \{0, 1, \dots, n-1\}$ represents AGV $R_{i+1}$.
- Column $j \in \{0, 1, \dots, m-1\}$ represents Charging Dock $D_{j+1}$.
- Cell $(i, j) \in B \subseteq [n] \times [m]$ represents a **forbidden assignment** ($R_{i+1}$ cannot be assigned to $D_{j+1}$).

The binary forbidden matrix is defined as:
$$M_{i,j} = \begin{cases} 1 & \text{if } (i, j) \in B \text{ (forbidden)} \\ 0 & \text{if } (i, j) \notin B \text{ (permitted)} \end{cases}$$

---

## 2. Rook Polynomial Definition & Algebraic Properties

### 2.1 Generating Function Definition
The Rook Polynomial $R(x, B)$ of the forbidden board $B$ is the generating function:
$$R(x, B) = \sum_{k=0}^{\min(n, m)} r_k(B) x^k = r_0 + r_1 x + r_2 x^2 + \dots + r_{\min(n, m)} x^{\min(n, m)}$$
Where:
- $r_k(B)$ is the number of ways to place $k$ non-attacking rooks on the forbidden cells of $B$.
- Two rooks attack each other if they share the same row or the same column.
- By combinatorial convention: $r_0(B) = 1$ (the empty placement).
- $r_1(B) = |B|$ (total number of forbidden cells).

### 2.2 Decomposition Expansion Theorems
For any cell $e = (i, j) \in B$:
$$R(x, B) = x \cdot R(x, B_e) + R(x, B \setminus \{e\})$$
Where:
- $B \setminus \{e\}$ is the board with cell $e$ deleted (a rook is NOT placed on $e$).
- $B_e$ is the subboard formed by deleting row $i$ and column $j$ from $B$ (a rook IS placed on $e$, preventing any other rook in that row or column).

For disjoint independent subboards $B = B_1 \cup B_2$ where no cell of $B_1$ shares a row or column with $B_2$:
$$R(x, B_1 \cup B_2) = R(x, B_1) \cdot R(x, B_2)$$

---

## 3. Counting Valid Matchings via Inclusion-Exclusion

### 3.1 Principle of Inclusion-Exclusion (PIE) Formulation
Let $S$ denote the set of all $n!$ one-to-one assignments from $\mathcal{R}$ to $\mathcal{D}$ (for $n = m$).
Let $P_i$ denote the property that the assignment places robot $R_i$ at a forbidden dock:
$$N(P_1' P_2' \dots P_n') = |S| - \sum_i |S(P_i)| + \sum_{i < j} |S(P_i P_j)| - \dots + (-1)^n |S(P_1 P_2 \dots P_n)|$$

Substituting the rook polynomial coefficients $r_k(B)$:
$$N = \sum_{k=0}^n (-1)^k \cdot r_k(B) \cdot (n - k)!$$

### 3.2 Step-by-Step Derivation for the Benchmark $4 \times 4$ Diagonal Board
Consider $n = 4$ AGVs and $m = 4$ docks with main-diagonal clearance restrictions:
$$B = \{(0, 0), (1, 1), (2, 2), (3, 3)\}$$

#### Step 1: Compute Rook Coefficients $r_k(B)$
Since all 4 forbidden cells occupy distinct rows and distinct columns, any choice of $k$ cells from $B$ is automatically non-attacking:
$$r_k(B) = \binom{4}{k}$$
- $r_0 = \binom{4}{0} = 1$
- $r_1 = \binom{4}{1} = 4$
- $r_2 = \binom{4}{2} = 6$
- $r_3 = \binom{4}{3} = 4$
- $r_4 = \binom{4}{4} = 1$

Therefore:
$$R(x, B) = 1 + 4x + 6x^2 + 4x^3 + x^4 = (1 + x)^4$$

#### Step 2: Evaluate PIE Summation
$$N = \sum_{k=0}^4 (-1)^k r_k (4 - k)!$$
- **Term $k = 0$:** $+1 \cdot r_0 \cdot 4! = +1 \cdot 1 \cdot 24 = +24$
- **Term $k = 1$:** $-1 \cdot r_1 \cdot 3! = -1 \cdot 4 \cdot 6 = -24$
- **Term $k = 2$:** $+1 \cdot r_2 \cdot 2! = +1 \cdot 6 \cdot 2 = +12$
- **Term $k = 3$:** $-1 \cdot r_3 \cdot 1! = -1 \cdot 4 \cdot 1 = -4$
- **Term $k = 4$:** $+1 \cdot r_4 \cdot 0! = +1 \cdot 1 \cdot 1 = +1$

Summing all signed terms:
$$N = 24 - 24 + 12 - 4 + 1 = \mathbf{9}$$

#### Step 3: Derangement Number Equivalence
A permutation $\sigma \in S_n$ with no fixed points ($\sigma(i) \ne i$ for all $i$) is a **derangement**, denoted $!n$:
$$!n = n! \sum_{k=0}^n \frac{(-1)^k}{k!} = 4! \left(1 - 1 + \frac{1}{2} - \frac{1}{6} + \frac{1}{24}\right) = 24 \left(\frac{12 - 4 + 1}{24}\right) = \mathbf{9}$$
The Rook Polynomial PIE formulation proves that smart charging compatibility matching on a diagonal forbidden board is isomorphic to the classical derangement problem $!4 = 9$.
