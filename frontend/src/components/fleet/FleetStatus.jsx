import React from 'react';
import {
  Battery,
  BatteryCharging,
  BatteryWarning,
  Cpu,
} from 'lucide-react';

export default function FleetStatus({ agvs = {}, selectedAGVId, onSelectAGV }) {
  const robotList = Object.values(agvs);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'MOVING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
            MOVING
          </span>
        );
      case 'CHARGING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 animate-pulse">
            CHARGING
          </span>
        );
      case 'WAITING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
            WAITING
          </span>
        );
      case 'BLOCKED':
      case 'DEADLOCKED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800 animate-pulse">
            BLOCKED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
            COMPLETED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            IDLE
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Cpu className="text-blue-600 dark:text-cyan-400" size={18} />
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">8 AGV Fleet Telemetry</h2>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {robotList.length} Robots Active
        </span>
      </div>

      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
        {robotList.map((robot) => {
          const isSelected = selectedAGVId === robot.id;
          const batteryVal = Math.round(
            robot.battery !== undefined ? robot.battery : robot.battery_level || 100
          );
          const color = robot.color || '#2563EB';
          const pos = robot.position || [0, 0];
          const dest = robot.destination || robot.target_position;
          const isLoaded = robot.payload_status === 'CARRYING_PAYLOAD';

          return (
            <div
              key={robot.id}
              onClick={() => onSelectAGV && onSelectAGV(robot.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-500 shadow-sm shadow-blue-500/15 dark:bg-slate-800 dark:border-cyan-500'
                  : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Card Header: Color Swatch + ID + Status + Battery */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full border border-black/10 dark:border-white/20 shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                    {robot.id}
                  </span>
                  {getStatusBadge(robot.movement_status || robot.status)}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold">
                  {robot.movement_status === 'CHARGING' ? (
                    <BatteryCharging size={14} className="text-amber-600 dark:text-amber-400 animate-pulse" />
                  ) : batteryVal < 20 ? (
                    <BatteryWarning size={14} className="text-rose-600 dark:text-rose-400" />
                  ) : (
                    <Battery size={14} className="text-emerald-600 dark:text-emerald-400" />
                  )}
                  <span
                    className={
                      batteryVal < 20
                        ? 'text-rose-600 dark:text-rose-400'
                        : batteryVal < 50
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }
                  >
                    {batteryVal}%
                  </span>
                </div>
              </div>

              {/* Battery Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-2.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    batteryVal < 20
                      ? 'bg-rose-500'
                      : batteryVal < 50
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${batteryVal}%` }}
                />
              </div>

              {/* Telemetry Attributes Grid */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Pos:</span> ({pos[0]}, {pos[1]})
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Target:</span>{' '}
                  {dest ? `(${dest[0]}, ${dest[1]})` : 'Idle'}
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Payload:</span>{' '}
                  <span className={isLoaded ? 'text-amber-600 dark:text-amber-300 font-bold' : 'text-slate-500'}>
                    {isLoaded ? 'Loaded 📦' : 'Empty'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Charger:</span>{' '}
                  {robot.assigned_charger ? `(${robot.assigned_charger[0]}, ${robot.assigned_charger[1]})` : 'P0'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
