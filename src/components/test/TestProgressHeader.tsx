import React from 'react';
import { Subject, Chapter, Topic, ClassLevel } from '../../types';
import { CheckSquare, ArrowLeft, Layers, ShieldCheck } from 'lucide-react';

interface TestProgressHeaderProps {
  classLevel: ClassLevel;
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
  onExitClick: () => void;
}

export const TestProgressHeader: React.FC<TestProgressHeaderProps> = ({
  classLevel,
  subject,
  chapter,
  topic,
  currentIndex,
  totalQuestions,
  answeredCount,
  onExitClick,
}) => {
  const remainingCount = totalQuestions - answeredCount;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className="w-full bg-[#090f23]/95 border-b border-slate-800/80 backdrop-blur-xl sticky top-0 z-30 py-3.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Top Row: Meta and Exit */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="exit-test-btn"
              type="button"
              onClick={onExitClick}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all shrink-0"
              title="Pause / Exit Test"
              aria-label="Exit test"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-cyan-400">RDS SMART LEARN</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400 truncate">{subject.name} (Ch {chapter.chapterNumber})</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-sm sm:max-w-md">
                {topic.title}
              </h2>
            </div>
          </div>

          {/* Answered & Remaining Pills */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1 rounded-xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <span className="text-slate-400 mr-1 hidden sm:inline">Answered:</span>
              <span className="font-mono">{answeredCount}</span>/{totalQuestions}
            </div>

            <div className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold hidden xs:flex">
              <span className="text-slate-400 mr-1 hidden sm:inline">Remaining:</span>
              <span className="font-mono">{remainingCount}</span>
            </div>
          </div>
        </div>

        {/* Bottom Row: Smooth Progress Bar */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-cyan-400 font-bold shrink-0">
            {Math.round(progressPercent)}% Done
          </span>
        </div>
      </div>
    </div>
  );
};
