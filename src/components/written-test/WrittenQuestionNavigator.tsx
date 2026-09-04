import React from 'react';
import { WrittenQuestion } from '../../types/writtenTest';
import { LearningLanguage } from '../../services/ai/aiTypes';
import { t, questionProgress, answeredProgress } from '../../services/study/examText';
import { 
  CheckCircle2, 
  Circle, 
  Edit3, 
  ArrowLeft, 
  ArrowRight, 
  SkipForward,
  CheckSquare,
  Layers
} from 'lucide-react';

interface WrittenQuestionNavigatorProps {
  questions: WrittenQuestion[];
  answers: Record<string, string>;
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
  onSubmitClick: () => void;
  language?: LearningLanguage;
}

export const WrittenQuestionNavigator: React.FC<WrittenQuestionNavigatorProps> = ({
  questions,
  answers,
  currentIndex,
  onSelectIndex,
  onPrevious,
  onNext,
  onSkip,
  onSubmitClick,
  language = 'English',
}) => {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  const getQuestionStatus = (questionId: string) => {
    const text = (answers[questionId] || '').trim();
    if (!text) return 'unanswered';
    const words = text.split(/\s+/).filter(Boolean);
    return words.length >= 10 ? 'answered' : 'in_progress';
  };

  return (
    <div id="written-question-navigator" className="space-y-6">
      {/* Action Buttons Row */}
      <div className="bg-[#090f23] border border-slate-800 rounded-3xl p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3 shadow-lg">
        {/* Left: Previous */}
        <button
          id="prev-question-btn"
          type="button"
          onClick={onPrevious}
          disabled={isFirst}
          className="px-4 py-2.5 rounded-xl bg-[#060a17] hover:bg-[#121d3f] border border-slate-800 disabled:opacity-40 disabled:hover:bg-[#060a17] text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('previousQuestion', language)}</span>
        </button>

        {/* Center: Skip */}
        <button
          id="skip-question-btn"
          type="button"
          onClick={onSkip}
          disabled={isLast}
          className="px-3.5 py-2.5 rounded-xl bg-[#060a17] hover:bg-[#121d3f] border border-slate-800 disabled:opacity-40 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
        >
          <span>{t('skip', language)}</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        {/* Right: Next or Submit */}
        {isLast ? (
          <button
            id="finish-test-btn"
            type="button"
            onClick={onSubmitClick}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-950/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckSquare className="w-4 h-4" />
            <span>{t('finishSubmit', language)}</span>
          </button>
        ) : (
          <button
            id="next-question-btn"
            type="button"
            onClick={onNext}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white text-xs font-black shadow-md shadow-emerald-950/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{t('nextQuestion', language)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Palette Grid */}
      <div className="bg-[#090f23] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>{t('questionPalette', language)}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {answeredProgress(Object.values(answers).filter((a) => typeof a === 'string' && a.trim().length > 0).length, questions.length, language)}
          </span>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const status = getQuestionStatus(q.id);

            let bgBorder = 'bg-[#060a17] border-slate-800 text-slate-400 hover:border-slate-700';
            if (status === 'answered') {
              bgBorder = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold';
            } else if (status === 'in_progress') {
              bgBorder = 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold';
            }

            if (isCurrent) {
              bgBorder = 'ring-2 ring-emerald-400 border-emerald-400 bg-emerald-500/30 text-white font-black shadow-lg shadow-emerald-950/50';
            }

            return (
              <button
                key={q.id}
                id={`palette-btn-${idx + 1}`}
                type="button"
                onClick={() => onSelectIndex(idx)}
                className={`h-11 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${bgBorder}`}
                title={`Question ${idx + 1} (${status})`}
              >
                <span className="text-xs">{idx + 1}</span>
                <span className="text-[9px] font-mono leading-none">
                  {status === 'answered' ? '✓' : status === 'in_progress' ? '✎' : '•'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Palette Legend */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center flex-wrap gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>{t('answered', language)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>{t('inProgress', language)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
            <span>{t('notAnswered', language)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full ring-2 ring-emerald-400 bg-emerald-500/30"></span>
            <span className="text-slate-200">{t('current', language)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
