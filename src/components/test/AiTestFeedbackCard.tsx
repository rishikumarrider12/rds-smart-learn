import React from 'react';
import { AiTestFeedbackData } from '../../types/test';
import { Bot, Sparkles, CheckCircle2, Target, AlertTriangle, ArrowRight, BookOpen, RefreshCw, MessageSquare } from 'lucide-react';

interface AiTestFeedbackCardProps {
  feedback?: AiTestFeedbackData;
  isLoading: boolean;
  onReviewMistakesWithAi: () => void;
  onLearnWeakTopics: () => void;
  onRetakeTest: () => void;
}

export const AiTestFeedbackCard: React.FC<AiTestFeedbackCardProps> = ({
  feedback,
  isLoading,
  onReviewMistakesWithAi,
  onLearnWeakTopics,
  onRetakeTest,
}) => {
  if (isLoading) {
    return (
      <div className="bg-[#090f23]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center animate-pulse">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">RDS AI Teacher Analysis</h3>
            <p className="text-xs text-slate-400">Analyzing your answers and preparing personalized feedback...</p>
          </div>
        </div>

        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-slate-800 rounded-md w-3/4" />
          <div className="h-4 bg-slate-800 rounded-md w-5/6" />
          <div className="h-4 bg-slate-800 rounded-md w-2/3" />
        </div>
      </div>
    );
  }

  if (!feedback) return null;

  return (
    <div className="bg-[#090f23]/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-6">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-md shadow-cyan-950/50">
            <div className="w-full h-full bg-[#060a17] rounded-[14px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">RDS AI Teacher Feedback</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                Personalized
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Insights on your strengths, mistake patterns, and next steps
            </p>
          </div>
        </div>
      </div>

      {/* Overall feedback narrative */}
      <div className="p-4 rounded-2xl bg-[#060a17]/90 border border-slate-800 text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
        "{feedback.overallFeedback}"
      </div>

      {/* 3 Columns: Strengths, Areas to improve, Mistake patterns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strengths */}
        <div className="bg-[#060a17]/60 border border-emerald-500/30 rounded-2xl p-4 space-y-2.5">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Concepts You Mastered</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {feedback.strengths.map((st, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{st}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas to Improve */}
        <div className="bg-[#060a17]/60 border border-amber-500/30 rounded-2xl p-4 space-y-2.5">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-amber-400" />
            <span>Concepts to Revise</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {feedback.areasToImprove.map((ar, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{ar}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mistake Patterns */}
        <div className="bg-[#060a17]/60 border border-purple-500/30 rounded-2xl p-4 space-y-2.5">
          <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-purple-400" />
            <span>Mistake Patterns</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {feedback.mistakePatterns.map((pt, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
