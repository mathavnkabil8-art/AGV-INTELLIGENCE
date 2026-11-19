import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No Data Available',
  description = 'There are no active records or events to display at this moment.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`glass-panel rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800/80 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-4">
        <Icon size={22} className="text-slate-500 dark:text-slate-400" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1.5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" variant="outline" className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
