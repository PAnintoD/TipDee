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
      icon: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      activeBorder: 'border-emerald-500/30',
    },
    blue: {
      icon: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      activeBorder: 'border-sky-500/30',
    },
    purple: {
      icon: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      activeBorder: 'border-purple-500/30',
    },
    amber: {
      icon: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      activeBorder: 'border-amber-500/30',
    },
  };

  const scheme = colorMap[color] || colorMap.green;

  return (
    <div
      className={`relative rounded-xl border bg-[#0d1017] p-4 sm:p-5 transition-colors ${
        highlight
          ? 'border-emerald-500/40 bg-[#0d1219]'
          : 'border-white/[0.08] hover:border-white/[0.14]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
            {title}
          </p>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
            {typeof value === 'number' ? `${value.toLocaleString('th-TH')} ฿` : value}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 truncate">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg border ${scheme.icon} flex-shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
