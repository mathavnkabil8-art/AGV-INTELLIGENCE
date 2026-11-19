# Discrete Mathematics & Graph Theory Derivations

This directory contains formal mathematical derivations, definitions, theorems, and proofs for the AGV Intelligence project:

1. **Graph Routing & Chromatic Number Bounds**
   - Grid topology $G = (V, E)$
   - Conflict Graph $G_c = (V_c, E_c)$ formulation for vertex collisions and edge swaps
   - Vertex coloring bounds $\chi(G_c) \le \Delta(G_c) + 1$ via Welsh-Powell

2. **Rook Polynomials & Principle of Inclusion-Exclusion (PIE)**
   - Forbidden board $B \subseteq [n] \times [n]$ representation
   - $R(x, B) = \sum_{k=0}^n r_k(B) x^k$
   - Derivation of valid complete assignments: $N = \sum_{k=0}^n (-1)^k r_k(B) (n - k)!$

3. **Ordinary Generating Functions (OGF) for Energy Quotas**
   - Single-agent capacity polynomial $P_i(x) = \sum_{j=L_i}^{U_i} x^j$
   - Fleet joint distribution generating function $G(x) = \prod_{i=1}^k P_i(x)$
   - Extraction of coefficient $[x^E] G(x)$

4. **Deadlock Detection via Directed Wait-For Graphs**
   - Wait-For Graph $D = (V_A, E_W)$
   - Equivalence of circular wait and directed cycles
   - Cycle decomposition via Tarjan's SCC and greedy feedback vertex resolution
