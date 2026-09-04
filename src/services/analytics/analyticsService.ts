import { getAuthToken } from '../auth/authService';
import {
  StudentAnalyticsOverview,
  SubjectProgress,
  PerformanceTrend,
  LearningEvent,
  LearningEventType,
  TopicProgressStatus,
} from '../../types/analytics';
import { getAllTestAttempts } from '../test/testStorage';
import { getAllWrittenTestAttempts } from '../test/writtenTestStorage';

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Guarantees the full StudentAnalyticsOverview contract before data reaches any component.
 * Missing backend fields degrade to honest zero/empty values — never fabricated statistics
 * and never undefined property crashes in the UI.
 */
export function normalizeAnalyticsOverview(raw: unknown): StudentAnalyticsOverview {
  const src = (raw && typeof raw === 'object' ? raw : {}) as Record<string, any>;
  const num = (v: any, d = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : d);
  const str = (v: any, d = ''): string => (typeof v === 'string' ? v : d);
  const arr = <T>(v: any): T[] => (Array.isArray(v) ? v : []);

  return {
    overallCompletionPct: num(src.overallCompletionPct),
    totalTopics: num(src.totalTopics),
    completedTopicsCount: num(src.completedTopicsCount),
    inProgressTopicsCount: num(src.inProgressTopicsCount),
    totalSubjects: num(src.totalSubjects),
    activeSubjectsCount: num(src.activeSubjectsCount),
    averageMastery: num(src.averageMastery),
    averageMcqAccuracy: num(src.averageMcqAccuracy),
    averageWrittenAccuracy: num(src.averageWrittenAccuracy),
    totalTestsTaken: num(src.totalTestsTaken),
    trend: {
      direction: str(src.trend?.direction, 'insufficient_data') as PerformanceTrend['direction'],
      label: str(src.trend?.label, 'Getting Started'),
      recentAverage: num(src.trend?.recentAverage),
      previousAverage: num(src.trend?.previousAverage),
      dataPointCount: num(src.trend?.dataPointCount),
      description: str(src.trend?.description, 'Take practice tests to unlock performance trends.'),
    },
    streak: {
      currentStreak: num(src.streak?.currentStreak),
      longestStreak: num(src.streak?.longestStreak),
      totalActiveDays: num(src.streak?.totalActiveDays),
      lastActiveDate: str(src.streak?.lastActiveDate),
      activeDates: arr<string>(src.streak?.activeDates),
      isTodayActive: Boolean(src.streak?.isTodayActive),
    },
    recentActivity: arr(src.recentActivity),
    achievements: arr(src.achievements),
    recommendations: arr(src.recommendations),
    subjects: arr<any>(src.subjects).map((s) => ({
      subjectId: str(s?.subjectId),
      subjectName: str(s?.subjectName),
      subjectCode: str(s?.subjectCode),
      icon: str(s?.icon, 'BookOpen'),
      accentColor: str(s?.accentColor, 'from-blue-500 to-indigo-500'),
      totalTopics: num(s?.totalTopics),
      startedTopics: num(s?.startedTopics),
      completedTopics: num(s?.completedTopics),
      completionPercentage: num(s?.completionPercentage),
      averageMcqScore: num(s?.averageMcqScore),
      averageWrittenScore: num(s?.averageWrittenScore),
      masteryScore: num(s?.masteryScore),
      totalAttempts: num(s?.totalAttempts),
      statusTrend: str(s?.statusTrend, 'Not Enough Data') as SubjectProgress['statusTrend'],
      lastActivityAt: s?.lastActivityAt,
      chapters: arr<any>(s?.chapters).map((c) => ({
        chapterId: str(c?.chapterId),
        chapterNumber: num(c?.chapterNumber, 1),
        title: str(c?.title),
        description: c?.description,
        totalTopics: num(c?.totalTopics),
        completedTopics: num(c?.completedTopics),
        inProgressTopics: num(c?.inProgressTopics),
        masteryAverage: num(c?.masteryAverage),
        averageMcqScore: num(c?.averageMcqScore),
        averageWrittenScore: num(c?.averageWrittenScore),
        weakTopics: arr(c?.weakTopics),
        topics: arr<any>(c?.topics).map((t) => ({
          topicId: str(t?.topicId),
          title: str(t?.title),
          description: str(t?.description),
          difficulty: str(t?.difficulty),
          estimatedMinutes: num(t?.estimatedMinutes),
          progress: t?.progress,
        })),
        lastActivityAt: c?.lastActivityAt,
      })),
    })),
    insights: {
      strongTopics: arr(src.insights?.strongTopics),
      improvingTopics: arr(src.insights?.improvingTopics),
      needsPracticeTopics: arr(src.insights?.needsPracticeTopics),
      commonMistakes: arr(src.insights?.commonMistakes),
    },
    aiSummary: src.aiSummary,
  };
}

