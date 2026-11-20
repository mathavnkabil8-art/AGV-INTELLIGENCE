import React from 'react';
import ConnectionStatus from '../common/ConnectionStatus';
import { useTheme } from '../../context/ThemeContext';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Bell,
  Clock,
  AlertTriangle,
  Sun,
  Moon,
  Menu,
} from 'lucide-react';

export default function TopNav({
  pageTitle = 'Dashboard',
  pageSubtitle,
  isCollapsed,
  isPlaying,
  onTogglePlay,
  onStep,
  onReset,
  stepCount = 0,
  tickRate = 800,
  onChangeTickRate,
  onOpenNotifications,
  unreadNotificationCount = 0,
  conflictCount = 0,
  onToggleMobileMenu,
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-white/95 dark:bg-command-surface/90 border-b border-slate-200 dark:border-command-border/80 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between transition-colors shadow-xs">
      {/* Left: Hamburger & Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2 sm:mr-4">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={onToggleMobileMenu}
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm sm:text-base lg:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
              {pageTitle}
            </h1>
            {conflictCount > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800 animate-pulse shrink-0 font-bold">
                <AlertTriangle size={11} />
                <span>{conflictCount} Conflicts</span>
              </span>
            )}
          </div>
          {pageSubtitle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block truncate">
              {pageSubtitle}
            </p>
          )}
        </div>
      </div>

      {/* Center/Right: Simulation Control Strip & Status Panel */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Simulation Execution Widget (Desktop/Large Tablet) */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1">
          {/* Step Clock */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 dark:text-slate-300 pr-2 border-r border-slate-200 dark:border-slate-800">
            <Clock size={13} className="text-blue-600 dark:text-cyan-400" />
            <span className="text-slate-400 text-[10px]">TICK:</span>
            <span className="font-bold text-slate-900 dark:text-white w-8">{stepCount}</span>
          </div>

          {/* Quick Play/Pause */}
          <button
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause Simulation' : 'Run Fleet Auto'}
            className={`p-1.5 rounded-lg transition-all ${
              isPlaying
                ? 'bg-amber-500 text-white font-bold hover:bg-amber-600 shadow-xs'
                : 'bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-sm shadow-blue-500/20'
            }`}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </button>

          {/* Step 1 tick */}
          <button
            onClick={onStep}
            disabled={isPlaying}
            title="Advance 1 Clock Tick"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <SkipForward size={14} />
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            title="Reset Simulation State"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950/30 transition-colors"
          >
            <RotateCcw size={13} />
          </button>

          {/* Speed Presets */}
          <div className="hidden xl:flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            {[
              { label: '0.5s', val: 500 },
              { label: '0.8s', val: 800 },
              { label: '1.5s', val: 1500 },
            ].map((preset) => (
              <button
                key={preset.val}
                onClick={() => onChangeTickRate && onChangeTickRate(preset.val)}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  tickRate === preset.val
                    ? 'bg-white text-blue-700 font-bold shadow-xs dark:bg-slate-700 dark:text-cyan-300'
                    : 'hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Backend Connection Status Badge */}
        <ConnectionStatus />

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle Theme"
          className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-amber-400 hover:border-slate-300 transition-colors shadow-xs"
        >
          {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          title="Notification Center"
          aria-label="Notifications"
          className="relative p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 transition-colors shadow-xs"
        >
          <Bell size={16} />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-pulse">
              {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
