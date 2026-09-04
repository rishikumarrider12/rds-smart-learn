import React from 'react';
import { WrittenQuestion } from '../../types/writtenTest';
import { HelpCircle, Award, Bookmark, Sparkles, Layers } from 'lucide-react';

interface WrittenTestQuestionProps {
  question: WrittenQuestion;
  index: number;
  total: number;
}

export const WrittenTestQuestion: React.FC<WrittenTestQuestionProps> = ({
  question,
  index,
  total,
}) => {
  const isLong = question.questionType === 'long';

  return (
    <div id={`written-question-display-${question.id}`} className="bg-[#090f23] border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-lg">
      {/* Question metadata chips */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
            Question {index + 1} of {total}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
            isLong 
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
              : 'bg-teal-500/20 text-teal-300 border-teal-500/30'
          }`}>
            {isLong ? 'Long Answer' : 'Short Answer'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#060a17] border border-slate-800 text-xs font-bold text-amber-300">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Max Marks: {question.maxMarks}</span>
          </div>
        </div>
      </div>

      {/* Question Text */}
      <div className="pt-2">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-snug">
          {question.question}
        </h2>
      </div>

      {/* Tested Concept Tag */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 truncate">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span className="truncate">Core Concept: <strong className="text-slate-200 font-medium">{question.concept}</strong></span>
        </div>
        <span className="text-[11px] font-mono text-slate-500 shrink-0">
          State Board Rubric
        </span>
      </div>
    </div>
  );
};
