import React, { useState, useEffect } from 'react';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import Tabs from '../components/ui/Tabs';
import { apiClient } from '../api/client';
import {
  BatteryCharging,
  Grid3X3,
  Calculator,
  RefreshCw,
  CheckCircle2,
  Ban,
  Zap,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  Sliders,
  ListOrdered,
  FileCode2,
} from 'lucide-react';

export default function ChargingOptimizationPage({ warehouse, agvs = {} }) {
  // Configurable matrix dimensions: n robots x m charging docks
  const [robotCount, setRobotCount] = useState(4);
  const [dockCount, setDockCount] = useState(4);

  // Forbidden pairs: set of "r,c" strings (default: 4x4 diagonal derangements)
  const [forbiddenSet, setForbiddenSet] = useState(
    new Set(['0,0', '1,1', '2,2', '3,3'])
  );

  const [activeTab, setActiveTab] = useState('matrix');
  const [rookResult, setRookResult] = useState(null);
  const [matchingResult, setMatchingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  // Toggle cell forbidden / compatible
  const toggleForbidden = (r, c) => {
    const key = `${r},${c}`;
    setForbiddenSet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Presets
  const applyPreset = (presetName) => {
    const newSet = new Set();
    if (presetName === 'diagonal_4x4') {
      setRobotCount(4);
      setDockCount(4);
      for (let i = 0; i < 4; i++) newSet.add(`${i},${i}`);
    } else if (presetName === 'clear') {
      // Empty forbidden set
    } else if (presetName === 'single') {
      newSet.add('0,0');
    } else if (presetName === 'row_forbidden') {
      for (let c = 0; c < dockCount; c++) newSet.add(`0,${c}`);
    } else if (presetName === 'col_forbidden') {
      for (let r = 0; r < robotCount; r++) newSet.add(`${r},0`);
    } else if (presetName === 'full_board') {
      for (let r = 0; r < robotCount; r++) {
        for (let c = 0; c < dockCount; c++) {
          newSet.add(`${r},${c}`);
        }
      }
    }
    setForbiddenSet(newSet);
  };

  // Handle Dimension Change
  const handleDimensionChange = (newN, newM) => {
    setRobotCount(newN);
    setDockCount(newM);
    // Filter existing forbidden cells to keep within new bounds
    setForbiddenSet((prev) => {
      const next = new Set();
      prev.forEach((k) => {
        const [r, c] = k.split(',').map(Number);
        if (r < newN && c < newM) next.add(k);
      });
      return next;
    });
  };

  const evaluateRook = async () => {
    setLoading(true);
    try {
      const pairs = Array.from(forbiddenSet).map((k) => k.split(',').map(Number));
      const res = await apiClient.computeRookPolynomial({
        num_agvs: robotCount,
        num_destinations: dockCount,
        forbidden_pairs: pairs,
      });
      setRookResult(res);

      // Also fetch Hungarian matching if 4x4
      try {
        const matchRes = await apiClient.optimizeCharging();
        setMatchingResult(matchRes);
      } catch (e) {
        // Hungarian matching optional
      }
    } catch (err) {
      console.error('Error evaluating rook polynomial:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    evaluateRook();
  }, [forbiddenSet, robotCount, dockCount]);

  const totalCells = robotCount * dockCount;
  const forbiddenCount = forbiddenSet.size;
  const compatibleCount = totalCells - forbiddenCount;
  const isPigeonhole = robotCount > dockCount;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Smart Charging Assignment & Rook Polynomials
            </h2>
            <Badge variant="amber" dot>
              ROOK POLYNOMIAL & PIE
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Exact mathematical one-to-one robot-to-charger matching under physical clearance and compatibility constraints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => applyPreset('diagonal_4x4')}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            4×4 Benchmark
          </Button>
          <Button
            onClick={evaluateRook}
            loading={loading}
            icon={RefreshCw}
            variant="primary"
            size="sm"
          >
            Recalculate
          </Button>
        </div>
      </div>

      {/* Configuration & Presets Bar */}
      <GlassCard className="py-3 px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Dimension Selectors */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1 font-sans">
                <Sliders size={13} className="text-blue-600 dark:text-cyan-400" /> AGVs (n):
              </span>
              <div className="flex gap-1">
                {[2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleDimensionChange(n, dockCount)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                      robotCount === n
                        ? 'bg-blue-600 text-white shadow-sm dark:bg-cyan-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1 font-sans">
                <BatteryCharging size={13} className="text-emerald-600 dark:text-emerald-400" /> Docks (m):
              </span>
              <div className="flex gap-1">
                {[2, 3, 4, 5, 6].map((m) => (
                  <button
                    key={m}
                    onClick={() => handleDimensionChange(robotCount, m)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                      dockCount === m
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 text-[11px] mr-1 font-sans">Presets:</span>
            <button
              onClick={() => applyPreset('diagonal_4x4')}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors"
            >
              Diagonal (Derangements)
            </button>
            <button
              onClick={() => applyPreset('clear')}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors"
            >
              All Compatible
            </button>
            <button
              onClick={() => applyPreset('single')}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors"
            >
              Single Forbidden
            </button>
            <button
              onClick={() => applyPreset('row_forbidden')}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors"
            >
              Row 1 Blocked
            </button>
            <button
              onClick={() => applyPreset('col_forbidden')}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors"
            >
              Dock 1 Blocked
            </button>
          </div>
        </div>
      </GlassCard>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Board Dimension"
          value={`${robotCount} × ${dockCount}`}
          unit={robotCount === dockCount ? 'Square Board' : 'Rectangular'}
          icon={Grid3X3}
          status="cyan"
          subtitle={`${totalCells} total cell pairs`}
        />
        <StatCard
          label="Compatibility Split"
          value={`${compatibleCount} / ${forbiddenCount}`}
          unit="compat / forbid"
          icon={Ban}
          status={forbiddenCount > 0 ? 'rose' : 'emerald'}
          subtitle={`${((forbiddenCount / totalCells) * 100).toFixed(0)}% cells restricted`}
        />
        <StatCard
          label="Valid Assignments N"
          value={rookResult?.pie_valid_assignments_count ?? '--'}
          unit={isPigeonhole ? 'Pigeonhole 0' : 'exact matchings'}
          icon={Calculator}
          status={rookResult?.pie_valid_assignments_count > 0 ? 'emerald' : 'rose'}
          subtitle={
            isPigeonhole
              ? 'n > m: impossible'
              : `Out of ${rookResult?.unrestricted_total ?? '--'} total`
          }
        />
        <StatCard
          label="Verification Status"
          value={rookResult?.verified ? 'VERIFIED' : 'PENDING'}
          unit="PIE == Enumeration"
          icon={ShieldCheck}
          status={rookResult?.verified ? 'emerald' : 'amber'}
          subtitle={`Explicit count: ${rookResult?.explicit_valid_assignments_count ?? '--'}`}
        />
      </div>

      {/* Navigation Tabs */}
      <Tabs
        tabs={[
          { id: 'matrix', label: '1. Compatibility Matrix & Assignments', icon: Grid3X3 },
          { id: 'pie', label: '2. Rook Polynomial & PIE Derivation', icon: Calculator },
          { id: 'all_assignments', label: `3. Enumerated Matchings (${rookResult?.explicit_valid_assignments_count ?? 0})`, icon: ListOrdered },
          { id: 'theory', label: '4. Mathematical Lab & Proofs', icon: FileCode2 },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: Compatibility Matrix & Quick Preview */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 cols: Interactive Compatibility Board */}
          <div className="lg:col-span-7">
            <GlassCard
              title={`Robot-Charger Compatibility Board B (${robotCount} × ${dockCount})`}
              subtitle="Click any cell to toggle between ALLOWED (compatible) and FORBIDDEN (incompatible)"
              icon={Grid3X3}
            >
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-center text-xs font-mono">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        <th className="p-2.5 text-left font-sans text-slate-700 dark:text-slate-300">Robot \ Dock</th>
                        {Array.from({ length: dockCount }).map((_, c) => (
                          <th key={c} className="p-2.5">
                            <div className="text-slate-900 dark:text-white font-bold">Dock {c + 1}</div>
                            <div className="text-[10px] text-slate-500 font-normal">Pad {c + 1}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-command-surface">
                      {Array.from({ length: robotCount }).map((_, r) => {
                        const forbiddenInRow = Array.from({ length: dockCount }).filter((_, c) =>
                          forbiddenSet.has(`${r},${c}`)
                        ).length;
                        return (
                          <tr key={r} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                            <td className="p-2.5 text-left font-bold text-slate-900 dark:text-white whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400" />
                                <span>AGV-{r + 1}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-normal font-sans">
                                {dockCount - forbiddenInRow} compatible
                              </div>
                            </td>
                            {Array.from({ length: dockCount }).map((_, c) => {
                              const isForbidden = forbiddenSet.has(`${r},${c}`);
                              return (
                                <td key={c} className="p-2">
                                  <button
                                    onClick={() => toggleForbidden(r, c)}
                                    title={`Toggle AGV-${r + 1} to Dock-${c + 1}`}
                                    className={`w-full py-2.5 px-2 rounded-lg border font-mono text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                                      isForbidden
                                        ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100 shadow-2xs dark:bg-rose-950/70 dark:border-rose-600/80 dark:text-rose-300 dark:hover:bg-rose-900/70'
                                        : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-600/60 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1">
                                      {isForbidden ? (
                                        <Ban size={12} className="text-rose-600 dark:text-rose-400" />
                                      ) : (
                                        <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                                      )}
                                      <span>{isForbidden ? 'FORBIDDEN' : 'ALLOWED'}</span>
                                    </div>
                                    <span className="text-[9px] opacity-70">
                                      ({r}, {c})
                                    </span>
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Legend & Summary */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Allowed Matching
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-medium">
                      <span className="w-2.5 h-2.5 rounded bg-rose-500" /> Forbidden Pair (in B)
                    </span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">
                    |B| = {forbiddenCount} / {totalCells}
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right 5 cols: Live Matching Preview & Polynomial Quick Summary */}
          <div className="lg:col-span-5 space-y-4">
            <GlassCard
              title="Mathematical Result Summary"
              subtitle="Rook polynomial and PIE assignment evaluation"
              icon={Calculator}
            >
              <div className="space-y-4 text-xs font-mono">
                {/* Symbolic Rook Polynomial */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 font-sans font-medium block">
                    Rook Polynomial R(x, B):
                  </span>
                  <div className="text-blue-700 dark:text-cyan-300 font-bold text-sm bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 break-all shadow-2xs">
                    {rookResult?.polynomial_str || 'Evaluating...'}
                  </div>
                  <span className="text-[10px] text-slate-500 font-sans block mt-1">
                    Formula: R(x, B) = ∑ r_k(B) · x^k
                  </span>
                </div>

                {/* Valid Assignments Count Box */}
                <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-sans font-bold block">
                      Valid Non-Conflicting Assignments:
                    </span>
                    <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 font-sans">
                      No robot assigned to a forbidden dock
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {rookResult?.pie_valid_assignments_count ?? '--'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">ways</span>
                  </div>
                </div>

                {/* Verification Callout */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 font-sans font-medium">Independent Verification:</span>
                  <Badge variant={rookResult?.verified ? 'emerald' : 'rose'}>
                    {rookResult?.verified
                      ? `Exact Match (${rookResult?.explicit_valid_assignments_count} = ${rookResult?.pie_valid_assignments_count})`
                      : 'Mismatch'}
                  </Badge>
                </div>
              </div>
            </GlassCard>

            {/* First Few Valid Assignments Preview */}
            <GlassCard
              title="Permutation Matchings Preview"
              subtitle={`Showing first ${Math.min(4, rookResult?.valid_assignments?.length || 0)} of ${rookResult?.explicit_valid_assignments_count || 0} valid configurations`}
              icon={ListOrdered}
            >
              {rookResult?.valid_assignments && rookResult.valid_assignments.length > 0 ? (
                <div className="space-y-2.5">
                  {rookResult.valid_assignments.slice(0, 4).map((assign) => (
                    <div
                      key={assign.assignment_id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-200 dark:border-slate-800 text-[11px]">
                        <span className="font-bold text-blue-700 dark:text-cyan-400 font-sans">
                          Assignment #{assign.assignment_id}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">Valid Matching</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {assign.pairs.map((p) => (
                          <div
                            key={p.robot_id}
                            className="p-1.5 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between px-2 shadow-2xs"
                          >
                            <span className="text-slate-900 dark:text-white font-bold">{p.robot_id}</span>
                            <span className="text-slate-400 text-[10px]">→</span>
                            <span className="text-blue-600 dark:text-cyan-300 font-semibold">{p.dock_id}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {rookResult.valid_assignments.length > 4 && (
                    <Button
                      onClick={() => setActiveTab('all_assignments')}
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-blue-600 dark:text-cyan-400 mt-2 font-medium"
                    >
                      View All {rookResult.explicit_valid_assignments_count} Valid Assignments →
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs">
                  {isPigeonhole
                    ? 'No one-to-one assignment possible because AGVs (n) exceed Charging Docks (m).'
                    : 'Zero valid assignments. All configurations violate at least one forbidden clearance constraint.'}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}

      {/* TAB 2: Rook Polynomial & PIE Derivation */}
      {activeTab === 'pie' && (
        <div className="space-y-6">
          {/* Mathematical Formulations Banner */}
          <GlassCard
            title="Principle of Inclusion-Exclusion (PIE) Step-by-Step Derivation"
            subtitle="Evaluating the alternating sum N = ∑ (-1)^k · r_k · (n - k)!"
            icon={Calculator}
          >
            <div className="space-y-6">
              {/* Formula Callout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-blue-700 dark:text-cyan-300 font-mono block">
                    1. ROOK POLYNOMIAL DEFINITION
                  </span>
                  <div className="text-sm font-mono text-blue-700 dark:text-cyan-400 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 font-bold shadow-2xs">
                    R(x, B) = ∑_{'{'}k=0{'}'}^{'{'}min(n, m){'}'} r_k(B) · x^k
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Where <code className="text-slate-800 dark:text-slate-300 font-bold">r_k</code> is the number of ways to place <code className="text-slate-800 dark:text-slate-300 font-bold">k</code> non-attacking rooks on forbidden cells <code className="text-slate-800 dark:text-slate-300 font-bold">B</code> (no two rooks sharing the same row or column).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 font-mono block">
                    2. INCLUSION-EXCLUSION FORMULA
                  </span>
                  <div className="text-sm font-mono text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 font-bold shadow-2xs">
                    N = ∑_{'{'}k=0{'}'}^n (-1)^k · r_k(B) · (n - k)!
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Alternating sum subtracting single-violation overcounts, adding back pairwise intersections, and alternating to exactness.
                  </p>
                </div>
              </div>

              {/* Rook Coefficients Grid */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white font-sans block">
                  Computed Rook Numbers r_k(B):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {rookResult?.coefficients?.map((c, k) => (
                    <div
                      key={k}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center shadow-2xs"
                    >
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block">
                        r_{k} (k = {k})
                      </span>
                      <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono block my-1">
                        {c}
                      </span>
                      <span className="text-[10px] text-slate-500 font-sans block">
                        {k === 0 ? 'Empty board (1 way)' : `${c} way${c !== 1 ? 's' : ''} to place ${k} rooks`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step PIE Expansion Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white font-sans block">
                  Step-by-Step Inclusion-Exclusion Table:
                </span>
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50 dark:bg-slate-900/60">
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        <th className="p-3">k</th>
                        <th className="p-3">Sign (-1)^k</th>
                        <th className="p-3">Rook Placements r_k</th>
                        <th className="p-3">Permutation Factor</th>
                        <th className="p-3">Term Product</th>
                        <th className="p-3">Running Sum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-command-surface">
                      {rookResult?.pie_expansion?.map((term) => (
                        <tr key={term.k} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">k = {term.k}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                term.sign > 0
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800'
                              }`}
                            >
                              {term.sign_str}1
                            </span>
                          </td>
                          <td className="p-3 text-blue-600 dark:text-cyan-300 font-bold">{term.r_k}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{term.factor_label}</td>
                          <td className="p-3">
                            <span
                              className={`font-bold ${
                                term.term_value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {term.term_value > 0 ? `+${term.term_value}` : term.term_value}
                            </span>
                          </td>
                          <td className="p-3 text-slate-900 dark:text-white font-bold text-sm bg-slate-50/50 dark:bg-slate-900/40">
                            {term.running_sum}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Final Equation Synthesis */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-sans">
                      Complete Alternating Summation:
                    </span>
                    <div className="text-sm font-mono text-blue-700 dark:text-cyan-300 font-bold mt-1">
                      {rookResult?.pie_expansion?.map((t, idx) => (
                        <span key={t.k}>
                          {idx > 0 && ' '}
                          {t.term_value >= 0 && idx > 0 ? `+ ${t.term_value}` : `${t.term_value}`}{' '}
                        </span>
                      ))}
                      = <span className="text-emerald-600 dark:text-emerald-400 text-base">{rookResult?.pie_valid_assignments_count}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="emerald" className="text-xs py-1 px-3">
                      FINAL VALID COUNT N = {rookResult?.pie_valid_assignments_count}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 3: All Enumerated Assignments */}
      {activeTab === 'all_assignments' && (
        <div className="space-y-4">
          <GlassCard
            title={`Explicit Valid Assignments (${rookResult?.explicit_valid_assignments_count || 0} Total)`}
            subtitle="Generated via exhaustive permutation backtracking to verify PIE exactness"
            icon={ListOrdered}
          >
            {rookResult?.valid_assignments && rookResult.valid_assignments.length > 0 ? (
              <div className="space-y-4">
                <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  Every listed configuration guarantees:
                  <ul className="list-disc list-inside mt-1 text-slate-700 dark:text-slate-300 space-y-0.5">
                    <li>No robot is assigned to multiple chargers (one-to-one).</li>
                    <li>No charger is assigned to multiple robots.</li>
                    <li>No forbidden pair <code className="text-rose-600 dark:text-rose-400 font-mono font-semibold">(AGV_i, Dock_j) ∈ B</code> is accepted.</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rookResult.valid_assignments.map((assign) => (
                    <div
                      key={assign.assignment_id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-cyan-600/60 transition-all font-mono text-xs shadow-2xs"
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-blue-700 dark:text-cyan-400 font-sans">
                          Matching #{assign.assignment_id}
                        </span>
                        <Badge variant="cyan" size="sm">
                          Valid
                        </Badge>
                      </div>
                      <div className="space-y-1.5">
                        {assign.pairs.map((p) => (
                          <div
                            key={p.robot_id}
                            className="flex items-center justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80"
                          >
                            <span className="text-slate-900 dark:text-white font-bold">{p.robot_id}</span>
                            <ArrowRight size={12} className="text-slate-400" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{p.dock_id}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                Zero valid assignments exist under current constraints.
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* TAB 4: Mathematical Lab & Formal Proofs */}
      {activeTab === 'theory' && (
        <div className="space-y-6">
          <GlassCard
            title="Discrete Mathematics & Combinatorics Formalism"
            subtitle="Rook polynomials, restricted positions, and the Principle of Inclusion-Exclusion"
            icon={FileCode2}
          >
            <div className="space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {/* Problem Definition */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  1. Mathematical Definition of Restricted Boards
                </h4>
                <p>
                  Let the warehouse AGV-to-Charger matching problem be defined on an <code className="text-blue-600 dark:text-cyan-400 font-mono font-bold">n × m</code> chessboard. The cells of the board correspond to pairs <code className="text-blue-600 dark:text-cyan-400 font-mono font-semibold">(i, j)</code> representing the assignment of AGV <code className="text-blue-600 dark:text-cyan-400 font-mono font-semibold">i</code> to Charging Dock <code className="text-blue-600 dark:text-cyan-400 font-mono font-semibold">j</code>.
                </p>
                <p>
                  A subset of cells <code className="text-rose-600 dark:text-rose-400 font-mono font-bold">B ⊆ [n] × [m]</code> represents forbidden positions. Placing non-attacking rooks on <code className="text-rose-600 dark:text-rose-400 font-mono font-bold">B</code> corresponds to selecting mutually disjoint forbidden pairings.
                </p>
              </div>

              {/* Benchmark Validation */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="amber">BENCHMARK VALIDATION</Badge>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    4×4 Diagonal Forbidden Board (The Classical Derangement Problem !4)
                  </h4>
                </div>
                <p>
                  Consider a <code className="text-blue-600 dark:text-cyan-400 font-mono font-bold">4 × 4</code> board with forbidden positions on the main diagonal:
                  <code className="text-rose-600 dark:text-rose-400 font-mono block mt-1 font-bold">
                    B = {(0, 0), (1, 1), (2, 2), (3, 3)}
                  </code>
                </p>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-blue-700 dark:text-cyan-300 font-bold shadow-2xs">
                  R(x, B) = 1 + 4x + 6x² + 4x³ + x⁴
                </div>
                <p>
                  Since any <code className="text-slate-800 dark:text-slate-200 font-mono font-bold">k</code> diagonal cells have distinct rows and columns, <code className="text-slate-800 dark:text-slate-200 font-mono font-bold">r_k = C(4, k)</code>.
                </p>
                <p>
                  Applying the Principle of Inclusion-Exclusion:
                </p>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-emerald-700 dark:text-emerald-300 text-sm font-bold shadow-2xs">
                  N = 4! - 4·3! + 6·2! - 4·1! + 1·0!<br />
                  N = 24 - 24 + 12 - 4 + 1 = 9
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  This proves that exactly 9 valid one-to-one dispatch configurations exist, matching the combinatorial subfactorial <code className="text-slate-800 dark:text-slate-200 font-mono font-bold">!4 = 9</code>.
                </p>
              </div>

              {/* Unequal Dimensions & Pigeonhole */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  2. Unequal Fleet and Dock Sizes (n ≠ m)
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-400">
                  <li>
                    <strong className="text-slate-900 dark:text-white">When n &lt; m (More Docks than Robots):</strong> Each robot can be assigned a distinct dock. Unrestricted total is <code className="text-blue-700 dark:text-cyan-300 font-mono font-bold">P(m, n) = m! / (m - n)!</code>. The generalized PIE formula is:
                    <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-blue-700 dark:text-cyan-300 my-1 font-bold shadow-2xs">
                      N = ∑_{'{'}k=0{'}'}^n (-1)^k · r_k(B) · P(m - k, n - k)
                    </div>
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white">When n &gt; m (More Robots than Docks):</strong> By the <strong className="text-rose-600 dark:text-rose-400 font-bold">Pigeonhole Principle</strong>, assigning <code className="text-slate-800 dark:text-slate-200 font-mono font-bold">n</code> robots to <code className="text-slate-800 dark:text-slate-200 font-mono font-bold">m</code> docks must assign at least two robots to the same dock. Therefore, exactly 0 one-to-one simultaneous assignments are possible (<code className="text-rose-600 dark:text-rose-400 font-mono font-bold">N = 0</code>).
                  </li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 4: Mathematical Lab & Formal Proofs */}
      {activeTab === 'theory' && (
        <div className="space-y-6">
          <GlassCard
            title="Discrete Mathematics & Combinatorics Formalism"
            subtitle="Rook polynomials, restricted positions, and the Principle of Inclusion-Exclusion"
            icon={FileCode2}
          >
            <div className="space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
              {/* Problem Definition */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">
                  1. Mathematical Definition of Restricted Boards
                </h4>
                <p>
                  Let the warehouse AGV-to-Charger matching problem be defined on an <code className="text-cyan-400 font-mono">n × m</code> chessboard. The cells of the board correspond to pairs <code className="text-cyan-400 font-mono">(i, j)</code> representing the assignment of AGV <code className="text-cyan-400 font-mono">i</code> to Charging Dock <code className="text-cyan-400 font-mono">j</code>.
                </p>
                <p>
                  A subset of cells <code className="text-rose-400 font-mono">B ⊆ [n] × [m]</code> represents forbidden positions. Placing non-attacking rooks on <code className="text-rose-400 font-mono">B</code> corresponds to selecting mutually disjoint forbidden pairings.
                </p>
              </div>

              {/* Benchmark Validation */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="amber">BENCHMARK VALIDATION</Badge>
                  <h4 className="font-bold text-white text-sm">
                    4×4 Diagonal Forbidden Board (The Classical Derangement Problem !4)
                  </h4>
                </div>
                <p>
                  Consider a <code className="text-cyan-400 font-mono">4 × 4</code> board with forbidden positions on the main diagonal:
                  <code className="text-rose-400 font-mono block mt-1">
                    B = {(0, 0), (1, 1), (2, 2), (3, 3)}
                  </code>
                </p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-cyan-300">
                  R(x, B) = 1 + 4x + 6x² + 4x³ + x⁴
                </div>
                <p>
                  Since any <code className="text-slate-200 font-mono">k</code> diagonal cells have distinct rows and columns, <code className="text-slate-200 font-mono">r_k = C(4, k)</code>.
                </p>
                <p>
                  Applying the Principle of Inclusion-Exclusion:
                </p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-emerald-300 text-sm">
                  N = 4! - 4·3! + 6·2! - 4·1! + 1·0!<br />
                  N = 24 - 24 + 12 - 4 + 1 = 9
                </div>
                <p className="text-slate-400">
                  This proves that exactly 9 valid one-to-one dispatch configurations exist, matching the combinatorial subfactorial <code className="text-slate-200 font-mono">!4 = 9</code>.
                </p>
              </div>

              {/* Unequal Dimensions & Pigeonhole */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">
                  2. Unequal Fleet and Dock Sizes (n ≠ m)
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-slate-400">
                  <li>
                    <strong className="text-white">When n &lt; m (More Docks than Robots):</strong> Each robot can be assigned a distinct dock. Unrestricted total is <code className="text-cyan-300 font-mono">P(m, n) = m! / (m - n)!</code>. The generalized PIE formula is:
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-cyan-300 my-1">
                      N = ∑_{'{'}k=0{'}'}^n (-1)^k · r_k(B) · P(m - k, n - k)
                    </div>
                  </li>
                  <li>
                    <strong className="text-white">When n &gt; m (More Robots than Docks):</strong> By the <strong className="text-rose-400">Pigeonhole Principle</strong>, assigning <code className="text-slate-200 font-mono">n</code> robots to <code className="text-slate-200 font-mono">m</code> docks must assign at least two robots to the same dock. Therefore, exactly 0 one-to-one simultaneous assignments are possible (<code className="text-rose-400 font-mono">N = 0</code>).
                  </li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
