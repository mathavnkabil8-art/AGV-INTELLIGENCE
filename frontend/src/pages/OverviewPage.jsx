import React, { useState, useEffect } from 'react';
import StatCard from '../components/ui/StatCard';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import WarehouseGrid from '../components/warehouse/WarehouseGrid';
import FleetStatus from '../components/fleet/FleetStatus';
import { apiClient } from '../api/client';
import {
  Bot,
  Activity,
  Zap,
  AlertTriangle,
  BatteryCharging,
  PackageCheck,
  ArrowRight,
  Cpu,
  RefreshCw,
  GitFork,
  Grid3X3,
  AlertOctagon,
  Scale,
} from 'lucide-react';

export default function OverviewPage({
  warehouse,
  agvs = {},
  simulationState,
  onNavigate,
  selectedAGVId,
  onSelectAGV,
}) {
  const agvList = Object.values(agvs);
  const totalAgvs = agvList.length;
  const activeRobots = agvList.filter((a) => a.status === 'MOVING' || a.status === 'WAITING').length;
  const chargingRobots = agvList.filter((a) => a.status === 'CHARGING').length;

  const totalChargers = warehouse?.charging_stations?.length || 4;
  const availableChargers = Math.max(0, totalChargers - chargingRobots);

  // Compute average battery
  const avgBattery =
    totalAgvs > 0
      ? Math.round(agvList.reduce((acc, a) => acc + (a.battery_level || 0), 0) / totalAgvs)
      : 0;

  // Total cumulative distance traveled
  const totalDistance = agvList.reduce((acc, a) => acc + (a.total_distance_traveled || 0), 0);
  const completedDeliveries = Math.floor(totalDistance / 14);

  // Phase 7: Integrated Controller State
  const [optData, setOptData] = useState(null);
  const [optLoading, setOptLoading] = useState(false);
  const [weights, setWeights] = useState({ alpha: 1.0, beta: 5.0, gamma: 0.5, delta: 2.0 });

  const fetchOptimization = async () => {
    setOptLoading(true);
    try {
      const res = await apiClient.runIntegratedOptimization(weights);
      setOptData(res);
    } catch (err) {
      console.error('Error running integrated optimization:', err);
    } finally {
      setOptLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimization();
  }, [simulationState?.step]);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl p-4 sm:p-6 overflow-hidden border border-blue-200/80 dark:border-command-border/80 bg-gradient-to-r from-blue-50/90 via-sky-50/60 to-indigo-50/80 dark:from-command-surface dark:via-slate-900/90 dark:to-command-surface min-w-0 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="max-w-2xl min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="cyan" dot>
                SYSTEM ACTIVE • LEVEL 4 AUTOMATION
              </Badge>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Tick #{simulationState?.step || 0}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Warehouse Command & Fleet Optimization
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Autonomous multi-agent warehouse coordination powered by graph theory, combinatorial mathematics, and intelligent energy allocation.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => onNavigate('simulator')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-all shrink-0"
            >
              <Bot size={15} />
              <span>Open Simulator</span>
            </button>
            <button
              onClick={() => onNavigate('traffic')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 transition-all shrink-0 shadow-2xs"
            >
              <span>Traffic Control</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Subtle background industrial grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 dark:opacity-15 pointer-events-none" />
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 min-w-0">
        <StatCard
          label="Total AGVs"
          value={totalAgvs}
          unit="units"
          icon={Bot}
          status="cyan"
          subtitle="Fleet footprint"
        />
        <StatCard
          label="Active Robots"
          value={activeRobots}
          unit="moving"
          icon={Activity}
          status="emerald"
          subtitle="In transit"
        />
        <StatCard
          label="Completed Tasks"
          value={completedDeliveries}
          unit="deliveries"
          icon={PackageCheck}
          status="cyan"
          subtitle="Payload missions"
        />
        <StatCard
          label="Route Conflicts"
          value={optData?.conflict_scheduling?.conflicts_count ?? 0}
          unit="interferences"
          icon={AlertTriangle}
          status={optData?.conflict_scheduling?.conflicts_count > 0 ? 'amber' : 'emerald'}
          subtitle="G_c conflict edges"
        />
        <StatCard
          label="Dock Availability"
          value={`${availableChargers} / ${totalChargers}`}
          unit="free bays"
          icon={BatteryCharging}
          status="emerald"
          subtitle="Rook compatible"
        />
        <StatCard
          label="Avg Fleet Battery"
          value={`${avgBattery}%`}
          unit="%"
          icon={Zap}
          status={avgBattery < 30 ? 'rose' : avgBattery < 50 ? 'amber' : 'emerald'}
          subtitle="Lithium pack average"
        />
      </div>

      {/* Phase 7: Live Integrated Optimization Status Panel */}
      <GlassCard
        title="Integrated AGV Optimization Controller (Phase 7)"
        subtitle="End-to-end mathematical coordination linking Graph Theory, Coloring, Rook Polynomials, OGF Energy, and Deadlocks"
        icon={Scale}
        badge={
          <Badge variant={optData?.deadlock_telemetry?.deadlock_detected ? 'rose' : 'emerald'}>
            Z = {optData?.objective_score_z ?? '--'}
          </Badge>
        }
        action={
          <Button
            onClick={fetchOptimization}
            loading={optLoading}
            size="sm"
            variant="ghost"
            icon={RefreshCw}
            className="text-xs text-blue-600 dark:text-cyan-400"
          >
            Re-optimize
          </Button>
        }
      >
        <div className="space-y-4">
          {/* Objective Function Formulation & Tuner */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-sans block text-[11px]">
                Configurable Objective Function (Heuristic Minimization):
              </span>
              <div className="text-blue-700 dark:text-cyan-300 font-bold text-sm mt-0.5">
                min Z = α·T + β·C + γ·E + δ·W
              </div>
              <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
                {optData?.objective_breakdown?.formula || 'Evaluating multi-objective cost...'}
              </span>
            </div>

            {/* Weight inputs */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 dark:text-slate-400">α (Dist):</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={weights.alpha}
                  onChange={(e) => setWeights({ ...weights, alpha: Number(e.target.value) })}
                  className="w-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-900 dark:text-white text-center text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 dark:text-slate-400">β (Conf):</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="1"
                  value={weights.beta}
                  onChange={(e) => setWeights({ ...weights, beta: Number(e.target.value) })}
                  className="w-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-900 dark:text-white text-center text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 dark:text-slate-400">γ (Energy):</span>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={weights.gamma}
                  onChange={(e) => setWeights({ ...weights, gamma: Number(e.target.value) })}
                  className="w-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-900 dark:text-white text-center text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 dark:text-slate-400">δ (Wait):</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={weights.delta}
                  onChange={(e) => setWeights({ ...weights, delta: Number(e.target.value) })}
                  className="w-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-900 dark:text-white text-center text-xs"
                />
              </div>
            </div>
          </div>

          {/* 5-Pillar Integrated Pipeline Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* 1. Route Status */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-sans">
                <span className="font-semibold">1. Route Status</span>
                <GitFork size={13} className="text-blue-600 dark:text-cyan-400" />
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                {optData?.graph_routing?.total_travel_distance ?? '--'} hops
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans block">
                BFS / Dijkstra paths
              </span>
            </div>

            {/* 2. Conflict Count */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-sans">
                <span className="font-semibold">2. Conflict Graph</span>
                <AlertTriangle size={13} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                {optData?.conflict_scheduling?.conflicts_count ?? '--'} conflicts
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans block">
                {optData?.conflict_scheduling?.num_phases ?? 1} chromatic phases
              </span>
            </div>

            {/* 3. Deadlock Status */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-sans">
                <span className="font-semibold">3. Deadlock State</span>
                <AlertOctagon size={13} className="text-rose-600 dark:text-rose-400" />
              </div>
              <div className="text-lg font-bold font-mono">
                <span className={optData?.deadlock_telemetry?.deadlock_detected ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                  {optData?.deadlock_telemetry?.deadlock_detected ? 'CYCLE ACTIVE' : 'NO DEADLOCK'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans block">
                {optData?.deadlock_telemetry?.cycles?.length || 0} WFG cycles
              </span>
            </div>

            {/* 4. Charging Matching */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-sans">
                <span className="font-semibold">4. Rook Dock Match</span>
                <Grid3X3 size={13} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                {optData?.charging_matching?.valid_assignments_count ?? '--'} valid
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans block">
                PIE non-forbidden bays
              </span>
            </div>

            {/* 5. Energy Availability */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-sans">
                <span className="font-semibold">5. Energy Allocation</span>
                <Zap size={13} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                {optData?.backup_energy?.admissible_allocations?.toLocaleString() ?? '--'} ways
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans block">
                {optData?.backup_energy?.status ?? 'OGF Active'}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Main Operational Split: Live Warehouse Twin & Fleet Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Warehouse Live Map */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard
            title="Live Warehouse Topology"
            subtitle="Planar grid graph with A* orthogonal path reservation"
            icon={Cpu}
            action={
              <button
                onClick={() => onNavigate('simulator')}
                className="text-xs text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 font-mono flex items-center gap-1 font-semibold"
              >
                <span>Full Screen</span>
                <ArrowRight size={12} />
              </button>
            }
          >
            <WarehouseGrid
              warehouse={warehouse}
              agvs={agvs}
              selectedAGVId={selectedAGVId}
              onSelectAGV={onSelectAGV}
            />
          </GlassCard>
        </div>

        {/* Right Col: Fleet Telemetry List & Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <FleetStatus
            agvs={agvs}
            selectedAGVId={selectedAGVId}
            onSelectAGV={onSelectAGV}
          />

          <GlassCard
            title="Quick Optimization Jump"
            subtitle="Mathematical modules in current cycle"
          >
            <div className="space-y-2 text-xs">
              <button
                onClick={() => onNavigate('traffic')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-cyan-500/40 text-left transition-colors shadow-2xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Graph Theory & Conflict Coloring</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Time-slot channels via Welsh-Powell</div>
                </div>
                <Badge variant="cyan">χ(G)</Badge>
              </button>

              <button
                onClick={() => onNavigate('charging')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-300 dark:hover:border-amber-500/40 text-left transition-colors shadow-2xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Rook Polynomial Matching</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Forbidden dock clearance via PIE</div>
                </div>
                <Badge variant="amber">PIE</Badge>
              </button>

              <button
                onClick={() => onNavigate('energy')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-500/40 text-left transition-colors shadow-2xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Generating Functions</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Power quota discrete partitions</div>
                </div>
                <Badge variant="emerald">G(x)</Badge>
              </button>

              <button
                onClick={() => onNavigate('deadlocks')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-rose-300 dark:hover:border-rose-500/40 text-left transition-colors shadow-2xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Deadlock Monitoring & Recovery</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">WFG cycle detection & detour replanning</div>
                </div>
                <Badge variant="rose">WFG</Badge>
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
