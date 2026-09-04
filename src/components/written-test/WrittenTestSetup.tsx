import React from 'react';
import { Subject, Chapter, Topic, ClassLevel } from '../../types';
import { LearningLanguage } from '../../services/ai/aiTypes';
import { WrittenDifficulty, WrittenQuestionType } from '../../types/writtenTest';
import { 
  PenTool, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  GraduationCap,
  Globe,
  Sliders,
  FileText
} from 'lucide-react';

interface WrittenTestSetupProps {
  classLevel: ClassLevel;
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  questionType: WrittenQuestionType;
  difficulty: WrittenDifficulty;
  questionCount: number;
  language: LearningLanguage;
  isLoading: boolean;
  error: string | null;
  onQuestionTypeChange: (type: WrittenQuestionType) => void;
  onDifficultyChange: (diff: WrittenDifficulty) => void;
  onQuestionCountChange: (count: number) => void;
  onLanguageChange: (lang: LearningLanguage) => void;
  onStartTest: () => void;
  onBack: () => void;
}

export const WrittenTestSetup: React.FC<WrittenTestSetupProps> = ({
  classLevel,
  subject,
  chapter,
  topic,
  questionType,
  difficulty,
  questionCount,
  language,
  isLoading,
  error,
  onQuestionTypeChange,
  onDifficultyChange,
  onQuestionCountChange,
  onLanguageChange,
  onStartTest,
  onBack,
}) => {
  const questionTypeOptions: Array<{
    id: WrittenQuestionType;
    label: string;
    description: string;
    marksInfo: string;
    color: string;
    borderActive: string;
    bgActive: string;
  }> = [
    {
      id: 'short',
      label: 'Short Answer',
      description: 'Concise, focused answers testing fundamental concepts and definitions.',
      marksInfo: '2 to 4 Marks each',
      color: 'text-emerald-400',
      borderActive: 'border-emerald-500',
      bgActive: 'bg-emerald-500/10',
    },
    {
      id: 'long',
      label: 'Long Answer',
      description: 'Comprehensive explanations, step-by-step reasoning, and derivations.',
      marksInfo: '5 to 8 Marks each',
      color: 'text-blue-400',
      borderActive: 'border-blue-500',
      bgActive: 'bg-blue-500/10',
    },
    {
      id: 'mixed',
      label: 'Mixed Combination',
      description: 'A balanced set combining both short definitions and descriptive questions.',
      marksInfo: 'State Board Mix',
      color: 'text-purple-400',
      borderActive: 'border-purple-500',
      bgActive: 'bg-purple-500/10',
    },
  ];

  const difficultyOptions: Array<{ id: WrittenDifficulty; label: string; desc: string; color: string }> = [
    { id: 'Easy', label: 'Easy', desc: 'Core definitions & direct recall', color: 'text-emerald-400 border-emerald-500/40' },
    { id: 'Medium', label: 'Medium', desc: 'Standard board exam level', color: 'text-cyan-400 border-cyan-500/40' },
    { id: 'Hard', label: 'Hard', desc: 'Analytical & deep evaluation', color: 'text-purple-400 border-purple-500/40' },
    { id: 'Mixed', label: 'Mixed', desc: 'Balanced adaptive test', color: 'text-amber-400 border-amber-500/40' },
  ];

  const countOptions = [3, 5, 10];

  const languageOptions: Array<{ id: LearningLanguage; label: string; sub: string }> = [
    { id: 'English', label: 'English', sub: 'Default Medium' },
    { id: 'Telugu', label: 'తెలుగు (Telugu)', sub: 'State Medium' },
    { id: 'Hindi', label: 'हिंदी (Hindi)', sub: 'National Medium' },
  ];

  return (
    <div id="written-test-setup-container" className="max-w-4xl mx-auto space-y-8">
      {/* Back button & Page title */}
      <div className="flex items-center justify-between">
        <button
          id="back-to-topic-btn"
          onClick={onBack}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090f23] hover:bg-[#121d3f] border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Topic</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>AI Written Evaluator Ready</span>
        </div>
      </div>

      {/* Context Badge */}
      <div className="bg-gradient-to-r from-[#0d162d] via-[#111f44] to-[#0d162d] border border-emerald-500/30 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 flex-shrink-0">
            <PenTool className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Selected Topic for Written Test</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {topic.title}
            </h1>
            <div className="text-xs text-slate-300 flex items-center flex-wrap gap-2 mt-1 font-medium">
              <span>{classLevel}</span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-cyan-300">{subject.name}</span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-slate-300">Ch {chapter.chapterNumber}: {chapter.title}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#080d1e] px-3 py-2 rounded-xl border border-slate-800 text-right">
          <div className="text-[10px] text-slate-400 font-mono">Evaluation Mode</div>
          <div className="text-xs font-bold text-emerald-300">Concept & Step Rubric</div>
        </div>
      </div>

      {/* Error state if any */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-rose-200">Unable to Prepare Written Test</div>
            <div className="mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Configuration Grid */}
      <div className="space-y-6">
        {/* 1. Question Type Selection */}
        <div className="bg-[#090f23] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>1. Choose Question Type</span>
            </div>
            <span className="text-xs text-slate-400">Board Exam Formats</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {questionTypeOptions.map((opt) => {
              const isSelected = questionType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onQuestionTypeChange(opt.id)}
                  className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? `${opt.borderActive} ${opt.bgActive} shadow-md`
                      : 'border-slate-800 bg-[#060a17] hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {opt.label}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      {opt.description}
                    </p>
                  </div>
                  <span className={`text-[11px] font-mono font-bold ${opt.color}`}>
                    {opt.marksInfo}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Number of Questions & Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Number of Questions */}
          <div className="bg-[#090f23] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>2. Number of Questions</span>
              </div>
              <span className="text-xs text-cyan-400 font-mono font-bold">{questionCount} Questions</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {countOptions.map((count) => {
                const isSelected = questionCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => onQuestionCountChange(count)}
                    className={`py-3 px-2 rounded-xl border text-center font-bold text-sm transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300 shadow-md'
                        : 'border-slate-800 bg-[#060a17] text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div>{count}</div>
                    <div className="text-[10px] font-normal text-slate-400 mt-0.5">Questions</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-[#090f23] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <GraduationCap className="w-4 h-4 text-purple-400" />
                <span>3. Difficulty Level</span>
              </div>
              <span className="text-xs text-purple-400 font-mono font-bold">{difficulty}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-2.5">
              {difficultyOptions.map((diff) => {
                const isSelected = difficulty === diff.id;
                return (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => onDifficultyChange(diff.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/15 text-white shadow-md'
                        : 'border-slate-800 bg-[#060a17] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs">{diff.label}</div>
                    <div className="text-[10px] text-slate-400 truncate">{diff.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Language Preference */}
        <div className="bg-[#090f23] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>4. Preferred Medium / Language</span>
            </div>
            <span className="text-xs text-slate-400">Questions & Model Answers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {languageOptions.map((lang) => {
              const isSelected = language === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => onLanguageChange(lang.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300 shadow-md'
                      : 'border-slate-800 bg-[#060a17] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">{lang.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{lang.sub}</div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="pt-2 text-center">
        <button
          id="start-written-test-btn"
          type="button"
          onClick={onStartTest}
          disabled={isLoading}
          className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-black text-base shadow-xl shadow-emerald-950/50 hover:shadow-emerald-900/60 transition-all flex items-center justify-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Preparing Questions with RDS AI...</span>
            </>
          ) : (
            <>
              <PenTool className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Start Written Answer Test</span>
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </>
          )}
        </button>
        <p className="text-xs text-slate-400 mt-3">
          Your answers will be saved automatically as you write. Evaluated on concept clarity, not exact wording.
        </p>
      </div>
    </div>
  );
};
