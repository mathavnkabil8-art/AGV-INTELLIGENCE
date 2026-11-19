import React from 'react';
import WarehouseGrid from '../components/warehouse/WarehouseGrid';
import FleetStatus from '../components/fleet/FleetStatus';
import SimulationControls from '../components/simulation/SimulationControls';
import { ArrowRight, Bot, GitFork, ShieldCheck } from 'lucide-react';

export default function DashboardPage({
  warehouse,
  agvs,
  simulationState,
  isPlaying,
  onTogglePlay,
  onStep,
  onReset,
  selectedAGVId,
  onSelectAGV,
  onNavigateTab
}) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-[11px] font-mono font-semibold text-cyan-300 mb-3">
            <ShieldCheck size={13} />
            Experiential Learning Project • University Discrete Mathematics & Graph Theory
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Autonomous Guided Vehicle Traffic Routing & Smart Charging
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Mathematical modeling of automated warehouse multi-agent dynamics using Graph Coloring, Rook Polynomials (PIE), Generating Functions, and Wait-For-Graph deadlock cycle detection.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={() => onNavigateTab('simulation')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Bot size={15} />
              <span>Open Fleet Simulator</span>
            </button>
            <button
              onClick={() => onNavigateTab('algorithms')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all"
            >
              <GitFork size={15} />
              <span>Explore Mathematical Modules</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Simulation Controls Strip */}
      <SimulationControls
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
        onStep={onStep}
        onReset={onReset}
        stepCount={simulationState?.step || 0}
        metrics={simulationState?.fleet_metrics}
      />

      {/* Main Grid: Warehouse Digital Twin & Fleet Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WarehouseGrid
            warehouse={warehouse}
            agvs={agvs}
            selectedAGVId={selectedAGVId}
            onSelectAGV={onSelectAGV}
          />
        </div>
        <div className="lg:col-span-1">
          <FleetStatus
            agvs={agvs}
            selectedAGVId={selectedAGVId}
            onSelectAGV={onSelectAGV}
          />
        </div>
      </div>
    </div>
  );
}
