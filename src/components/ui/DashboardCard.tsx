import React from 'react';

interface DashboardCardProps {
  id?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  id,
  title,
  subtitle,
  headerAction,
  children,
  className = '',
  bodyClassName = 'p-6',
  headerClassName = 'p-5 sm:px-6 border-b border-slate-100',
}) => {
  return (
    <div
      id={id}
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden ${className}`}
    >
      {(title || headerAction) && (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${headerClassName}`}>
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
};
