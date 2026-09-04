import { WrittenTestAttempt, AnswerEvaluation, WrittenTestResult, OverallWrittenFeedback } from '../../types/writtenTest';
import { syncWrittenAttemptToCloud } from '../cloud/cloudDataService';
import { recordLearningEvent } from '../analytics/analyticsService';

const WRITTEN_TEST_STORAGE_KEY = 'rds_written_test_attempts';

/**
 * Retrieve all written test attempts from localStorage
 */
export function getAllWrittenTestAttempts(): WrittenTestAttempt[] {
  try {
    const raw = localStorage.getItem(WRITTEN_TEST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load written test attempts from storage:', error);
    return [];
  }
}

/**
 * Retrieve a specific written test attempt by ID
 */
export function getWrittenTestAttempt(id: string): WrittenTestAttempt | null {
  const attempts = getAllWrittenTestAttempts();
  return attempts.find((a) => a.id === id) || null;
}

/**
 * Save or update a written test attempt in localStorage and sync with cloud
 */
export function saveWrittenTestAttempt(attempt: WrittenTestAttempt): void {
  try {
    const attempts = getAllWrittenTestAttempts();
    const existingIndex = attempts.findIndex((a) => a.id === attempt.id);

    if (existingIndex >= 0) {
      attempts[existingIndex] = attempt;
    } else {
      attempts.unshift(attempt);
    }

    // Keep up to 30 most recent test attempts
    const trimmed = attempts.slice(0, 30);
    localStorage.setItem(WRITTEN_TEST_STORAGE_KEY, JSON.stringify(trimmed));

    // Sync to cloud asynchronously
    syncWrittenAttemptToCloud(attempt).catch((e) => console.warn('Cloud sync error for written test attempt:', e));

    // Record analytics event
    if (attempt.status === 'completed') {
      recordLearningEvent({
        type: 'written_test_completed',
        classLevel: attempt.classLevel,
        subjectId: attempt.subjectId,
        chapterId: attempt.chapterId,
        topicId: attempt.topicId,
        metadata: {
          attemptId: attempt.id,
          percentage: attempt.result?.percentage,
          score: attempt.result?.totalScore,
          maxScore: attempt.result?.maxScore,
        },
      });
    } else {
      recordLearningEvent({
        type: 'written_test_started',
        classLevel: attempt.classLevel,
        subjectId: attempt.subjectId,
        chapterId: attempt.chapterId,
        topicId: attempt.topicId,
        metadata: { attemptId: attempt.id },
      });
    }
  } catch (error) {
    console.error('Failed to save written test attempt:', error);
  }
}

/**
 * Update an individual answer in storage immediately for auto-save
 */
export function updateWrittenTestAnswer(testId: string, questionId: string, answerText: string): void {
  const attempt = getWrittenTestAttempt(testId);
  if (!attempt) return;

  attempt.answers = {
    ...(attempt.answers || {}),
    [questionId]: answerText,
  };

  saveWrittenTestAttempt(attempt);
}

/**
 * Update current active question index
 */
export function updateWrittenTestCurrentIndex(testId: string, index: number): void {
  const attempt = getWrittenTestAttempt(testId);
  if (!attempt) return;

  attempt.currentQuestionIndex = index;
  saveWrittenTestAttempt(attempt);
}

/**
 * Save evaluation for a specific question
 */
export function saveAnswerEvaluation(testId: string, questionId: string, evaluation: AnswerEvaluation): void {
  const attempt = getWrittenTestAttempt(testId);
  if (!attempt) return;

  attempt.evaluations = {
    ...(attempt.evaluations || {}),
    [questionId]: evaluation,
  };

  saveWrittenTestAttempt(attempt);
}

/**
 * Complete and lock a written test attempt with results and overall AI feedback
 */
export function completeWrittenTestAttempt(
  testId: string,
  evaluations: Record<string, AnswerEvaluation>,
  result: WrittenTestResult,
  aiOverallFeedback?: OverallWrittenFeedback
): WrittenTestAttempt | null {
  const attempt = getWrittenTestAttempt(testId);
  if (!attempt) return null;

  attempt.status = 'completed';
  attempt.completedAt = new Date().toISOString();
  attempt.evaluations = evaluations;
  attempt.result = result;
  attempt.aiOverallFeedback = aiOverallFeedback;

  saveWrittenTestAttempt(attempt);
  return attempt;
}

/**
 * Delete a written test attempt
 */
export function deleteWrittenTestAttempt(id: string): void {
  try {
    const attempts = getAllWrittenTestAttempts().filter((a) => a.id !== id);
    localStorage.setItem(WRITTEN_TEST_STORAGE_KEY, JSON.stringify(attempts));
  } catch (error) {
    console.error('Failed to delete written test attempt:', error);
  }
}
