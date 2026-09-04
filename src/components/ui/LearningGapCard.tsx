import React from 'react';
import { AlertTriangle, Sparkles, Users, ArrowRight, BookOpen } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export interface LearningGapCardProps {
  id?: string;
  topicName: string;
  subjectName: string;
  severity?: 'critical' | 'high' | 'moderate' | 'low';
  studentsAffectedCount?: number;
  averageScore?: number;
  evidence: string;
  recommendedAction: string;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

const severityConfig = {
  critical: {
    badgeVariant: 'danger' as const,
    badgeLabel: 'Critical Priority',
    border: 'border-rose-200/90',
    bg: 'bg-rose-50/40',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50 border-rose-100',
  },
  high: {
    badgeVariant: 'danger' as const,
    badgeLabel: 'High Priority',
    border: 'border-rose-200/80',
    bg: 'bg-rose-50/20',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50 border-rose-100',
  },
  moderate: {
    badgeVariant: 'warning' as const,
    badgeLabel: 'Moderate Gap',
    border: 'border-amber-200/80',
    bg: 'bg-amber-50/20',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border-amber-100',
  },
  low: {
    badgeVariant: 'steady' as const,
    badgeLabel: 'Minor Gap',
    border: 'border-blue-200/80',
    bg: 'bg-blue-50/20',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 border-blue-100',
  },
};

export const LearningGapCard: React.FC<LearningGapCardProps> = ({
  id,
  topicName,
  subjectName,
  severity = 'high',
  studentsAffectedCount,
  averageScore,
  evidence,
  recommendedAction,
  onAction,
  actionLabel = 'Review & Assign Remedial',
  className = '',
}) => {
  const conf = severityConfig[severity] || severityConfig.high;

  return (
    <div
      id={id}
      className={`bg-white rounded-2xl border ${conf.border} p-5 shadow-xs flex flex-col justify-between gap-4 transition-all hover:shadow-sm ${className}`}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl border ${conf.iconBg} ${conf.iconColor} flex items-center justify-center shrink-0`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {subjectName}
              </span>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {topicName}
              </h4>
            </div>
          </div>
          <StatusBadge variant={conf.badgeVariant} label={conf.badgeLabel} size="sm" />
        </div>

        {/* Evidence Block */}
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 text-xs">
          <div className="flex items-center justify-between text-slate-500 font-medium mb-1">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Evidence & Impact</span>
            </span>
            {averageScore !== undefined && (
              <span className="font-bold text-rose-700">
                Avg Score: {averageScore}%
              </span>
            )}
          </div>
          <p className="text-slate-700 font-medium leading-relaxed">
            {evidence}
          </p>
          {studentsAffectedCount !== undefined && studentsAffectedCount > 0 && (
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">
              {studentsAffectedCount} students flagged below mastery benchmark.
            </p>
          )}
        </div>

        {/* Recommended Action */}
        <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 text-xs text-blue-900">
          <div className="flex items-center gap-1.5 font-bold text-blue-800 uppercase tracking-wider text-[10px] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Recommended Teacher Action</span>
          </div>
          <p className="text-slate-700 font-medium leading-relaxed">
            {recommendedAction}
          </p>
        </div>
      </div>

      {onAction && (
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onAction}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
