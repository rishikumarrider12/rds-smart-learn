import React from 'react';

export type StatusVariant = 
  | 'active' 
  | 'steady' 
  | 'needs_practice' 
  | 'inactive' 
  | 'excellent' 
  | 'completed' 
  | 'pending' 
  | 'warning'
  | 'success'
  | 'danger'
  | 'info';

interface StatusBadgeProps {
  status?: string;
  variant?: StatusVariant;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  excellent: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',

  steady: 'bg-blue-50 text-blue-700 border-blue-200/80',
  info: 'bg-blue-50 text-blue-700 border-blue-200/80',

  needs_practice: 'bg-amber-50 text-amber-800 border-amber-200/80',
  pending: 'bg-amber-50 text-amber-800 border-amber-200/80',
  warning: 'bg-amber-50 text-amber-800 border-amber-200/80',

  inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  label,
  size = 'md',
  className = '',
}) => {
  const key = (variant || status || 'info').toLowerCase().replace(/\s+/g, '_');
  const style = variantStyles[key] || 'bg-slate-100 text-slate-700 border-slate-200';
  const displayLabel = label || (status ? status.replace(/_/g, ' ') : key.replace(/_/g, ' '));

  const sizeClasses = size === 'sm' 
    ? 'text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider'
    : 'text-xs px-2.5 py-1 font-semibold capitalize';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${style} ${sizeClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      <span>{displayLabel}</span>
    </span>
  );
};
