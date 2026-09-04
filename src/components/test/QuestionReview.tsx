import React, { useState } from 'react';
import { QuestionEvaluationReview, OptionId } from '../../types/test';
import { CheckCircle2, XCircle, HelpCircle, Tag, Lightbulb, ChevronDown, ChevronUp, Filter } from 'lucide-react';

interface QuestionReviewProps {
  reviews: QuestionEvaluationReview[];
}

export const QuestionReview: React.FC<QuestionReviewProps> = ({ reviews }) => {
  const [filter, setFilter] = useState<'all' | 'incorrect' | 'correct' | 'unanswered'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredReviews = reviews.filter((r) => {
    if (filter === 'correct') return r.isCorrect;
    if (filter === 'incorrect') return !r.isCorrect && !r.isUnanswered;
    if (filter === 'unanswered') return r.isUnanswered;
    return true;
  });

  const correctCount = reviews.filter((r) => r.isCorrect).length;
  const incorrectCount = reviews.filter((r) => !r.isCorrect && !r.isUnanswered).length;
  const unansweredCount = reviews.filter((r) => r.isUnanswered).length;

  return (
    <div className="bg-[#090f23]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
      {/* Review Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Detailed Question Review</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review your answers, correct solutions, and pedagogical explanations.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#060a17] rounded-xl border border-slate-800 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              filter === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('incorrect')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              filter === 'incorrect'
                ? 'bg-pink-950/80 text-pink-300 font-bold border border-pink-500/40'
                : 'text-slate-400 hover:text-pink-300'
            }`}
          >
            Incorrect ({incorrectCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('correct')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              filter === 'correct'
                ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/40'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            Correct ({correctCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unanswered')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              filter === 'unanswered'
                ? 'bg-amber-950/80 text-amber-300 font-bold border border-amber-500/40'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            Skipped ({unansweredCount})
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm bg-[#060a17]/50 rounded-2xl border border-slate-800/60">
            No questions match the selected filter.
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const isExpanded = expandedId === rev.questionId || filteredReviews.length <= 5;

            return (
              <div
                key={rev.questionId}
                id={`review-card-${rev.questionNumber}`}
                className={`rounded-2xl border transition-all ${
                  rev.isCorrect
                    ? 'border-emerald-500/30 bg-[#060a17]/80'
                    : rev.isUnanswered
                    ? 'border-amber-500/30 bg-[#060a17]/80'
                    : 'border-pink-500/30 bg-[#060a17]/80'
                } p-5 sm:p-6 space-y-4`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200">
                      Q{rev.questionNumber}
                    </span>

                    {/* Result Badge */}
                    {rev.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Correct (+1)
                      </span>
                    ) : rev.isUnanswered ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Not Answered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
                        <XCircle className="w-3.5 h-3.5" />
                        Incorrect (0)
                      </span>
                    )}

                    {rev.concept && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300">
                        <Tag className="w-3 h-3 text-cyan-400" />
                        <span>{rev.concept}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <div className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
                  {rev.questionText}
                </div>

                {/* Options Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {rev.options.map((opt) => {
                    const isStudentPick = rev.studentAnswer === opt.id;
                    const isCorrectAnswer = rev.correctAnswer === opt.id;

                    let optBorder = 'border-slate-800 bg-[#090f23]/60 text-slate-400';
                    let badgeLabel = null;

                    if (isCorrectAnswer) {
                      optBorder = 'border-emerald-500 bg-emerald-950/40 text-emerald-200 font-semibold ring-1 ring-emerald-500/40';
                      badgeLabel = (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Correct Answer ✅
                        </span>
                      );
                    } else if (isStudentPick && !isCorrectAnswer) {
                      optBorder = 'border-pink-500 bg-pink-950/40 text-pink-200 font-medium';
                      badgeLabel = (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40">
                          Your Answer ❌
                        </span>
                      );
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border flex items-start justify-between gap-2.5 text-xs sm:text-sm ${optBorder}`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCorrectAnswer ? 'bg-emerald-500 text-slate-950' : isStudentPick ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {opt.id}
                          </span>
                          <span className="leading-snug">{opt.text}</span>
                        </div>
                        {badgeLabel}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Card */}
                <div className="mt-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Explanation & Derivation:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {rev.explanation}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
