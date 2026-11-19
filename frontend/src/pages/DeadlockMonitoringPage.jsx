import React, { useState, useEffect } from 'react';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../api/client';
import {
  AlertOctagon,
  ShieldAlert,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  ArrowRight,
  ShieldCheck,
  Flame,
  Compass,
} from 'lucide-react';

export default function DeadlockMonitoringPage({ agvs = {}, onStep }) {
  const { isDark } = useTheme();
  const [deadlockData, setDeadlockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [intentionalLoading, setIntentionalLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [recoveryReport, setRecoveryReport] = useState(null);

  const fetchDeadlockStatus = async () => {
    setLoading(true);
    try {
      const data = await apiClient.checkDeadlocks();
      setDeadlockData(data);
    } catch (err) {
      console.error('Error checking deadlocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadlockStatus();
  }, []);

  // Part A: Trigger intentional deadlock scenario
  const handleTriggerIntentionalDeadlock = async () => {
    setIntentionalLoading(true);
    try {
      const res = await apiClient.injectIntentionalDeadlock();
      setStatusMessage({
        type: 'warning',
        text: 'Injected 4-robot circular wait dependency: AGV-01 → AGV-02 → AGV-03 → AGV-04 → AGV-01.',
      });
      setRecoveryReport(null);
      await fetchDeadlockStatus();
    } catch (err) {
      console.error('Error injecting intentional deadlock:', err);
    } finally {
      setIntentionalLoading(false);
    }
  };

  // Part C: True physical route replanning recovery
  const handleTrueRouteRecovery = async () => {
    setRecoveryLoading(true);
    try {
      const res = await apiClient.recoverDeadlock();
      const resolution = res.resolution;
      if (resolution?.recovery_action?.success) {
        const action = resolution.recovery_action;
        setRecoveryReport(action);
        setStatusMessage({
          type: 'success',
          text: `True Route Replanning: ${action.yield_robot} rerouted around ${action.blocked_by} via Dijkstra detour. Cycle successfully broken!`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: 'No deadlock cycle active to recover, or no safe detour found.',
        });
      }
      if (onStep) onStep();
      setTimeout(fetchDeadlockStatus, 500);
    } catch (err) {
      console.error('Error recovering deadlock:', err);
    } finally {
      setRecoveryLoading(false);
    }
  };

  const isDeadlock = deadlockData?.deadlock_detected;
  const cycleCount = deadlockData?.cycles?.length || 0;
  const edgeCount = deadlockData?.wait_for_graph?.edges?.length || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Deadlock Monitoring & True Route Recovery
            </h2>
            <Badge variant={isDeadlock ? 'rose' : 'emerald'} dot>
              {isDeadlock ? 'DEADLOCK DETECTED' : 'SYSTEM ACYCLIC (DAG)'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Directed Wait-For Graph (WFG) analysis, Coffman cycle detection, and physical Dijkstra detour replanning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleTriggerIntentionalDeadlock}
            loading={intentionalLoading}
            variant="ghost"
            size="sm"
            className="text-xs text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/60 font-medium"
            icon={Flame}
          >
            Inject Deadlock Demo
          </Button>

          <Button
            onClick={fetchDeadlockStatus}
            loading={loading}
            icon={RefreshCw}
            variant="outline"
            size="sm"
          >
            Scan WFG
          </Button>

          {isDeadlock && (
            <Button
              onClick={handleTrueRouteRecovery}
              loading={recoveryLoading}
              icon={RotateCcw}
              variant="danger"
              size="sm"
            >
              Replan Detour Route
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Wait-For Graph Edges"
          value={edgeCount}
          unit="waiting links"
          icon={Layers}
          status="cyan"
          subtitle="Directed dependency pairs"
        />
        <StatCard
          label="Directed Cycles"
          value={cycleCount}
          unit="circular waits"
          icon={AlertOctagon}
          status={cycleCount > 0 ? 'rose' : 'emerald'}
          subtitle={cycleCount > 0 ? 'Coffman circular wait' : 'Acyclic directed graph (DAG)'}
        />
        <StatCard
          label="Strongly Connected (SCC)"
          value={deadlockData?.strongly_connected_clusters?.length || 0}
          unit="clusters"
          icon={AlertTriangle}
          status={deadlockData?.strongly_connected_clusters?.length > 0 ? 'rose' : 'neutral'}
          subtitle="Components with size > 1"
        />
        <StatCard
          label="Deadlock State"
          value={isDeadlock ? 'CRITICAL' : 'STABLE'}
          icon={ShieldAlert}
          status={isDeadlock ? 'rose' : 'emerald'}
          subtitle="Real-time graph analysis"
        />
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between shadow-2xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : statusMessage.type === 'warning'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              : 'bg-blue-50 dark:bg-cyan-950/40 border-blue-200 dark:border-cyan-800 text-blue-800 dark:text-cyan-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-rose-500 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white ml-2 text-xs font-sans font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: WFG Visualizer & Active Wait Relationships */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Wait-For Graph Inspector */}
        <GlassCard
          title="Directed Wait-For Graph D = (V_A, E_W)"
          subtitle="Directed edge u → v indicates robot u is waiting for cell held or reserved by robot v"
          icon={AlertOctagon}
          badge={
            <Badge variant={isDeadlock ? 'rose' : 'emerald'}>
              {isDeadlock ? 'Directed Cycle Present' : 'Acyclic DAG'}
            </Badge>
          }
        >
          <div className="space-y-4">
            {edgeCount > 0 ? (
              <div className="h-64 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 p-4 relative flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 400 240">
                  <defs>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="18"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
                    </marker>
                    <marker
                      id="arrow-safe"
                      viewBox="0 0 10 10"
                      refX="18"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill={isDark ? '#06B6D4' : '#2563EB'} />
                    </marker>
                  </defs>

                  {/* Draw Directed Edges */}
                  {deadlockData?.wait_for_graph?.edges?.map((edge, i) => {
                    const u = Array.isArray(edge) ? edge[0] : (edge?.u || edge?.source);
                    const v = Array.isArray(edge) ? edge[1] : (edge?.v || edge?.target);
                    if (!u || !v) return null;
                    const nodes = deadlockData.wait_for_graph?.nodes || [];
                    const uIdx = nodes.indexOf(u);
                    const vIdx = nodes.indexOf(v);
                    if (uIdx < 0 || vIdx < 0) return null;
                    const n = nodes.length || 1;
                    const cx = 200;
                    const cy = 120;
                    const r = 80;
                    const ux = cx + r * Math.cos((2 * Math.PI * uIdx) / n);
                    const uy = cy + r * Math.sin((2 * Math.PI * uIdx) / n);
                    const vx = cx + r * Math.cos((2 * Math.PI * vIdx) / n);
                    const vy = cy + r * Math.sin((2 * Math.PI * vIdx) / n);
                    if (isNaN(ux) || isNaN(uy) || isNaN(vx) || isNaN(vy)) return null;

                    return (
                      <line
                        key={i}
                        x1={ux}
                        y1={uy}
                        x2={vx}
                        y2={vy}
                        stroke={isDeadlock ? '#EF4444' : (isDark ? '#06B6D4' : '#2563EB')}
                        strokeWidth={2.5}
                        markerEnd={`url(#${isDeadlock ? 'arrow' : 'arrow-safe'})`}
                      />
                    );
                  })}

                  {/* Draw Nodes */}
                  {deadlockData?.wait_for_graph?.nodes?.map((node, i) => {
                    const n = deadlockData.wait_for_graph.nodes.length || 1;
                    const cx = 200;
                    const cy = 120;
                    const r = 80;
                    const x = cx + r * Math.cos((2 * Math.PI * i) / n);
                    const y = cy + r * Math.sin((2 * Math.PI * i) / n);

                    return (
                      <g key={node}>
                        <circle
                          cx={x}
                          cy={y}
                          r={18}
                          fill={isDark ? '#0F172A' : '#FFFFFF'}
                          stroke={isDeadlock ? '#EF4444' : (isDark ? '#06B6D4' : '#2563EB')}
                          strokeWidth={2}
                        />
                        <text
                          x={x}
                          y={y + 4}
                          textAnchor="middle"
                          fill={isDark ? '#FFFFFF' : '#0F172A'}
                          fontSize={9}
                          fontFamily="JetBrains Mono"
                          fontWeight="bold"
                        >
                          {node}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500 opacity-80" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Wait-For Graph is Disjoint</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto font-sans">
                  Zero active agents are blocked by neighboring AGVs. All vehicles possess unobstructed pathways.
                </p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Right: Circular Wait Detection & True Replanning Engine */}
        <GlassCard
          title="Circular Wait Cycles & Recovery Strategy"
          subtitle="Identified cycles resolved via Dijkstra detour route replanning"
          icon={AlertTriangle}
        >
          <div className="space-y-4 text-xs font-mono">
            {cycleCount > 0 ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 shadow-2xs">
                  <div className="font-bold text-sm mb-1 text-rose-900 dark:text-rose-200">
                    ⚠ Active Circular Deadlock Detected!
                  </div>
                  <p className="text-[11px] text-rose-800/90 dark:text-rose-300/80 leading-relaxed font-sans">
                    A directed cycle in the Wait-For Graph violates progress conditions. Robots are blocked in mutual wait without outside intervention.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-slate-700 dark:text-slate-400 text-[11px] block font-sans font-bold">
                    Enumerated Directed Cycles:
                  </span>
                  {deadlockData.cycles.map((cycle, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-rose-600 dark:text-rose-400 font-bold">Cycle {idx + 1}:</span>
                        <span className="text-slate-900 dark:text-white font-semibold">{cycle.join(' → ')} → {cycle[0]}</span>
                      </div>
                      <Badge variant="rose">DEADLOCKED</Badge>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleTrueRouteRecovery}
                  loading={recoveryLoading}
                  variant="danger"
                  className="w-full mt-2"
                  icon={RotateCcw}
                >
                  Execute Physical Detour Replanning & Break Cycle
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 shadow-2xs">
                  <div className="font-bold mb-1 flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200">
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span>No Circular Wait Conditions Found</span>
                  </div>
                  <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400/80 font-sans leading-relaxed">
                    The Wait-For Graph is a Directed Acyclic Graph (DAG). Topological sorting succeeds, ensuring deadlock-free multi-agent execution.
                  </p>
                </div>

                {recoveryReport && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-blue-200 dark:border-cyan-800/60 space-y-2 font-mono text-[11px] shadow-2xs">
                    <div className="flex items-center justify-between text-blue-700 dark:text-cyan-300 font-bold font-sans">
                      <span>Recent Recovery Audit:</span>
                      <Badge variant="cyan" size="sm">{recoveryReport.strategy}</Badge>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      <div>Yielding AGV: <strong className="text-slate-900 dark:text-white">{recoveryReport.yield_robot}</strong></div>
                      <div>Blocked By: <strong className="text-slate-900 dark:text-white">{recoveryReport.blocked_by}</strong></div>
                      <div>Replanned Path: <strong className="text-emerald-600 dark:text-emerald-400">{JSON.stringify(recoveryReport.replanned_route)}</strong></div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans">
                      ✓ Real physical detour around obstacle. Edges were not artificially deleted.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
