import React, { useState } from 'react';
import { X, Bell, AlertTriangle, BatteryWarning, CheckCircle2, Info, Trash2 } from 'lucide-react';
import Tabs from '../ui/Tabs';

export default function NotificationPanel({
  isOpen,
  onClose,
  events = [],
  onClearAll,
}) {
  const [filter, setFilter] = useState('all');

  if (!isOpen) return null;

  const getEventIcon = (type) => {
    switch (type) {
      case 'CONFLICT':
      case 'DEADLOCK':
        return <AlertTriangle size={15} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />;
      case 'LOW_BATTERY':
        return <BatteryWarning size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />;
      case 'CHARGING':
      case 'COMPLETED':
        return <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />;
      default:
        return <Info size={15} className="text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />;
    }
  };

  const filteredEvents = events.filter((evt) => {
    if (filter === 'conflicts') return evt.type === 'CONFLICT' || evt.type === 'DEADLOCK';
    if (filter === 'battery') return evt.type === 'LOW_BATTERY' || evt.type === 'CHARGING';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-white dark:bg-command-surface border-l border-slate-200 dark:border-command-border/80 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Panel Header */}
        <div className="h-16 px-5 border-b border-slate-100 dark:border-command-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-cyan-400 border border-blue-100 dark:border-slate-700/60">
              <Bell size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Notification Center
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {events.length} System & Simulation Events
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {events.length > 0 && (
              <button
                onClick={onClearAll}
                title="Clear All Notifications"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="p-3 border-b border-slate-100 dark:border-command-border/60 bg-slate-50/50 dark:bg-command-bg/30">
          <Tabs
            tabs={[
              { id: 'all', label: 'All', badge: events.length },
              {
                id: 'conflicts',
                label: 'Conflicts',
                badge: events.filter((e) => e.type === 'CONFLICT' || e.type === 'DEADLOCK').length,
              },
              {
                id: 'battery',
                label: 'Power',
                badge: events.filter((e) => e.type === 'LOW_BATTERY' || e.type === 'CHARGING').length,
              },
            ]}
            activeTab={filter}
            onChange={setFilter}
          />
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredEvents.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Bell size={28} className="mx-auto mb-2 opacity-30 text-slate-400" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">No events in this category</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Simulation notifications will stream here as the discrete clock ticks.
              </p>
            </div>
          ) : (
            filteredEvents.map((evt, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  {getEventIcon(evt.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                        {evt.type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Tick #{evt.step !== undefined ? evt.step : 'Init'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                      {evt.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Panel Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-command-border/80 bg-slate-50/50 dark:bg-command-bg/60 text-center">
          <p className="text-[11px] font-mono text-slate-400">
            Real-Time Discrete Simulation Log • AGV INTELLIGENCE
          </p>
        </div>
      </div>
    </div>
  );
}
