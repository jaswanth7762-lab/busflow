import React from 'react';

type ProgressBarProps = {
  progress: number;
  colorClass?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

export function ProgressBar({ 
  progress, 
  colorClass = 'bg-indigo-600', 
  className = '',
  size = 'md'
}: ProgressBarProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));
  
  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  }[size];

  return (
    <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass} ${className}`}>
      <div 
        className={`${heightClass} rounded-full transition-all duration-500 ease-out ${colorClass}`} 
        style={{ width: `${safeProgress}%` }}
      ></div>
    </div>
  );
}

