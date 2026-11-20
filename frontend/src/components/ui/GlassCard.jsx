import React from 'react';

export default function GlassCard({
  children,
  className = '',
  title,
  subtitle,
  action,
  icon: Icon,
  badge,
  variant = 'default', // 'default' | 'glow' | 'accent' | 'danger'
  onClick,
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'glow':
        return 'border-blue-500/40 hover:border-blue-500/60 shadow-sm shadow-blue-500/10';
      case 'accent':
        return 'border-sky-500/40 hover:border-sky-500/60 shadow-sm shadow-sky-500/10';
      case 'danger':
        return 'border-rose-500/40 hover:border-rose-500/60 shadow-sm shadow-rose-500/10';
      default:
        return 'border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-2xl p-3.5 sm:p-5 transition-all duration-200 min-w-0 max-w-full overflow-hidden ${getVariantStyles()} ${
        onClick ? 'cursor-pointer hover:translate-y-[-1px]' : ''
      } ${className}`}
    >
      {(title || subtitle || action || Icon || badge) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            {Icon && (
              <div className="p-1.5 sm:p-2 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-cyan-400 border border-blue-100 dark:border-slate-700/60 shrink-0">
                <Icon size={16} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {title && (
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">
                    {title}
                  </h3>
                )}
                {badge}
              </div>
              {subtitle && (
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
