import React, { useState, useEffect, useCallback } from 'react';
import { Subject, Chapter, Topic } from '../types';
import { WrittenTestAttempt } from '../types/writtenTest';
import {
  getWrittenTestAttempt,
  saveWrittenTestAttempt,
  updateWrittenTestAnswer,
  updateWrittenTestCurrentIndex,
  completeWrittenTestAttempt,
} from '../services/test/writtenTestStorage';
import {
  evaluateAllWrittenAnswers,
  calculateWrittenTestResult,
  generateOverallFeedback,
  ProgressCallbackData,
} from '../services/test/answerEvaluationService';
import { WrittenTestProgressHeader } from '../components/written-test/WrittenTestProgressHeader';
import { WrittenTestQuestion } from '../components/written-test/WrittenTestQuestion';
import { AnswerEditor } from '../components/written-test/AnswerEditor';
import { WrittenQuestionNavigator } from '../components/written-test/WrittenQuestionNavigator';
import { SubmitWrittenTestDialog } from '../components/written-test/SubmitWrittenTestDialog';
import { EvaluationLoading } from '../components/written-test/EvaluationLoading';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface WrittenTestActiveScreenProps {
  testId: string;
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  onFinishTest: (testId: string) => void;
  onExitTest: () => void;
}

export const WrittenTestActiveScreen: React.FC<WrittenTestActiveScreenProps> = ({
  testId,
  subject,
  chapter,
  topic,
  onFinishTest,
  onExitTest,
}) => {
  const [attempt, setAttempt] = useState<WrittenTestAttempt | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationProgress, setEvaluationProgress] = useState<ProgressCallbackData | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  // Load attempt on mount
  useEffect(() => {
    const loaded = getWrittenTestAttempt(testId);
    if (loaded) {
      // If already completed, redirect directly to result screen
      if (loaded.status === 'completed') {
        onFinishTest(testId);
        return;
      }

      setAttempt(loaded);
      setAnswers(loaded.answers || {});
      setCurrentIndex(loaded.currentQuestionIndex || 0);
    }
  }, [testId, onFinishTest]);

  // Handle answer edit
  const handleAnswerChange = useCallback(
    (text: string) => {
      if (!attempt) return;
      const currentQ = attempt.questions[currentIndex];
      if (!currentQ) return;

      setAnswers((prev) => {
        const next = { ...prev, [currentQ.id]: text };
        updateWrittenTestAnswer(testId, currentQ.id, text);
        return next;
      });
    },
    [attempt, currentIndex, testId]
  );

  // Handle index change
  const handleSelectIndex = (idx: number) => {
    if (!attempt || idx < 0 || idx >= attempt.questions.length) return;
    setCurrentIndex(idx);
    updateWrittenTestCurrentIndex(testId, idx);
  };

  const handleNext = () => {
    if (!attempt || currentIndex >= attempt.questions.length - 1) return;
    handleSelectIndex(currentIndex + 1);
  };

  const handlePrevious = () => {
    if (!attempt || currentIndex <= 0) return;
    handleSelectIndex(currentIndex - 1);
  };

  const handleSkip = () => {
    handleNext();
  };

  // Submit test and trigger AI evaluation
  const handleConfirmSubmit = async () => {
    if (!attempt) return;
    setIsSubmitDialogOpen(false);
    setIsEvaluating(true);
    setEvalError(null);

    try {
      // 1. Lock attempt status
      attempt.status = 'evaluating';
      attempt.answers = answers;
      saveWrittenTestAttempt(attempt);

      // 2. Evaluate all answers (empty answers are skipped deterministically, answered ones evaluated with AI)
      const evaluations = await evaluateAllWrittenAnswers(
        attempt,
        subject,
        chapter,
        topic,
        (progress) => {
          setEvaluationProgress(progress);
        }
      );

      // 3. Programmatically calculate deterministic test score
      const result = calculateWrittenTestResult(attempt.questions, evaluations, answers);

      // 4. Generate overall pedagogical feedback
      setEvaluationProgress({
        currentIndex: attempt.questions.length,
        totalQuestions: attempt.questions.length,
        questionId: 'summary',
        stage: 'finalizing',
        statusText: 'Preparing comprehensive report & model answer comparisons...',
      });

      const overallFeedback = await generateOverallFeedback(attempt, evaluations, result);

      // 5. Complete and persist attempt
      completeWrittenTestAttempt(testId, evaluations, result, overallFeedback);

      // 6. Navigate to results
      onFinishTest(testId);
    } catch (err: any) {
      console.error('Evaluation failure:', err);
      setEvalError(err?.message || 'Encountered an issue during AI evaluation. Your answers are saved.');
      setIsEvaluating(false);
    }
  };

  if (!attempt) {
    return (
      <div className="min-h-screen bg-[#070b19] flex items-center justify-center p-4 text-slate-100">
        <div className="bg-[#090f23] border border-slate-800 rounded-2xl p-8 max-w-md text-center space-y-4">
          <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-lg font-bold">Loading Written Test...</h3>
        </div>
      </div>
    );
  }

  if (isEvaluating) {
    return (
      <div className="min-h-screen bg-[#070b19] text-slate-100">
        <EvaluationLoading
          progressData={evaluationProgress}
          totalQuestions={attempt.questions.length}
        />
      </div>
    );
  }

  const currentQuestion = attempt.questions[currentIndex];
  const currentAnswer = (currentQuestion && answers[currentQuestion.id]) || '';
  const answeredCount = Object.values(answers).filter((a) => typeof a === 'string' && a.trim().length > 0).length;

  return (
    <div id="written-test-active-screen" className="min-h-screen bg-[#070b19] pb-24 text-slate-100 flex flex-col justify-between">
      {/* Progress Top Header */}
      <WrittenTestProgressHeader
        topic={topic}
        subject={subject}
        chapter={chapter}
        currentIndex={currentIndex}
        totalQuestions={attempt.questions.length}
        answeredCount={answeredCount}
        onExit={onExitTest}
        onSubmitClick={() => setIsSubmitDialogOpen(true)}
        language={attempt.language}
      />

      {/* Main Examination Stage */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 w-full space-y-6">
        {/* Error Alert if evaluation failed */}
        {evalError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{evalError}</span>
            </div>
            <button
              onClick={handleConfirmSubmit}
              className="px-3 py-1 bg-rose-500 hover:bg-rose-400 text-white rounded-lg font-bold"
            >
              Retry Evaluation
            </button>
          </div>
        )}

        {/* Question Card */}
        {currentQuestion && (
          <WrittenTestQuestion
            question={currentQuestion}
            index={currentIndex}
            total={attempt.questions.length}
          />
        )}

        {/* Answer Editor Area */}
        {currentQuestion && (
          <AnswerEditor
            questionId={currentQuestion.id}
            initialAnswer={currentAnswer}
            maxMarks={currentQuestion.maxMarks}
            onAnswerChange={handleAnswerChange}
          />
        )}

        {/* Navigator and Palette */}
        <WrittenQuestionNavigator
          questions={attempt.questions}
          answers={answers}
          currentIndex={currentIndex}
          onSelectIndex={handleSelectIndex}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSkip={handleSkip}
          onSubmitClick={() => setIsSubmitDialogOpen(true)}
          language={attempt.language}
        />
      </main>

      {/* Submit Confirmation Dialog */}
      <SubmitWrittenTestDialog
        isOpen={isSubmitDialogOpen}
        totalQuestions={attempt.questions.length}
        answeredCount={answeredCount}
        onClose={() => setIsSubmitDialogOpen(false)}
        onConfirmSubmit={handleConfirmSubmit}
        language={attempt.language}
      />
    </div>
  );
};
