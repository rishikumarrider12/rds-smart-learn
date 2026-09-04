import React from 'react';
import { AlertTriangle, BookOpen, Sparkles, ArrowRight, Target, Brain } from 'lucide-react';
import { AnswerEvaluation, WrittenQuestion } from '../../types/writtenTest';

interface MistakeAnalysisProps {
  questions: WrittenQuestion[];
  evaluations: Record<string, AnswerEvaluation>;
  onSelectConceptToLearn: (concept: string) => void;
}

export const MistakeAnalysis: React.FC<MistakeAnalysisProps> = ({
  questions,
  evaluations,
  onSelectConceptToLearn,
}) => {
  // Aggregate weak concepts and missing points
  const weakItems = questions.map((q, idx) => {
    const ev = evaluations[q.id];
    return {
      index: idx + 1,
      question: q.question,
      concept: q.concept,
      maxMarks: q.maxMarks,
      score: ev?.score ?? 0,
      accuracy: ev?.conceptualAccuracy ?? 0,
      missingPoints: ev?.missingPoints ?? [],
      factualMistakes: ev?.factualMistakes ?? [],
      isWeak: (ev?.score ?? 0) < q.maxMarks * 0.7 || (ev?.missingPoints?.length ?? 0) > 0,
    };
  }).filter((item) => item.isWeak);

  if (weakItems.length === 0) {
    return (
      <div id="mistake-analysis-none" className="bg-[#090f23] border border-emerald-500/30 rounded-3xl p-6 sm:p-7 text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto">
          <Sparkles className="w-5 h-5 text-emerald-400" />
        </div>
        <h3 className="text-base font-bold text-white">No Major Weak Concepts Found</h3>
        <p className="text-xs text-slate-300 max-w-md mx-auto">
          You scored high across all questions with no significant missing points. Keep up the great practice!
        </p>
      </div>
    );
  }

  return (
    <div id="mistake-analysis-section" className="bg-[#090f23] border border-amber-500/30 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Detailed Missing Points & Weak Concepts ({weakItems.length})</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Focus Revision List
        </span>
      </div>

      <div className="space-y-4">
        {weakItems.map((item) => (
          <div
            key={item.index}
            className="bg-[#060a17] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Q{item.index}</span>
                  <span className="text-xs font-black text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                    {item.concept}
                  </span>
                  <span className="text-xs font-mono text-amber-400">
                    Score: {item.score}/{item.maxMarks}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1 line-clamp-2">
                  {item.question}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectConceptToLearn(item.concept)}
                className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer"
                title={`Study ${item.concept} with AI`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Learn Concept</span>
              </button>
            </div>

            {/* Missing Points list */}
            {item.missingPoints.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[11px] font-mono text-slate-400 mb-1">Expected Points to Remember:</div>
                <ul className="space-y-1 text-xs text-slate-300">
                  {item.missingPoints.map((mp, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{mp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
