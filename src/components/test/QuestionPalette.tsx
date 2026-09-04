import React from 'react';
import { OptionId, TestAnswerMap } from '../../types/test';
import { Check, CircleDot, AlertCircle, Compass } from 'lucide-react';

interface QuestionPaletteProps {
  totalQuestions: number;
  currentIndex: number;
  answers: TestAnswerMap;
  questionIds: string[];
  visitedIndices: Set<number>;
  onSelectIndex: (index: number) => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  totalQuestions,
  currentIndex,
  answers,
  questionIds,
  visitedIndices,
  onSelectIndex,
}) => {
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="bg-[#090f23]/90 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          Question Palette
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          {answeredCount}/{totalQuestions} Answered
        </span>
      </div>

      {/* Grid of question buttons */}
      <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 gap-2 sm:gap-2.5">
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const qId = questionIds[index];
          const isAnswered = qId ? !!answers[qId] : false;
          const isCurrent = currentIndex === index;
          const isVisited = visitedIndices.has(index);
          const isSkipped = isVisited && !isAnswered && !isCurrent;

          let btnStyles = 'bg-[#060a17] text-slate-400 border-slate-800 hover:border-slate-700';
          let statusLabel = 'Not Visited';

          if (isCurrent) {
            btnStyles = 'bg-cyan-500 text-slate-950 font-bold border-cyan-300 ring-2 ring-cyan-400/60 shadow-lg shadow-cyan-950/50';
            statusLabel = 'Current Question';
          } else if (isAnswered) {
            btnStyles = 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 hover:bg-cyan-900/80 font-bold';
            statusLabel = 'Answered';
          } else if (isSkipped) {
            btnStyles = 'bg-amber-950/40 text-amber-300 border-amber-500/40 hover:bg-amber-900/40';
            statusLabel = 'Skipped / Unanswered';
          }

          return (
            <button
              key={index}
              id={`palette-btn-${index + 1}`}
              type="button"
              onClick={() => onSelectIndex(index)}
              aria-label={`Go to Question ${index + 1} - ${statusLabel}`}
              className={`relative h-10 rounded-xl border flex items-center justify-center text-sm font-semibold transition-all duration-200 cursor-pointer ${btnStyles}`}
            >
              <span>{index + 1}</span>

              {/* Status mini dot / icon */}
              {isAnswered && !isCurrent && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full border border-[#090f23]" />
              )}
              {isSkipped && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-[#090f23]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-cyan-500" />
          <span>Current ({currentIndex + 1})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-cyan-950 border border-cyan-500/50" />
          <span>Answered ({answeredCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-amber-950/80 border border-amber-500/50" />
          <span>Skipped ({visitedIndices.size - answeredCount - (visitedIndices.has(currentIndex) && !answers[questionIds[currentIndex]] ? 1 : 0) < 0 ? 0 : visitedIndices.size - answeredCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-[#060a17] border border-slate-800" />
          <span>Not Visited</span>
        </div>
      </div>
    </div>
  );
};
