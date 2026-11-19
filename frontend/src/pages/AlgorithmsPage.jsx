import React from 'react';
import AlgorithmsPanel from '../components/algorithms/AlgorithmsPanel';

export default function AlgorithmsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Mathematical Modelling & Optimization Suite</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Interactive evaluation of Discrete Mathematics algorithms: Graph Coloring, Rook Polynomials, Generating Functions, Deadlock Detection.
        </p>
      </div>

      <AlgorithmsPanel />
    </div>
  );
}
