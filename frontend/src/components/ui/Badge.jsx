import React from 'react';

export default function Badge({
  children,
  variant = 'neutral', // 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple' | 'neutral'
  size = 'md', // 'sm' | 'md' | 'lg'
  dot = false,
  className = '',
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'cyan':
        return 'bg-sky-50 text-blue-700 border-sky-200/80 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-800/80';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/80';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/80';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/80';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800/80';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/80';
    }
  };

  const getDotColor = () => {
    switch (variant) {
      case 'cyan':
        return 'bg-blue-600 dark:bg-cyan-400';
      case 'emerald':
        return 'bg-emerald-600 dark:bg-emerald-400';
      case 'amber':
        return 'bg-amber-600 dark:bg-amber-400';
      case 'rose':
        return 'bg-rose-600 dark:bg-rose-400';
      case 'purple':
        return 'bg-purple-600 dark:bg-purple-400';
      default:
        return 'bg-slate-500 dark:bg-slate-400';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-[10px]';
      case 'lg':
        return 'px-3 py-1 text-xs';
      default:
        return 'px-2.5 py-0.5 text-[11px]';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full border ${getVariantStyles()} ${getSizeStyles()} ${className}`}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getDotColor()}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${getDotColor()}`} />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}
