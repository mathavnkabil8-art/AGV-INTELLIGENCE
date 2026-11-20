import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  status = 'neutral', // 'cyan' | 'emerald' | 'amber' | 'rose' | 'neutral'
  subtitle,
  isSampleData = false,
  className = '',
}) {
  const getIconContainerStyle = () => {
    switch (status) {
      case 'cyan':
        return 'bg-sky-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 border-sky-200/80 dark:border-cyan-500/30';
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-500/30';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-500/30';
      case 'rose':
        return 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/80 dark:border-rose-500/30';
      default:
        return 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60';
    }
  };

  return (
    <div
      className={`glass-panel rounded-2xl p-3.5 sm:p-5 transition-all duration-200 min-w-0 max-w-full overflow-hidden ${className}`}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1.5 sm:mb-2">
        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate tracking-wide uppercase">
          {label}
        </span>
        {Icon && (
          <div className={`p-1.5 sm:p-2 rounded-xl border ${getIconContainerStyle()} shrink-0`}>
            <Icon size={14} className="sm:w-4 sm:h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 min-w-0">
        <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight truncate">
          {value !== undefined && value !== null ? value : '--'}
        </span>
        {unit && <span className="text-[11px] sm:text-xs font-mono text-slate-500 dark:text-slate-400 truncate">{unit}</span>}
      </div>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-xs">
        {trend ? (
          <div
            className={`flex items-center gap-1 font-mono font-medium ${
              trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp size={13} />
            ) : trend.value === '0%' ? (
              <Minus size={13} />
            ) : (
              <TrendingDown size={13} />
            )}
            <span>{trend.value}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">vs target</span>
          </div>
        ) : subtitle ? (
          <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{subtitle}</span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-[11px]">Real-time telemetry</span>
        )}

        {isSampleData && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
            Sample
          </span>
        )}
      </div>
    </div>
  );
}
