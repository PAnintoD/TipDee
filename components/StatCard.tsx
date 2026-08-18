import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'green' | 'blue' | 'purple' | 'amber';
  highlight?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'green',
  highlight = false,
}: StatCardProps) {
  const colorMap = {
    green: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      bg: 'from-emerald-950/20 to-slate-900/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'group-hover:shadow-emerald-500/10',
    },
    blue: {
      border: 'border-blue-500/20 hover:border-blue-500/40',
      bg: 'from-blue-950/20 to-slate-900/40',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      glow: 'group-hover:shadow-blue-500/10',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      bg: 'from-purple-950/20 to-slate-900/40',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      glow: 'group-hover:shadow-purple-500/10',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      bg: 'from-amber-950/20 to-slate-900/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'group-hover:shadow-amber-500/10',
    },
  };

  const scheme = colorMap[color];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border ${scheme.border} bg-gradient-to-br ${scheme.bg} p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${scheme.glow} ${
        highlight ? 'ring-1 ring-brand-500/30' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {typeof value === 'number' ? `${value.toLocaleString('th-TH')} ฿` : value}
          </h3>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={`rounded-2xl p-3.5 border ${scheme.iconBg}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
