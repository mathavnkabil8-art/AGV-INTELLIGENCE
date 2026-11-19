import React, { useState, useEffect } from 'react';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import Tabs from '../components/ui/Tabs';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../api/client';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  BarChart3,
  FlaskConical,
  Download,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle2,
  FileSpreadsheet,
  FileCode2,
  Printer,
  RefreshCw,
  AlertTriangle,
  Zap,
  RotateCcw,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

export default function ExperimentsAnalyticsPage({ agvs = {}, simulationState }) {
  const { isDark } = useTheme();
  const [selectedExperiment, setSelectedExperiment] = useState('exp1');
  const [experimentData, setExperimentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewTab, setViewTab] = useState('comparison');

  const fetchExperiment = async (expId) => {
    setLoading(true);
    try {
      const data = await apiClient.getExperimentEvaluation(expId);
      setExperimentData(data);
    } catch (err) {
      console.error('Error fetching experiment evaluation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiment(selectedExperiment);
  }, [selectedExperiment]);

  // Export handlers
  const handleExportCsv = () => {
    window.open(apiClient.getExperimentCsvUrl(selectedExperiment), '_blank');
  };

  const handleExportJson = () => {
    window.open(apiClient.getExperimentJsonUrl(selectedExperiment), '_blank');
  };

  const handlePrintReport = () => {
    window.print();
  };

  const base = experimentData?.baseline_metrics || {};
  const opt = experimentData?.optimized_metrics || {};
  const comp = experimentData?.comparison || {};

  // Formulate data for comparative Bar Chart
  const comparisonBarData = [
    {
      metric: 'Travel Distance',
      Baseline: base.total_travel_distance || 0,
      Optimized: opt.total_travel_distance || 0,
    },
    {
      metric: 'Waiting Time',
      Baseline: base.avg_waiting_time || 0,
      Optimized: opt.avg_waiting_time || 0,
    },
    {
      metric: 'Conflicts',
      Baseline: base.route_conflicts_detected || 0,
      Optimized: opt.route_conflicts_detected || 0,
    },
    {
      metric: 'Deliveries',
      Baseline: base.completed_deliveries || 0,
      Optimized: opt.completed_deliveries || 0,
    },
    {
      metric: 'Collisions',
      Baseline: base.actual_collisions_occurred || 0,
      Optimized: opt.actual_collisions_occurred || 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Experimental Analytics & Performance Evaluation
            </h2>
            <Badge variant="cyan" dot>
              EMPIRICAL RESEARCH LAB
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Reproducible empirical evaluation comparing uncoordinated baseline heuristics against mathematical discrete optimization.
          </p>
        </div>

        {/* Export Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => fetchExperiment(selectedExperiment)}
            loading={loading}
            icon={RefreshCw}
            variant="outline"
            size="sm"
          >
            Re-run
          </Button>
          <Button
            onClick={handleExportCsv}
            icon={FileSpreadsheet}
            variant="ghost"
            size="sm"
            className="text-xs text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 font-medium"
          >
            Export CSV
          </Button>
          <Button
            onClick={handleExportJson}
            icon={FileCode2}
            variant="ghost"
            size="sm"
            className="text-xs text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-cyan-900/60 bg-blue-50 dark:bg-cyan-950/40 hover:bg-blue-100 dark:hover:bg-cyan-950/60 font-medium"
          >
            Export JSON
          </Button>
          <Button
            onClick={handlePrintReport}
            icon={Printer}
            variant="ghost"
            size="sm"
            className="text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium"
          >
            Print
          </Button>
        </div>
      </div>

      {/* 5 Predefined Experiment Tabs */}
      <Tabs
        tabs={[
          { id: 'exp1', label: 'EXP-01: Normal Routing', icon: FlaskConical },
          { id: 'exp2', label: 'EXP-02: Intersecting Routes', icon: Layers },
          { id: 'exp3', label: 'EXP-03: Restricted Charging', icon: Zap },
          { id: 'exp4', label: 'EXP-04: Energy Shortage', icon: TrendingUp },
          { id: 'exp5', label: 'EXP-05: Deadlock Recovery', icon: RotateCcw },
        ]}
        activeTab={selectedExperiment}
        onChange={setSelectedExperiment}
      />

      {/* Experiment Overview Banner */}
      <GlassCard className="py-3 px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="cyan">{experimentData?.experiment_id}</Badge>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{experimentData?.name}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
              <strong className="text-slate-800 dark:text-slate-300">Aim:</strong> {experimentData?.aim}
            </p>
          </div>
          <div className="text-right font-mono text-[11px] text-slate-500">
            <div>Algorithm: <span className="text-blue-600 dark:text-cyan-400 font-bold">{experimentData?.algorithm_used}</span></div>
          </div>
        </div>
      </GlassCard>

      {/* KPI Cards (Empirical Results) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Conflicts Detected (C)"
          value={`${base.route_conflicts_detected ?? 0} → ${opt.route_conflicts_detected ?? 0}`}
          unit="Baseline vs Opt"
          icon={AlertTriangle}
          status={opt.route_conflicts_detected === 0 ? 'emerald' : 'amber'}
          subtitle={`Eliminated: ${(base.route_conflicts_detected || 0) - (opt.route_conflicts_detected || 0)}`}
        />
        <StatCard
          label="Physical Collisions"
          value={`${base.actual_collisions_occurred ?? 0} → ${opt.actual_collisions_occurred ?? 0}`}
          unit="Baseline vs Opt"
          icon={CheckCircle2}
          status="emerald"
          subtitle="Spatial reservation table"
        />
        <StatCard
          label="Avg Waiting Time"
          value={`${base.avg_waiting_time ?? 0}s → ${opt.avg_waiting_time ?? 0}s`}
          unit="per AGV"
          icon={Cpu}
          status="emerald"
          subtitle={`Saved: ${((base.avg_waiting_time || 0) - (opt.avg_waiting_time || 0)).toFixed(1)}s`}
        />
        <StatCard
          label="Deliveries Completed"
          value={`${base.completed_deliveries ?? 0} / 4 → ${opt.completed_deliveries ?? 0} / 4`}
          unit="missions"
          icon={BarChart3}
          status={opt.completed_deliveries === 4 ? 'emerald' : 'amber'}
          subtitle="Mission completion rate"
        />
      </div>

      {/* Sub-Tabs for Details */}
      <Tabs
        tabs={[
          { id: 'comparison', label: '1. Baseline vs Optimized Matrix', icon: Layers },
          { id: 'charts', label: '2. Comparative Charts & Progression', icon: BarChart3 },
          { id: 'documentation', label: '3. Scientific Documentation & Analysis', icon: BookOpen },
          { id: 'math', label: '4. Mathematical Formulations & Proofs', icon: FileCode2 },
        ]}
        activeTab={viewTab}
        onChange={setViewTab}
      />

      {/* SUB-TAB 1: Baseline vs Optimized Metrics Matrix */}
      {viewTab === 'comparison' && (
        <GlassCard
          title="Empirical Performance Comparison: Baseline vs Optimized"
          subtitle="Direct comparison under identical initial spatial conditions (No artificial multipliers)"
          icon={Layers}
        >
          <div className="overflow-x-auto text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/40">
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="p-3">EVALUATION METRIC</th>
                  <th className="p-3">BASELINE MODE</th>
                  <th className="p-3">OPTIMIZED MODE</th>
                  <th className="p-3">EMPIRICAL DELTA</th>
                  <th className="p-3">MATHEMATICAL INTERPRETATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-command-surface">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">1. Total Travel Distance</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{base.total_travel_distance} hops</td>
                  <td className="p-3 text-blue-600 dark:text-cyan-300 font-bold">{opt.total_travel_distance} hops</td>
                  <td className="p-3">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">
                      {opt.total_travel_distance - base.total_travel_distance > 0
                        ? `+${opt.total_travel_distance - base.total_travel_distance} (Detour)`
                        : 'Identical'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 font-sans text-[11px]">
                    Optimized mode takes small collision-free detours to bypass congestion.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">2. Average Travel Distance</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{base.avg_travel_distance} hops/AGV</td>
                  <td className="p-3 text-blue-600 dark:text-cyan-300 font-bold">{opt.avg_travel_distance} hops/AGV</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400 font-semibold">
                    {opt.avg_travel_distance - base.avg_travel_distance > 0
                      ? `+${(opt.avg_travel_distance - base.avg_travel_distance).toFixed(1)}`
                      : '0.0'}
                  </td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 font-sans text-[11px]">
                    Per-robot distance remains within optimal Manhattan boundaries.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">3. Average Waiting Time</td>
                  <td className="p-3 text-rose-600 dark:text-rose-400 font-bold">{base.avg_waiting_time}s</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">{opt.avg_waiting_time}s</td>
                  <td className="p-3">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      -{(base.avg_waiting_time - opt.avg_waiting_time).toFixed(1)}s (Delay Eliminated)
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 font-sans text-[11px]">
                    Spatial reservations prevent persistent corridor queuing stalls.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">4. Route Conflicts Detected</td>
                  <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">{base.route_conflicts_detected}</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">{opt.route_conflicts_detected}</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">
                    -{base.route_conflicts_detected - opt.route_conflicts_detected} conflicts
                  </td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 font-sans text-[11px]">
                    Welsh-Powell chromatic phases decouple overlapping trajectory segments.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">5. Physical Collisions Occurred</td>
                  <td className="p-3 text-rose-600 dark:text-rose-400 font-bold">{base.actual_collisions_occurred ?? 0}</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">{opt.actual_collisions_occurred ?? 0}</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">
                    -{(base.actual_collisions_occurred || 0) - (opt.actual_collisions_occurred || 0)} collisions
                  </td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 font-sans text-[11px]">
                    Guaranteed zero simultaneous cell and edge swap claims.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">6. Completed Deliveries</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{base.completed_deliveries} / 4</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">{opt.completed_deliveries} / 4</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">
                    +{opt.completed_deliveries - base.completed_deliveries} missions
                  </td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 font-sans text-[11px]">
                    Unresolved deadlocks in baseline prevent robots from reaching targets.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">7. Deadlocks Detected</td>
                  <td className="p-3 text-rose-600 dark:text-rose-400 font-bold">{base.deadlocks_detected}</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300 font-bold">{opt.deadlocks_detected}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">Identified in both</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 font-sans text-[11px]">
                    Both engines construct WFG; baseline stalls while optimized recovers.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">8. Successful Deadlock Recoveries</td>
                  <td className="p-3 text-slate-500 font-bold">0 (Stall)</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">{opt.successful_recoveries}</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+{opt.successful_recoveries} recovered</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 font-sans text-[11px]">
                    True Dijkstra detour around blockage breaks circular dependency.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">9. Valid Charging Assignments</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">{base.valid_charging_assignments}</td>
                  <td className="p-3 text-blue-600 dark:text-cyan-300 font-bold">{opt.valid_charging_assignments}</td>
                  <td className="p-3 text-purple-600 dark:text-purple-400 font-semibold">15 violations rejected</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 font-sans text-[11px]">
                    Rook polynomial and PIE filter clearance-violating matchings (!4 = 9).
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">10. Possible Energy Allocations</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">{String(base.possible_energy_allocations)}</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">{String(opt.possible_energy_allocations)}</td>
                  <td className="p-3 text-blue-600 dark:text-cyan-400">Analytic</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 font-sans text-[11px]">
                    OGF Negative Binomial expansion yields exact admissible profiles.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* SUB-TAB 2: Comparative Charts */}
      {viewTab === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0 w-full">
          {/* Chart 1: Key Metric Comparison */}
          <GlassCard
            title="Performance Metrics: Baseline vs Optimized"
            subtitle="Comparing Distance, Waiting Delay, Conflicts, and Deliveries"
            icon={BarChart3}
            className="min-w-0"
          >
            <div className="h-72 min-h-[280px] w-full min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonBarData} margin={{ top: 10, right: 15, left: -10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#F1F5F9'} />
                  <XAxis
                    dataKey="metric"
                    stroke="#64748B"
                    fontSize={11}
                    fontFamily="JetBrains Mono"
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis stroke="#64748B" fontSize={11} fontFamily="JetBrains Mono" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                      borderRadius: '8px',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    itemStyle={{ fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '8px' }} />
                  <Bar dataKey="Baseline" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Optimized" fill={isDark ? '#10B981' : '#2563EB'} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Chart 2: Time Series / Step Progression */}
          <GlassCard
            title="Experiment Execution Progression"
            subtitle="Metric progression over simulation steps"
            icon={TrendingUp}
            className="min-w-0"
          >
            <div className="h-72 min-h-[280px] w-full min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={experimentData?.time_series_data || []} margin={{ top: 10, right: 15, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#F1F5F9'} />
                  <XAxis
                    dataKey={experimentData?.time_series_data?.[0]?.step !== undefined ? 'step' : 'scenario'}
                    stroke="#64748B"
                    fontSize={10}
                    fontFamily="JetBrains Mono"
                  />
                  <YAxis stroke="#64748B" fontSize={11} fontFamily="JetBrains Mono" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                      borderRadius: '8px',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    itemStyle={{ fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '8px' }} />
                  {experimentData?.time_series_data?.[0]?.baselineWait !== undefined && (
                    <Line type="monotone" dataKey="baselineWait" stroke="#EF4444" strokeWidth={2} name="Baseline Wait" />
                  )}
                  {experimentData?.time_series_data?.[0]?.optimizedWait !== undefined && (
                    <Line type="monotone" dataKey="optimizedWait" stroke="#10B981" strokeWidth={2} name="Optimized Wait" />
                  )}
                  {experimentData?.time_series_data?.[0]?.baselineConflicts !== undefined && (
                    <Line type="monotone" dataKey="baselineConflicts" stroke="#F59E0B" strokeWidth={2} name="Baseline Conflicts" />
                  )}
                  {experimentData?.time_series_data?.[0]?.optimizedConflicts !== undefined && (
                    <Line type="monotone" dataKey="optimizedConflicts" stroke="#06B6D4" strokeWidth={2} name="Optimized Conflicts" />
                  )}
                  {experimentData?.time_series_data?.[0]?.allocations !== undefined && (
                    <Line type="monotone" dataKey="allocations" stroke="#10B981" strokeWidth={2} name="Admissible Allocations" />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      )}

      {/* SUB-TAB 3: Scientific Documentation & Analysis */}
      {viewTab === 'documentation' && (
        <GlassCard
          title={`Scientific Experiment Documentation: ${experimentData?.experiment_id}`}
          subtitle="Formal academic report structure: Aim, Input, Algorithm, Output, Result, and Conclusion"
          icon={BookOpen}
        >
          <div className="space-y-4 text-xs font-sans leading-relaxed text-slate-700 dark:text-slate-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
                <span className="font-bold text-blue-700 dark:text-cyan-400 font-mono text-xs uppercase block">
                  1. Experimental Aim
                </span>
                <p>{experimentData?.aim}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-xs uppercase block">
                  2. Input & Scenario Description
                </span>
                <p>{experimentData?.description}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
                <span className="font-bold text-purple-700 dark:text-purple-400 font-mono text-xs uppercase block">
                  3. Algorithm & Heuristics Employed
                </span>
                <p className="font-mono text-[11px] text-purple-800 dark:text-purple-300 font-semibold">{experimentData?.algorithm_used}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
                <span className="font-bold text-amber-700 dark:text-amber-400 font-mono text-xs uppercase block">
                  4. Mathematical Concept
                </span>
                <p>{experimentData?.mathematical_concept}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
              <span className="font-bold text-slate-900 dark:text-white font-mono text-xs uppercase block">
                5. Observed Output & Empirical Evidence
              </span>
              <p className="text-slate-800 dark:text-slate-300 font-mono text-xs bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                {experimentData?.observed_output}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-emerald-200 dark:border-emerald-900/60 space-y-1.5 shadow-2xs">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-xs uppercase block">
                  6. Experimental Result
                </span>
                <p>{experimentData?.result}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-blue-200 dark:border-cyan-900/60 space-y-1.5 shadow-2xs">
                <span className="font-bold text-blue-700 dark:text-cyan-400 font-mono text-xs uppercase block">
                  7. Scientific Conclusion
                </span>
                <p>{experimentData?.conclusion}</p>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* SUB-TAB 4: Mathematical Formulations & Proofs */}
      {viewTab === 'math' && (
        <GlassCard
          title="Mathematical Calculation Summaries"
          subtitle="Formulas, bounds, and combinatorial proofs underlying this experiment"
          icon={FileCode2}
        >
          <div className="space-y-4 text-xs font-mono text-slate-700 dark:text-slate-300">
            {experimentData?.mathematical_derivation && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-blue-700 dark:text-cyan-300 font-sans block text-xs">
                  Active Mathematical Equations & Proofs:
                </span>
                <div className="space-y-2 text-slate-700 dark:text-slate-200">
                  {Object.entries(experimentData.mathematical_derivation).map(([key, val]) => (
                    <div key={key} className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-2 shadow-2xs">
                      <span className="text-slate-500 dark:text-slate-400 font-sans font-medium">{key.replace(/_/g, ' ').toUpperCase()}:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold break-all">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
