import { AccountStatus, UserRole } from './auth';

export type AssignmentType = 'mcq' | 'written' | 'mixed';
export type AssignmentDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type AssignmentStatus = 'draft' | 'published' | 'closed' | 'archived';
export type StudentTargetMode = 'class' | 'selected_students';
export type SubmissionStatus = 'not_started' | 'in_progress' | 'submitted' | 'evaluated' | 'late';

export interface AssignmentQuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface AssignmentQuestion {
  id: string;
  type: 'mcq' | 'written';
  question: string;
  marks: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  // MCQ fields
  options?: AssignmentQuestionOption[];
  correctAnswer?: 'A' | 'B' | 'C' | 'D'; // Server-protected during taking
  explanation?: string; // Server-protected during taking
  concept?: string;
  // Written fields
  keyPoints?: string[]; // Server-protected during taking
  modelAnswer?: string; // Server-protected during taking
  evaluationCriteria?: string; // Server-protected during taking
  questionType?: 'short' | 'long';
}

export interface Assignment {
  id: string;
  teacherId: string;
  teacherName?: string;
  teacherEmail?: string;
  schoolId: string;
  schoolName?: string;
  classLevel: string;
  subjectId: string;
  subjectName?: string;
  chapterId: string;
  chapterNumber?: number;
  chapterTitle?: string;
  topicId: string;
  topicTitle?: string;
  title: string;
  description?: string;
  assignmentType: AssignmentType;
  difficulty: AssignmentDifficulty;
  questionCount: number;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  dueDate?: string;
  allowLateSubmission: boolean;
  studentTargetMode: StudentTargetMode;
  targetStudentIds?: string[];
  questions: AssignmentQuestion[];
  totalPossibleMarks: number;
  metadata?: Record<string, any>;
  // Computed statistics for teacher/principal views
  assignedCount?: number;
  startedCount?: number;
  submittedCount?: number;
  averageScore?: number;
  completionRate?: number;
  mySubmission?: AssignmentSubmission;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  schoolId: string;
  schoolName?: string;
  classLevel: string;
  subjectId: string;
  status: SubmissionStatus;
  startedAt?: string;
  submittedAt?: string;
  updatedAt: string;
  mcqScore?: number;
  mcqTotal?: number;
  writtenScore?: number;
  writtenTotal?: number;
  totalScore?: number;
  totalPossibleMarks?: number;
  percentage?: number;
  questionResponses: Record<string, {
    selectedOption?: string;
    writtenAnswer?: string;
    timeSpentSeconds?: number;
  }>;
  evaluationData?: {
    mcqResults?: Array<{
      questionId: string;
      question: string;
      selectedOption?: string;
      correctOption: string;
      isCorrect: boolean;
      explanation: string;
      concept?: string;
      marksAwarded: number;
      maxMarks: number;
    }>;
    writtenResults?: Array<{
      questionId: string;
      question: string;
      studentAnswer: string;
      score: number;
      maxMarks: number;
      percentage: number;
      accuracyLevel: string;
      strengths: string[];
      correctPoints: string[];
      missingPoints: string[];
      factualMistakes: string[];
      improvementTips: string[];
      teacherFeedback?: string;
      modelAnswer: string;
    }>;
    overallSummary?: string;
    strengths?: string[];
    areasToImprove?: string[];
  };
  teacherFeedback?: string;
  teacherReviewedAt?: string;
  teacherReviewedBy?: string;
  isLate: boolean;
  attemptNumber: number;
}

export interface PrincipalAssignmentAnalytics {
  schoolId: string;
  schoolName: string;
  totalAssignments: number;
  activeAssignments: number;
  totalSubmissions: number;
  averageCompletionRate: number;
  averageScore: number;
  overdueCount: number;
  classBreakdown: Array<{
    classLevel: string;
    totalAssignments: number;
    completionRate: number;
    averageScore: number;
  }>;
  subjectBreakdown: Array<{
    subjectId: string;
    subjectName: string;
    totalAssignments: number;
    completionRate: number;
    averageScore: number;
  }>;
  lowCompletionClasses: Array<{
    classLevel: string;
    completionRate: number;
    pendingCount: number;
  }>;
  strugglingTopics: Array<{
    topicId: string;
    topicTitle: string;
    subjectName: string;
    averageScore: number;
    attemptsCount: number;
  }>;
}

export interface AdminAssignmentAnalytics {
  totalAssignments: number;
  activeAssignments: number;
  totalSubmissions: number;
  averageCompletionRate: number;
  averageScore: number;
  schoolComparison: Array<{
    schoolId: string;
    schoolName: string;
    totalAssignments: number;
    submissionsCount: number;
    completionRate: number;
    averageScore: number;
  }>;
  topActiveSchools: Array<{
    schoolId: string;
    schoolName: string;
    assignmentsCount: number;
  }>;
  subjectActivity: Array<{
    subjectId: string;
    subjectName: string;
    assignmentsCount: number;
    submissionsCount: number;
    averageScore: number;
  }>;
  platformStrugglingTopics: Array<{
    topicId: string;
    topicTitle: string;
    subjectName: string;
    averageScore: number;
    submissionsCount: number;
  }>;
}

// Aliases for cross-module compatibility
export type DbAssignment = Assignment;
export type DbAssignmentQuestion = AssignmentQuestion;
export type DbAssignmentSubmission = AssignmentSubmission;

export interface TeacherAssignmentStats {
  totalAssignments: number;
  activeCount: number;
  totalSubmissions: number;
  averageCompletionRate: number;
  averageScore: number;
}

export interface StudentAssignmentItem {
  id: string;
  title: string;
  description?: string;
  assignmentType: AssignmentType;
  difficulty: AssignmentDifficulty;
  questionCount: number;
  totalPossibleMarks: number;
  classLevel: string;
  subjectId: string;
  subjectName?: string;
  chapterTitle?: string;
  topicTitle?: string;
  teacherName?: string;
  dueDate?: string;
  allowLateSubmission: boolean;
  status: AssignmentStatus;
  submissionStatus: SubmissionStatus;
  submissionId?: string;
  score?: number;
  percentage?: number;
  isLate?: boolean;
  /** Latest submission snapshot returned by the student assignments API */
  mySubmission?: {
    percentage?: number;
    teacherFeedback?: string;
  };
}

