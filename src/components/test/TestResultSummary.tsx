import React from 'react';
import { TestResult } from '../../types/test';
import { Award, CheckCircle2, XCircle, HelpCircle, Trophy, Sparkles, TrendingUp } from 'lucide-react';

interface TestResultSummaryProps {
  result: TestResult;
  topicTitle: string;
  difficulty: string;
}

export const TestResultSummary: React.FC<TestResultSummaryProps> = ({
  result,
  topicTitle,
  difficulty,
}) => {
  const getBadgeColors = (pct: number) => {
    if (pct >= 90) {
      return {
        badgeText: 'Outstanding Mastery',
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        ringColor: 'text-emerald-400',
        gradient: 'from-emerald-500 to-teal-600',
      };
    }
    if (pct >= 70) {
      return {
        badgeText: 'Proficient Understanding',
        badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
        ringColor: 'text-cyan-400',
        gradient: 'from-cyan-500 to-blue-600',
      };
    }
    if (pct >= 50) {
      return {
        badgeText: 'Good Foundation',
        badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
        ringColor: 'text-blue-400',
        gradient: 'from-blue-500 to-indigo-600',
      };
    }
    return {
      badgeText: 'Learning in Progress',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      ringColor: 'text-purple-400',
      gradient: 'from-purple-500 to-pink-600',
    };
  };

  const badge = getBadgeColors(result.percentage);

  return (
    <div className="bg-[#090f23]/90 border border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left: Overall Score & Message */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold ${badge.badgeColor}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{badge.badgeText}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{difficulty} Level</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            🎉 Test Complete!
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
            {result.performanceMessage}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400">
            <span>Topic: <strong className="text-white">{topicTitle}</strong></span>
            <span>•</span>
            <span>Total Questions: <strong className="text-white">{result.totalQuestions}</strong></span>
          </div>
        </div>

        {/* Right: Score Gauge Card */}
        <div className="bg-[#060a17]/90 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-w-[240px] shadow-inner text-center">
          <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
            Your Final Score
          </div>
          
          <div className="flex items-baseline gap-1 my-2">
            <span className="text-4xl sm:text-5xl font-black text-white font-mono">
              {result.score}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-slate-500 font-mono">
              /{result.totalQuestions}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-sm font-bold font-mono">
            <TrendingUp className="w-4 h-4" />
            <span>{result.percentage}% Accuracy</span>
          </div>
        </div>
      </div>

      {/* 3 Metric Breakdown Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8 pt-8 border-t border-slate-800/80">
        {/* Correct */}
        <div className="bg-[#060a17] border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {result.correct}
          </div>
          <div className="text-xs text-emerald-400 font-semibold mt-0.5">
            Correct
          </div>
        </div>

        {/* Incorrect */}
        <div className="bg-[#060a17] border border-pink-500/30 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center">
          <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-2">
            <XCircle className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {result.incorrect}
          </div>
          <div className="text-xs text-pink-400 font-semibold mt-0.5">
            Incorrect
          </div>
        </div>

        {/* Unanswered */}
        <div className="bg-[#060a17] border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {result.unanswered}
          </div>
          <div className="text-xs text-amber-400 font-semibold mt-0.5">
            Unanswered
          </div>
        </div>
      </div>
    </div>
  );
};
