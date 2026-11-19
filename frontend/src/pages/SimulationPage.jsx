import React from 'react';
import WarehouseGrid from '../components/warehouse/WarehouseGrid';
import FleetStatus from '../components/fleet/FleetStatus';
import SimulationControls from '../components/simulation/SimulationControls';
import { Activity } from 'lucide-react';

export default function SimulationPage({
  warehouse,
  agvs,
  simulationState,
  isPlaying,
  onTogglePlay,
  onStep,
  onReset,
  selectedAGVId,
  onSelectAGV,
  tickRate,
  onChangeTickRate
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Warehouse Digital Twin & Dynamic Simulation</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time discrete-event multi-agent spatial coordination and inductive charging management.
          </p>
        </div>
      </div>

      <SimulationControls
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
        onStep={onStep}
        onReset={onReset}
        stepCount={simulationState?.step || 0}
        tickRate={tickRate}
        onChangeTickRate={onChangeTickRate}
        metrics={simulationState?.fleet_metrics}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <WarehouseGrid
            warehouse={warehouse}
            agvs={agvs}
            selectedAGVId={selectedAGVId}
            onSelectAGV={onSelectAGV}
          />
        </div>
        <div className="lg:col-span-1 space-y-4">
          <FleetStatus
            agvs={agvs}
            selectedAGVId={selectedAGVId}
            onSelectAGV={onSelectAGV}
          />

          {/* Event Log */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="text-cyan-400" size={16} />
              <h3 className="text-sm font-bold text-white">Simulation Log Stream</h3>
            </div>
            <div className="space-y-1.5 font-mono text-xs max-h-44 overflow-y-auto">
              {simulationState?.recent_events?.map((evt, idx) => (
                <div key={idx} className="p-1.5 rounded bg-slate-950/70 border border-slate-800 text-slate-300">
                  <span className="text-cyan-400 font-bold">[{evt.type}]</span> {evt.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
