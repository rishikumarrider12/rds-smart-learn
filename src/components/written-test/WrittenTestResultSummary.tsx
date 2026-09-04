import React from 'react';
import { WrittenTestResult } from '../../types/writtenTest';
import { LearningLanguage } from '../../services/ai/aiTypes';
import { t } from '../../services/study/examText';
import { 
  Trophy, 
  Award, 
  Target, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  FileText,
  TrendingUp,
  Brain
} from 'lucide-react';

interface WrittenTestResultSummaryProps {
  result: WrittenTestResult;
  topicTitle: string;
  subjectName: string;
  chapterTitle: string;
  language?: LearningLanguage;
}

export const WrittenTestResultSummary: React.FC<WrittenTestResultSummaryProps> = ({
  result,
  topicTitle,
  subjectName,
  chapterTitle,
  language = 'English',
}) => {
  const {
    totalScore,
    maxScore,
    percentage,
    conceptualAccuracy,
    questionsAnswered,
    totalQuestions,
    performanceBadge,
    badgeColor,
    performanceMessage,
  } = result;

  return (
    <div id="written-test-result-summary" className="space-y-6">
      {/* Top Banner Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0a142e] via-[#0e1c40] to-[#070b18] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/40">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${badgeColor}`}>
                {performanceBadge}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Telangana Board Rubric
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>🎉 {t('testComplete', language)}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Topic: <strong className="text-white">{topicTitle}</strong> &bull; {subjectName} ({chapterTitle})
            </p>

            <div className="pt-2">
              <p className="text-xs sm:text-sm text-emerald-300 font-medium bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 max-w-2xl">
                {performanceMessage}
              </p>
            </div>
          </div>

          {/* Big Score Display */}
          <div className="bg-[#050814]/90 border border-emerald-500/40 rounded-2xl p-5 text-center min-w-[200px] shadow-xl flex-shrink-0 flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              {t('totalScoreAwarded', language)}
            </span>
            <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight my-1">
              {totalScore} <span className="text-2xl sm:text-3xl text-slate-400 font-semibold">/ {maxScore}</span>
            </div>
            <div className="text-xs font-bold text-cyan-300 font-mono">
              {percentage}% Marks
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Score */}
        <div className="bg-[#090f23] border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">{t('marksObtained', language)}</div>
            <div className="text-lg sm:text-xl font-black text-white">{totalScore} / {maxScore}</div>
          </div>
        </div>

        {/* Percentage */}
        <div className="bg-[#090f23] border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">{t('percentage', language)}</div>
            <div className="text-lg sm:text-xl font-black text-cyan-400">{percentage}%</div>
          </div>
        </div>

        {/* Conceptual Accuracy */}
        <div className="bg-[#090f23] border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">{t('conceptAccuracy', language)}</div>
            <div className="text-lg sm:text-xl font-black text-purple-300">{conceptualAccuracy}%</div>
          </div>
        </div>

        {/* Questions Answered */}
        <div className="bg-[#090f23] border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">{t('questionsAnswered', language)}</div>
            <div className="text-lg sm:text-xl font-black text-white">{questionsAnswered} / {totalQuestions}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
