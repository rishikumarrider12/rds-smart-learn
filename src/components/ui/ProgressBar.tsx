import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'auto';
  /** Explicit semantic color that overrides the automatic threshold color */
  variant?: 'blue' | 'purple' | 'emerald' | 'amber';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  color = 'auto',
  variant,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  let barColor = 'bg-blue-600';
  if (variant === 'blue') barColor = 'bg-blue-600';
  else if (variant === 'purple') barColor = 'bg-purple-600';
  else if (variant === 'emerald') barColor = 'bg-emerald-600';
  else if (variant === 'amber') barColor = 'bg-amber-500';
  else if (color === 'success') barColor = 'bg-emerald-600';
  else if (color === 'warning') barColor = 'bg-amber-500';
  else if (color === 'danger') barColor = 'bg-rose-600';
  else if (color === 'auto') {
    if (percentage >= 75) barColor = 'bg-emerald-600';
    else if (percentage >= 50) barColor = 'bg-blue-600';
    else if (percentage >= 30) barColor = 'bg-amber-500';
    else barColor = 'bg-rose-600';
  }

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${barColor} ${heightClass} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
