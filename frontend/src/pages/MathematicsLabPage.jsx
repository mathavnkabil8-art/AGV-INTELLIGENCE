import React, { useState } from 'react';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import {
  Calculator,
  BookOpen,
  GitFork,
  Grid3X3,
  Zap,
  AlertOctagon,
  Layers,
  CheckCircle2,
  Code,
} from 'lucide-react';

export default function MathematicsLabPage() {
  const [activeTopic, setActiveTopic] = useState('rook');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Discrete Mathematics & Graph Theory Laboratory
            </h2>
            <Badge variant="cyan" dot>
              THEORY & PROOFS
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Formal definitions, algebraic derivations, step-by-step algorithms, and discrete models.
          </p>
        </div>
      </div>

      {/* Module Selector Tabs */}
      <Tabs
        tabs={[
          { id: 'rook', label: '1. Rook Polynomials & PIE', icon: Grid3X3 },
          { id: 'graph-coloring', label: '2. Conflict Graphs & χ(G)', icon: GitFork },
          { id: 'generating-functions', label: '3. Generating Functions', icon: Zap },
          { id: 'deadlock', label: '4. Deadlock Theorems (WFG)', icon: AlertOctagon },
        ]}
        activeTab={activeTopic}
        onChange={setActiveTopic}
      />

      {/* TOPIC 1: Rook Polynomials & PIE */}
      {activeTopic === 'rook' && (
        <div className="space-y-6">
          <GlassCard
            title="Module 1: Rook Polynomials on Restricted Boards & Principle of Inclusion-Exclusion"
            subtitle="Combinatorics of non-attacking placements under physical clearance and dock incompatibilities"
            icon={Grid3X3}
          >
            <div className="space-y-5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {/* Abstract */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-blue-700 dark:text-cyan-300 font-mono text-xs uppercase tracking-wider block">
                  Problem Formulation
                </span>
                <p>
                  Let <code className="text-blue-600 dark:text-cyan-400 font-mono font-bold">B ⊆ [n] × [m]</code> denote the set of forbidden positions (where AGV <code className="text-blue-600 dark:text-cyan-400 font-mono font-semibold">i</code> cannot dock at charging pad <code className="text-blue-600 dark:text-cyan-400 font-mono font-semibold">j</code> due to charger wattage mismatch or dimensional clearance). We seek the exact number of complete valid assignments <code className="text-blue-600 dark:text-cyan-400 font-mono font-bold">N</code> where no AGV occupies a forbidden bay.
                </p>
              </div>

              {/* Theorem 1 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="amber">THEOREM 1.1</Badge>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Rook Polynomial Expansion
                  </h4>
                </div>
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-blue-700 dark:text-cyan-300 text-center font-bold shadow-2xs overflow-x-auto">
                  R(x, B) = ∑_{'{'}k=0{'}'}^{'{'}min(n, m){'}'} r_k(B) · x^k
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  Where <code className="text-slate-800 dark:text-slate-300 font-mono font-bold">r_k(B)</code> denotes the number of ways to arrange <code className="text-slate-800 dark:text-slate-300 font-mono font-bold">k</code> mutually non-attacking rooks solely on the cells of forbidden board <code className="text-slate-800 dark:text-slate-300 font-mono font-bold">B</code>. By definition, <code className="text-slate-800 dark:text-slate-300 font-mono font-bold">r_0(B) = 1</code>.
                </p>
              </div>

              {/* Theorem 2: PIE */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="emerald">THEOREM 1.2</Badge>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Valid Permutations via Principle of Inclusion-Exclusion (PIE)
                  </h4>
                </div>
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-emerald-700 dark:text-emerald-300 text-center text-sm font-bold shadow-2xs overflow-x-auto">
                  N = n! - r_1·(n-1)! + r_2·(n-2)! - r_3·(n-3)! + ... = ∑_{'{'}k=0{'}'}^n (-1)^k · r_k(B) · (n - k)!
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  When <code className="text-slate-800 dark:text-slate-300 font-mono font-bold">B</code> is the main diagonal of an <code className="text-slate-800 dark:text-slate-300 font-mono font-bold">n × n</code> board, this reduces to the classical <strong>Derangement Problem (!n)</strong>, confirming that our implementation yields exact mathematical derangements <code className="text-slate-800 dark:text-slate-300 font-mono font-bold">!3 = 2, !4 = 9, !5 = 44</code>.
                </p>
              </div>

              {/* Step by Step Examples */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white font-sans text-xs">
                      Derivation 1 (3 AGVs Diagonal):
                    </span>
                    <Badge variant="cyan" size="sm">!3 = 2</Badge>
                  </div>
                  <div className="space-y-1 text-slate-700 dark:text-slate-300">
                    <div>1. Forbidden B = {'{(0,0), (1,1), (2,2)}'}</div>
                    <div>2. r_0 = 1, r_1 = 3, r_2 = 3, r_3 = 1</div>
                    <div className="text-blue-700 dark:text-cyan-300 font-bold">3. R(x, B) = 1 + 3x + 3x² + x³ = (1 + x)³</div>
                    <div>4. N = 3! - 3·2! + 3·1! - 1·0!</div>
                    <div className="text-emerald-700 dark:text-emerald-400 font-bold">5. N = 6 - 6 + 3 - 1 = 2 valid ways</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-slate-950/60 border border-blue-200 dark:border-cyan-800/60 space-y-3 font-mono text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white font-sans text-xs">
                      Derivation 2 (4 AGVs Benchmark):
                    </span>
                    <Badge variant="emerald" size="sm">!4 = 9 (Verified)</Badge>
                  </div>
                  <div className="space-y-1 text-slate-700 dark:text-slate-300">
                    <div>1. Forbidden B = {'{(0,0), (1,1), (2,2), (3,3)}'}</div>
                    <div>2. r_k = C(4, k) → r_0=1, r_1=4, r_2=6, r_3=4, r_4=1</div>
                    <div className="text-blue-700 dark:text-cyan-300 font-bold">3. R(x, B) = 1 + 4x + 6x² + 4x³ + x⁴</div>
                    <div>4. N = 4! - 4·3! + 6·2! - 4·1! + 1·0!</div>
                    <div className="text-emerald-700 dark:text-emerald-400 font-bold">5. N = 24 - 24 + 12 - 4 + 1 = 9 valid ways</div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TOPIC 2: Graph Theory & Vertex Coloring */}
      {activeTopic === 'graph-coloring' && (
        <div className="space-y-6">
          <GlassCard
            title="Module 2: Topological Conflict Graphs & Minimal Vertex Coloring"
            subtitle="Mapping multi-agent spatial collisions to chromatic number scheduling"
            icon={GitFork}
          >
            <div className="space-y-5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-blue-700 dark:text-cyan-300 font-mono text-xs uppercase tracking-wider block">
                  Conflict Graph Construction
                </span>
                <p>
                  Let each planned spatio-temporal path be represented as a vertex <code className="text-blue-600 dark:text-cyan-400 font-mono font-semibold">v_i ∈ V_c</code>. An undirected edge <code className="text-rose-600 dark:text-cyan-400 font-mono font-semibold">(v_i, v_j) ∈ E_c</code> is introduced if trajectories <code className="text-slate-800 dark:text-slate-200 font-semibold">i</code> and <code className="text-slate-800 dark:text-slate-200 font-semibold">j</code> share a coordinate at the same time-step (vertex collision) or cross adjacent cells in opposing directions (edge swap collision).
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="cyan">THEOREM 2.1</Badge>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Vertex Coloring & Time-Slot Channel Separation
                  </h4>
                </div>
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-blue-700 dark:text-cyan-300 text-center font-bold shadow-2xs overflow-x-auto">
                  c: V_c → {'{'}0, 1, ..., k-1{'}'} such that (u, v) ∈ E_c ⟹ c(u) ≠ c(v)
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  The chromatic number <code className="text-slate-800 dark:text-slate-300 font-mono font-bold">χ(G_c)</code> represents the minimum number of discrete execution slots required to guarantee collision-free operation across the entire warehouse fleet.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="emerald">ALGORITHM 2.2</Badge>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Welsh-Powell Greedy Coloring Strategy
                  </h4>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-1.5 text-slate-700 dark:text-slate-300 shadow-2xs">
                  <div>1. Compute vertex degrees deg(v) for all v ∈ V_c.</div>
                  <div>2. Sort vertices in descending order of degree: deg(v_1) ≥ deg(v_2) ≥ ... ≥ deg(v_n).</div>
                  <div>3. Assign lowest permissible color to highest-degree vertex.</div>
                  <div>4. Sequentially color all non-adjacent vertices with the same color before incrementing.</div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-bold">Result: χ(G_c) ≤ Δ(G_c) + 1 upper bound satisfied.</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TOPIC 3: Generating Functions */}
      {activeTopic === 'generating-functions' && (
        <div className="space-y-6">
          <GlassCard
            title="Module 3: Ordinary Generating Functions (OGFs) for Backup Energy Distribution"
            subtitle="Integer partitions with reserve constraints via formal power series and the Negative Binomial Theorem"
            icon={Zap}
          >
            <div className="space-y-5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-blue-700 dark:text-cyan-300 font-mono text-xs uppercase tracking-wider block">
                  Problem Formulation
                </span>
                <p>
                  A warehouse microgrid has <code className="text-blue-600 dark:text-cyan-400 font-mono font-bold">R</code> units of total backup electricity to partition among <code className="text-blue-600 dark:text-cyan-400 font-mono font-bold">n</code> charging bays. Each bay must receive a minimum reserve of <code className="text-blue-600 dark:text-cyan-400 font-mono font-bold">m</code> kWh:
                </p>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-blue-700 dark:text-cyan-300 text-center font-bold shadow-2xs overflow-x-auto">
                  x₁ + x₂ + ... + xₙ = R,  with xᵢ ≥ m for all i ∈ {'{'}1, ..., n{'}'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="emerald">THEOREM 3.1</Badge>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Ordinary Generating Function Construction
                  </h4>
                </div>
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-emerald-700 dark:text-emerald-300 text-center text-sm font-bold shadow-2xs overflow-x-auto">
                  G(x) = (xᵐ + xᵐ⁺¹ + xᵐ⁺² + ...)ⁿ = (xᵐ / (1 - x))ⁿ = xᵐⁿ / (1 - x)ⁿ
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  Each bay's infinite sequence of valid integer power choices <code className="text-slate-800 dark:text-slate-300 font-mono font-bold">&#123;m, m+1, m+2, ...&#125;</code> is captured by the geometric series <code className="text-blue-600 dark:text-cyan-400 font-mono font-bold">xᵐ / (1 - x)</code>.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="cyan">THEOREM 3.2</Badge>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Negative Binomial Coefficient Extraction
                  </h4>
                </div>
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-blue-700 dark:text-cyan-300 text-center text-sm font-bold shadow-2xs overflow-x-auto">
                  [xᴿ] G(x) = [xᴿ⁻ᵐⁿ] (1 - x)⁻ⁿ = C((R - mn) + n - 1, n - 1)
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  By the Negative Binomial Theorem, <code className="text-slate-800 dark:text-slate-300 font-mono font-bold">(1 - x)⁻ⁿ = ∑ C(k + n - 1, n - 1) xᵏ</code>, shifting exponents by <code className="text-slate-800 dark:text-slate-300 font-mono font-bold">mn</code> matches the classical Stars and Bars partition on the remaining energy <code className="text-slate-800 dark:text-slate-300 font-mono font-bold">R - mn</code>.
                </p>
              </div>

              {/* Benchmark Validation Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-blue-200 dark:border-cyan-800/60 space-y-3 font-mono text-xs shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white font-sans text-xs">
                    Official University Benchmark: 4 Bays, 100 kWh, 15 kWh Min Reserve
                  </span>
                  <Badge variant="emerald" size="sm">Exact: 12,341 (Verified)</Badge>
                </div>
                <div className="space-y-1 text-slate-700 dark:text-slate-300">
                  <div>1. Parameters: n = 4 bays, R = 100 kWh, m = 15 kWh/bay.</div>
                  <div>2. Aggregate Minimum Reserve: n × m = 4 × 15 = 60 kWh.</div>
                  <div>3. Remaining Distributable Surplus: R - nm = 100 - 60 = 40 kWh.</div>
                  <div className="text-blue-700 dark:text-cyan-300 font-bold">4. Target Coefficient: [x¹⁰⁰] (x¹⁵ / (1 - x))⁴ = [x⁴⁰] (1 - x)⁻⁴</div>
                  <div>5. Binomial Coefficient: C(40 + 4 - 1, 4 - 1) = C(43, 3)</div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-bold">
                    6. C(43, 3) = (43 × 42 × 41) / (3 × 2 × 1) = 74,046 / 6 = 12,341 possible allocations
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TOPIC 4: Deadlocks & Wait-For Graph */}
      {activeTopic === 'deadlock' && (
        <div className="space-y-6">
          <GlassCard
            title="Module 4: Directed Wait-For Graphs & Deadlock Theorems"
            subtitle="Topological cycle analysis and strongly connected component decomposition"
            icon={AlertOctagon}
          >
            <div className="space-y-5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-rose-700 dark:text-rose-300 font-mono text-xs uppercase tracking-wider block">
                  Wait-For Graph Theorem
                </span>
                <p>
                  Let <code className="text-rose-600 dark:text-rose-400 font-mono font-bold">D = (V_A, E_W)</code> be a directed graph where <code className="text-rose-600 dark:text-rose-400 font-mono font-bold">(u → v) ∈ E_W</code> if agent <code className="text-rose-600 dark:text-rose-400 font-mono font-bold">u</code> is halted awaiting entry into a cell currently reserved by agent <code className="text-rose-600 dark:text-rose-400 font-mono font-bold">v</code>.
                </p>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-center text-amber-700 dark:text-amber-300 font-bold shadow-2xs">
                  System Deadlock ⟺ ∃ directed simple cycle C ⊆ D
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="cyan">ALGORITHM 4.1</Badge>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Tarjan's Strongly Connected Components (SCC)
                  </h4>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Using depth-first search (DFS) with low-link values, all strongly connected clusters with cardinality <code className="text-slate-800 dark:text-slate-300 font-mono font-bold">&gt; 1</code> are identified in linear time <code className="text-slate-800 dark:text-slate-300 font-mono font-bold">O(|V| + |E|)</code>, isolating deadlocked clusters for targeted priority back-off.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
