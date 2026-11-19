import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../api/client';
import { RefreshCw } from 'lucide-react';

export default function ConnectionStatus() {
  const [status, setStatus] = useState('checking'); // 'connected' | 'error' | 'checking'
  const [latency, setLatency] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const checkConnection = useCallback(async () => {
    const startTime = performance.now();
    try {
      const data = await apiClient.checkHealth();
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setStatus('connected');
      setHealthData(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setStatus('error');
      setHealthData(null);
      setLatency(null);
      setLastChecked(new Date().toLocaleTimeString());
    }
  }, []);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  return (
    <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1.5 text-xs transition-colors shadow-xs">
      <div className="flex items-center gap-2">
        {status === 'connected' ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        ) : status === 'checking' ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-pulse relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
          </span>
        ) : (
          <span className="relative flex h-2.5 w-2.5">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
        )}

        <span className="font-medium">
          {status === 'connected' ? (
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">Online</span>
          ) : status === 'checking' ? (
            <span className="text-amber-700 dark:text-amber-400 text-[11px]">Connecting...</span>
          ) : (
            <span className="text-rose-700 dark:text-rose-400 font-semibold text-[11px]">Offline</span>
          )}
        </span>
      </div>

      {status === 'connected' && latency !== null && (
        <span className="text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-2 font-mono text-[10px]">
          {latency}ms
        </span>
      )}

      {status === 'connected' && healthData?.version && (
        <span className="hidden sm:inline-block text-slate-600 dark:text-slate-400 text-[10px] bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
          v{healthData.version}
        </span>
      )}

      <button
        onClick={checkConnection}
        title={`Last checked: ${lastChecked || 'N/A'}`}
        className="text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors p-0.5"
      >
        <RefreshCw size={11} className={status === 'checking' ? 'animate-spin' : ''} />
      </button>
    </div>
  );
}