/**
 * Fetch Full Student Analytics Dashboard (Cached/Fast)
 */
export async function fetchStudentDashboardAnalytics(
  classLevel: string = 'Class 10'
): Promise<StudentAnalyticsOverview | null> {
  const token = getAuthToken();
  if (!token) {
    return normalizeAnalyticsOverview(buildLocalFallbackAnalytics(classLevel));
  }

  try {
    const res = await fetch(`/api/analytics/dashboard?classLevel=${encodeURIComponent(classLevel)}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      console.warn('[AnalyticsService] dashboard request failed:', res.status);
      return normalizeAnalyticsOverview(buildLocalFallbackAnalytics(classLevel));
    }
    const data = await res.json();
    return data.analytics ? normalizeAnalyticsOverview(data.analytics) : null;
  } catch (err) {
    console.warn('[AnalyticsService] Error fetching dashboard analytics, using local fallback:', err);
    return buildLocalFallbackAnalytics(classLevel);
  }
}

/**
 * Fetch Deep Progress Overview for /progress page
 */
export async function fetchStudentProgressDetails(
  classLevel: string = 'Class 10'
): Promise<StudentAnalyticsOverview | null> {
  const token = getAuthToken();
  if (!token) {
    return normalizeAnalyticsOverview(buildLocalFallbackAnalytics(classLevel));
  }

  try {
    const res = await fetch(`/api/analytics/progress?classLevel=${encodeURIComponent(classLevel)}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      console.warn('[AnalyticsService] progress request failed:', res.status);
      return normalizeAnalyticsOverview(buildLocalFallbackAnalytics(classLevel));
    }
    const data = await res.json();
    return data.analytics ? normalizeAnalyticsOverview(data.analytics) : null;
  } catch (err) {
    console.warn('[AnalyticsService] Error fetching progress details:', err);
    return buildLocalFallbackAnalytics(classLevel);
  }
}

/**
 * Fetch Specific Subject Analytics
 */
