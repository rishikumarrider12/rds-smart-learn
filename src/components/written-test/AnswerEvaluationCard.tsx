import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  BookOpen, 
  Columns, 
  Sparkles, 
  Award, 
  UserCheck, 
  RefreshCw,
  HelpCircle,
  FileText
} from 'lucide-react';
import { AnswerEvaluation, WrittenQuestion } from '../../types/writtenTest';

interface AnswerEvaluationCardProps {
  index: number;
  question: WrittenQuestion;
  studentAnswer: string;
  evaluation: AnswerEvaluation;
  onRetryEvaluation?: (questionId: string) => void;
  isRetrying?: boolean;
}

export const AnswerEvaluationCard: React.FC<AnswerEvaluationCardProps> = ({
  index,
  question,
  studentAnswer,
  evaluation,
  onRetryEvaluation,
  isRetrying = false,
}) => {
  const [showComparison, setShowComparison] = useState(false);
  const isLong = question.questionType === 'long';

  const accuracyBadgeColors: Record<string, string> = {
    Excellent: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    Good: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    Developing: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'Needs Improvement': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };

  const badgeStyle = accuracyBadgeColors[evaluation.accuracyLevel] || accuracyBadgeColors.Developing;

  return (
    <div
      id={`answer-evaluation-card-${question.id}`}
      className="bg-[#090f23] border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl relative"
    >
      {/* Header with question number, type, score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-[#060a17] text-white border border-slate-700 text-xs font-black">
            Question {index + 1}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
            isLong ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-teal-500/20 text-teal-300 border-teal-500/30'
          }`}>
            {isLong ? 'Long Answer' : 'Short Answer'}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeStyle}`}>
            {evaluation.accuracyLevel}
          </span>
        </div>

        {/* Score Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-sm font-black flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Score: {evaluation.score} / {evaluation.maxMarks}</span>
          </div>

          {evaluation.isPartialFailure && onRetryEvaluation && (
            <button
              type="button"
              onClick={() => onRetryEvaluation(question.id)}
              disabled={isRetrying}
              className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1"
              title="Re-evaluate this answer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>Retry Evaluation</span>
            </button>
          )}
        </div>
      </div>

      {/* Question Text */}
      <div className="space-y-1">
        <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
          Question Prompt
        </div>
        <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
          {question.question}
        </h3>
      </div>

      {/* Student's Written Answer */}
      <div className="bg-[#050814] border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-300">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Your Submitted Answer</span>
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            {studentAnswer.trim().split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
          {studentAnswer.trim() ? studentAnswer : <em className="text-slate-500">No answer written for this question.</em>}
        </div>
      </div>

      {/* Side-by-side or toggle Comparison view */}
      {showComparison && (
        <div className="bg-[#060a17] border border-cyan-500/30 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Columns className="w-4 h-4 text-cyan-400" />
              Side-by-Side Comparison
            </span>
            <button
              type="button"
              onClick={() => setShowComparison(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Hide Comparison
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student answer column */}
            <div className="bg-[#090f23] border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-xs font-bold text-slate-300">Your Answer</div>
              <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {studentAnswer.trim() || 'No answer submitted'}
              </div>
            </div>

            {/* Model answer column */}
            <div className="bg-[#090f23] border border-emerald-500/30 rounded-xl p-4 space-y-2">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reference Model Answer</span>
              </div>
              <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {evaluation.modelAnswer || question.modelAnswer}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Grid (What You Did Well & What To Improve) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* What You Did Well */}
        <div className="bg-[#060a17] border border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>What You Did Well</span>
          </div>

          {evaluation.correctPoints && evaluation.correctPoints.length > 0 ? (
            <ul className="space-y-2 text-xs text-slate-300">
              {evaluation.correctPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">
              {evaluation.strengths && evaluation.strengths.length > 0
                ? evaluation.strengths[0]
                : 'Good attempt to understand the question structure.'}
            </p>
          )}
        </div>

        {/* What To Improve */}
        <div className="bg-[#060a17] border border-amber-500/20 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>What to Improve</span>
          </div>

          {evaluation.missingPoints && evaluation.missingPoints.length > 0 ? (
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-slate-400">Key Points Missing:</div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {evaluation.missingPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold mt-0.5">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-emerald-300">
              ✓ Excellent! All primary textbook points were covered in your answer.
            </p>
          )}

          {/* Factual Mistakes if any */}
          {evaluation.factualMistakes && evaluation.factualMistakes.length > 0 && (
            <div className="pt-2 border-t border-slate-800">
              <div className="text-[11px] font-mono text-rose-300 font-bold">Conceptual Note:</div>
              <ul className="space-y-1 text-xs text-rose-200 mt-1">
                {evaluation.factualMistakes.map((mistake, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">!</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* How to Improve Suggestions */}
      {evaluation.improvementTips && evaluation.improvementTips.length > 0 && (
        <div className="bg-[#060a17] border border-cyan-500/20 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-cyan-400" />
            <span>How to Improve for Board Exams</span>
          </div>
          <ul className="space-y-1 text-xs text-slate-300">
            {evaluation.improvementTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">→</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Teacher's Feedback */}
      {evaluation.teacherFeedback && (
        <div className="bg-[#0d162d] border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-1.5 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0 mt-0.5">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-emerald-300">RDS Teacher Feedback</div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              "{evaluation.teacherFeedback}"
            </p>
          </div>
        </div>
      )}

      {/* Toggle Comparison Button */}
      <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowComparison(!showComparison)}
          className="px-4 py-2 rounded-xl bg-[#060a17] hover:bg-[#121d3f] border border-slate-800 text-xs font-bold text-cyan-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
        >
          <Columns className="w-4 h-4 text-cyan-400" />
          <span>{showComparison ? 'Hide Comparison' : 'Compare My Answer with Model Answer'}</span>
        </button>

        <span className="text-[11px] text-slate-500 font-mono">
          Tested: {question.concept}
        </span>
      </div>
    </div>
  );
};
