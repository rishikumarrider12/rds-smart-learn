import { TestAttempt, TestAnswerMap, TestResult, AiTestFeedbackData } from '../../types/test';
import { syncMcqAttemptToCloud } from '../cloud/cloudDataService';
import { recordLearningEvent } from '../analytics/analyticsService';

const ATTEMPTS_INDEX_KEY = 'rds_mcq_attempts_index_v1';
const ATTEMPT_PREFIX = 'rds_mcq_attempt_v1_';

/**
 * Get all test attempt IDs ordered by creation time desc
 */
export function getSavedAttemptIds(): string[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read attempts index:', err);
    return [];
  }
}

/**
 * Add an attempt ID to the attempts index
 */
function recordAttemptId(attemptId: string): void {
  try {
    const current = getSavedAttemptIds();
    if (!current.includes(attemptId)) {
      const updated = [attemptId, ...current].slice(0, 50); // Keep last 50
      localStorage.setItem(ATTEMPTS_INDEX_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.error('Failed to record attempt ID:', err);
  }
}

/**
 * Save an entire test attempt
 */
export function saveTestAttempt(attempt: TestAttempt): void {
  try {
    const key = `${ATTEMPT_PREFIX}${attempt.id}`;
    localStorage.setItem(key, JSON.stringify(attempt));
    recordAttemptId(attempt.id);

    // Sync to cloud asynchronously
    syncMcqAttemptToCloud(attempt).catch((e) => console.warn('Cloud sync error for MCQ attempt:', e));

    // Record learning event
    if (attempt.status === 'completed') {
      recordLearningEvent({
        type: 'mcq_completed',
        classLevel: attempt.classLevel,
        subjectId: attempt.subjectId,
        chapterId: attempt.chapterId,
        topicId: attempt.topicId,
        metadata: {
          attemptId: attempt.id,
          percentage: attempt.result?.percentage,
          score: attempt.result?.score,
          questionCount: attempt.questionCount,
        },
      });
    } else {
      recordLearningEvent({
        type: 'mcq_started',
        classLevel: attempt.classLevel,
        subjectId: attempt.subjectId,
        chapterId: attempt.chapterId,
        topicId: attempt.topicId,
        metadata: { attemptId: attempt.id },
      });
    }
  } catch (err) {
    console.error('Failed to save test attempt:', err);
  }
}

/**
 * Retrieve a test attempt by ID
 */
export function getTestAttempt(attemptId: string): TestAttempt | null {
  try {
    const key = `${ATTEMPT_PREFIX}${attemptId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: TestAttempt = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error(`Failed to load test attempt ${attemptId}:`, err);
    return null;
  }
}

/**
 * Get all saved test attempts
 */
export function getAllTestAttempts(): TestAttempt[] {
  const ids = getSavedAttemptIds();
  const attempts: TestAttempt[] = [];
  for (const id of ids) {
    const attempt = getTestAttempt(id);
    if (attempt) {
      attempts.push(attempt);
    }
  }
  return attempts;
}

/**
 * Update answers and question index during active test session
 * Won't modify if already completed (immutability rule)
 */
export function updateTestAnswers(
  attemptId: string,
  answers: TestAnswerMap,
  currentQuestionIndex: number
): TestAttempt | null {
  const attempt = getTestAttempt(attemptId);
  if (!attempt) return null;

  // Immutability: If already completed, do not allow modifying answers
  if (attempt.status === 'completed') {
    return attempt;
  }

  attempt.answers = { ...attempt.answers, ...answers };
  attempt.currentQuestionIndex = currentQuestionIndex;
  saveTestAttempt(attempt);
  return attempt;
}

/**
 * Mark test attempt as completed with deterministic evaluation result and optional AI feedback
 */
export function completeTestAttempt(
  attemptId: string,
  result: TestResult,
  aiFeedback?: AiTestFeedbackData
): TestAttempt | null {
  const attempt = getTestAttempt(attemptId);
  if (!attempt) return null;

  attempt.status = 'completed';
  attempt.completedAt = new Date().toISOString();
  attempt.result = result;
  if (aiFeedback) {
    attempt.aiFeedback = aiFeedback;
  }

  saveTestAttempt(attempt);
  return attempt;
}

/**
 * Update AI feedback on an existing completed attempt
 */
export function updateAttemptAiFeedback(
  attemptId: string,
  aiFeedback: AiTestFeedbackData
): TestAttempt | null {
  const attempt = getTestAttempt(attemptId);
  if (!attempt) return null;

  attempt.aiFeedback = aiFeedback;
  saveTestAttempt(attempt);
  return attempt;
}

/**
 * Get recent test attempts for a specific topic
 */
export function getRecentAttemptsForTopic(
  subjectId: string,
  chapterId: string,
  topicId: string
): TestAttempt[] {
  return getAllTestAttempts().filter(
    (a) => a.subjectId === subjectId && a.chapterId === chapterId && a.topicId === topicId
  );
}

/**
 * Clear test attempt
 */
export function deleteTestAttempt(attemptId: string): void {
  try {
    const key = `${ATTEMPT_PREFIX}${attemptId}`;
    localStorage.removeItem(key);
    const current = getSavedAttemptIds();
    const updated = current.filter((id) => id !== attemptId);
    localStorage.setItem(ATTEMPTS_INDEX_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error(`Failed to delete attempt ${attemptId}:`, err);
  }
}
