import { ClassLevel, Subject, Chapter, Topic } from './index';
import { LearningLanguage } from '../services/ai/aiTypes';

export type WrittenQuestionType = 'short' | 'long' | 'mixed';
export type WrittenDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed';
export type AccuracyLevel = 'Excellent' | 'Good' | 'Developing' | 'Needs Improvement';

export interface WrittenQuestion {
  id: string;
  question: string;
  questionType: 'short' | 'long';
  difficulty: 'easy' | 'medium' | 'hard';
  maxMarks: number;
  concept: string;
  keyPoints: string[];
  modelAnswer: string;
}

export type WrittenAnswerMap = Record<string, string>;

export interface AnswerEvaluation {
  questionId: string;
  score: number;
  maxMarks: number;
  percentage: number;
  accuracyLevel: AccuracyLevel;
  conceptualAccuracy: number; // 0 to 100
  strengths: string[];
  correctPoints: string[];
  missingPoints: string[];
  factualMistakes: string[];
  improvementTips: string[];
  teacherFeedback: string;
  modelAnswer: string;
  evaluatedAt: string;
  isPartialFailure?: boolean;
  isEmptyAnswer?: boolean;
}

export interface OverallWrittenFeedback {
  overallFeedback: string;
  strongAreas: string[];
  areasToImprove: string[];
  commonMistakes: string[];
  recommendedLearningActions: Array<{
    label: string;
    action: 'review_with_ai' | 'learn_topic' | 'retake_test' | 'dashboard';
    description?: string;
    targetConcept?: string;
  }>;
}

export interface WrittenTestResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  conceptualAccuracy: number;
  questionsAnswered: number;
  totalQuestions: number;
  performanceBadge: string;
  badgeColor: string;
  performanceMessage: string;
}

export interface WrittenTestAttempt {
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
  difficulty: WrittenDifficulty;
  questionType: WrittenQuestionType;
  questionCount: number;
  language: LearningLanguage;
  questions: WrittenQuestion[];
  answers: WrittenAnswerMap;
  evaluations: Record<string, AnswerEvaluation>;
  currentQuestionIndex: number;
  status: 'in-progress' | 'evaluating' | 'completed';
  result?: WrittenTestResult;
  aiOverallFeedback?: OverallWrittenFeedback;
}
