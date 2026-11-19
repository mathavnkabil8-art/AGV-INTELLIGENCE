import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'secondary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glow'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  className = '',
  title,
  type = 'button',
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm shadow-blue-600/20 active:translate-y-[1px]';
      case 'glow':
        return 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold shadow-md shadow-blue-500/25 active:translate-y-[1px]';
      case 'danger':
        return 'bg-rose-50 dark:bg-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40 active:translate-y-[1px]';
      case 'outline':
        return 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 active:translate-y-[1px]';
      case 'ghost':
        return 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200';
      default:
        return 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 shadow-2xs active:translate-y-[1px]';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2.5 py-1.5 text-xs rounded-lg gap-1.5';
      case 'lg':
        return 'px-5 py-2.5 text-sm rounded-xl gap-2.5';
      default:
        return 'px-3.5 py-2 text-xs rounded-xl gap-2';
    }
  };

  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${getVariantStyles()} ${getSizeStyles()} ${className}`}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 12 : 15} className="animate-spin" />
      ) : (
        Icon && <Icon size={size === 'sm' ? 13 : 15} />
      )}
      {children && <span>{children}</span>}
    </button>
  );
}
