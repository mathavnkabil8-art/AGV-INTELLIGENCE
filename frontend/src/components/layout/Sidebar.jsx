import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Network,
  BatteryCharging,
  Zap,
  AlertOctagon,
  BarChart3,
  Calculator,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const NAVIGATION_ITEMS = [
  {
    category: 'Operations',
    items: [
      {
        id: 'overview',
        label: 'Overview Dashboard',
        icon: LayoutDashboard,
        badge: null,
      },
      {
        id: 'simulator',
        label: 'Warehouse Simulator',
        icon: Bot,
        badge: 'Twin',
      },
      {
        id: 'traffic',
        label: 'Traffic Control',
        icon: Network,
        badge: 'χ(G)',
      },
    ],
  },
  {
    category: 'Optimization & Power',
    items: [
      {
        id: 'charging',
        label: 'Charging Optimization',
        icon: BatteryCharging,
        badge: 'Rook',
      },
      {
        id: 'energy',
        label: 'Energy Management',
        icon: Zap,
        badge: 'G(x)',
      },
      {
        id: 'deadlocks',
        label: 'Deadlock Monitoring',
        icon: AlertOctagon,
        badge: 'WFG',
      },
    ],
  },
  {
    category: 'Research & Verification',
    items: [
      {
        id: 'experiments',
        label: 'Experiments & Analytics',
        icon: BarChart3,
        badge: null,
      },
      {
        id: 'math-lab',
        label: 'Mathematics Lab',
        icon: Calculator,
        badge: 'Proofs',
      },
    ],
  },
];

export default function Sidebar({
  currentTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  activeConflictCount = 0,
  deadlockDetected = false,
}) {
  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-white dark:bg-command-surface border-r border-slate-200 dark:border-command-border/80 flex flex-col transition-all duration-300 select-none shadow-sm ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-command-border/60 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 text-white font-mono font-bold text-sm tracking-wider">
            AGV
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                  AGV INTELLIGENCE
                </span>
              </div>
              <p className="text-[10px] text-blue-600 dark:text-sky-400 font-mono tracking-wider uppercase font-semibold">
                Control & Optimization
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Group Items */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAVIGATION_ITEMS.map((group) => (
          <div key={group.category} className="space-y-1">
            {!isCollapsed && (
              <h4 className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 dark:text-slate-500 px-3 py-1">
                {group.category}
              </h4>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const hasAlert =
                (item.id === 'deadlocks' && deadlockDetected) ||
                (item.id === 'traffic' && activeConflictCount > 0);

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group relative ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-500/30 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Left accent bar for active tab */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 dark:bg-blue-400 rounded-r" />
                  )}

                  <Icon
                    size={18}
                    className={`shrink-0 transition-colors ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}

                  {/* Badges / Alerts */}
                  {!isCollapsed && hasAlert && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                  )}

                  {!isCollapsed && item.badge && !hasAlert && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer / System Badge */}
      <div className="p-3 border-t border-slate-100 dark:border-command-border/60 bg-slate-50/50 dark:bg-command-bg/40 shrink-0">
        {!isCollapsed ? (
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">System v1.0-DMGT</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              Discrete Mathematics & Graph Theory Experiential Project
            </p>
          </div>
        ) : (
          <div className="flex justify-center" title="System Operational">
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
