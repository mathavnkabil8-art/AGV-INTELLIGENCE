import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Battery, Activity, TrendingUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function AnalyticsPanel({ agvs = {}, recentEvents = [], metrics = {} }) {
  const agvList = Object.values(agvs);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const batteryData = agvList.map((a) => ({
    name: a.id,
    battery: Math.round(a.battery_level),
    distance: a.total_distance_traveled,
  }));

  const gridStroke = isDark ? '#1E293B' : '#F1F5F9';
  const textStroke = isDark ? '#64748B' : '#94A3B8';
  const tooltipBg = isDark ? '#0F172A' : '#FFFFFF';
  const tooltipBorder = isDark ? '#334155' : '#E2E8F0';

  return (
    <div className="space-y-6">
      {/* Top Stat Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-medium">Total Active AGVs</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">{agvList.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-medium">Fleet Average Battery</div>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-cyan-400 mt-1">
            {metrics.avg_battery ? Math.round(metrics.avg_battery) : 0}%
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-medium">Total Distance Traveled</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.total_distance || 0} m
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-medium">Vehicles in Motion</div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {metrics.status_breakdown?.MOVING || 0}
          </div>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0 w-full">
        {/* Battery Bar Chart */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 min-w-0 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Battery className="text-blue-600 dark:text-cyan-400" size={16} />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">AGV Battery Levels (%)</h3>
          </div>
          <div className="h-56 w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batteryData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" stroke={textStroke} fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis domain={[0, 100]} stroke={textStroke} fontSize={11} fontFamily="JetBrains Mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: isDark ? '#FFFFFF' : '#172033', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#2563EB', fontFamily: 'JetBrains Mono' }}
                />
                <Bar dataKey="battery" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distance Cumulative Chart */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 min-w-0 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={16} />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cumulative Traversal per AGV (m)</h3>
          </div>
          <div className="h-56 w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={batteryData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" stroke={textStroke} fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis stroke={textStroke} fontSize={11} fontFamily="JetBrains Mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: isDark ? '#FFFFFF' : '#172033', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#0D9488', fontFamily: 'JetBrains Mono' }}
                />
                <Area type="monotone" dataKey="distance" stroke="#0D9488" fill="rgba(13, 148, 136, 0.15)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Simulation Event Stream */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="text-blue-600 dark:text-cyan-400" size={16} />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Simulation Audit Log</h3>
        </div>
        <div className="space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto">
          {recentEvents.length === 0 ? (
            <div className="text-slate-400 py-3 text-center">No simulation events recorded yet. Click 'Step' or 'Run'.</div>
          ) : (
            recentEvents.map((evt, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80">
                <span className="text-slate-400 w-16">Tick {evt.step}:</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200 dark:bg-cyan-950 dark:text-cyan-400 dark:border-cyan-800 font-bold">
                  {evt.type}
                </span>
                <span className="text-slate-700 dark:text-slate-300 truncate">{evt.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
