import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Clock,
  Plus,
  Trash2,
  Ban,
} from 'lucide-react';

export default function SimulationControls({
  isPlaying,
  onTogglePlay,
  onStep,
  onReset,
  stepCount = 0,
  tickRate = 800,
  onChangeTickRate,
  onAddRobot,
  onRemoveRobot,
  selectedAGVId,
  mode = 'select',
  onToggleMode,
}) {
  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback & Step Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
            }`}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause' : 'Start / Resume'}</span>
          </button>

          <button
            onClick={onStep}
            disabled={isPlaying}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Advance exactly 1 clock tick"
          >
            <SkipForward size={14} />
            <span>Step</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition-all"
            title="Reset simulation state to origin"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>

        {/* Dynamic Fleet & Interactive Mode Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switch: Select/Navigate vs Edit Obstacles */}
          <button
            onClick={onToggleMode}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              mode === 'obstacle'
                ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-600 text-rose-700 dark:text-rose-300 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
            title="Toggle Obstacle Edit Mode (click cells to place/remove racks)"
          >
            <Ban size={13} className={mode === 'obstacle' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'} />
            <span>{mode === 'obstacle' ? 'Done Editing' : 'Edit Obstacles'}</span>
          </button>

          {/* Add Robot */}
          {onAddRobot && (
            <button
              onClick={onAddRobot}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-cyan-950/60 hover:bg-blue-100 text-blue-700 dark:text-cyan-300 border border-blue-200/80 dark:border-cyan-800 transition-all"
              title="Spawn an additional AGV"
            >
              <Plus size={14} />
              <span>Add Robot</span>
            </button>
          )}

          {/* Remove Selected Robot */}
          {onRemoveRobot && selectedAGVId && (
            <button
              onClick={() => onRemoveRobot(selectedAGVId)}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-all"
              title={`Remove ${selectedAGVId}`}
            >
              <Trash2 size={13} />
              <span>Remove {selectedAGVId}</span>
            </button>
          )}
        </div>

        {/* Clock & Speed Slider */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <Clock size={13} className="text-blue-600 dark:text-cyan-400" />
            <span className="text-slate-400">TICK:</span>
            <span className="text-slate-900 dark:text-white font-bold">{stepCount}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Speed:</span>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={tickRate}
              onChange={(e) => onChangeTickRate && onChangeTickRate(Number(e.target.value))}
              className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-cyan-400"
            />
            <span className="font-mono text-slate-500 dark:text-slate-400 text-[10px] w-12 text-right">
              {tickRate}ms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
