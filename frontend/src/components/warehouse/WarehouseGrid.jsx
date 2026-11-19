import React, { useState } from 'react';
import { Zap, Package, Ban } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function WarehouseGrid({
  warehouse,
  agvs = {},
  onSelectAGV,
  selectedAGVId,
  mode = 'select', // 'select' | 'destination' | 'obstacle'
  onToggleObstacle,
  onChangeDestination,
}) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!warehouse) {
    return (
      <div className="flex items-center justify-center h-80 bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 text-sm font-mono">Loading 8x8 warehouse topology...</p>
      </div>
    );
  }

  const {
    width = 8,
    height = 8,
    obstacles = [],
    charging_stations = [],
    storage_zones = [],
  } = warehouse;

  const cellSize = 64; // generous cell size for 8x8 grid
  const padding = 28;
  const svgWidth = width * cellSize + padding * 2;
  const svgHeight = height * cellSize + padding * 2;

  const obstacleSet = new Set(obstacles.map(([x, y]) => `${x},${y}`));
  const chargerSet = new Set(charging_stations.map(([x, y]) => `${x},${y}`));
  const storageSet = new Set(storage_zones.map(([x, y]) => `${x},${y}`));

  const robotList = Object.values(agvs);
  // Map of "x,y" to occupying robot
  const occupantMap = new Map();
  robotList.forEach((r) => {
    occupantMap.set(`${r.position[0]},${r.position[1]}`, r);
  });

  const getStatusBorder = (status) => {
    switch (status) {
      case 'MOVING':
        return '#2563EB'; // blue
      case 'CHARGING':
        return '#0D9488'; // teal
      case 'WAITING':
        return '#D97706'; // amber
      case 'BLOCKED':
      case 'DEADLOCKED':
        return '#DC2626'; // red
      case 'COMPLETED':
        return '#16A34A'; // emerald
      default:
        return '#64748B'; // slate
    }
  };

  const handleCellClick = (x, y) => {
    const key = `${x},${y}`;

    if (mode === 'obstacle') {
      if (onToggleObstacle) {
        onToggleObstacle(x, y);
      }
      return;
    }

    // If clicking on a robot, select it
    if (occupantMap.has(key)) {
      const robot = occupantMap.get(key);
      if (onSelectAGV) {
        onSelectAGV(robot.id);
      }
      return;
    }

    // If in destination mode or a robot is selected, assign destination
    if (selectedAGVId && onChangeDestination) {
      if (!obstacleSet.has(key)) {
        onChangeDestination(selectedAGVId, x, y);
      }
    }
  };

  return (
    <div className="relative bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 overflow-auto shadow-xs transition-colors">
      {/* Legend & Interactive Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-2xs"></span>
            <span className="text-slate-600 dark:text-slate-400 font-medium">Navigable Lane</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-700/80 border border-slate-400 dark:border-slate-600"></span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Storage Rack</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-teal-50 dark:bg-amber-950/80 border border-teal-500 dark:border-amber-600"></span>
            <span className="text-teal-700 dark:text-amber-400 font-medium">Charging Bay (4)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-purple-50 dark:bg-emerald-950/80 border border-purple-500 dark:border-emerald-600"></span>
            <span className="text-purple-700 dark:text-emerald-400 font-medium">Staging Bay (6)</span>
          </div>
        </div>

        {/* Active Grid Interaction Hint */}
        <div className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {mode === 'obstacle' ? (
            <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
              <Ban size={12} /> Click cells to add/remove obstacles
            </span>
          ) : selectedAGVId ? (
            <span className="text-blue-600 dark:text-cyan-400 font-bold">
              {selectedAGVId} selected • Click any cell to dispatch destination
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">Click a robot to inspect & assign targets</span>
          )}
        </div>
      </div>

      {/* SVG Canvas (8x8 Grid) */}
      <div className="flex justify-center select-none overflow-x-auto max-w-full p-1">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="transition-all max-w-full h-auto"
        >
          <g transform={`translate(${padding}, ${padding})`}>
            {/* Draw 8x8 Grid Cells */}
            {Array.from({ length: height }).map((_, y) =>
              Array.from({ length: width }).map((_, x) => {
                const cellKey = `${x},${y}`;
                const isObstacle = obstacleSet.has(cellKey);
                const isCharger = chargerSet.has(cellKey);
                const isStorage = storageSet.has(cellKey);

                let fill = isDark ? '#0F172A' : '#FFFFFF'; // free aisle
                let stroke = isDark ? '#1E293B' : '#E2E8F0';

                if (isObstacle) {
                  fill = isDark ? '#1E293B' : '#E2E8F0';
                  stroke = isDark ? '#475569' : '#CBD5E1';
                } else if (isCharger) {
                  fill = isDark ? 'rgba(120, 53, 15, 0.4)' : '#F0FDFA';
                  stroke = isDark ? '#D97706' : '#0D9488';
                } else if (isStorage) {
                  fill = isDark ? 'rgba(6, 78, 59, 0.45)' : '#FAF5FF';
                  stroke = isDark ? '#059669' : '#7C3AED';
                }

                // Check if this cell is the selected robot's destination
                const selectedRobot = selectedAGVId ? agvs[selectedAGVId] : null;
                const isSelectedDest =
                  selectedRobot &&
                  selectedRobot.destination &&
                  selectedRobot.destination[0] === x &&
                  selectedRobot.destination[1] === y;

                return (
                  <g
                    key={cellKey}
                    onClick={() => handleCellClick(x, y)}
                    onMouseEnter={() =>
                      setHoveredCell({ x, y, isObstacle, isCharger, isStorage })
                    }
                    onMouseLeave={() => setHoveredCell(null)}
                    className="cursor-pointer transition-all"
                  >
                    <rect
                      x={x * cellSize}
                      y={y * cellSize}
                      width={cellSize - 3}
                      height={cellSize - 3}
                      rx={8}
                      fill={fill}
                      stroke={isSelectedDest ? '#2563EB' : stroke}
                      strokeWidth={isSelectedDest ? 2.5 : 1.5}
                      strokeDasharray={isSelectedDest ? '3 2' : undefined}
                      className="hover:stroke-blue-500 hover:fill-blue-50/40 dark:hover:stroke-cyan-400 dark:hover:fill-slate-900 transition-colors"
                    />

                    {/* Coordinate Watermark */}
                    <text
                      x={x * cellSize + 6}
                      y={y * cellSize + 13}
                      fontSize={9}
                      fill={isDark ? '#475569' : '#94A3B8'}
                      fontFamily="JetBrains Mono"
                      fontWeight="500"
                    >
                      {x},{y}
                    </text>

                    {/* Cell Content Icons */}
                    {isCharger && (
                      <g transform={`translate(${x * cellSize + cellSize / 2 - 9}, ${y * cellSize + cellSize / 2 - 9})`}>
                        <Zap size={18} className="text-teal-600 dark:text-amber-400" />
                      </g>
                    )}
                    {isStorage && (
                      <g transform={`translate(${x * cellSize + cellSize / 2 - 9}, ${y * cellSize + cellSize / 2 - 9})`}>
                        <Package size={18} className="text-purple-600 dark:text-emerald-400" />
                      </g>
                    )}

                    {/* Destination marker pulse */}
                    {isSelectedDest && (
                      <circle
                        cx={x * cellSize + cellSize / 2 - 1}
                        cy={y * cellSize + cellSize / 2 - 1}
                        r={14}
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        className="animate-spin"
                      />
                    )}
                  </g>
                );
              })
            )}

            {/* Trajectory Polylines */}
            {robotList.map((robot) => {
              const route = robot.route || robot.path;
              if (!route || route.length <= 1) return null;
              const points = route
                .map(([px, py]) => `${px * cellSize + cellSize / 2 - 1.5},${py * cellSize + cellSize / 2 - 1.5}`)
                .join(' ');
              const isSelected = selectedAGVId === robot.id;
              const strokeColor = isDark ? (robot.color || '#06B6D4') : '#2563EB';

              return (
                <polyline
                  key={`route-${robot.id}`}
                  points={points}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 3.5 : 2}
                  strokeDasharray="4 3"
                  strokeOpacity={isSelected ? 0.95 : 0.4}
                />
              );
            })}

            {/* 8 AGV Robots with Distinct Visual Identities */}
            {robotList.map((robot) => {
              const [ax, ay] = robot.position;
              const cx = ax * cellSize + cellSize / 2 - 1.5;
              const cy = ay * cellSize + cellSize / 2 - 1.5;
              const isSelected = selectedAGVId === robot.id;
              const robotColor = robot.color || '#2563EB';
              const statusBorder = getStatusBorder(robot.movement_status);
              const batteryVal = Math.round(robot.battery !== undefined ? robot.battery : robot.battery_level || 100);

              return (
                <g
                  key={robot.id}
                  transform={`translate(${cx}, ${cy})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectAGV) onSelectAGV(robot.id);
                  }}
                  className="cursor-pointer transition-transform duration-300"
                >
                  {/* Selected pulse ring */}
                  {isSelected && (
                    <circle
                      r={24}
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth={2.2}
                      strokeDasharray="4 3"
                      className="animate-spin"
                    />
                  )}

                  {/* AGV Chassis Body */}
                  <rect
                    x={-18}
                    y={-18}
                    width={36}
                    height={36}
                    rx={10}
                    fill={isDark ? '#0B1120' : '#FFFFFF'}
                    stroke={isSelected ? '#2563EB' : statusBorder}
                    strokeWidth={isSelected ? 3 : 2}
                    className="filter drop-shadow-md"
                  />

                  {/* Robot Identity Core (Distinct Color Disc) */}
                  <circle r={8} fill={robotColor} />

                  {/* Payload Indicator Badge (Package icon if carrying load) */}
                  {robot.payload_status === 'CARRYING_PAYLOAD' && (
                    <g transform="translate(-5, -5)">
                      <rect x={0} y={0} width={10} height={10} rx={2} fill="#D97706" />
                    </g>
                  )}

                  {/* Robot Label Tag */}
                  <text
                    y={-22}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight="bold"
                    fill={isDark ? '#FFFFFF' : '#172033'}
                    fontFamily="JetBrains Mono"
                  >
                    {robot.id}
                  </text>

                  {/* Mini Battery Gauge */}
                  <g transform="translate(0, 24)">
                    <rect
                      x={-14}
                      y={-4}
                      width={28}
                      height={8}
                      rx={3}
                      fill={isDark ? '#1E293B' : '#E2E8F0'}
                      stroke={isDark ? '#334155' : '#CBD5E1'}
                      strokeWidth={0.8}
                    />
                    <rect
                      x={-13}
                      y={-3}
                      width={Math.max(2, (26 * batteryVal) / 100)}
                      height={6}
                      rx={2}
                      fill={
                        batteryVal < 20
                          ? '#DC2626'
                          : batteryVal < 50
                          ? '#D97706'
                          : '#16A34A'
                      }
                    />
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Grid Footer Telemetry & Hover Inspector */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          {hoveredCell ? (
            <span>
              Cell ({hoveredCell.x}, {hoveredCell.y}) :{' '}
              <span className="text-blue-600 dark:text-cyan-400 font-semibold">
                {hoveredCell.isObstacle
                  ? 'Obstacle (Blocked Storage Rack)'
                  : hoveredCell.isCharger
                  ? 'Inductive Charging Pad'
                  : hoveredCell.isStorage
                  ? 'Storage Bay'
                  : 'Navigable Floor Lane'}
              </span>
              {occupantMap.has(`${hoveredCell.x},${hoveredCell.y}`) && (
                <span className="text-emerald-600 dark:text-emerald-400 ml-2 font-bold">
                  Occupied by {occupantMap.get(`${hoveredCell.x},${hoveredCell.y}`).id}
                </span>
              )}
            </span>
          ) : (
            <span>Grid 8×8 (64 cells) • Movement Cost: {warehouse.movement_cost || 1.0}</span>
          )}
        </div>
        <div className="text-slate-700 dark:text-slate-300">
          Deployed AGVs: <span className="text-blue-600 dark:text-cyan-400 font-bold">{robotList.length}</span> / 8
        </div>
      </div>
    </div>
  );
}
