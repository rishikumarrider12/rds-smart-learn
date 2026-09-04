export type LearningEventType =
  | 'lesson_started'
  | 'lesson_completed'
  | 'ai_question_asked'
  | 'mcq_started'
  | 'mcq_completed'
  | 'written_test_started'
  | 'written_test_completed'
  | 'topic_completed'
  | 'revision_completed';

export interface LearningEvent {
  id: string;
  userId: string;
  type: LearningEventType;
  classLevel?: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type TopicProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface TopicProgress {
  id: string;
  userId: string;
  classLevel: string;
  subjectId: string;
  chapterId: string;
  topicId: string;
  status: TopicProgressStatus;
  lessonCompleted: boolean;
  mcqAttempts: number;
  writtenAttempts: number;
  bestMcqScore?: number;
  latestMcqScore?: number;
  previousBestMcqScore?: number;
  bestWrittenScore?: number;
  latestWrittenScore?: number;
  previousBestWrittenScore?: number;
  masteryScore: number;
  lastActivityAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface ChapterProgress {
  chapterId: string;
  chapterNumber: number;
  title: string;
  description?: string;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  masteryAverage: number;
  averageMcqScore: number;
  averageWrittenScore: number;
  weakTopics: Array<{ topicId: string; title: string; masteryScore: number }>;
  topics: Array<{
    topicId: string;
    title: string;
    description: string;
    difficulty: string;
    estimatedMinutes: number;
    progress?: TopicProgress;
  }>;
  lastActivityAt?: string;
}

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  icon: string;
  accentColor: string;
  totalTopics: number;
  startedTopics: number;
  completedTopics: number;
  completionPercentage: number;
  averageMcqScore: number;
  averageWrittenScore: number;
  masteryScore: number;
  totalAttempts: number;
  statusTrend: 'Improving 📈' | 'Stable →' | 'Needs More Practice ⚠️' | 'Not Enough Data';
  lastActivityAt?: string;
  chapters: ChapterProgress[];
}

export interface PerformanceTrend {
  direction: 'improving' | 'stable' | 'needs_practice' | 'insufficient_data';
  label: string;
  recentAverage: number;
  previousAverage: number;
  dataPointCount: number;
  description: string;
}

export interface StrongTopicItem {
  topicId: string;
  topicTitle: string;
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterTitle: string;
  masteryScore: number;
}

export interface ImprovingTopicItem {
  topicId: string;
  topicTitle: string;
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterTitle: string;
  delta: number;
  currentScore: number;
}

export interface NeedsPracticeTopicItem {
  topicId: string;
  topicTitle: string;
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterTitle: string;
  masteryScore: number;
  reason: string;
}

export interface MistakePatternItem {
  category: string;
  description: string;
  count: number;
  subjectId: string;
  chapterId: string;
  topicId: string;
  topicTitle: string;
  recommendedAction: {
    type: 'learn_ai' | 'mcq' | 'written';
    label: string;
  };
}

export interface StrengthWeaknessInsight {
  strongTopics: StrongTopicItem[];
  improvingTopics: ImprovingTopicItem[];
  needsPracticeTopics: NeedsPracticeTopicItem[];
  commonMistakes: MistakePatternItem[];
}

export type RecommendationType =
  | 'continue_learning'
  | 'practice_weak_topic'
  | 'revision'
  | 'challenge'
  | 'resume_test';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  reason: string;
  actionLabel: string;
  classLevel: string;
  subjectId: string;
  chapterId: string;
  topicId: string;
  targetPath: string;
  priority: number;
  badge: string;
}

export interface LearningStreak {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  activeDates: string[];  // List of YYYY-MM-DD
  isTodayActive: boolean;
}

export type AchievementCategory =
  | 'getting_started'
  | 'consistency'
  | 'practice'
  | 'excellence'
  | 'completion'
  | 'improvement';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  iconName: string;
  targetValue: number;
}

export interface StudentAchievement {
  id: string;
  userId: string;
  achievementId: string;
  title: string;
  description: string;
  category: AchievementCategory;
  iconName: string;
  unlockedAt?: string;
  progress: number;
  targetValue: number;
  isUnlocked: boolean;
}

export interface StudentAnalyticsOverview {
  overallCompletionPct: number;
  totalTopics: number;
  completedTopicsCount: number;
  inProgressTopicsCount: number;
  totalSubjects: number;
  activeSubjectsCount: number;
  averageMastery: number;
  averageMcqAccuracy: number;
  averageWrittenAccuracy: number;
  totalTestsTaken: number;
  trend: PerformanceTrend;
  streak: LearningStreak;
  recentActivity: LearningEvent[];
  achievements: StudentAchievement[];
  recommendations: Recommendation[];
  subjects: SubjectProgress[];
  insights: StrengthWeaknessInsight;
  aiSummary?: {
    text: string;
    generatedAt: string;
  };
}
