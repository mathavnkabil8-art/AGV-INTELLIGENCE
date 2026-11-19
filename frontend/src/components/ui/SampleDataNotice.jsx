import React from 'react';
import { Info } from 'lucide-react';

export default function SampleDataNotice({
  label = 'Sample Verification Dataset',
  description = 'Values shown are baseline research figures for algorithm verification until real-time multi-agent telemetry is streamed.',
  className = '',
}) {
  return (
    <div
      className={`flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 ${className}`}
    >
      <Info size={14} className="text-cyan-400 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-slate-300 mr-1.5">{label}:</span>
        <span className="text-slate-400 leading-relaxed">{description}</span>
      </div>
    </div>
  );
}
