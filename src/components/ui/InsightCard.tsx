import React from 'react';
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, LucideIcon } from 'lucide-react';

export interface InsightCardProps {
  id?: string;
  title: string;
  category?: string;
  description: string;
  recommendation?: string;
  impact?: string;
  type?: 'positive' | 'warning' | 'info' | 'ai';
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

const typeStyles = {
  ai: {
    bg: 'bg-blue-50/50',
    border: 'border-blue-200/80',
    badgeBg: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600',
    icon: Sparkles,
  },
  positive: {
    bg: 'bg-emerald-50/50',
    border: 'border-emerald-200/80',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    iconColor: 'text-emerald-600',
    icon: TrendingUp,
  },
  warning: {
    bg: 'bg-amber-50/50',
    border: 'border-amber-200/80',
    badgeBg: 'bg-amber-100 text-amber-800',
    iconColor: 'text-amber-600',
    icon: AlertCircle,
  },
  info: {
    bg: 'bg-slate-50/70',
    border: 'border-slate-200/80',
    badgeBg: 'bg-slate-200 text-slate-700',
    iconColor: 'text-slate-600',
    icon: Lightbulb,
  },
};

export const InsightCard: React.FC<InsightCardProps> = ({
  id,
  title,
  category = 'Academic Insight',
  description,
  recommendation,
  impact,
  type = 'ai',
  icon: CustomIcon,
  action,
  className = '',
}) => {
  const conf = typeStyles[type] || typeStyles.ai;
  const Icon = CustomIcon || conf.icon;

  return (
    <div
      id={id}
      className={`rounded-2xl border ${conf.border} ${conf.bg} p-5 shadow-xs flex flex-col justify-between gap-3 ${className}`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${conf.iconColor}`} />
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${conf.badgeBg}`}>
              {category}
            </span>
          </div>
          {impact && (
            <span className="text-[11px] font-bold text-slate-600 font-mono">
              {impact}
            </span>
          )}
        </div>

        <h4 className="text-sm font-bold text-slate-900 leading-snug">
          {title}
        </h4>

        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          {description}
        </p>

        {recommendation && (
          <div className="pt-2 border-t border-slate-200/60 mt-2 text-xs font-medium text-slate-800">
            <span className="font-bold text-slate-900">Next Step: </span>
            {recommendation}
          </div>
        )}
      </div>

      {action && <div className="pt-2 flex justify-end">{action}</div>}
    </div>
  );
};
