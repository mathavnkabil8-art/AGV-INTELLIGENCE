import React, { useState } from 'react';
import WarehouseGrid from '../components/warehouse/WarehouseGrid';
import FleetStatus from '../components/fleet/FleetStatus';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SimulationControls from '../components/simulation/SimulationControls';
import { apiClient } from '../api/client';
import {
  Bot,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Send,
} from 'lucide-react';

export default function SimulatorPage({
  warehouse,
  agvs = {},
  simulationState,
  isPlaying,
  onTogglePlay,
  onStep,
  onReset,
  selectedAGVId,
  onSelectAGV,
  tickRate,
  onChangeTickRate,
  onRefreshState,
}) {
  const [interactiveMode, setInteractiveMode] = useState('select'); // 'select' | 'obstacle'
  const [destX, setDestX] = useState('');
  const [destY, setDestY] = useState('');
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);

  const robotList = Object.values(agvs);
  const selectedAGV = selectedAGVId ? agvs[selectedAGVId] : robotList[0] || null;

  // Manual Destination Change via Form
  const handleManualDispatch = async (e) => {
    e?.preventDefault();
    if (!selectedAGV) return;

    const x = Number(destX);
    const y = Number(destY);

    if (isNaN(x) || isNaN(y)) {
      setActionError('Coordinates must be integers.');
      return;
    }

    try {
      setActionError(null);
      const res = await apiClient.setRobotDestination(selectedAGV.id, x, y);
      setActionMessage(`Dispatched ${selectedAGV.id} to (${x}, ${y}). BFS planned ${res.route?.length || 0} steps.`);
      if (onRefreshState) onRefreshState();
    } catch (err) {
      setActionError(err.message || 'Invalid destination rejection.');
    }
  };

  // Click on Grid to Change Destination
  const handleGridChangeDestination = async (robotId, x, y) => {
    try {
      setActionError(null);
      const res = await apiClient.setRobotDestination(robotId, x, y);
      setActionMessage(`Dispatched ${robotId} to (${x}, ${y}) via BFS shortest path.`);
      if (onRefreshState) onRefreshState();
    } catch (err) {
      setActionError(err.message || 'Cannot dispatch to this location.');
    }
  };

  // Toggle Obstacle via Grid Click
  const handleToggleObstacle = async (x, y) => {
    try {
      setActionError(null);
      const res = await apiClient.toggleObstacle(x, y);
      setActionMessage(res.message);
      if (onRefreshState) onRefreshState();
    } catch (err) {
      setActionError(err.message || 'Cannot place obstacle here.');
    }
  };

  // Add Robot
  const handleAddRobot = async () => {
    try {
      setActionError(null);
      const res = await apiClient.addRobot();
      setActionMessage(res.message);
      if (onRefreshState) onRefreshState();
    } catch (err) {
      setActionError(err.message);
    }
  };

  // Remove Robot
  const handleRemoveRobot = async (robotId) => {
    try {
      setActionError(null);
      const res = await apiClient.removeRobot(robotId);
      setActionMessage(res.message);
      if (onSelectAGV) onSelectAGV(null);
      if (onRefreshState) onRefreshState();
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Header & Playback Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              8×8 Warehouse Digital Twin Simulator
            </h2>
            <Badge variant="cyan" dot>
              BFS ACTIVE
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            4-directional kinematic routing, 4 charging pads, 6 storage bays, and collision prevention.
          </p>
        </div>

        <SimulationControls
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
          onStep={onStep}
          onReset={onReset}
          stepCount={simulationState?.step || 0}
          tickRate={tickRate}
          onChangeTickRate={onChangeTickRate}
          onAddRobot={handleAddRobot}
          onRemoveRobot={handleRemoveRobot}
          selectedAGVId={selectedAGV?.id}
          mode={interactiveMode}
          onToggleMode={() =>
            setInteractiveMode((prev) => (prev === 'obstacle' ? 'select' : 'obstacle'))
          }
        />
      </div>

      {/* Notifications / Toast Messages */}
      {actionMessage && (
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-cyan-950/40 border border-blue-200 dark:border-cyan-800 text-xs font-mono text-blue-800 dark:text-cyan-300 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-blue-600 dark:text-cyan-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-mono text-rose-800 dark:text-rose-300 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Interactive 8x8 Canvas + Detailed Robot Information Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-w-0 w-full">
        {/* Left 2 Cols: 8x8 Interactive Warehouse Canvas */}
        <div className="xl:col-span-2 space-y-4 min-w-0">
          <WarehouseGrid
            warehouse={warehouse}
            agvs={agvs}
            selectedAGVId={selectedAGV?.id}
            onSelectAGV={onSelectAGV}
            mode={interactiveMode}
            onToggleObstacle={handleToggleObstacle}
            onChangeDestination={handleGridChangeDestination}
          />

          {/* Quick Metrics & Mode Guide */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">GRID DIMENSIONS</span>
              <span className="text-slate-900 dark:text-white font-bold text-sm">8 × 8 (64 cells)</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">CHARGING STATIONS</span>
              <span className="text-teal-600 dark:text-amber-400 font-bold text-sm">
                {warehouse?.charging_stations?.length || 4} dedicated bays
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">STORAGE LOCATIONS</span>
              <span className="text-purple-600 dark:text-emerald-400 font-bold text-sm">
                {warehouse?.storage_zones?.length || 6} rack bays
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">MOVEMENT COST</span>
              <span className="text-blue-600 dark:text-cyan-400 font-bold text-sm">
                {warehouse?.movement_cost || 1.0} cost / step
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Comprehensive Robot Information Panel */}
        <div className="xl:col-span-1 space-y-4 min-w-0">
          {selectedAGV ? (
            <GlassCard
              title={`AGV Information Panel: ${selectedAGV.id}`}
              subtitle="Full digital twin telemetry & manual dispatch"
              icon={Bot}
              badge={
                <Badge
                  variant={
                    selectedAGV.movement_status === 'MOVING'
                      ? 'cyan'
                      : selectedAGV.movement_status === 'CHARGING'
                      ? 'amber'
                      : selectedAGV.movement_status === 'BLOCKED'
                      ? 'rose'
                      : selectedAGV.movement_status === 'COMPLETED'
                      ? 'emerald'
                      : 'neutral'
                  }
                  dot
                >
                  {selectedAGV.movement_status || selectedAGV.status}
                </Badge>
              }
            >
              <div className="space-y-4 text-xs font-mono">
                {/* 1. Battery Gauge & Charger Info */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-slate-500 dark:text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1 font-sans">
                      <Zap size={13} className="text-amber-500 dark:text-amber-400" /> Battery SoC:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {Math.round(selectedAGV.battery || selectedAGV.battery_level || 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        selectedAGV.battery < 20
                          ? 'bg-rose-500'
                          : selectedAGV.battery < 50
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${selectedAGV.battery || selectedAGV.battery_level || 100}%` }}
                    />
                  </div>
                </div>

                {/* 2. Position, Destination, Assigned Charger */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] block font-sans">CURRENT POSITION</span>
                    <span className="text-blue-700 dark:text-cyan-300 font-bold text-sm">
                      ({selectedAGV.position[0]}, {selectedAGV.position[1]})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] block font-sans">DESTINATION</span>
                    <span className="text-slate-900 dark:text-white font-bold text-sm">
                      {selectedAGV.destination
                        ? `(${selectedAGV.destination[0]}, ${selectedAGV.destination[1]})`
                        : 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] block font-sans">ASSIGNED CHARGER</span>
                    <span className="text-amber-700 dark:text-amber-300 font-bold">
                      {selectedAGV.assigned_charger
                        ? `(${selectedAGV.assigned_charger[0]}, ${selectedAGV.assigned_charger[1]})`
                        : '(0, 0)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] block font-sans">PAYLOAD STATUS</span>
                    <span
                      className={`font-bold ${
                        selectedAGV.payload_status === 'CARRYING_PAYLOAD'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {selectedAGV.payload_status === 'CARRYING_PAYLOAD'
                        ? 'Loaded 📦'
                        : 'Empty'}
                    </span>
                  </div>
                </div>

                {/* 3. Mission Completion Status */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Mission Status:</span>
                  <span
                    className={`font-bold ${
                      selectedAGV.is_completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-cyan-300'
                    }`}
                  >
                    {selectedAGV.is_completed ? 'Destination Reached' : 'En Route to Target'}
                  </span>
                </div>

                {/* 4. Planned BFS Route Waypoints */}
                <div>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px] block mb-1 font-sans">
                    BFS Planned Route ({selectedAGV.route?.length || 0} waypoints):
                  </span>
                  <div className="max-h-28 overflow-y-auto space-y-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-[11px]">
                    {selectedAGV.route && selectedAGV.route.length > 0 ? (
                      selectedAGV.route.map(([wx, wy], idx) => (
                        <div key={idx} className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span className="text-slate-400 dark:text-slate-500">Step {idx}:</span>
                          <span className={idx === 0 ? 'text-blue-600 dark:text-cyan-400 font-bold' : ''}>
                            ({wx}, {wy}) {idx === 0 ? '(Current)' : ''}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">Idle at destination</span>
                    )}
                  </div>
                </div>

                {/* 5. Manual Destination Dispatch Form */}
                <form
                  onSubmit={handleManualDispatch}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white block font-sans">
                    Change Robot Destination:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">Target X (0-7):</label>
                      <input
                        type="number"
                        min="0"
                        max="7"
                        value={destX}
                        onChange={(e) => setDestX(e.target.value)}
                        placeholder="e.g. 5"
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1 text-slate-900 dark:text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">Target Y (0-7):</label>
                      <input
                        type="number"
                        min="0"
                        max="7"
                        value={destY}
                        onChange={(e) => setDestY(e.target.value)}
                        placeholder="e.g. 2"
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1 text-slate-900 dark:text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    icon={Send}
                    className="w-full mt-1"
                  >
                    Dispatch New Route
                  </Button>
                </form>
              </div>
            </GlassCard>
          ) : (
            <GlassCard title="Information Panel">
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-mono">
                Click any robot on the grid or in the fleet telemetry list to inspect and control.
              </div>
            </GlassCard>
          )}

          {/* Quick Fleet Telemetry List */}
          <FleetStatus
            agvs={agvs}
            selectedAGVId={selectedAGV?.id}
            onSelectAGV={onSelectAGV}
          />
        </div>
      </div>
    </div>
  );
}
