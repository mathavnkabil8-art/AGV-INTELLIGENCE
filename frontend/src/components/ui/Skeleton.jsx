import React from 'react';

export default function Skeleton({ className = '', variant = 'rect' }) {
  const getVariant = () => {
    switch (variant) {
      case 'circle':
        return 'rounded-full';
      case 'text':
        return 'h-4 rounded';
      case 'card':
        return 'h-32 rounded-2xl';
      default:
        return 'rounded-xl';
    }
  };

  return (
    <div
      className={`animate-pulse bg-slate-800/60 border border-slate-700/30 ${getVariant()} ${className}`}
    />
  );
}
