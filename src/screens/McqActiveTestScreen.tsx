import React, { useState, useEffect, useMemo } from 'react';
import { Subject, Chapter, Topic, ClassLevel } from '../types';
import { TestAttempt, OptionId, TestAnswerMap, ClientQuestion } from '../types/test';
import { getTestAttempt, updateTestAnswers, completeTestAttempt } from '../services/test/testStorage';
import { calculateDeterministicResult } from '../services/test/mcqService';
import { TestProgressHeader } from '../components/test/TestProgressHeader';
import { McqQuestionCard } from '../components/test/McqQuestionCard';
import { QuestionPalette } from '../components/test/QuestionPalette';
import { SubmitTestDialog } from '../components/test/SubmitTestDialog';
import { 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  SkipForward, 
  RotateCcw, 
  AlertTriangle 
} from 'lucide-react';

interface McqActiveTestScreenProps {
  testId: string;
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  onExitTest: () => void;
  onTestCompleted: (testId: string) => void;
}

export const McqActiveTestScreen: React.FC<McqActiveTestScreenProps> = ({
  testId,
  subject,
  chapter,
  topic,
  onExitTest,
  onTestCompleted,
}) => {
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<TestAnswerMap>({});
  const [visitedIndices, setVisitedIndices] = useState<Set<number>>(new Set([0]));
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Restore test attempt on mount or refresh
  useEffect(() => {
    const loaded = getTestAttempt(testId);
    if (!loaded) {
      setLoadError('Test session not found. It may have expired or been cleared.');
      return;
    }

    if (loaded.status === 'completed') {
      // Completed tests are immutable and should view results directly
      onTestCompleted(testId);
      return;
    }

    setAttempt(loaded);
    setAnswers(loaded.answers || {});
    setCurrentIndex(loaded.currentQuestionIndex || 0);
    setVisitedIndices(new Set([0, loaded.currentQuestionIndex || 0]));
  }, [testId, onTestCompleted]);

  // Client-safe questions stripping answer key from memory view
  const clientQuestions: ClientQuestion[] = useMemo(() => {
    if (!attempt?.questions) return [];
    return attempt.questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      concept: q.concept,
    }));
  }, [attempt?.questions]);

  const questionIds = useMemo(() => {
    return clientQuestions.map((q) => q.id);
  }, [clientQuestions]);

  const currentQuestion = clientQuestions[currentIndex];
  const totalQuestions = clientQuestions.length;
  const answeredCount = Object.keys(answers).length;

  // Handle Option selection
  const handleSelectOption = (optionId: OptionId) => {
    if (!currentQuestion || !attempt || attempt.status === 'completed') return;

    const updatedAnswers: TestAnswerMap = {
      ...answers,
      [currentQuestion.id]: optionId,
    };
    setAnswers(updatedAnswers);

    // Persist answer immediately
    updateTestAnswers(testId, updatedAnswers, currentIndex);
  };

  // Clear answer for current question
  const handleClearAnswer = () => {
    if (!currentQuestion || !attempt || attempt.status === 'completed') return;

    const updatedAnswers: TestAnswerMap = { ...answers };
    delete updatedAnswers[currentQuestion.id];
    setAnswers(updatedAnswers);

    updateTestAnswers(testId, updatedAnswers, currentIndex);
  };

  // Navigation handlers
  const handleNavigateIndex = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < totalQuestions) {
      setCurrentIndex(newIndex);
      setVisitedIndices((prev) => new Set([...prev, newIndex]));
      updateTestAnswers(testId, answers, newIndex);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      handleNavigateIndex(currentIndex + 1);
    } else {
      setIsSubmitDialogOpen(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      handleNavigateIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    if (currentIndex < totalQuestions - 1) {
      handleNavigateIndex(currentIndex + 1);
    }
  };

  // Submit test and calculate deterministic score
  const handleConfirmSubmit = () => {
    if (!attempt || !attempt.questions) return;
    setIsSubmitting(true);

    // 1. Calculate deterministic evaluation using application logic
    const evaluatedResult = calculateDeterministicResult(attempt.questions, answers);

    // 2. Lock attempt as completed in storage
    completeTestAttempt(testId, evaluatedResult);

    setIsSubmitting(false);
    setIsSubmitDialogOpen(false);
    onTestCompleted(testId);
  };

  if (loadError) {
    return (
      <div className="w-full max-w-lg mx-auto py-16 px-4 text-center">
        <div className="bg-[#090f23] border border-slate-800 rounded-3xl p-8 space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Session Unavailable</h2>
          <p className="text-slate-400 text-sm">{loadError}</p>
          <button
            onClick={onExitTest}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm hover:bg-cyan-400 transition-all"
          >
            Back to Topics
          </button>
        </div>
      </div>
    );
  }

  if (!attempt || !currentQuestion) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#060a17] pb-16 flex flex-col justify-between">
      {/* Sticky Progress Header */}
      <TestProgressHeader
        classLevel={attempt.classLevel}
        subject={subject}
        chapter={chapter}
        topic={topic}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        onExitClick={onExitTest}
      />

      {/* Main Test Layout */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Question Card & Controls (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <McqQuestionCard
              questionNumber={currentIndex + 1}
              totalQuestions={totalQuestions}
              question={currentQuestion}
              selectedOption={answers[currentQuestion.id]}
              onSelectOption={handleSelectOption}
            />

            {/* Question Action Navigation Bar */}
            <div className="bg-[#090f23]/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  id="test-prev-btn"
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 font-semibold text-xs transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {answers[currentQuestion.id] && (
                  <button
                    id="test-clear-ans-btn"
                    type="button"
                    onClick={handleClearAnswer}
                    className="px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all flex items-center gap-1.5"
                    title="Clear selected option"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {currentIndex < totalQuestions - 1 && (
                  <button
                    id="test-skip-btn"
                    type="button"
                    onClick={handleSkip}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <span>Skip</span>
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                )}

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    id="test-next-btn"
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950/50 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    id="test-submit-trigger-btn"
                    type="button"
                    onClick={() => setIsSubmitDialogOpen(true)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Test</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Question Palette & Test Actions (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <QuestionPalette
              totalQuestions={totalQuestions}
              currentIndex={currentIndex}
              answers={answers}
              questionIds={questionIds}
              visitedIndices={visitedIndices}
              onSelectIndex={handleNavigateIndex}
            />

            {/* Quick Submit Block */}
            <div className="bg-[#090f23]/70 border border-slate-800/80 rounded-3xl p-5 space-y-3">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Test Progress</span>
                <span className="font-mono text-cyan-400 font-bold">{answeredCount}/{totalQuestions}</span>
              </div>

              <button
                id="sidebar-submit-test-btn"
                type="button"
                onClick={() => setIsSubmitDialogOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-cyan-400" />
                <span>Submit & Complete Test</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog before evaluation */}
      <SubmitTestDialog
        isOpen={isSubmitDialogOpen}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        onClose={() => setIsSubmitDialogOpen(false)}
        onConfirmSubmit={handleConfirmSubmit}
      />
    </div>
  );
};
