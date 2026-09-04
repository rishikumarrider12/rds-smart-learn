import React from 'react';
import { Subject, Chapter, Topic, ClassLevel } from '../../types';
import { LearningLanguage } from '../../services/ai/aiTypes';
import { t, questionProgress, answeredProgress, pendingCount } from '../../services/study/examText';
import { 
  PenTool, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface WrittenTestProgressHeaderProps {
  topic: Topic;
  subject: Subject;
  chapter: Chapter;
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
  onExit: () => void;
  onSubmitClick: () => void;
  language?: LearningLanguage;
}

export const WrittenTestProgressHeader: React.FC<WrittenTestProgressHeaderProps> = ({
  topic,
  subject,
  chapter,
  currentIndex,
  totalQuestions,
  answeredCount,
  onExit,
  onSubmitClick,
  language = 'English',
}) => {
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <header id="written-test-header" className="bg-[#090f23] border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Brand & Exit */}
        <div className="flex items-center gap-3">
          <button
            id="exit-test-btn"
            type="button"
            onClick={onExit}
            className="p-2 rounded-xl bg-[#060a17] hover:bg-[#121d3f] border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={t('exitTest', language)}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-black tracking-wider text-emerald-400 uppercase">
                RDS SMART LEARN
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-xs text-slate-300 font-bold">{t('writtenTest', language)}</span>
            </div>
            <div className="text-xs text-slate-400 truncate max-w-xs md:max-w-md">
              Topic: <span className="text-white font-medium">{topic.title}</span> ({subject.name})
            </div>
          </div>
        </div>

        {/* Center: Question Progress */}
        <div className="flex-1 max-w-xs mx-auto hidden md:block">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-bold text-slate-300">
              {questionProgress(currentIndex + 1, totalQuestions, language)}
            </span>
            <span className="font-mono text-emerald-400 font-semibold">
              {answeredProgress(answeredCount, totalQuestions, language)} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-[#060a17] h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right: Submit Button */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 font-mono block">{t('status', language)}</span>
            <span className="text-xs font-bold text-slate-200">
              {answeredCount === totalQuestions ? t('readyToEvaluate', language) : pendingCount(totalQuestions - answeredCount, language)}
            </span>
          </div>

          <button
            id="header-submit-test-btn"
            type="button"
            onClick={onSubmitClick}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('submitTest', language)}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
