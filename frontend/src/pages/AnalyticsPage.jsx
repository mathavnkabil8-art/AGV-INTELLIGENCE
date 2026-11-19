import React from 'react';
import AnalyticsPanel from '../components/analytics/AnalyticsPanel';

export default function AnalyticsPage({ agvs, simulationState }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Experimental Analytics & Verification</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Empirical simulation metrics, energy consumption curves, and discrete verification data.
        </p>
      </div>

      <AnalyticsPanel
        agvs={agvs}
        recentEvents={simulationState?.recent_events || []}
        metrics={simulationState?.fleet_metrics || {}}
      />
    </div>
  );
}
