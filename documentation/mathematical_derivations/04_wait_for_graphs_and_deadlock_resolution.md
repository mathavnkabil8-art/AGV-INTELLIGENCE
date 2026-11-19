# Module 4: Directed Wait-For Graphs & Deadlock Resolution

**Course:** Discrete Mathematics & Graph Theory  
**Module:** Multi-Agent Circular Wait Detection, Strongly Connected Components & Detour Replanning  
**System:** AGV-INTELLIGENCE Industrial Digital Twin  

---

## 1. Multi-Agent Deadlock Theory: Coffman Conditions

In a discrete warehouse multi-agent robotic system, a deadlock occurs if and only if all four Coffman conditions hold simultaneously:
1. **Mutual Exclusion:** A grid coordinate $c = (x, y)$ can be held by at most one AGV at any discrete time $t$.
2. **Hold and Wait:** An AGV $A_i$ currently occupies cell $c_i$ while waiting to enter an adjacent cell $c_j$.
3. **No Preemption:** An AGV cannot be physically removed or overridden by another robot from its current location.
4. **Circular Wait:** A closed dependency loop of AGVs exists: $A_1$ waits for $A_2$, $A_2$ waits for $A_3$, $\dots$, and $A_k$ waits for $A_1$.

---

## 2. Directed Wait-For Graph (WFG) $D = (V_A, E_W)$

### 2.1 Formal Definition
Let $V_A = \{A_1, A_2, \dots, A_n\}$ denote the set of active AGV agents.
Let $\text{pos}(A_i) \in V$ be the current position of $A_i$.
Let $\text{next}(A_i) \in V$ be the desired next adjacent cell along $A_i$'s planned shortest route.

The Wait-For Graph is a directed graph $D = (V_A, E_W)$ where a directed edge exists:
$$(A_i \to A_j) \in E_W \iff (\text{next}(A_i) = \text{pos}(A_j)) \land (i \ne j)$$

### 2.2 Deadlock Theorem
**Theorem:** *A multi-agent AGV traffic system contains an unresolved deadlock if and only if the Wait-For Graph $D = (V_A, E_W)$ contains at least one directed simple cycle $C = (v_1, v_2, \dots, v_k, v_1)$.*

**Proof Sketch:**
- If $D$ is a Directed Acyclic Graph (DAG), topological sort yields a linear ordering $A_{\pi(1)}, \dots, A_{\pi(n)}$ such that the sink agent $A_{\pi(n)}$ has out-degree 0 (its desired next cell is unoccupied). $A_{\pi(n)}$ advances, vacating its cell for $A_{\pi(n-1)}$, and by induction all agents advance. Hence no deadlock exists.
- If $D$ contains a directed cycle $C$, every agent in $C$ has out-degree $\ge 1$ within the cycle; no agent in $C$ can advance until the agent ahead advances. By no preemption and mutual exclusion, this forms an infinite temporal stall. $\blacksquare$

---

## 3. Cycle Detection via Tarjan's Strongly Connected Components

### 3.1 Strongly Connected Components (SCC)
A subgraph $S \subseteq D$ is strongly connected if there is a directed path between every pair of vertices in $S$.
- Any non-trivial SCC with $|S| > 1$ or containing a self-loop indicates mutual circular dependencies.
- Tarjan's algorithm uses depth-first search (DFS) with low-link values to detect all SCCs in $\mathcal{O}(|V_A| + |E_W|)$ time.

---

## 4. Priority-Based Yielding & Physical Dijkstra Detour Recovery

### 4.1 True Physical Route Replanning (No Artificial Edge Deletion)
In naive or toy simulations, deadlocks are often "resolved" by deleting graph edges or teleporting vehicles. In the AGV-INTELLIGENCE industrial twin, deadlocks are broken physically:
1. **Cycle Identification:** Extract the simple cycle $C = (A_1, A_2, \dots, A_k, A_1)$.
2. **Yield Agent Selection:** Choose the robot with the lowest mission priority or least critical payload:
   $$A_{\text{yield}} = \arg\min_{A \in C} \text{priority}(A)$$
3. **Obstacle Augmentation:** Treat all other active robots' current positions as dynamic physical obstacles:
   $$O_{\text{detour}} = O_{\text{warehouse}} \cup \{\text{pos}(A_i) \mid A_i \in V_A \setminus \{A_{\text{yield}}\}\}$$
4. **Physical Detour Recalculation:** Compute an alternate collision-free geodesic path for $A_{\text{yield}}$ to its destination $d$:
   $$\pi'_{\text{yield}} = \text{Dijkstra}\left(\text{pos}(A_{\text{yield}}), d, G \setminus O_{\text{detour}}\right)$$
5. **Immediate Sidestep Fallback:** If no direct path to $d$ exists due to localized congestion, $A_{\text{yield}}$ sidesteps into an unoccupied neighboring cell $n \in \text{neighbors}(\text{pos}(A_{\text{yield}})) \setminus O_{\text{detour}}$ to vacate its cell and break the cycle.
6. **Defensive Safety Interlock:** If $A_{\text{yield}}$ is completely boxed in by structural barriers and robots such that no vacant adjacent cell exists, the system flags `strategy: "NO_FEASIBLE_DETOUR"` and `resolved: False`, preventing illegal maneuvers.
