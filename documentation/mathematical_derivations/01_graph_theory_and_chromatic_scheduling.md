# Module 1: Graph Theory & Chromatic Conflict Scheduling

**Course:** Discrete Mathematics & Graph Theory  
**Module:** Planar Warehouse Graph Routing & Spatio-Temporal Conflict Graph Coloring  
**System:** AGV-INTELLIGENCE Industrial Digital Twin  

---

## 1. Warehouse Grid Topology $G = (V, E)$

### 1.1 Definition
The physical warehouse floor is modeled as a finite, undirected planar grid graph $G = (V, E)$:
- $V \subseteq \{0, 1, \dots, W-1\} \times \{0, 1, \dots, H-1\} \setminus O$, where:
  - $W = 8$ (grid width), $H = 8$ (grid height),
  - $O \subset \mathbb{Z}^2$ is the set of impassable structural obstacle cells and barriers.
- An undirected edge $e = \{u, v\} \in E$ exists between $u = (x_1, y_1)$ and $v = (x_2, y_2)$ if and only if:
  $$|x_1 - x_2| + |y_1 - y_2| = 1 \quad \text{and} \quad u, v \notin O$$

### 1.2 Structural Properties
- In an obstacle-free $8 \times 8$ grid:
  - Vertex cardinality: $|V| = 8 \times 8 = 64$.
  - Edge cardinality: $|E| = 2 \times 8 \times (8 - 1) = 112$.
  - Corner vertices $(0, 0), (0, 7), (7, 0), (7, 7)$ have degree $\deg(v) = 2$.
  - Boundary vertices (excluding corners) have degree $\deg(v) = 3$.
  - Interior vertices have degree $\deg(v) = 4$.
- When $k = |O|$ obstacles are introduced, $|V| = 64 - k$, and all edges incident to $O$ are removed:
  $$E' = E \setminus \{\{u, v\} \mid u \in O \lor v \in O\}$$

### 1.3 Shortest Path Metrics
For any start $s \in V$ and destination $d \in V$, the geodesic path $\pi^*(s, d)$ minimizes cumulative edge weights:
$$\pi^*(s, d) = \arg\min_{\pi \in \Pi(s, d)} \sum_{e \in \pi} w(e)$$
- **BFS (Breadth-First Search):** Finds minimum-hop paths in unweighted graphs in $\mathcal{O}(|V| + |E|)$ time.
- **Dijkstra's Algorithm:** Computes weighted shortest paths with non-negative edge costs $w(e) \ge 0$ in $\mathcal{O}(|E| + |V| \log |V|)$ time using a Fibonacci or binary min-heap.

---

## 2. Spatio-Temporal Conflict Graph $G_c = (V_c, E_c)$

### 2.1 Spatio-Temporal Trajectories
Let $\mathcal{A} = \{A_1, A_2, \dots, A_k\}$ denote the active AGV fleet. Each robot $A_i$ is assigned a planned route $\tau_i = (p_{i,0}, p_{i,1}, \dots, p_{i,L_i})$, where $p_{i,t} \in V$ is the cell occupied at discrete time step $t$.

### 2.2 Conflict Conditions
Two trajectories $\tau_i$ and $\tau_j$ ($i \ne j$) conflict if either of the following physical interference conditions holds:
1. **Vertex Collision (Shared Cell Claim at Time $t$):**
   $$\exists t \ge 0 : p_{i,t} = p_{j,t}$$
2. **Edge-Swap Collision (Head-On Opposite Traversal at Time $t$):**
   $$\exists t \ge 0 : (p_{i,t} = p_{j,t+1}) \land (p_{i,t+1} = p_{j,t})$$
3. **Follower Cell Collision (Trailing Distance Violation):**
   $$\exists t \ge 0 : p_{i,t+1} = p_{j,t} \quad \text{when } A_j \text{ halts at } p_{j,t}$$

### 2.3 Conflict Graph Construction
The conflict graph $G_c = (V_c, E_c)$ is an undirected graph where:
- $V_c = \mathcal{A}$ (each vertex represents an AGV routing task).
- Edge $\{A_i, A_j\} \in E_c \iff \tau_i \text{ and } \tau_j \text{ have at least one collision condition}$.

---

## 3. Vertex Coloring & Temporal Phase Scheduling

### 3.1 Mathematical Problem
Assign a color $c: V_c \to \{0, 1, \dots, \chi(G_c)-1\}$ such that:
$$\forall \{u, v\} \in E_c \implies c(u) \ne c(v)$$
Each color class $C_k = \{u \in V_c \mid c(u) = k\}$ constitutes an **independent set** in $G_c$. All AGVs in $C_k$ can execute their missions simultaneously without spatio-temporal interference.

### 3.2 Brooks' Theorem & Upper Bounds
For any connected conflict graph $G_c$ that is neither an odd cycle $C_{2k+1}$ nor a complete graph $K_n$:
$$\chi(G_c) \le \Delta(G_c)$$
In all cases, greedy sequential coloring satisfies:
$$\chi(G_c) \le \Delta(G_c) + 1$$
Where $\Delta(G_c) = \max_{v \in V_c} \deg_{G_c}(v)$ is the maximum vertex degree in the conflict graph.

### 3.3 Welsh-Powell Greedy Algorithm
1. Compute degrees $\deg(v)$ for all $v \in V_c$.
2. Sort vertices in non-increasing degree order: $\deg(v_1) \ge \deg(v_2) \ge \dots \ge \deg(v_n)$.
3. Assign color $0$ to the first uncolored vertex $v_1$.
4. Traverse the sorted list sequentially; assign color $0$ to every uncolored vertex $v_i$ that is not adjacent in $G_c$ to any vertex already colored with color $0$.
5. Repeat for subsequent colors $1, 2, \dots$ until all vertices are colored.

**Computational Complexity:** Sorting takes $\mathcal{O}(|V_c| \log |V_c|)$; coloring checks require $\mathcal{O}(|V_c| + |E_c|)$.
