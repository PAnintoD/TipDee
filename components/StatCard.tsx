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
      icon: 'text-emerald-700 bg-emerald-50 border-emerald-200/80',
      activeBorder: 'border-emerald-300',
    },
    blue: {
      icon: 'text-sky-700 bg-sky-50 border-sky-200/80',
      activeBorder: 'border-sky-300',
    },
    purple: {
      icon: 'text-purple-700 bg-purple-50 border-purple-200/80',
      activeBorder: 'border-purple-300',
    },
    amber: {
      icon: 'text-amber-700 bg-amber-50 border-amber-200/80',
      activeBorder: 'border-amber-300',
    },
  };

  const scheme = colorMap[color] || colorMap.green;

  return (
    <div
      className={`relative rounded-xl border bg-white p-4 sm:p-5 transition-colors shadow-xs ${
        highlight
          ? 'border-emerald-300 bg-emerald-50/20'
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">
            {title}
          </p>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {typeof value === 'number' ? `${value.toLocaleString('th-TH')} ฿` : value}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 truncate">
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
