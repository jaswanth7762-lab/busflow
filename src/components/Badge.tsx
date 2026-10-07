import React from 'react';

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'indigo' | 'purple';
};

export function Badge({ children, variant = 'default', className, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/60',
    info: 'bg-sky-50 text-sky-700 border border-sky-200/60',
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200/60',
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium tracking-tight',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

