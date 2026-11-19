import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'System Communication Error',
  message = 'Failed to load telemetry data from the AGV simulation backend.',
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`rounded-2xl p-6 bg-rose-950/20 border border-rose-800/40 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-11 h-11 rounded-2xl bg-rose-900/30 border border-rose-700/50 flex items-center justify-center text-rose-400 mb-3">
        <AlertTriangle size={20} />
      </div>
      <h3 className="text-sm font-bold text-rose-300 tracking-tight">{title}</h3>
      <p className="text-xs text-rose-400/80 max-w-md mt-1 leading-relaxed font-mono">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          size="sm"
          variant="outline"
          icon={RefreshCw}
          className="mt-4 border-rose-800 text-rose-300 hover:bg-rose-900/30"
        >
          Retry Connection
        </Button>
      )}
    </div>
  );
}
