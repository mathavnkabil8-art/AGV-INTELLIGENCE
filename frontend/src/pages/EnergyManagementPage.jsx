import React, { useState, useEffect } from 'react';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import Tabs from '../components/ui/Tabs';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../api/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Zap,
  Gauge,
  BatteryCharging,
  Calculator,
  RefreshCw,
  Sun,
  ShieldCheck,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Layers,
  ArrowRight,
  Info,
  Flame,
  FileCode2,
  ListOrdered,
} from 'lucide-react';

export default function EnergyManagementPage({ agvs = {} }) {
  const { isDark } = useTheme();
  // Configurable OGF Parameters
  const [numBays, setNumBays] = useState(4);
  const [totalEnergy, setTotalEnergy] = useState(100);
  const [minReserve, setMinReserve] = useState(15);
  const [unit, setUnit] = useState(1);

  // Tab navigation
  const [activeTab, setActiveTab] = useState('distribution');

  // API Results
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Legacy fleet spectrum data
  const [legacyResult, setLegacyResult] = useState(null);

  // Evaluate OGF distribution
  const evaluateDistribution = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.computeBackupEnergyDistribution({
        num_bays: Number(numBays),
        total_energy: Number(totalEnergy),
        min_reserve: Number(minReserve),
        unit: Number(unit),
      });
      setTelemetry(res);

      // Also fetch legacy spectrum for visualization tab
      try {
        const bounds = Array.from({ length: numBays }).map(() => [
          Math.max(1, Math.floor(minReserve / 5)),
          Math.max(3, Math.floor(minReserve / 2) + 2),
        ]);
        const legacy = await apiClient.computeGeneratingFunction({
          total_energy: 12,
          agv_bounds: bounds.slice(0, 4),
        });
        setLegacyResult(legacy);
      } catch (e) {
        // Optional
      }
    } catch (err) {
      console.error('Error evaluating generating function:', err);
      setErrorMsg(err.message || 'Calculation error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    evaluateDistribution();
  }, [numBays, totalEnergy, minReserve, unit]);

  // Presets
  const applyPreset = (preset) => {
    if (preset === 'normal') {
      setNumBays(4);
      setTotalEnergy(100);
      setMinReserve(15);
      setUnit(1);
    } else if (preset === 'limited') {
      setNumBays(4);
      setTotalEnergy(68);
      setMinReserve(15);
      setUnit(1);
    } else if (preset === 'critical') {
      setNumBays(4);
      setTotalEnergy(50);
      setMinReserve(15);
      setUnit(1);
    } else if (preset === 'unit5') {
      setNumBays(4);
      setTotalEnergy(100);
      setMinReserve(15);
      setUnit(5);
    }
  };

  const isFeasible = telemetry?.is_feasible ?? (totalEnergy >= numBays * minReserve);
  const combinedMin = numBays * minReserve;
  const remainingEnergy = Math.max(0, totalEnergy - combinedMin);
  const deficit = Math.max(0, combinedMin - totalEnergy);

  // Format chart data for legacy spectrum
  const chartData = legacyResult?.energy_spectrum
    ? Object.entries(legacyResult.energy_spectrum).map(([energy, count]) => ({
        energy: `E=${energy}`,
        energyNum: Number(energy),
        count: count,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Backup Energy Management & Ordinary Generating Functions
            </h2>
            <Badge variant="emerald" dot>
              OGF DIOPHANTINE SOLVER
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Exact mathematical counting of backup electricity distributions across warehouse charging bays using formal power series.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => applyPreset('normal')}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            100 kWh Benchmark
          </Button>
          <Button
            onClick={evaluateDistribution}
            loading={loading}
            icon={RefreshCw}
            variant="primary"
            size="sm"
          >
            Recalculate
          </Button>
        </div>
      </div>

      {/* Configuration & Scenarios Toolbar */}
      <GlassCard className="py-3 px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Quick Scenario Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1 font-sans">
              <Sliders size={13} className="text-blue-600 dark:text-cyan-400" /> Presets:
            </span>
            <button
              onClick={() => applyPreset('normal')}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                totalEnergy === 100 && minReserve === 15 && unit === 1
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              1. Normal (100 kWh, 12341 ways)
            </button>
            <button
              onClick={() => applyPreset('limited')}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                totalEnergy === 68 && minReserve === 15 && unit === 1
                  ? 'bg-amber-600 text-white font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              2. Limited (68 kWh, 165 ways)
            </button>
            <button
              onClick={() => applyPreset('critical')}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                totalEnergy === 50 && minReserve === 15 && unit === 1
                  ? 'bg-rose-600 text-white font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              3. Critical Shortage (50 kWh, Deficit)
            </button>
            <button
              onClick={() => applyPreset('unit5')}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                totalEnergy === 100 && minReserve === 15 && unit === 5
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              4. 5 kWh Steps (165 ways)
            </button>
          </div>

          {/* Allocation Unit Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400 font-semibold font-sans">Unit:</span>
            {[1, 2, 5, 10].map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                  unit === u
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {u} kWh
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Backup Energy R"
          value={`${totalEnergy} kWh`}
          unit={`Unit: ${unit} kWh`}
          icon={Zap}
          status="cyan"
          subtitle={`${numBays} Charging Bays`}
        />
        <StatCard
          label="Combined Reserve Req."
          value={`${combinedMin} kWh`}
          unit={`${minReserve} kWh / bay`}
          icon={BatteryCharging}
          status={isFeasible ? 'emerald' : 'rose'}
          subtitle={`n × m = ${numBays} × ${minReserve} kWh`}
        />
        <StatCard
          label={isFeasible ? 'Distributable Buffer' : 'Energy Deficit'}
          value={isFeasible ? `${remainingEnergy} kWh` : `-${deficit} kWh`}
          unit={isFeasible ? 'flexible surplus' : 'below threshold'}
          icon={isFeasible ? Gauge : AlertTriangle}
          status={isFeasible ? 'cyan' : 'rose'}
          subtitle={isFeasible ? `R - nm = ${remainingEnergy} kWh` : 'Infeasible demand'}
        />
        <StatCard
          label="Admissible Allocations"
          value={telemetry?.exact_allocation_count?.toLocaleString() ?? '--'}
          unit={telemetry?.binomial_expression || 'C(n, k)'}
          icon={Calculator}
          status={isFeasible ? 'emerald' : 'rose'}
          subtitle={`[x^${totalEnergy}] G(x) coefficient`}
        />
      </div>

      {/* Infeasible Alert Banner */}
      {!isFeasible && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-600 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-rose-600 dark:text-rose-400 shrink-0" size={20} />
            <div>
              <span className="font-bold text-sm text-rose-900 dark:text-white block font-sans">
                Critical Energy Deficit: No Feasible Allocation Exists!
              </span>
              <span className="font-sans">
                Total available backup energy ({totalEnergy} kWh) is insufficient to satisfy the aggregate minimum reserve requirement ({combinedMin} kWh = {numBays} bays × {minReserve} kWh). Deficit: {deficit} kWh.
              </span>
            </div>
          </div>
          <Button
            onClick={() => setTotalEnergy(combinedMin)}
            variant="ghost"
            size="sm"
            className="text-xs bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/60 dark:hover:bg-rose-800 text-rose-800 dark:text-rose-100 font-medium"
          >
            Set to Min ({combinedMin} kWh)
          </Button>
        </div>
      )}

      {/* Navigation Tabs */}
      <Tabs
        tabs={[
          { id: 'distribution', label: '1. OGF Allocation & Configurations', icon: Calculator },
          { id: 'derivation', label: '2. Step-by-Step Derivation', icon: FileCode2 },
          { id: 'spectrum', label: '3. Microgrid & Power Spectrum', icon: BarChart },
          { id: 'theory', label: '4. Mathematical Lab & Proofs', icon: Info },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: OGF Allocation & Configurations */}
      {activeTab === 'distribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 5 Cols: Sliders & Parameter Controls */}
          <div className="lg:col-span-5 space-y-4">
            <GlassCard
              title="Backup Energy Parameters"
              subtitle="Adjust inputs to observe discrete generating function behavior"
              icon={Sliders}
            >
              <div className="space-y-5 text-xs font-mono">
                {/* Number of Bays */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-slate-700 dark:text-slate-300 font-sans">
                    <span className="font-semibold">Charging Bays (n):</span>
                    <span className="text-blue-600 dark:text-cyan-400 font-mono font-bold text-sm">{numBays} bays</span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {[1, 2, 3, 4, 5, 6, 8].map((b) => (
                      <button
                        key={b}
                        onClick={() => setNumBays(b)}
                        className={`flex-1 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                          numBays === b
                            ? 'bg-blue-600 text-white shadow-sm dark:bg-cyan-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total Available Energy Slider */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-sans">
                    <span className="font-semibold">Total Backup Energy (R):</span>
                    <span className="text-blue-600 dark:text-cyan-400 font-mono font-bold text-sm">{totalEnergy} kWh</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="200"
                    step={unit}
                    value={totalEnergy}
                    onChange={(e) => setTotalEnergy(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-sans">
                    <span>30 kWh</span>
                    <span>100 kWh (Default)</span>
                    <span>200 kWh</span>
                  </div>
                </div>

                {/* Minimum Reserve Per Bay Slider */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-sans">
                    <span className="font-semibold">Min Reserve Per Bay (m):</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm">{minReserve} kWh</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step={unit}
                    value={minReserve}
                    onChange={(e) => setMinReserve(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-sans">
                    <span>0 kWh</span>
                    <span>15 kWh (Default)</span>
                    <span>30 kWh</span>
                  </div>
                </div>

                {/* Verification Badge */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 font-sans text-xs font-medium">SymPy Series Verification:</span>
                  <Badge variant={telemetry?.verification?.verified ? 'emerald' : 'rose'}>
                    {telemetry?.verification?.verified ? '100% Exact Match' : 'Mismatch'}
                  </Badge>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right 7 Cols: Generating Function & Sample Allocations */}
          <div className="lg:col-span-7 space-y-4">
            {/* OGF Formula Card */}
            <GlassCard
              title="Ordinary Generating Function (OGF)"
              subtitle="Formal power series modeling energy choices per bay"
              icon={Calculator}
            >
              <div className="space-y-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 font-sans font-medium block">
                    Product Form G(x):
                  </span>
                  <div className="text-blue-700 dark:text-cyan-300 font-bold text-sm bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                    G(x) = (x^{minReserve} / (1 - x))^{numBays} = x^{numBays * minReserve} / (1 - x)^{numBays}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-sans mt-2 font-medium">
                    Coefficient Extraction:
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between shadow-2xs">
                    <span>[x^{totalEnergy}] G(x) = {telemetry?.binomial_expression || 'C(n, k)'}</span>
                    <span className="text-base text-slate-900 dark:text-white font-bold">{telemetry?.exact_allocation_count?.toLocaleString()} ways</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Enumerated Sample Allocations */}
            <GlassCard
              title={
                telemetry?.is_enumerated_complete
                  ? `All Valid Allocations (${telemetry?.exact_allocation_count} Total)`
                  : `Sample Allocations (Showing ${telemetry?.enumerated_sample?.length || 0} of ${telemetry?.exact_allocation_count?.toLocaleString() || 0})`
              }
              subtitle="Generated via integer partition backtracking subject to x_i ≥ m"
              icon={ListOrdered}
            >
              {telemetry?.enumerated_sample && telemetry.enumerated_sample.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                    {telemetry.enumerated_sample.map((alloc) => (
                      <div
                        key={alloc.allocation_id}
                        className="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-100 dark:border-slate-800">
                          <span className="font-bold text-blue-700 dark:text-cyan-400 font-sans">
                            Allocation #{alloc.allocation_id}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 text-[10px]">
                            Sum: {totalEnergy} kWh
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[11px]">
                          {alloc.physical_kwh.map((val, idx) => (
                            <div
                              key={idx}
                              className="p-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between px-2"
                            >
                              <span className="text-slate-500 dark:text-slate-400">Bay {idx + 1}:</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{val} kWh</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!telemetry.is_enumerated_complete && (
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 text-[11px] font-sans">
                      Showing sample distributions. Total count of <strong className="text-blue-700 dark:text-cyan-300 font-bold">{telemetry.exact_allocation_count?.toLocaleString()}</strong> is computed analytically via the Negative Binomial theorem to avoid generating millions of tuples.
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs font-sans">
                  {isFeasible
                    ? 'No allocations generated.'
                    : 'Zero allocations available because total energy is less than the combined minimum reserve.'}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}

      {/* TAB 2: Step-by-Step Derivation */}
      {activeTab === 'derivation' && (
        <div className="space-y-6">
          <GlassCard
            title="Step-by-Step Mathematical Derivation"
            subtitle="Negative Binomial Series and Stars-and-Bars algebraic reduction"
            icon={FileCode2}
          >
            <div className="space-y-4">
              {telemetry?.derivation_steps?.map((step) => (
                <div
                  key={step.step_number}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="cyan">STEP {step.step_number}</Badge>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm font-sans">{step.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    {step.description}
                  </p>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-blue-700 dark:text-cyan-300 text-xs font-bold shadow-2xs">
                    {step.formula}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 3: Microgrid & Power Spectrum */}
      {activeTab === 'spectrum' && (
        <div className="space-y-6">
          <GlassCard
            title="Fleet Energy Distribution Spectrum"
            subtitle="Multiplicity of achievable energy levels under agent bounds"
            icon={BarChart}
          >
            <div className="space-y-4">
              <div className="h-64 w-full min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#F1F5F9'} />
                    <XAxis
                      dataKey="energy"
                      stroke="#64748B"
                      fontSize={11}
                      fontFamily="JetBrains Mono"
                    />
                    <YAxis
                      stroke="#64748B"
                      fontSize={11}
                      fontFamily="JetBrains Mono"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                        borderRadius: '8px',
                        color: isDark ? '#F8FAFC' : '#0F172A',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      itemStyle={{ color: isDark ? '#22D3EE' : '#2563EB', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}
                    />
                    <Bar
                      dataKey="count"
                      fill={isDark ? '#06B6D4' : '#2563EB'}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 4: Mathematical Lab & Proofs */}
      {activeTab === 'theory' && (
        <div className="space-y-6">
          <GlassCard
            title="Discrete Mathematics Formalism: Ordinary Generating Functions"
            subtitle="Solving constrained Diophantine equations via formal power series"
            icon={Info}
          >
            <div className="space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  1. Equivalence of Generating Functions and Integer Partitions
                </h4>
                <p>
                  Finding the number of non-negative integer solutions to <code className="text-blue-600 dark:text-cyan-400 font-mono font-bold">x₁ + x₂ + ... + xₙ = R</code> subject to constraints <code className="text-blue-600 dark:text-cyan-400 font-mono font-bold">xᵢ ≥ m</code> is equivalent to finding the coefficient of <code className="text-blue-600 dark:text-cyan-400 font-mono font-bold">xᴿ</code> in the product of individual choice series:
                </p>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-blue-700 dark:text-cyan-300 text-center font-bold shadow-2xs">
                  G(x) = ∏_{'{'}i=1{'}'}^n (xᵐ + xᵐ⁺¹ + xᵐ⁺² + ...) = (xᵐ / (1 - x))ⁿ = xᵐⁿ / (1 - x)ⁿ
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="amber">OFFICIAL BENCHMARK VALIDATION</Badge>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    4 Bays, 100 kWh Backup Energy, 15 kWh Min Reserve
                  </h4>
                </div>
                <p>
                  For the default university problem: <code className="text-blue-600 dark:text-cyan-400 font-mono font-bold">n = 4, R = 100, m = 15</code>:
                </p>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-emerald-700 dark:text-emerald-300 space-y-1 font-bold shadow-2xs">
                  <div>Remaining Energy: R - nm = 100 - (4 × 15) = 40 kWh</div>
                  <div>Formula: [x¹⁰⁰] G(x) = C(40 + 4 - 1, 4 - 1) = C(43, 3)</div>
                  <div className="text-slate-900 dark:text-white font-extrabold text-sm">C(43, 3) = (43 × 42 × 41) / (3 × 2 × 1) = 74046 / 6 = 12,341</div>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  This proves analytically and symbolically that exactly <strong>12,341</strong> distinct ways exist to distribute the 100 kWh backup energy across the 4 bays while guaranteeing at least 15 kWh per bay.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
