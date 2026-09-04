import React from 'react';
import { Subject, Chapter, Topic, ClassLevel } from '../../types';
import { TestDifficulty } from '../../types/test';
import { LearningLanguage } from '../../services/ai/aiTypes';
import { 
  Sparkles, 
  HelpCircle, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Award, 
  ArrowRight, 
  Flame, 
  Compass, 
  Zap, 
  Languages, 
  History 
} from 'lucide-react';
import { getRecentAttemptsForTopic } from '../../services/test/testStorage';

interface TestSetupProps {
  classLevel: ClassLevel;
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  language: LearningLanguage;
  difficulty: TestDifficulty;
  questionCount: number;
  onDifficultyChange: (diff: TestDifficulty) => void;
  onQuestionCountChange: (count: number) => void;
  onLanguageChange: (lang: LearningLanguage) => void;
  onStartTest: () => void;
  onViewPreviousResult?: (attemptId: string) => void;
}

export const TestSetup: React.FC<TestSetupProps> = ({
  classLevel,
  subject,
  chapter,
  topic,
  language,
  difficulty,
  questionCount,
  onDifficultyChange,
  onQuestionCountChange,
  onLanguageChange,
  onStartTest,
  onViewPreviousResult,
}) => {
  const recentAttempts = getRecentAttemptsForTopic(subject.id, chapter.id, topic.id);

  const difficultyOptions: {
    id: TestDifficulty;
    label: string;
    iconEmoji: string;
    description: string;
    color: string;
    badge: string;
  }[] = [
    {
      id: 'Mixed',
      label: 'Mixed Difficulty',
      iconEmoji: '🌈',
      description: 'Balanced mix of recall, concept application, and problem solving.',
      color: 'border-cyan-500/50 bg-cyan-950/20 text-cyan-300',
      badge: 'Recommended',
    },
    {
      id: 'Easy',
      label: 'Easy',
      iconEmoji: '🟢',
      description: 'Basic understanding, direct definitions, and foundational recall.',
      color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300',
      badge: 'Foundations',
    },
    {
      id: 'Medium',
      label: 'Medium',
      iconEmoji: '🔵',
      description: 'Standard textbook problem solving and concept relationships.',
      color: 'border-blue-500/50 bg-blue-950/20 text-blue-300',
      badge: 'Standard',
    },
    {
      id: 'Hard',
      label: 'Hard',
      iconEmoji: '🟣',
      description: 'Multi-step reasoning and challenging board-level applications.',
      color: 'border-purple-500/50 bg-purple-950/20 text-purple-300',
      badge: 'Advanced',
    },
  ];

  const questionCounts = [5, 10, 20];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Context Card */}
      <div className="bg-[#090f23]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              {classLevel}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300">
              {subject.name}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-400 hidden sm:inline">
              Ch {chapter.chapterNumber}
            </span>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-[#060a17] p-1 rounded-xl border border-slate-800 text-xs">
            <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {(['English', 'Telugu', 'Hindi'] as LearningLanguage[]).map((lang) => (
              <button
                key={lang}
                id={`lang-select-${lang.toLowerCase()}`}
                type="button"
                onClick={() => onLanguageChange(lang)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  language === lang
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'Telugu' ? 'తెలుగు' : lang === 'Hindi' ? 'हिन्दी' : 'English'}
              </button>
            ))}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {topic.title}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base line-clamp-2">
          {topic.description || `Chapter: ${chapter.title}`}
        </p>
      </div>

      {/* Setup Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Difficulty Selection */}
        <div className="bg-[#090f23]/70 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                Select Difficulty
              </label>
              <span className="text-xs text-cyan-400 font-mono">
                {difficulty}
              </span>
            </div>

            <div className="space-y-3">
              {difficultyOptions.map((opt) => {
                const isSelected = difficulty === opt.id;
                return (
                  <button
                    key={opt.id}
                    id={`diff-btn-${opt.id.toLowerCase()}`}
                    type="button"
                    onClick={() => onDifficultyChange(opt.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? `${opt.color} shadow-lg ring-1 ring-cyan-400/40`
                        : 'border-slate-800 bg-[#060a17]/60 hover:bg-[#0c1430] text-slate-300'
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{opt.iconEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-white">
                          {opt.label}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 font-medium">
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Number of Questions & Configuration */}
        <div className="bg-[#090f23]/70 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                Number of Questions
              </label>
              <span className="text-xs text-cyan-400 font-mono">
                {questionCount} Questions
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {questionCounts.map((count) => {
                const isSelected = questionCount === count;
                return (
                  <button
                    key={count}
                    id={`qcount-btn-${count}`}
                    type="button"
                    onClick={() => onQuestionCountChange(count)}
                    className={`py-4 px-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300 shadow-md ring-1 ring-cyan-400/50'
                        : 'border-slate-800 bg-[#060a17]/60 hover:bg-[#0c1430] text-slate-300'
                    }`}
                  >
                    <div className="text-2xl font-bold font-mono">{count}</div>
                    <div className="text-[11px] text-slate-400 mt-1">Questions</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      ~{count * 1.5} mins
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Test Features Checklist */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Deterministic instant scoring with explanation review</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>AI teacher feedback & mistake analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Zero answer reveal during the active exam</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Auto-saved progress: refresh without losing your answers</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div>
            <button
              id="start-mcq-generation-btn"
              type="button"
              onClick={onStartTest}
              className="w-full group py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-base shadow-xl shadow-cyan-950/50 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 fill-current" />
              <span>Create a {questionCount}-question {difficulty} test</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Past attempts history if any */}
      {recentAttempts.length > 0 && (
        <div className="bg-[#090f23]/60 border border-slate-800/80 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              Previous Attempts on This Topic ({recentAttempts.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recentAttempts.slice(0, 3).map((attempt) => (
              <div
                key={attempt.id}
                onClick={() => onViewPreviousResult?.(attempt.id)}
                className="bg-[#060a17] border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 transition-all cursor-pointer hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>{new Date(attempt.createdAt).toLocaleDateString()}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">
                      {attempt.difficulty}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white font-mono">
                      {attempt.result?.score ?? 0}/{attempt.questionCount}
                    </span>
                    <span className="text-xs text-cyan-400 font-semibold">
                      ({attempt.result?.percentage ?? 0}%)
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                  <span>{attempt.status === 'completed' ? 'Completed' : 'In Progress'}</span>
                  <span className="text-cyan-400 hover:underline">View Results →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
