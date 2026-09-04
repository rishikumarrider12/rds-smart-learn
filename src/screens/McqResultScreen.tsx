import React, { useState, useEffect } from 'react';
import { Subject, Chapter, Topic } from '../types';
import { TestAttempt, QuestionEvaluationReview } from '../types/test';
import { getTestAttempt, updateAttemptAiFeedback } from '../services/test/testStorage';
import { buildQuestionEvaluationReviews, generateAiMistakeAnalysis } from '../services/test/mcqService';
import { TestResultSummary } from '../components/test/TestResultSummary';
import { QuestionReview } from '../components/test/QuestionReview';
import { AiTestFeedbackCard } from '../components/test/AiTestFeedbackCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { 
  Bot, 
  BookOpen, 
  RefreshCw, 
  LayoutDashboard, 
  ArrowLeft, 
  CheckCircle2, 
  HelpCircle, 
  Share2 
} from 'lucide-react';

interface McqResultScreenProps {
  testId: string;
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  onNavigateToAskAiWithMistakes: (mistakesSummary: string) => void;
  onNavigateToLearnWithAi: () => void;
  onRetakeTest: () => void;
  onNavigateToDashboard: () => void;
  onNavigate: (target: 'dashboard' | 'subjects' | 'chapters' | 'topics' | 'learn') => void;
}

export const McqResultScreen: React.FC<McqResultScreenProps> = ({
  testId,
  subject,
  chapter,
  topic,
  onNavigateToAskAiWithMistakes,
  onNavigateToLearnWithAi,
  onRetakeTest,
  onNavigateToDashboard,
  onNavigate,
}) => {
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [isLoadingAiFeedback, setIsLoadingAiFeedback] = useState<boolean>(false);
  const [reviews, setReviews] = useState<QuestionEvaluationReview[]>([]);

  useEffect(() => {
    const loaded = getTestAttempt(testId);
    if (!loaded || !loaded.result) return;

    setAttempt(loaded);
    const revs = buildQuestionEvaluationReviews(loaded.questions, loaded.answers);
    setReviews(revs);

    // If AI feedback isn't cached on the attempt yet, generate it in background
    if (!loaded.aiFeedback) {
      setIsLoadingAiFeedback(true);
      generateAiMistakeAnalysis({
        studentName: loaded.studentName,
        classLevel: loaded.classLevel,
        subject,
        chapter,
        topic,
        language: loaded.language,
        questions: loaded.questions,
        answers: loaded.answers,
        result: loaded.result,
      })
        .then((feedback) => {
          updateAttemptAiFeedback(testId, feedback);
          setAttempt((prev) => (prev ? { ...prev, aiFeedback: feedback } : prev));
        })
        .catch((err) => {
          console.error('Failed to get background AI feedback:', err);
        })
        .finally(() => {
          setIsLoadingAiFeedback(false);
        });
    }
  }, [testId, subject, chapter, topic]);

  if (!attempt || !attempt.result) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Compile mistake summary text to pass to Ask RDS AI Chat
  const handleReviewWithAi = () => {
    const incorrectReviews = reviews.filter((r) => !r.isCorrect);
    let mistakesSummary = `I just took a ${attempt.difficulty} MCQ test on "${topic.title}" and scored ${attempt.result?.score}/${attempt.result?.totalQuestions}.\n\nHere are the questions I struggled with:\n`;

    incorrectReviews.forEach((r, idx) => {
      mistakesSummary += `\n${idx + 1}. Question: "${r.questionText}"\nMy Answer: ${r.studentAnswer || 'Skipped'}, Correct Answer: ${r.correctAnswer}\nConcept: ${r.concept}\nExplanation: ${r.explanation}\n`;
    });

    mistakesSummary += `\nPlease explain these concepts to me simply and help me understand where I went wrong.`;
    onNavigateToAskAiWithMistakes(mistakesSummary);
  };

  const breadcrumbItems = [
    { label: attempt.classLevel, onClick: () => onNavigate('subjects') },
    { label: subject.name, onClick: () => onNavigate('chapters') },
    { label: `Ch ${chapter.chapterNumber}`, onClick: () => onNavigate('topics') },
    { label: topic.title, onClick: () => onNavigate('learn') },
    { label: 'Test Results' },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center gap-2">
          <button
            id="results-retake-top-btn"
            type="button"
            onClick={onRetakeTest}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retake Test</span>
          </button>
          <button
            id="results-dashboard-top-btn"
            type="button"
            onClick={onNavigateToDashboard}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Result Score Summary */}
      <TestResultSummary
        result={attempt.result}
        topicTitle={topic.title}
        difficulty={attempt.difficulty}
      />

      {/* AI Teacher Feedback Card */}
      <AiTestFeedbackCard
        feedback={attempt.aiFeedback}
        isLoading={isLoadingAiFeedback}
        onReviewMistakesWithAi={handleReviewWithAi}
        onLearnWeakTopics={onNavigateToLearnWithAi}
        onRetakeTest={onRetakeTest}
      />

      {/* Detailed Question Review */}
      <QuestionReview reviews={reviews} />

      {/* Action Footer Navigation */}
      <div className="bg-[#090f23]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-bold text-white">What would you like to do next?</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Continue mastering this topic or practice with a new question set.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Action 1: Review Mistakes with RDS AI */}
          <button
            id="action-review-mistakes-ai-btn"
            type="button"
            onClick={handleReviewWithAi}
            className="p-4 rounded-2xl bg-gradient-to-tr from-cyan-950/80 to-blue-950/60 border border-cyan-500/40 hover:border-cyan-400 text-left transition-all hover:-translate-y-0.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Bot className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-white group-hover:text-cyan-300">
              Review with RDS AI
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Chat through your incorrect questions with your AI tutor.
            </p>
          </button>

          {/* Action 2: Learn Weak Topics */}
          <button
            id="action-learn-weak-topics-btn"
            type="button"
            onClick={onNavigateToLearnWithAi}
            className="p-4 rounded-2xl bg-[#060a17] border border-slate-800 hover:border-blue-500/40 text-left transition-all hover:-translate-y-0.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-white group-hover:text-blue-300">
              Learn with AI
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Step-by-step notes and worked examples for this topic.
            </p>
          </button>

          {/* Action 3: Take Another Test */}
          <button
            id="action-take-another-test-btn"
            type="button"
            onClick={onRetakeTest}
            className="p-4 rounded-2xl bg-[#060a17] border border-slate-800 hover:border-purple-500/40 text-left transition-all hover:-translate-y-0.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-white group-hover:text-purple-300">
              Take Another Test
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Generate a fresh practice set with custom difficulty.
            </p>
          </button>

          {/* Action 4: Dashboard */}
          <button
            id="action-back-dashboard-btn"
            type="button"
            onClick={onNavigateToDashboard}
            className="p-4 rounded-2xl bg-[#060a17] border border-slate-800 hover:border-slate-700 text-left transition-all hover:-translate-y-0.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-white group-hover:text-slate-200">
              Back to Dashboard
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Return to your student dashboard overview.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
