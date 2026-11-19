import React, { useState, useEffect, useCallback } from 'react';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import Tabs from '../components/ui/Tabs';
import EmptyState from '../components/ui/EmptyState';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../api/client';
import {
  Network,
  GitFork,
  RefreshCw,
  AlertTriangle,
  Clock,
  Layers,
  CheckCircle2,
  Cpu,
  Info,
  Calendar,
  Compass,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Send,
  BookOpen,
  Bot,
} from 'lucide-react';

const STRATEGIES = [
  { id: 'largest_first', label: 'Largest-First (Welsh-Powell)', desc: 'Sorts vertices in descending order of degree deg(v).' },
  { id: 'smallest_last', label: 'Smallest-Last (Matula-Beck)', desc: 'Successively removes minimum degree vertices.' },
  { id: 'random_sequential', label: 'Random Sequential', desc: 'Arbitrary random vertex ordering.' },
  { id: 'connected_sequential_bfs', label: 'Connected Sequential (BFS)', desc: 'Traverses vertices according to BFS tree traversal.' },
  { id: 'independent_set', label: 'Independent Set Extraction', desc: 'Successively colors maximal independent sets.' },
];

const PHASE_COLORS = [
  { bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40', fill: '#2563EB', stroke: '#1D4ED8', name: 'Phase 0 (Green Wave)' },
  { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40', fill: '#10B981', stroke: '#059669', name: 'Phase 1 (Secondary)' },
  { bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40', fill: '#F59E0B', stroke: '#D97706', name: 'Phase 2 (Tertiary)' },
  { bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40', fill: '#9333EA', stroke: '#7C3AED', name: 'Phase 3 (Delay Tier 1)' },
  { bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40', fill: '#EF4444', stroke: '#DC2626', name: 'Phase 4 (Delay Tier 2)' },
  { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40', fill: '#6366F1', stroke: '#4F46E5', name: 'Phase 5 (Delay Tier 3)' },
];

export default function TrafficControlPage({ agvs = {} }) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('conflict-scheduling'); // 'conflict-scheduling' | 'grid-graph' | 'math-theory'
  const [strategy, setStrategy] = useState('largest_first');
  const [conflictData, setConflictData] = useState(null);
  const [gridGraphData, setGridGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [selectedRobotId, setSelectedRobotId] = useState(null);

  // Grid Graph Path Query state
  const [startX, setStartX] = useState('0');
  const [startY, setStartY] = useState('0');
  const [targetX, setTargetX] = useState('7');
  const [targetY, setTargetY] = useState('7');
  const [pathAlgo, setPathAlgo] = useState('bfs');
  const [pathResult, setPathResult] = useState(null);
  const [pathLoading, setPathLoading] = useState(false);

  // Fetch Conflict Graph & Coloring
  const fetchConflictGraph = useCallback(async (strat = strategy) => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await apiClient.getConflictGraph(strat);
      setConflictData(data);
      if (!selectedRobotId && data.nodes && data.nodes.length > 0) {
        setSelectedRobotId(data.nodes[0]);
      }
    } catch (err) {
      console.error('Error fetching conflict graph:', err);
      setFetchError(err.message || 'Failed to evaluate conflict graph from backend');
    } finally {
      setLoading(false);
    }
  }, [strategy, selectedRobotId]);

  // Fetch Warehouse Grid Graph G = (V, E)
  const fetchGridGraph = useCallback(async () => {
    try {
      const data = await apiClient.getGridGraph();
      setGridGraphData(data);
    } catch (err) {
      console.error('Error fetching grid graph:', err);
    }
  }, []);

  useEffect(() => {
    fetchConflictGraph(strategy);
    fetchGridGraph();
  }, [strategy]);

  // Handle Strategy Change
  const handleStrategyChange = (newStrat) => {
    setStrategy(newStrat);
    fetchConflictGraph(newStrat);
  };

  // Test Grid Path Calculation
  const handleCalculatePath = async (e) => {
    e?.preventDefault();
    setPathLoading(true);
    try {
      const res = await apiClient.calculateGridPath({
        start_x: Number(startX),
        start_y: Number(startY),
        target_x: Number(targetX),
        target_y: Number(targetY),
        algorithm: pathAlgo,
      });
      setPathResult(res);
    } catch (err) {
      alert('Path finding error: ' + err.message);
    } finally {
      setPathLoading(false);
    }
  };

  const selectedRobot = selectedRobotId ? agvs[selectedRobotId] : null;
  const selectedRobotColor = conflictData?.coloring?.[selectedRobotId] ?? 0;
  const conflictingPartners = conflictData?.conflicts
    ? conflictData.conflicts
        .filter((c) => c.agv1 === selectedRobotId || c.agv2 === selectedRobotId)
        .map((c) => (c.agv1 === selectedRobotId ? c.agv2 : c.agv1))
    : [];
  const uniqueConflictingPartners = Array.from(new Set(conflictingPartners));

  return (
    <div className="space-y-6">
      {/* Top Header & Strategy Dropdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Module 3: Graph Theory & Graph Coloring
            </h2>
            <Badge variant="cyan" dot>
              G = (V, E) & G_c
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Topological grid representation, spatio-temporal conflict graph, and greedy coloring scheduling phases.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Strategy Selector Dropdown */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs shadow-sm">
            <Sliders size={13} className="text-blue-600 dark:text-cyan-400" />
            <span className="text-slate-600 dark:text-slate-400 text-[11px] font-sans font-medium">Coloring Strategy:</span>
            <select
              value={strategy}
              onChange={(e) => handleStrategyChange(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-blue-700 dark:text-cyan-300 font-mono text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500"
            >
              {STRATEGIES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={() => fetchConflictGraph(strategy)}
            loading={loading}
            icon={RefreshCw}
            variant="primary"
            size="sm"
          >
            Re-evaluate Graph
          </Button>
        </div>
      </div>

      {/* Prominent Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5 shadow-sm">
        <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold uppercase tracking-wider font-mono text-[10px] text-amber-800 dark:text-amber-200">
            Theoretical Principle & Operational Disclaimer
          </span>
          <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed font-sans text-[11px]">
            Graph coloring is a mathematical <strong>scheduling aid</strong>. It partitions conflicting tasks into discrete execution phases, but does not automatically guarantee deadlock freedom or collision-free execution unless spatial and temporal cell reservations are also enforced.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <Tabs
        tabs={[
          { id: 'conflict-scheduling', label: 'Conflict Graph & Phase Scheduling', icon: GitFork },
          { id: 'grid-graph', label: 'Warehouse Grid Graph G = (V, E)', icon: Network },
          { id: 'math-theory', label: 'Mathematical Formulations & Bounds', icon: BookOpen },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: CONFLICT GRAPH & SCHEDULING (PARTS B, C, D) */}
      {activeTab === 'conflict-scheduling' && (
        <div className="space-y-6">
          {/* Top KPI Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Tasks Vertices |V_c|"
              value={conflictData?.nodes?.length || 0}
              unit="agents"
              icon={Network}
              status="cyan"
              subtitle="Planned route vertices"
            />
            <StatCard
              label="Conflict Edges |E_c|"
              value={conflictData?.edges?.length || 0}
              unit="interferences"
              icon={AlertTriangle}
              status={conflictData?.edges?.length > 0 ? 'rose' : 'emerald'}
              subtitle={conflictData?.edges?.length > 0 ? 'Mutual incompatibilities' : 'Disjoint paths'}
            />
            <StatCard
              label="Chromatic Upper Bound"
              value={conflictData?.brooks_upper_bound || 1}
              unit="Δ(G_c) + 1"
              icon={GitFork}
              status="amber"
              subtitle={`Max degree Δ = ${conflictData?.max_degree_delta || 0}`}
            />
            <StatCard
              label="Phases Used (Colors)"
              value={conflictData?.num_colors_used || 0}
              unit="phases"
              icon={Clock}
              status="emerald"
              subtitle={`Strategy: ${strategy}`}
            />
          </div>

          {/* Main Grid: Visual Conflict Graph + Scheduling Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visual Conflict Graph G_c Canvas */}
            <GlassCard
              title="Conflict Graph G_c = (V_c, E_c)"
              subtitle="Nodes represent AGV tasks; edges connect mutually incompatible routes"
              icon={Network}
              badge={
                <Badge variant={conflictData?.edges?.length > 0 ? 'rose' : 'emerald'}>
                  {conflictData?.edges?.length || 0} Edges
                </Badge>
              }
            >
              {conflictData && conflictData.nodes?.length > 0 ? (
                <div className="space-y-4">
                  {/* SVG Node-Link Canvas */}
                  <div className="h-72 min-h-[280px] w-full rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 p-4 relative flex items-center justify-center select-none overflow-hidden">
                    <svg className="w-full h-full max-h-[280px]" viewBox="0 0 440 280">
                      {/* Draw Conflict Edges */}
                      {conflictData.edges?.map((edge, i) => {
                        const u = edge?.u !== undefined ? edge.u : (Array.isArray(edge) ? edge[0] : null);
                        const v = edge?.v !== undefined ? edge.v : (Array.isArray(edge) ? edge[1] : null);
                        if (!u || !v) return null;
                        const uIdx = conflictData.nodes ? conflictData.nodes.indexOf(u) : -1;
                        const vIdx = conflictData.nodes ? conflictData.nodes.indexOf(v) : -1;
                        if (uIdx < 0 || vIdx < 0) return null;
                        const n = conflictData.nodes?.length || 1;
                        if (n < 2) return null;
                        const r = 95;
                        const cx = 220;
                        const cy = 140;
                        const ux = cx + r * Math.cos((2 * Math.PI * uIdx) / n);
                        const uy = cy + r * Math.sin((2 * Math.PI * uIdx) / n);
                        const vx = cx + r * Math.cos((2 * Math.PI * vIdx) / n);
                        const vy = cy + r * Math.sin((2 * Math.PI * vIdx) / n);

                        if (isNaN(ux) || isNaN(uy) || isNaN(vx) || isNaN(vy)) return null;

                        const isHighlighted =
                          selectedRobotId === u || selectedRobotId === v;

                        const edgeStroke = isHighlighted
                          ? '#EF4444'
                          : (isDark ? '#64748B' : '#94A3B8');

                        return (
                          <g key={i}>
                            <line
                              x1={ux}
                              y1={uy}
                              x2={vx}
                              y2={vy}
                              stroke={edgeStroke}
                              strokeWidth={isHighlighted ? 2.8 : 1.4}
                              strokeDasharray={isHighlighted ? '4 2' : '2 2'}
                              strokeOpacity={isHighlighted ? 1.0 : (isDark ? 0.4 : 0.6)}
                              className={isHighlighted ? 'animate-pulse' : ''}
                            />
                          </g>
                        );
                      })}

                      {/* Draw Conflict Nodes */}
                      {conflictData.nodes?.map((node, i) => {
                        const n = conflictData.nodes.length || 1;
                        const r = 95;
                        const cx = 220;
                        const cy = 140;
                        const x = n > 0 ? cx + r * Math.cos((2 * Math.PI * i) / n) : cx;
                        const y = n > 0 ? cy + r * Math.sin((2 * Math.PI * i) / n) : cy;
                        const colorIdx = conflictData.coloring?.[node] ?? 0;
                        const pal = PHASE_COLORS[colorIdx % PHASE_COLORS.length];
                        const isSelected = selectedRobotId === node;

                        return (
                          <g
                            key={node}
                            onClick={() => setSelectedRobotId(node)}
                            className="cursor-pointer transition-transform"
                          >
                            {isSelected && (
                              <circle
                                cx={x}
                                cy={y}
                                r={28}
                                fill="none"
                                stroke={isDark ? '#22D3EE' : '#2563EB'}
                                strokeWidth={2}
                                strokeDasharray="3 2"
                                className="animate-spin"
                              />
                            )}

                            <circle
                              cx={x}
                              cy={y}
                              r={20}
                              fill={isDark ? '#0B1120' : '#FFFFFF'}
                              stroke={pal.fill}
                              strokeWidth={isSelected ? 3 : 2}
                            />
                            <circle cx={x} cy={y} r={7} fill={pal.fill} />
                            <text
                              x={x}
                              y={y - 25}
                              textAnchor="middle"
                              fill={isDark ? '#FFFFFF' : '#0F172A'}
                              fontSize={10}
                              fontFamily="JetBrains Mono"
                              fontWeight="bold"
                            >
                              {node}
                            </text>
                            <text
                              x={x}
                              y={y + 33}
                              textAnchor="middle"
                              fill={pal.fill}
                              fontSize={9}
                              fontFamily="JetBrains Mono"
                              fontWeight="bold"
                            >
                              Phase {colorIdx}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Phase Color Legend */}
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    {PHASE_COLORS.slice(0, conflictData.num_colors_used || 1).map((pal, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${pal.bg}`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pal.fill }} />
                        <span>{pal.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : loading ? (
                <div className="h-72 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center p-6 text-center">
                  <RefreshCw size={24} className="text-blue-600 dark:text-cyan-400 animate-spin mb-3" />
                  <span className="text-sm font-bold text-slate-800 dark:text-white">Analyzing Trajectories...</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Evaluating spatio-temporal conflict graph and chromatic coloring</p>
                </div>
              ) : fetchError ? (
                <div className="h-72 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 flex flex-col items-center justify-center p-6 text-center">
                  <AlertTriangle size={24} className="text-rose-500 mb-2" />
                  <span className="text-sm font-bold text-rose-800 dark:text-rose-300">Conflict Graph Unavailable</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">{fetchError}</p>
                  <Button size="sm" variant="outline" onClick={() => fetchConflictGraph(strategy)}>
                    Retry Evaluation
                  </Button>
                </div>
              ) : (
                <EmptyState
                  icon={Network}
                  title="No Active Robot Tasks"
                  description="Spawning AGVs in the simulator will populate the conflict graph."
                />
              )}
            </GlassCard>

            {/* Scheduling Phase Timeline */}
            <GlassCard
              title="Scheduling Phase Timeline"
              subtitle="Robots partitioned into non-conflicting temporal execution blocks"
              icon={Calendar}
            >
              <div className="space-y-4">
                {conflictData?.scheduling_phases &&
                Object.keys(conflictData.scheduling_phases).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(conflictData.scheduling_phases).map(([phaseName, robotsInPhase], pIdx) => {
                      const pal = PHASE_COLORS[pIdx % PHASE_COLORS.length];
                      return (
                        <div
                          key={phaseName}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pal.fill }} />
                              <span className="font-bold text-slate-900 dark:text-white uppercase">{phaseName}</span>
                            </div>
                            <span className="text-slate-500 dark:text-slate-400">
                              {robotsInPhase.length} Non-Conflicting AGVs
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {robotsInPhase.map((rId) => {
                              const isSelected = selectedRobotId === rId;
                              return (
                                <button
                                  key={rId}
                                  onClick={() => setSelectedRobotId(rId)}
                                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all ${
                                    isSelected
                                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm dark:bg-cyan-500 dark:text-black dark:border-cyan-400'
                                      : `${pal.bg} hover:border-slate-400`
                                  }`}
                                >
                                  {rId}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState title="No Phases Calculated" description="Run greedy coloring to partition schedule." />
                )}

                {/* Conflict Alert Panel */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-white font-sans">
                      Detected Spatio-Temporal Interferences ({conflictData?.total_conflicts || 0}):
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Vertex & Swap Collisions</span>
                  </div>

                  {conflictData?.conflicts && conflictData.conflicts.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto font-mono text-xs">
                      {conflictData.conflicts.map((c, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold">
                              {c.agv1} ↔ {c.agv2}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-200 font-bold">
                              {c.conflict_type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-sans">
                            {c.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs font-mono">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      <span>All planned trajectories are pairwise independent (zero conflicts detected).</span>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Interactive Robot Inspection Deck */}
          {selectedRobot && (
            <GlassCard
              title={`Selected Robot Inspection: ${selectedRobot.id}`}
              subtitle="Inspect route waypoints, assigned phase, and colliding counterpart agents"
              icon={Bot}
              badge={
                <Badge variant={selectedRobotColor === 0 ? 'cyan' : 'amber'}>
                  Phase {selectedRobotColor}
                </Badge>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                {/* 1. Spatial Coordinates & Distance */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[10px] block font-sans">CURRENT POSITION & TARGET</span>
                  <div className="text-slate-900 dark:text-white font-bold text-sm mt-1">
                    ({selectedRobot.position[0]}, {selectedRobot.position[1]}) →{' '}
                    {selectedRobot.destination ? `(${selectedRobot.destination[0]}, ${selectedRobot.destination[1]})` : 'Idle'}
                  </div>
                  <span className="text-blue-600 dark:text-cyan-400 text-[11px] block mt-1">
                    Route Distance: {selectedRobot.route?.length ? selectedRobot.route.length - 1 : 0} hops
                  </span>
                </div>

                {/* 2. Assigned Phase & Color */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[10px] block font-sans">ASSIGNED SCHEDULING PHASE</span>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-1">
                    Phase {selectedRobotColor} (Color {selectedRobotColor})
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block mt-1 font-sans">
                    Runs in execution window #{selectedRobotColor}
                  </span>
                </div>

                {/* 3. Conflicting Robots */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[10px] block font-sans">MUTUALLY CONFLICTING AGVS</span>
                  <div className="text-rose-600 dark:text-rose-400 font-bold text-sm mt-1">
                    {uniqueConflictingPartners.length > 0 ? uniqueConflictingPartners.join(', ') : 'None (Independent)'}
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block mt-1">
                    Degree in G_c: {uniqueConflictingPartners.length}
                  </span>
                </div>

                {/* 4. Planned Waypoints preview */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[10px] block font-sans">BFS ROUTE WAYPOINTS</span>
                  <div className="text-slate-700 dark:text-slate-300 text-[11px] truncate mt-1">
                    {selectedRobot.route && selectedRobot.route.length > 0
                      ? selectedRobot.route.map((p) => `(${p[0]},${p[1]})`).join(' → ')
                      : 'Stationary'}
                  </div>
                  <span className="text-slate-500 text-[10px] block mt-1">
                    Status: {selectedRobot.movement_status || selectedRobot.status}
                  </span>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* TAB 2: WAREHOUSE GRID GRAPH G = (V, E) (PART A) */}
      {activeTab === 'grid-graph' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard
              label="Vertices |V|"
              value={gridGraphData?.metadata?.num_vertices || 0}
              unit="accessible cells"
              icon={Network}
              status="cyan"
              subtitle="Excludes static obstacles"
            />
            <StatCard
              label="Edges |E|"
              value={gridGraphData?.metadata?.num_edges || 0}
              unit="pathways"
              icon={Layers}
              status="emerald"
              subtitle="Orthogonal 4-connectivity"
            />
            <StatCard
              label="Connectivity Status"
              value={gridGraphData?.metadata?.is_connected ? 'CONNECTED' : 'DISCONNECTED'}
              icon={CheckCircle2}
              status={gridGraphData?.metadata?.is_connected ? 'emerald' : 'rose'}
              subtitle={`${gridGraphData?.metadata?.connected_components_count || 1} components`}
            />
            <StatCard
              label="Max Degree Δ(G)"
              value={gridGraphData?.metadata?.max_degree || 4}
              unit="deg_max"
              icon={Cpu}
              status="amber"
              subtitle="Interior 4-way junctions"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graph Definition & Adjacency Spec */}
            <GlassCard
              title="Undirected Warehouse Grid Graph G = (V, E)"
              subtitle="Formal graph theory representation of accessible floor pathways"
              icon={Network}
            >
              <div className="space-y-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-slate-950/80 border border-blue-100 dark:border-slate-800 space-y-1.5 text-slate-700 dark:text-slate-300">
                  <div className="text-blue-700 dark:text-cyan-300 font-bold">Formal Graph Definition:</div>
                  <p className="font-sans text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                    G = (V, E) where vertex set V contains all coordinates (x, y) not blocked by warehouse racks, and edge set E connects adjacent cells (u, v) with weight c(u, v) = 1.0.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 text-[10px] block">TOTAL CELLS</span>
                    <span className="text-slate-900 dark:text-white font-bold text-sm">64 cells (8 × 8)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 text-[10px] block">AVERAGE DEGREE</span>
                    <span className="text-blue-600 dark:text-cyan-400 font-bold text-sm">
                      {gridGraphData?.metadata?.average_degree || 3.5}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-700 dark:text-slate-400 text-[11px] block font-sans font-bold">
                    Sample Vertices (First 16 nodes):
                  </span>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                    {gridGraphData?.metadata?.nodes?.slice(0, 32).map((n, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                        ({n[0]},{n[1]})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Shortest Path Calculator: BFS vs Dijkstra */}
            <GlassCard
              title="Shortest Path Solver: BFS vs Dijkstra"
              subtitle="Compare Breadth-First Search unweighted hops with Dijkstra weighted traversal"
              icon={Compass}
            >
              <form onSubmit={handleCalculatePath} className="space-y-3 text-xs font-mono">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans font-medium">Start Cell (X, Y):</label>
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      <input
                        type="number"
                        min="0"
                        max="7"
                        value={startX}
                        onChange={(e) => setStartX(e.target.value)}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-slate-900 dark:text-white text-xs shadow-2xs"
                      />
                      <input
                        type="number"
                        min="0"
                        max="7"
                        value={startY}
                        onChange={(e) => setStartY(e.target.value)}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-slate-900 dark:text-white text-xs shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans font-medium">Target Cell (X, Y):</label>
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      <input
                        type="number"
                        min="0"
                        max="7"
                        value={targetX}
                        onChange={(e) => setTargetX(e.target.value)}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-slate-900 dark:text-white text-xs shadow-2xs"
                      />
                      <input
                        type="number"
                        min="0"
                        max="7"
                        value={targetY}
                        onChange={(e) => setTargetY(e.target.value)}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-slate-900 dark:text-white text-xs shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans font-medium">Algorithm:</label>
                  <select
                    value={pathAlgo}
                    onChange={(e) => setPathAlgo(e.target.value)}
                    className="w-full mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-slate-900 dark:text-white text-xs font-mono shadow-2xs"
                  >
                    <option value="bfs">BFS (Breadth-First Search - Unweighted Hops)</option>
                    <option value="dijkstra">Dijkstra (Weighted Shortest Path)</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  loading={pathLoading}
                  variant="primary"
                  size="sm"
                  className="w-full mt-2"
                >
                  Find Shortest Path on G
                </Button>

                {pathResult && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 mt-3">
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>{pathResult.algorithm}</span>
                      <span>{pathResult.hop_count} Hops (Cost: {pathResult.cost})</span>
                    </div>
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 max-h-24 overflow-y-auto leading-relaxed">
                      {pathResult.path.map((p) => `(${p[0]},${p[1]})`).join(' → ')}
                    </div>
                  </div>
                )}
              </form>
            </GlassCard>
          </div>
        </div>
      )}

      {/* TAB 3: MATHEMATICAL FORMULATIONS & BOUNDS (PART E) */}
      {activeTab === 'math-theory' && (
        <div className="space-y-6">
          <GlassCard
            title="Mathematical Formulations, Brooks' Theorem & Coloring Bounds"
            subtitle="Theoretical foundation of graph coloring in automated multi-agent coordination"
            icon={BookOpen}
          >
            <div className="space-y-5 text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
              {/* Definition Section */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2 font-mono">
                <span className="font-bold text-blue-700 dark:text-cyan-300 text-xs uppercase tracking-wider block font-sans">
                  1. Conflict Graph Definition G_c = (V_c, E_c)
                </span>
                <p className="font-sans text-slate-700 dark:text-slate-300 text-xs">
                  Let <code className="text-blue-600 dark:text-cyan-400 font-mono font-semibold">V_c = {'{'}T_1, T_2, ..., T_k{'}'}</code> represent the set of AGV movement trajectories. An undirected edge <code className="text-rose-600 dark:text-rose-400 font-mono font-semibold">(T_i, T_j) ∈ E_c</code> connects two tasks if and only if they cannot safely execute concurrently.
                </p>
                <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-blue-700 dark:text-cyan-300 text-[11px]">
                  (T_i, T_j) ∈ E_c ⟺ ∃ t : pos_i(t) = pos_j(t) ∨ (pos_i(t)=pos_j(t+1) ∧ pos_i(t+1)=pos_j(t))
                </div>
              </div>

              {/* Brooks Theorem Upper Bound */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="amber">THEOREM 3.1</Badge>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Brooks' Theorem Upper Bound on Chromatic Number
                  </h4>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 font-mono text-blue-700 dark:text-cyan-300 text-center text-sm font-bold">
                  χ(G_c) ≤ Δ(G_c) + 1
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  Where <code className="text-slate-800 dark:text-slate-300 font-mono font-semibold">Δ(G_c)</code> is the maximum degree of the conflict graph. Brooks' theorem further states that for any connected graph that is neither a complete graph <code className="text-slate-800 dark:text-slate-300 font-mono">K_n</code> nor an odd cycle <code className="text-slate-800 dark:text-slate-300 font-mono">C_{'{'}2k+1{'}'}</code>, the bound sharpens to <code className="text-slate-800 dark:text-slate-300 font-mono">χ(G_c) ≤ Δ(G_c)</code>.
                </p>
              </div>

              {/* NP-Hardness Note */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="font-bold text-slate-900 dark:text-white text-xs">
                  NP-Hardness & Heuristic Nature of Greedy Coloring:
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Determining the exact minimal chromatic number <code className="text-blue-600 dark:text-cyan-400 font-mono font-semibold">χ(G_c)</code> is known to be <strong>NP-complete</strong> for general graphs. Consequently, greedy graph coloring algorithms (e.g. Welsh-Powell largest-first) provide an efficient polynomial-time heuristic <code className="text-blue-600 dark:text-cyan-400 font-mono">O(|V| + |E|)</code> that guarantees a valid coloring, though not necessarily minimal.
                </p>
              </div>

              {/* Step-by-Step Coloring Trace Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm font-sans">
                  Step-by-Step Greedy Coloring Process ({strategy}):
                </h4>
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px]">
                        <th className="py-2.5 px-3">STEP</th>
                        <th className="py-2.5 px-3">AGENT (VERTEX)</th>
                        <th className="py-2.5 px-3">DEGREE deg(v)</th>
                        <th className="py-2.5 px-3">CONFLICT NEIGHBORS</th>
                        <th className="py-2.5 px-3">PROHIBITED COLORS</th>
                        <th className="py-2.5 px-3">ASSIGNED PHASE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-command-surface">
                      {conflictData?.coloring_steps?.map((step, idx) => (
                        <tr key={step.vertex} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                          <td className="py-2.5 px-3 text-slate-500">#{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{step.vertex}</td>
                          <td className="py-2.5 px-3 text-blue-600 dark:text-cyan-300 font-semibold">{step.degree}</td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                            {step.neighbors.length > 0 ? step.neighbors.join(', ') : 'None'}
                          </td>
                          <td className="py-2.5 px-3 text-rose-600 dark:text-rose-300">
                            {step.neighbor_colors_prohibited.length > 0
                              ? step.neighbor_colors_prohibited.map((c) => `Phase ${c}`).join(', ')
                              : 'None'}
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge variant="cyan">{step.phase_name}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
