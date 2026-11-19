import React, { useState } from 'react';
import { apiClient } from '../../api/client';
import { GitFork, Calculator, RefreshCw, CheckCircle2, AlertOctagon, Zap } from 'lucide-react';

export default function AlgorithmsPanel() {
  const [activeTab, setActiveTab] = useState('rook'); // 'rook' | 'generating' | 'conflict' | 'deadlock' | 'optimization'
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});

  // 1. Rook Polynomial state
  const [rookAgvs, setRookAgvs] = useState(3);
  const [rookDests, setRookDests] = useState(3);
  const [forbiddenStr, setForbiddenStr] = useState('0,0; 1,1; 2,2');

  // 2. Generating function state
  const [gfEnergy, setGfEnergy] = useState(12);
  const [gfBoundsStr, setGfBoundsStr] = useState('2,5; 1,4; 3,6');

  // Handlers
  const handleRunRook = async () => {
    setLoading(true);
    try {
      const pairs = forbiddenStr
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((pair) => {
          const [r, c] = pair.split(',').map(Number);
          return [r, c];
        });

      const res = await apiClient.computeRookPolynomial({
        num_agvs: Number(rookAgvs),
        num_destinations: Number(rookDests),
        forbidden_pairs: pairs,
      });
      setResults((prev) => ({ ...prev, rook: res }));
    } catch (err) {
      alert('Error running Rook Polynomial calculation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunGF = async () => {
    setLoading(true);
    try {
      const bounds = gfBoundsStr
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((b) => {
          const [l, u] = b.split(',').map(Number);
          return [l, u];
        });

      const res = await apiClient.computeGeneratingFunction({
        total_energy: Number(gfEnergy),
        agv_bounds: bounds,
      });
      setResults((prev) => ({ ...prev, gf: res }));
    } catch (err) {
      alert('Error running Generating Function: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunConflictGraph = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getConflictGraph();
      setResults((prev) => ({ ...prev, conflict: res }));
    } catch (err) {
      alert('Error evaluating Conflict Graph: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunDeadlock = async () => {
    setLoading(true);
    try {
      const res = await apiClient.checkDeadlocks();
      setResults((prev) => ({ ...prev, deadlock: res }));
    } catch (err) {
      alert('Error checking Deadlock WFG: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunOptimization = async () => {
    setLoading(true);
    try {
      const res = await apiClient.optimizeCharging();
      setResults((prev) => ({ ...prev, optimization: res }));
    } catch (err) {
      alert('Error computing Bipartite Matching: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="text-cyan-400" size={20} />
            <h2 className="text-lg font-bold text-white">Discrete Mathematics & Graph Theory Core</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Independently verified mathematical engines powering AGV routing, inclusion-exclusion dispatch, and deadlocks.
          </p>
        </div>

        {/* Algorithm Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'rook', label: 'Rook Polynomial & PIE' },
            { id: 'generating', label: 'Generating Functions' },
            { id: 'conflict', label: 'Conflict Graph Coloring' },
            { id: 'deadlock', label: 'Deadlock (WFG)' },
            { id: 'optimization', label: 'Bipartite Matching' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-black font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Rook Polynomial & PIE */}
      {activeTab === 'rook' && (
        <div className="space-y-4">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <h3 className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">Mathematical Model</h3>
            <p className="text-slate-300">
              Models non-conflicting dispatch where certain (AGV, Dock) assignments are strictly forbidden.
              Computes rook polynomial <code className="text-cyan-400">R(x, B) = ∑ r_k(B) x^k</code> and derives valid complete matches via the Principle of Inclusion-Exclusion (PIE):
            </p>
            <div className="font-mono bg-slate-900 p-2 rounded text-cyan-300 text-center text-xs">
              N = ∑_{'{'}k=0{'}'}^n (-1)^k · r_k(B) · (n - k)!
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">AGV Count (n):</label>
              <input
                type="number"
                value={rookAgvs}
                onChange={(e) => setRookAgvs(e.target.value)}
                min="1"
                max="8"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Docks Count (m):</label>
              <input
                type="number"
                value={rookDests}
                onChange={(e) => setRookDests(e.target.value)}
                min="1"
                max="8"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Forbidden Cells (r,c; ...):</label>
              <input
                type="text"
                value={forbiddenStr}
                onChange={(e) => setForbiddenStr(e.target.value)}
                placeholder="0,0; 1,1; 2,2"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleRunRook}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            <Calculator size={14} />
            <span>Evaluate Rook Polynomial & PIE</span>
          </button>

          {results.rook && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 size={16} />
                <span>Exact Mathematical Solution:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Rook Polynomial R(x, B):</div>
                  <div className="text-cyan-300 font-bold mt-1">{results.rook.polynomial_str}</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Rook Coefficients [r_0, r_1, ...]:</div>
                  <div className="text-cyan-300 font-bold mt-1">[{results.rook.coefficients.join(', ')}]</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Permutations via PIE (N):</div>
                  <div className="text-emerald-400 font-bold text-base mt-1">{results.rook.pie_valid_assignments_count} valid ways</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Ground-Truth Verification:</div>
                  <div className="text-slate-300 mt-1">{results.rook.explicit_valid_assignments_count} explicit permutations match</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Generating Functions */}
      {activeTab === 'generating' && (
        <div className="space-y-4">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <h3 className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">Mathematical Model</h3>
            <p className="text-slate-300">
              Evaluates discrete energy quota allocation among AGVs using Ordinary Generating Functions (OGF).
              Extracts the coefficient <code className="text-cyan-400">[x^E] G(x)</code> where:
            </p>
            <div className="font-mono bg-slate-900 p-2 rounded text-cyan-300 text-center text-xs">
              G(x) = ∏_{'{'}i=1{'}'}^k (∑_{'{'}j=L_i{'}'}^{'{'}U_i{'}'} x^j)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Total Available Energy Units (E):</label>
              <input
                type="number"
                value={gfEnergy}
                onChange={(e) => setGfEnergy(e.target.value)}
                min="1"
                max="100"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">AGV Bounds (min,max; ...):</label>
              <input
                type="text"
                value={gfBoundsStr}
                onChange={(e) => setGfBoundsStr(e.target.value)}
                placeholder="2,5; 1,4; 3,6"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleRunGF}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            <Zap size={14} />
            <span>Expand Generating Function</span>
          </button>

          {results.gf && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 size={16} />
                <span>Power Series Expansion:</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px]">Generating Polynomial G(x):</div>
                <div className="text-cyan-300 font-bold mt-1 break-all">{results.gf.generating_polynomial}</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px]">Admissible Partitions for E = {results.gf.total_energy}:</div>
                <div className="text-emerald-400 font-bold text-base mt-1">{results.gf.admissible_configurations_count} exact configurations</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Conflict Graph Coloring */}
      {activeTab === 'conflict' && (
        <div className="space-y-4">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <h3 className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">Mathematical Model</h3>
            <p className="text-slate-300">
              Constructs Conflict Graph <code className="text-cyan-400">G_c = (V_c, E_c)</code> from current AGV trajectory paths.
              Computes minimal vertex coloring using Welsh-Powell greedy coloring to assign non-overlapping time slots / communication channels:
            </p>
          </div>

          <button
            onClick={handleRunConflictGraph}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            <GitFork size={14} />
            <span>Analyze Conflict Graph & Color Channels</span>
          </button>

          {results.conflict && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Vertices (AGVs):</div>
                  <div className="text-cyan-300 font-bold mt-1">{results.conflict.nodes.join(', ')}</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Conflicts (Edges in G_c):</div>
                  <div className="text-amber-400 font-bold mt-1">{results.conflict.edges.length} collision edges</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Chromatic Number χ(G_c):</div>
                  <div className="text-emerald-400 font-bold mt-1">{results.conflict.chromatic_number_estimate} slots needed</div>
                </div>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px] mb-1">Time Slot / Color Allocation:</div>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(results.conflict.vertex_coloring).map(([agv, color]) => (
                    <span key={agv} className="px-2 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {agv}: Slot {color}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Deadlock WFG */}
      {activeTab === 'deadlock' && (
        <div className="space-y-4">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <h3 className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">Mathematical Model</h3>
            <p className="text-slate-300">
              Builds directed Wait-For Graph <code className="text-cyan-400">D = (V_A, E_W)</code> where an edge represents an agent blocked by another occupant.
              Identifies circular wait conditions via directed cycle enumeration and Tarjan strongly connected components.
            </p>
          </div>

          <button
            onClick={handleRunDeadlock}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            <AlertOctagon size={14} />
            <span>Scan Wait-For Graph for Cycles</span>
          </button>

          {results.deadlock && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className={`p-3 rounded-lg border ${results.deadlock.deadlock_detected ? 'bg-rose-950/40 border-rose-800 text-rose-300' : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'}`}>
                <div className="font-bold">
                  {results.deadlock.deadlock_detected ? '⚠ Circular Wait Deadlock Detected!' : '✓ No Deadlock Cycles Found (WFG is a DAG)'}
                </div>
                <div className="text-[11px] mt-1 text-slate-400">
                  Total directed dependency edges: {results.deadlock.wait_for_graph.edges.length}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Bipartite Matching Optimization */}
      {activeTab === 'optimization' && (
        <div className="space-y-4">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <h3 className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">Mathematical Model</h3>
            <p className="text-slate-300">
              Solves Minimum Weight Bipartite Matching (Assignment Problem) between active AGVs and available charging pads, minimizing composite travel distance + battery depletion penalty.
            </p>
          </div>

          <button
            onClick={handleRunOptimization}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            <Zap size={14} />
            <span>Solve Bipartite Matching</span>
          </button>

          {results.optimization && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="text-emerald-400 font-bold mb-2">Optimal Bipartite Assignments:</div>
              <div className="space-y-2">
                {results.optimization.matching.map((m) => (
                  <div key={m.agv_id} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-white font-bold">{m.agv_id}</span>
                    <span className="text-cyan-400">Assigned Charger: ({m.charger_coord[0]}, {m.charger_coord[1]})</span>
                    <span className="text-slate-400">Weight Cost: {m.cost.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
