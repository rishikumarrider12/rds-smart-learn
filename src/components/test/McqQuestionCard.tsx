import React from 'react';
import { OptionId, ClientQuestion } from '../../types/test';
import { Check, HelpCircle, Tag } from 'lucide-react';

interface McqQuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question: ClientQuestion;
  selectedOption?: OptionId;
  onSelectOption: (optionId: OptionId) => void;
}

export const McqQuestionCard: React.FC<McqQuestionCardProps> = ({
  questionNumber,
  totalQuestions,
  question,
  selectedOption,
  onSelectOption,
}) => {
  return (
    <div className="bg-[#090f23]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
      {/* Question Header & Concept Label */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold font-mono">
            Question {questionNumber} of {totalQuestions}
          </span>
          {question.concept && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 text-slate-300 text-xs font-medium">
              <Tag className="w-3 h-3 text-cyan-400" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{question.concept}</span>
            </span>
          )}
        </div>

        <span className="text-xs text-slate-400">
          Single Choice • 1 Mark
        </span>
      </div>

      {/* Question Text */}
      <div className="text-lg sm:text-xl font-medium text-slate-100 leading-relaxed">
        {question.question}
      </div>

      {/* 4 Options */}
      <div className="space-y-3.5 pt-2" role="radiogroup" aria-label={`Question ${questionNumber} options`}>
        {question.options.map((opt) => {
          const isSelected = selectedOption === opt.id;

          return (
            <label
              key={opt.id}
              id={`option-label-${opt.id.toLowerCase()}`}
              onClick={() => onSelectOption(opt.id)}
              className={`group flex items-start gap-4 p-4 sm:p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-cyan-400 bg-gradient-to-r from-cyan-950/60 to-blue-950/40 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/50'
                  : 'border-slate-800/80 bg-[#060a17]/70 hover:bg-[#0c1430] hover:border-slate-700 text-slate-300'
              }`}
            >
              {/* Radio Indicator */}
              <div className="shrink-0 mt-0.5">
                <input
                  type="radio"
                  id={`radio-${question.id}-${opt.id}`}
                  name={`question-${question.id}`}
                  value={opt.id}
                  checked={isSelected}
                  onChange={() => onSelectOption(opt.id)}
                  className="sr-only"
                  aria-label={`Option ${opt.id}: ${opt.text}`}
                />
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                    isSelected
                      ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 shadow-md scale-105'
                      : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                  }`}
                >
                  {opt.id}
                </div>
              </div>

              {/* Option Text */}
              <div className="flex-1 text-sm sm:text-base leading-snug pt-0.5 text-slate-200">
                {opt.text}
              </div>

              {/* Checkmark icon for selected */}
              {isSelected && (
                <div className="shrink-0 text-cyan-400 mt-1">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
};
