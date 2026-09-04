import React, { useState, useEffect } from 'react';
import { useStudent } from '../../context/StudentContext';
import { Chapter, Subject, Topic } from '../../types';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { LanguageSelector } from '../ai/LanguageSelector';
import { LearningModeSelector, LEARNING_MODES } from '../ai/LearningModeSelector';
import { AiLoadingState } from '../ai/AiLoadingState';
import { AiErrorState } from '../ai/AiErrorState';
import { 
  AiLearningContext, 
  AiLearningMode, 
  LearningLanguage 
} from '../../services/ai/aiTypes';
import { generateLearningLesson } from '../../services/ai/aiService';
import { recordLearningEvent, updateTopicStatus } from '../../services/analytics/analyticsService';
import { getSubjectLanguage } from '../../data/syllabusData';
import { 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  Bot, 
  ThumbsUp, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  Send, 
  Layers,
  FileText,
  Share2,
  Check
} from 'lucide-react';

interface LearnWithAiScreenProps {
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  onBackToTopicActions: () => void;
  onNavigateToAskAi: (initialQuestion?: string) => void;
  onNavigate: (target: 'dashboard' | 'subjects' | 'chapters' | 'topics' | 'learn') => void;
}

export const LearnWithAiScreen: React.FC<LearnWithAiScreenProps> = ({
  subject,
  chapter,
  topic,
  onBackToTopicActions,
  onNavigateToAskAi,
  onNavigate,
}) => {
  const { student, selectedClass, language: preferredLanguage } = useStudent();
  // Academic content language defaults from the SUBJECT: Telugu subject ->
  // Telugu lessons, Hindi subject -> Hindi lessons, other subjects follow the
  // student's saved explanation-language preference. The on-screen language
  // selector still allows an explicit override.
  const subjectLang = getSubjectLanguage(subject);
  const [effectiveLang, setEffectiveLang] = useState<LearningLanguage>(
    subjectLang !== 'English' ? subjectLang : preferredLanguage
  );
  const [activeMode, setActiveMode] = useState<AiLearningMode>('simple_explanation');
  const [lessonContent, setLessonContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<{ message: string; isConfigError?: boolean } | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [tutorEvaluation, setTutorEvaluation] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [understoodSuccess, setUnderstoodSuccess] = useState<boolean>(false);

  // Storage cache key for current topic and mode lesson
  const getLessonCacheKey = (mode: AiLearningMode, lang: LearningLanguage) => {
    return `rds_lesson_${selectedClass}_${subject.id}_${chapter.id}_${topic.id}_${mode}_${lang}`;
  };

  // Fetch or retrieve cached lesson
  const loadLesson = async (mode: AiLearningMode, lang: LearningLanguage, instruction?: string) => {
    setError(null);
    setTutorEvaluation('');
    setUnderstoodSuccess(false);

    const cacheKey = getLessonCacheKey(mode, lang);
    if (!instruction) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setLessonContent(cached);
        return;
      }
    }

    setIsLoading(true);
    const context: AiLearningContext = {
      studentName: student?.name || 'Student',
      classLevel: selectedClass,
      subject,
      chapter,
      topic,
      language: lang,
      mode,
    };

    try {
      const text = await generateLearningLesson(context, mode, instruction);
      setLessonContent(text);
      if (!instruction) {
        localStorage.setItem(cacheKey, text);
      }

      recordLearningEvent({
        type: 'lesson_started',
        classLevel: selectedClass,
        subjectId: subject.id,
        chapterId: chapter.id,
        topicId: topic.id,
        metadata: { mode, language: effectiveLang },
      });
    } catch (err: any) {
      console.error('Failed to generate lesson:', err);
      const isConfig = err.message?.includes('GEMINI_API_KEY') || err.message?.includes('503');
      setError({
        message: err.message || 'Unable to generate lesson. Please try again.',
        isConfigError: isConfig,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLesson(activeMode, effectiveLang);
  }, [activeMode, effectiveLang, selectedClass, subject.id, chapter.id, topic.id]);

  const handleModeChange = (mode: AiLearningMode) => {
    setActiveMode(mode);
  };

  const handleSimplify = () => {
    loadLesson(activeMode, effectiveLang, 'The student found the previous explanation difficult. Please explain again with even simpler everyday analogies and smaller steps.');
  };

  const handleUnderstood = () => {
    setUnderstoodSuccess(true);
    setTimeout(() => setUnderstoodSuccess(false), 3000);

    recordLearningEvent({
      type: 'lesson_completed',
      classLevel: selectedClass,
      subjectId: subject.id,
      chapterId: chapter.id,
      topicId: topic.id,
      metadata: { mode: activeMode, language: effectiveLang },
    });

    updateTopicStatus({
      classLevel: selectedClass,
      subjectId: subject.id,
      chapterId: chapter.id,
      topicId: topic.id,
      lessonCompleted: true,
      status: 'completed',
    });
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || isEvaluating) return;

    setIsEvaluating(true);
    const context: AiLearningContext = {
      studentName: student?.name || 'Student',
      classLevel: selectedClass,
      subject,
      chapter,
      topic,
      language: effectiveLang,
      mode: 'ask_me_questions',
    };

    try {
      const evaluation = await generateLearningLesson(
        context,
        'ask_me_questions',
        userAnswer
      );
      setTutorEvaluation(evaluation);
      setUserAnswer('');
    } catch (err: any) {
      console.error('Evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const currentModeInfo = LEARNING_MODES.find((m) => m.id === activeMode) || LEARNING_MODES[0];

  return (
    <div id="learn-with-ai-screen" className="min-h-screen bg-[#070b19] pb-24">
      {/* Top Header & Breadcrumbs */}
      <div className="bg-gradient-to-b from-[#0a1226] to-[#070b19] border-b border-cyan-500/20 pt-6 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Breadcrumbs
            currentClass={selectedClass}
            subject={subject}
            chapter={chapter}
            topic={topic}
            onNavigate={onNavigate}
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <button
                id="back-to-topic-actions-btn"
                onClick={onBackToTopicActions}
                className="mt-1 p-2 rounded-xl bg-[#0e172f] hover:bg-[#162447] text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Back to Topic Options"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {selectedClass}
                  </span>
                  <span className="text-slate-400 font-medium">{subject.name}</span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="text-slate-400 font-medium">Ch {chapter.chapterNumber}: {chapter.title}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
                  <span>Learn with AI &mdash; {topic.title}</span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Interactive step-by-step masterclass with smart comprehension checks.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <LanguageSelector
                currentLanguage={effectiveLang}
                onSelectLanguage={(l) => setEffectiveLang(l)}
                variant="compact"
              />

              <button
                id="open-ask-ai-from-learn"
                onClick={() => onNavigateToAskAi()}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>Ask Doubts</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Learning Mode Selection Bar */}
        <div className="bg-[#080d21] border border-cyan-500/20 rounded-2xl p-4 sm:p-5 shadow-xl shadow-cyan-950/20">
          <LearningModeSelector
            selectedMode={activeMode}
            onSelectMode={handleModeChange}
            disabled={isLoading}
          />
        </div>

        {/* Main Lesson Content Card */}
        <div className="bg-[#080d21] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40 space-y-6">
          {/* Active Mode Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-xl">
                <span>{currentModeInfo.emoji}</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{currentModeInfo.label}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  {topic.title} &bull; {selectedClass} {subject.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadLesson(activeMode, effectiveLang, 'Regenerate a fresh perspective on this topic')}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                title="Regenerate lesson"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <AiLoadingState
              message={`RDS AI is preparing your ${currentModeInfo.label}...`}
              topicTitle={topic.title}
            />
          )}

          {/* Error State */}
          {error && !isLoading && (
            <AiErrorState
              errorMessage={error.message}
              isConfigError={error.isConfigError}
              onRetry={() => loadLesson(activeMode, effectiveLang)}
            />
          )}

          {/* Lesson Body Content */}
          {!isLoading && !error && lessonContent && (
            <div className="space-y-6">
              {/* Formatted Content Container */}
              <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-3.5">
                {lessonContent.split('\n').map((line, idx) => {
                  const trimmed = line.trim();
                  if (!trimmed) return <div key={idx} className="h-1" />;

                  if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
                    return (
                      <h3 key={idx} className="text-base sm:text-lg font-black text-cyan-300 pt-3 pb-1 border-b border-slate-800">
                        {trimmed.replace(/^#+\s*/, '')}
                      </h3>
                    );
                  }

                  if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
                    return (
                      <div key={idx} className="flex items-start gap-2.5 pl-2 py-0.5">
                        <span className="text-cyan-400 font-bold mt-1 text-xs">•</span>
                        <span className="flex-1">{trimmed.replace(/^[-*•]\s*/, '')}</span>
                      </div>
                    );
                  }

                  const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
                  if (numMatch) {
                    return (
                      <div key={idx} className="flex items-start gap-2.5 pl-2 py-1">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-extrabold text-xs">
                          {numMatch[1]}
                        </span>
                        <span className="flex-1 pt-0.5">{numMatch[2]}</span>
                      </div>
                    );
                  }

                  return (
                    <p key={idx} className="text-slate-200">
                      {trimmed}
                    </p>
                  );
                })}
              </div>

              {/* Interactive Tutor Section for "Ask Me Questions" Mode */}
              {activeMode === 'ask_me_questions' && (
                <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-4">
                  <div className="bg-[#090f24] border border-cyan-500/30 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Your Answer to RDS AI:</span>
                    </div>

                    <form onSubmit={handleAnswerSubmit} className="space-y-3">
                      <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your explanation or answer here to check your understanding..."
                        rows={3}
                        disabled={isEvaluating}
                        className="w-full bg-[#060a17] text-white placeholder-slate-500 text-xs sm:text-sm p-3 rounded-xl border border-slate-700 focus:border-cyan-400 focus:outline-none resize-none"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          RDS AI will review your logic politely and give tips.
                        </span>

                        <button
                          type="submit"
                          disabled={!userAnswer.trim() || isEvaluating}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isEvaluating ? 'Evaluating...' : 'Submit Answer'}</span>
                        </button>
                      </div>
                    </form>

                    {/* Tutor Evaluation Response */}
                    {tutorEvaluation && (
                      <div className="mt-4 p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-2 animate-fadeIn">
                        <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                          <Bot className="w-4 h-4 text-cyan-400" />
                          <span>RDS AI Feedback:</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                          {tutorEvaluation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Student Comprehension Feedback Bar */}
              <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">
                    How was this explanation?
                  </span>
                  {understoodSuccess && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Great job!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleUnderstood}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>I Understood This!</span>
                  </button>

                  <button
                    onClick={handleSimplify}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Explain in Simpler Words</span>
                  </button>

                  <button
                    onClick={() => onNavigateToAskAi(`I have a specific question about ${topic.title}: `)}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>I Have a Question</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
