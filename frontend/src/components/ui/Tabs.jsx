import React from 'react';

export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className="w-full overflow-x-auto pb-1 no-scrollbar min-w-0">
      <div
        className={`inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs font-semibold whitespace-nowrap min-w-max transition-colors ${className}`}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-blue-600 text-blue-700 dark:text-white font-bold shadow-xs border border-slate-200/90 dark:border-blue-500'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-900/60'
              }`}
            >
              {Icon && <Icon size={13} className="shrink-0" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono shrink-0 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-white/20 dark:text-white'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
