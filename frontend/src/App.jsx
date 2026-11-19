import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import NotificationPanel from './components/layout/NotificationPanel';

// 8 Command Center Pages
import OverviewPage from './pages/OverviewPage';
import SimulatorPage from './pages/SimulatorPage';
import TrafficControlPage from './pages/TrafficControlPage';
import ChargingOptimizationPage from './pages/ChargingOptimizationPage';
import EnergyManagementPage from './pages/EnergyManagementPage';
import DeadlockMonitoringPage from './pages/DeadlockMonitoringPage';
import ExperimentsAnalyticsPage from './pages/ExperimentsAnalyticsPage';
import MathematicsLabPage from './pages/MathematicsLabPage';

import { apiClient } from './api/client';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Global Simulation & Warehouse State
  const [warehouse, setWarehouse] = useState(null);
  const [simulationState, setSimulationState] = useState(null);
  const [selectedAGVId, setSelectedAGVId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tickRate, setTickRate] = useState(800);
  const [apiError, setApiError] = useState(null);

  // Notifications / Events
  const [eventsList, setEventsList] = useState([]);

  const timerRef = useRef(null);

  // Fetch Initial Warehouse Layout & Simulation Snapshot
  const loadInitialData = useCallback(async () => {
    try {
      const [layoutData, stateData] = await Promise.all([
        apiClient.getWarehouseLayout(),
        apiClient.getSimulationState(),
      ]);
      setWarehouse(layoutData);
      setSimulationState(stateData);
      if (stateData?.recent_events) {
        setEventsList(stateData.recent_events);
      }
      setApiError(null);
    } catch (err) {
      console.warn('Initial data load warning:', err);
      setApiError('Unable to connect to backend server. Make sure FastAPI is running on port 8000.');
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Simulation Single Step
  const handleStep = useCallback(async () => {
    try {
      const newState = await apiClient.stepSimulation();
      setSimulationState(newState);
      if (newState?.recent_events) {
        setEventsList((prev) => {
          const combined = [...newState.recent_events, ...prev];
          const unique = Array.from(new Map(combined.map((e) => [`${e.step}-${e.message}`, e])).values());
          return unique.slice(0, 50);
        });
      }
      setApiError(null);
    } catch (err) {
      setApiError(err.message);
      setIsPlaying(false);
    }
  }, []);

  // Simulation Reset
  const handleReset = useCallback(async () => {
    try {
      setIsPlaying(false);
      const res = await apiClient.resetSimulation();
      setSimulationState(res.state);
      setEventsList(res.state?.recent_events || []);
      setApiError(null);
    } catch (err) {
      setApiError(err.message);
    }
  }, []);

  // Simulation Play/Pause Interval Loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        handleStep();
      }, tickRate);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, tickRate, handleStep]);

  const togglePlay = () => setIsPlaying((prev) => !prev);

  const agvs = simulationState?.agvs || {};
  const agvList = Object.values(agvs);
  const deadlockedRobots = agvList.filter((a) => a.status === 'DEADLOCKED').length;

  const getPageTitle = () => {
    switch (currentTab) {
      case 'overview':
        return 'Overview Dashboard';
      case 'simulator':
        return 'Warehouse Simulator';
      case 'traffic':
        return 'Traffic Control & Graph Coloring';
      case 'charging':
        return 'Charging Optimization & Rook Polynomials';
      case 'energy':
        return 'Energy Management & Generating Functions';
      case 'deadlocks':
        return 'Deadlock Monitoring & Cycle Resolution';
      case 'experiments':
        return 'Experiments & Comparative Analytics';
      case 'math-lab':
        return 'Discrete Mathematics Laboratory';
      default:
        return 'Overview Dashboard';
    }
  };

  const getPageSubtitle = () => {
    switch (currentTab) {
      case 'overview':
        return 'Real-time multi-agent digital twin telemetry & system metrics';
      case 'simulator':
        return 'Interactive 2D spatial routing, obstacle avoidance & inductive charging';
      case 'traffic':
        return 'Conflict graph coloring and spatio-temporal route scheduling';
      case 'charging':
        return 'Restricted board Rook Polynomials and Inclusion-Exclusion dock allocations';
      case 'energy':
        return 'Generating functions and power quota partition distributions';
      case 'deadlocks':
        return 'Wait-For Graph cycle detection and Tarjan strongly connected components';
      case 'experiments':
        return 'Baseline vs optimized empirical performance benchmarks';
      case 'math-lab':
        return 'Formal theorems, step-by-step proofs, and discrete algorithm playground';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex bg-command-bg text-slate-800 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        activeConflictCount={deadlockedRobots}
        deadlockDetected={deadlockedRobots > 0}
      />

      {/* Main Content Viewport */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* 2. Top Navigation Bar */}
        <TopNav
          pageTitle={getPageTitle()}
          pageSubtitle={getPageSubtitle()}
          isCollapsed={isSidebarCollapsed}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onStep={handleStep}
          onReset={handleReset}
          stepCount={simulationState?.step || 0}
          tickRate={tickRate}
          onChangeTickRate={setTickRate}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          unreadNotificationCount={eventsList.length}
          conflictCount={deadlockedRobots}
        />

        {/* Global Connection Warning Banner */}
        {apiError && (
          <div className="bg-rose-950/80 border-b border-rose-800 text-rose-200 px-4 py-2 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
              <AlertCircle size={15} className="text-rose-400 shrink-0" />
              <span>{apiError}</span>
              <button
                onClick={loadInitialData}
                className="ml-auto underline hover:text-white font-semibold font-mono"
              >
                Retry Backend Connection
              </button>
            </div>
          </div>
        )}

        {/* 3. Main Page Content (Routed by currentTab) */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 min-w-0">
          {currentTab === 'overview' && (
            <OverviewPage
              warehouse={warehouse}
              agvs={agvs}
              simulationState={simulationState}
              onNavigate={setCurrentTab}
              selectedAGVId={selectedAGVId}
              onSelectAGV={setSelectedAGVId}
            />
          )}

          {currentTab === 'simulator' && (
            <SimulatorPage
              warehouse={warehouse}
              agvs={agvs}
              simulationState={simulationState}
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              onStep={handleStep}
              onReset={handleReset}
              selectedAGVId={selectedAGVId}
              onSelectAGV={setSelectedAGVId}
              tickRate={tickRate}
              onChangeTickRate={setTickRate}
              onRefreshState={loadInitialData}
            />
          )}

          {currentTab === 'traffic' && <TrafficControlPage agvs={agvs} />}

          {currentTab === 'charging' && (
            <ChargingOptimizationPage warehouse={warehouse} agvs={agvs} />
          )}

          {currentTab === 'energy' && <EnergyManagementPage agvs={agvs} />}

          {currentTab === 'deadlocks' && (
            <DeadlockMonitoringPage agvs={agvs} onStep={handleStep} />
          )}

          {currentTab === 'experiments' && (
            <ExperimentsAnalyticsPage agvs={agvs} simulationState={simulationState} />
          )}

          {currentTab === 'math-lab' && <MathematicsLabPage />}
        </main>

        {/* Command Center Footer */}
        <footer className="border-t border-command-border/60 bg-white/80 dark:bg-command-surface/50 py-3.5 px-6 text-center text-[11px] text-slate-500 font-mono transition-colors">
          AGV INTELLIGENCE • Smart Warehouse Control & Optimization System • Discrete Mathematics Experiential Learning
        </footer>
      </div>

      {/* 4. Slide-Over Notification Center Panel */}
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        events={eventsList}
        onClearAll={() => setEventsList([])}
      />
    </div>
  );
}