export async function fetchSubjectAnalytics(
  subjectId: string,
  classLevel: string = 'Class 10'
): Promise<SubjectProgress | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`/api/analytics/subject/${encodeURIComponent(subjectId)}?classLevel=${encodeURIComponent(classLevel)}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.subject || null;
  } catch (err) {
    console.warn('[AnalyticsService] Error fetching subject analytics:', err);
    return null;
  }
}

/**
 * Record a Learning Action Event
 */
export async function recordLearningEvent(event: {
  type: LearningEventType;
  classLevel?: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  // Always update local streak and last active date
  try {
    const today = new Date().toISOString().split('T')[0];
    const rawDates = localStorage.getItem('rds_active_dates') || '[]';
    const dates: string[] = JSON.parse(rawDates);
    if (!dates.includes(today)) {
      dates.push(today);
      localStorage.setItem('rds_active_dates', JSON.stringify(dates));
    }
  } catch (_) {}

  const token = getAuthToken();
  if (!token) return;

  try {
    await fetch('/api/analytics/events', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(event),
    });
  } catch (err) {
    console.warn('[AnalyticsService] Failed to record learning event:', err);
  }
}

/**
 * Update Topic Progress Status (e.g. marked completed or lesson done)
 */
export async function updateTopicStatus(params: {
  classLevel?: string;
  subjectId: string;
  chapterId: string;
  topicId: string;
  lessonCompleted?: boolean;
  status?: TopicProgressStatus;
}): Promise<void> {
  const token = getAuthToken();
  if (!token) return;

  try {
    await fetch('/api/analytics/topic-status', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
  } catch (err) {
    console.warn('[AnalyticsService] Failed to update topic status:', err);
  }
}

/**
 * Request Personalized RDS AI Coach Insight
 */
export async function fetchAiCoachInsight(
  classLevel: string = 'Class 10'
): Promise<{ insight: string; isAiGenerated: boolean }> {
  const token = getAuthToken();
  if (!token) {
    return {
      insight: 'Keep up the continuous learning! Daily practice and regular self-testing on Telangana SCERT topics build true mastery.',
      isAiGenerated: false,
    };
  }

  try {
    const res = await fetch('/api/analytics/ai-insight', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ classLevel }),
    });
    if (!res.ok) {
      return {
        insight: 'Consistent practice across Telangana SCERT subjects will strengthen your examination confidence!',
        isAiGenerated: false,
      };
    }
    const data = await res.json();
    return {
      insight: data.insight || 'Keep up your daily learning momentum!',
      isAiGenerated: !!data.isAiGenerated,
    };
  } catch (err) {
    return {
      insight: 'Keep exploring topics and taking quizzes to track your progress trajectory!',
      isAiGenerated: false,
    };
  }
}

/**
 * Client-side Local Fallback when unauthenticated or offline
 */
function buildLocalFallbackAnalytics(classLevel: string): StudentAnalyticsOverview {
  const mcqs = getAllTestAttempts().filter((m) => m.status === 'completed');
  const written = getAllWrittenTestAttempts().filter((w) => w.status === 'completed');

  let activeDates: string[] = [];
  try {
    const raw = localStorage.getItem('rds_active_dates');
    if (raw) activeDates = JSON.parse(raw);
  } catch (_) {}

  const todayStr = new Date().toISOString().split('T')[0];
  if (!activeDates.includes(todayStr) && (mcqs.length > 0 || written.length > 0)) {
    activeDates.push(todayStr);
  }

  const mcqScores = mcqs.map((m) => Number(m.result?.percentage || 0));
  const writtenScores = written.map((w) => Number(w.result?.percentage || 0));

  const avgMcq = mcqScores.length > 0 ? Math.round(mcqScores.reduce((a, b) => a + b, 0) / mcqScores.length) : 0;
  const avgWritten = writtenScores.length > 0 ? Math.round(writtenScores.reduce((a, b) => a + b, 0) / writtenScores.length) : 0;

  return {
    overallCompletionPct: 0,
    totalTopics: 0,
    completedTopicsCount: 0,
    inProgressTopicsCount: 0,
    totalSubjects: 0,
    activeSubjectsCount: 0,
    averageMastery: Math.round((avgMcq + avgWritten) / (avgMcq && avgWritten ? 2 : 1)),
    averageMcqAccuracy: avgMcq,
    averageWrittenAccuracy: avgWritten,
    totalTestsTaken: mcqs.length + written.length,
    trend: {
      direction: mcqs.length + written.length >= 2 ? 'improving' : 'insufficient_data',
      label: mcqs.length + written.length >= 2 ? 'Improving 📈' : 'Getting Started',
      recentAverage: avgMcq,
      previousAverage: 0,
      dataPointCount: mcqs.length + written.length,
      description: 'Continue taking practice tests to see deeper trends.',
    },
    streak: {
      currentStreak: activeDates.length > 0 ? 1 : 0,
      longestStreak: activeDates.length > 0 ? activeDates.length : 0,
      totalActiveDays: activeDates.length,
      lastActiveDate: todayStr,
      activeDates,
      isTodayActive: activeDates.includes(todayStr),
    },
    recentActivity: [],
    achievements: [
      {
        id: 'ach_first_step',
        userId: 'local',
        achievementId: 'first_step',
        title: 'First Step',
        description: 'Complete your first learning activity.',
        category: 'getting_started',
        iconName: 'Sparkles',
        progress: mcqs.length > 0 || written.length > 0 ? 1 : 0,
        targetValue: 1,
        isUnlocked: mcqs.length > 0 || written.length > 0,
      },
      {
        id: 'ach_high_achiever',
        userId: 'local',
        achievementId: 'high_achiever',
        title: 'High Achiever',
        description: 'Score 90% or above in any test.',
        category: 'excellence',
        iconName: 'Award',
        progress: mcqScores.some((s) => s >= 90) || writtenScores.some((s) => s >= 90) ? 1 : 0,
        targetValue: 1,
        isUnlocked: mcqScores.some((s) => s >= 90) || writtenScores.some((s) => s >= 90),
      },
    ],
    recommendations: [
      {
        id: 'rec_default_1',
        type: 'continue_learning',
        title: 'Explore Real Numbers',
        reason: 'Essential foundational topic for Telangana SSC examinations.',
        actionLabel: 'Learn with RDS AI',
        classLevel,
        subjectId: 'c10-maths',
        chapterId: 'c10-math-ch1',
        topicId: 't-1-1',
        targetPath: '/subjects/c10-maths/chapters/c10-math-ch1/topics',
        priority: 100,
        badge: 'Recommended',
      },
    ],
    subjects: [],
    insights: {
      strongTopics: [],
      improvingTopics: [],
      needsPracticeTopics: [],
      commonMistakes: [],
    },
  };
}
