import React from 'react';
import ConnectionStatus from './ConnectionStatus';
import { Layers, Activity, GitFork, BarChart3, Bot } from 'lucide-react';

export default function Header({ currentTab, onTabChange }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'simulation', label: 'Fleet Simulation', icon: Bot },
    { id: 'algorithms', label: 'Discrete Math Algorithms', icon: GitFork },
    { id: 'analytics', label: 'Analytics & Verification', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/90 border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Academic Project Title */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-lg font-mono">
              AGV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">
                  AGV Intelligence
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
                  MATH-2026
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate max-w-md">
                Graph Theory & Mathematical Optimization in Automated Warehouses
              </p>
            </div>
          </div>

          {/* Central Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Backend Connection Status Badge */}
          <div className="flex items-center gap-3">
            <ConnectionStatus />
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-2 border-t border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'text-slate-400 hover:text-white bg-slate-900'
                }`}
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
