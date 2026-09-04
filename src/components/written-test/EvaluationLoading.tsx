import React from 'react';
import { Sparkles, Brain, CheckCircle2, Award, FileText } from 'lucide-react';
import { ProgressCallbackData } from '../../services/test/answerEvaluationService';

interface EvaluationLoadingProps {
  progressData: ProgressCallbackData | null;
  totalQuestions: number;
}

export const EvaluationLoading: React.FC<EvaluationLoadingProps> = ({
  progressData,
  totalQuestions,
}) => {
  const currentNum = progressData?.currentIndex || 1;
  const percent = Math.round((currentNum / Math.max(1, totalQuestions)) * 100);

  const stages = [
    { label: 'Analyzing conceptual accuracy & reasoning', active: true },
    { label: 'Identifying key textbook definitions & steps', active: currentNum >= 1 },
    { label: 'Checking for factual points & exam rubrics', active: currentNum >= 2 || totalQuestions === 1 },
    { label: 'Synthesizing constructive teacher feedback & model comparisons', active: currentNum >= totalQuestions },
  ];

  return (
    <div id="evaluation-loading-view" className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-[#090f23] border border-emerald-500/30 rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center space-y-8 shadow-2xl shadow-emerald-950/60 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Animated AI Brain Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 p-0.5 shadow-xl shadow-emerald-950/80">
          <div className="w-full h-full bg-[#070b18] rounded-[22px] flex items-center justify-center text-emerald-300">
            <Brain className="w-10 h-10 animate-pulse text-emerald-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-400 text-[#070b18]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            RDS AI Written Examination Engine
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Evaluating Your Answers
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {progressData?.statusText || `Evaluating answer ${currentNum} of ${totalQuestions}...`}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Evaluation Progress</span>
            <span className="text-emerald-400 font-bold">{percent}%</span>
          </div>
          <div className="w-full bg-[#050814] h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full transition-all duration-500 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Pedagogical Step Checklist */}
        <div className="bg-[#060a17] border border-slate-800/90 rounded-2xl p-4 text-left space-y-2.5">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            Rubric Evaluation Stages
          </div>
          {stages.map((st, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs text-slate-300">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <span className="leading-tight">{st.label}</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-400 italic">
          RDS AI evaluates conceptual depth, key terminology, and step logic without requiring exact phrasing.
        </p>
      </div>
    </div>
  );
};
