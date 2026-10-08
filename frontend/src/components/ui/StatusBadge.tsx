import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const norm = status.toUpperCase();

  let styles = 'bg-slate-800 text-slate-300 border-slate-700';

  if (norm === 'VALID' || norm === 'CONFIRMED' || norm === 'PUBLISHED' || norm === 'ONLINE') {
    styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (norm === 'USED') {
    styles = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  } else if (norm === 'CANCELLED' || norm === 'DOWN' || norm === 'INVALID') {
    styles = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  } else if (norm === 'DRAFT' || norm === 'ALREADY_USED') {
    styles = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 animate-pulse" />
      {norm}
    </span>
  );
}
