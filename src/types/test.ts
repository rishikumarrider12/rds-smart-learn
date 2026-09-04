import { ClassLevel, Subject, Chapter, Topic } from './index';
import { LearningLanguage } from '../services/ai/aiTypes';

export type TestDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed';

export type OptionId = 'A' | 'B' | 'C' | 'D';

export interface TestQuestionOption {
  id: OptionId;
  text: string;
}

export interface TestQuestion {
  id: string;
  question: string;
  options: TestQuestionOption[];
  correctAnswer: OptionId;
  explanation: string;
  concept: string;
}

/**
 * Stripped question representation for active test taking (omits answer key)
 */
export interface ClientQuestion {
  id: string;
  question: string;
  options: TestQuestionOption[];
  concept: string;
}

export type TestAnswerMap = Record<string, OptionId>;

export interface TestResult {
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  score: number;
  percentage: number;
  performanceMessage: string;
}

export interface RecommendedAction {
  label: string;
  action: 'review_with_ai' | 'learn_topic' | 'retake_test' | 'dashboard';
  description?: string;
}

export interface AiTestFeedbackData {
  overallFeedback: string;
  strengths: string[];
  areasToImprove: string[];
  mistakePatterns: string[];
  recommendedActions: RecommendedAction[];
}

export interface TestAttempt {
  id: string;
  studentId: string;
  studentName: string;
  createdAt: string;
  completedAt?: string;
  classLevel: ClassLevel;
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterTitle: string;
  topicId: string;
  topicTitle: string;
  difficulty: TestDifficulty;
  questionCount: number;
  language: LearningLanguage;
  questions: TestQuestion[];
  answers: TestAnswerMap;
  currentQuestionIndex: number;
  status: 'in-progress' | 'completed';
  result?: TestResult;
  aiFeedback?: AiTestFeedbackData;
}

export interface QuestionEvaluationReview {
  questionNumber: number;
  questionId: string;
  questionText: string;
  options: TestQuestionOption[];
  studentAnswer?: OptionId;
  correctAnswer: OptionId;
  isCorrect: boolean;
  isUnanswered: boolean;
  explanation: string;
  concept: string;
}
