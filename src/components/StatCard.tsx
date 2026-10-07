import React from 'react';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: string;
  colorClass?: string;
  bgClass?: string;
};

export function StatCard({ 
  title, 
  value, 
  icon, 
  subtitle, 
  trend,
  colorClass = 'text-indigo-600', 
  bgClass = 'bg-indigo-50/70 border-indigo-100/60'
}: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-xl border ${bgClass} ${colorClass}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="flex items-baseline space-x-2">
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
          {trend && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {trend}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
}

