import {
  TopicProgress,
  ChapterProgress,
  SubjectProgress,
  PerformanceTrend,
  StrengthWeaknessInsight,
  Recommendation,
  LearningStreak,
  StudentAchievement,
  StudentAnalyticsOverview,
  AchievementDefinition,
} from '../src/types/analytics';
import { SYLLABUS_DATA } from '../src/data/syllabusData';
import { ClassLevel, ClassSyllabus } from '../src/types';
import {
  DbLearningEvent,
  DbTopicProgress,
  DbStudentAchievement,
  DbLearningStreak,
  DbMcqAttempt,
  DbWrittenAttempt,
  cloudDb,
} from './db';

// Master Achievement Registry (Fixed, extensible list of achievements)
export const ACHIEVEMENTS_REGISTRY: AchievementDefinition[] = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Complete your first learning activity (Lesson, MCQ, or Written Test).',
    category: 'getting_started',
    iconName: 'Sparkles',
    targetValue: 1,
  },
  {
    id: 'streak_3',
    title: '3-Day Learner',
    description: 'Maintain a 3-day continuous learning streak.',
    category: 'consistency',
    iconName: 'Flame',
    targetValue: 3,
  },
  {
    id: 'streak_7',
    title: 'Weekly Scholar',
    description: 'Maintain a 7-day continuous learning streak.',
    category: 'consistency',
    iconName: 'Flame',
    targetValue: 7,
  },
  {
    id: 'quiz_explorer',
    title: 'Quiz Explorer',
    description: 'Complete 5 MCQ practice tests.',
    category: 'practice',
    iconName: 'CheckSquare',
    targetValue: 5,
  },
  {
    id: 'written_master',
    title: 'Pen & Paper Pro',
    description: 'Complete 3 AI-evaluated written answer tests.',
    category: 'practice',
    iconName: 'PenTool',
    targetValue: 3,
  },
  {
    id: 'high_achiever',
    title: 'High Achiever',
    description: 'Score 90% or above in any completed test.',
    category: 'excellence',
    iconName: 'Award',
    targetValue: 1,
  },
  {
    id: 'topic_master',
    title: 'Topic Master',
    description: 'Reach 80% or higher mastery on any topic.',
    category: 'completion',
    iconName: 'GraduationCap',
    targetValue: 1,
  },
  {
    id: 'subject_explorer',
    title: 'Subject Explorer',
    description: 'Explore and practice topics across 3 different subjects.',
    category: 'completion',
    iconName: 'BookOpen',
    targetValue: 3,
  },
  {
    id: 'rising_star',
    title: 'Rising Star',
    description: 'Improve your score by 15% or more across attempts on the same topic.',
    category: 'improvement',
    iconName: 'TrendingUp',
    targetValue: 1,
  },
];

/**
 * Deterministic Mastery Score Calculation Formula (0 - 100)
 *
 * Weighting Breakdown:
 * 1. Learning Engagement / Completion (20%)
 *    - Topic marked completed or structured session done: 20 pts
 *    - In-progress / AI interaction: 10 pts
 * 2. MCQ Performance (35%)
 *    - Best MCQ percentage (15%) + Latest MCQ percentage (20%)
 * 3. Written Performance (35%)
 *    - Best Written percentage (15%) + Latest Written percentage (20%)
 * 4. Improvement & Practice Repetition (10%)
 *    - Repetition bonus (2+ attempts): 5 pts
 *    - Score improvement delta > 0: 5 pts
 *
 * Intelligent Dynamic Re-normalization:
 * If a student has only taken MCQs or only Written tests, test weight (70%)
 * is evaluated from the available test domain so students aren't unfairly penalized.
 */
export function calculateMasteryScore(params: {
  lessonCompleted: boolean;
  hasInteraction: boolean;
  mcqAttempts: number;
  bestMcqScore?: number;
  latestMcqScore?: number;
  previousBestMcqScore?: number;
  writtenAttempts: number;
  bestWrittenScore?: number;
  latestWrittenScore?: number;
  previousBestWrittenScore?: number;
}): number {
  const {
    lessonCompleted,
    hasInteraction,
    mcqAttempts,
    bestMcqScore,
    latestMcqScore,
    previousBestMcqScore,
    writtenAttempts,
    bestWrittenScore,
    latestWrittenScore,
    previousBestWrittenScore,
  } = params;

  // 1. Learning Component (20 max)
  let learningScore = 0;
  if (lessonCompleted) {
    learningScore = 20;
  } else if (hasInteraction || mcqAttempts > 0 || writtenAttempts > 0) {
    learningScore = 10;
  }

  // 2. Test Components Evaluation
  const hasMcq = mcqAttempts > 0 && typeof latestMcqScore === 'number';
  const hasWritten = writtenAttempts > 0 && typeof latestWrittenScore === 'number';

  let testScore = 0;

  if (hasMcq && hasWritten) {
    // Both available: 35% MCQ + 35% Written
    const mcqComponent = ((bestMcqScore || 0) * 0.15 + (latestMcqScore || 0) * 0.20);
    const writtenComponent = ((bestWrittenScore || 0) * 0.15 + (latestWrittenScore || 0) * 0.20);
    testScore = mcqComponent + writtenComponent; // Max 70
  } else if (hasMcq) {
    // Only MCQ taken: Scale 70% from MCQ
    const mcqComponent = ((bestMcqScore || 0) * 0.30 + (latestMcqScore || 0) * 0.40);
    testScore = mcqComponent; // Max 70
  } else if (hasWritten) {
    // Only Written taken: Scale 70% from Written
    const writtenComponent = ((bestWrittenScore || 0) * 0.30 + (latestWrittenScore || 0) * 0.40);
    testScore = writtenComponent; // Max 70
  }

  // 3. Practice & Improvement Bonus (10 max)
  let practiceBonus = 0;
  const totalAttempts = mcqAttempts + writtenAttempts;
  if (totalAttempts >= 2) {
    practiceBonus += 5; // Repetition bonus
  }

  // Genuine Improvement Check (Max +5 bonus):
  // Compare the latest attempt against the highest score from attempts that occurred before the latest attempt
  let isImproved = false;
  if (hasMcq && typeof latestMcqScore === 'number' && mcqAttempts >= 2) {
    if (typeof previousBestMcqScore === 'number') {
      if (latestMcqScore > previousBestMcqScore) {
        isImproved = true;
      }
    }
  }

  if (hasWritten && typeof latestWrittenScore === 'number' && writtenAttempts >= 2) {
    if (typeof previousBestWrittenScore === 'number') {
      if (latestWrittenScore > previousBestWrittenScore) {
        isImproved = true;
      }
    }
  }

  if (isImproved) {
    practiceBonus += 5;
  }

  const rawMastery = learningScore + testScore + practiceBonus;
  return Math.min(100, Math.max(0, Math.round(rawMastery)));
}

/**
 * Deterministic Streak Calculator from a set of activity dates (YYYY-MM-DD)
 */
export function calculateStreakFromDates(dates: string[]): {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActiveDate: string;
  isTodayActive: boolean;
} {
  if (!dates || dates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      lastActiveDate: '',
      isTodayActive: false,
    };
  }

  // Unique sorted dates ascending
  const uniqueDates = Array.from(new Set(dates)).sort();
  const totalActiveDays = uniqueDates.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const lastActiveDate = uniqueDates[uniqueDates.length - 1];
  const isTodayActive = uniqueDates.includes(todayStr);

  // Calculate longest streak
  let longestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentRun += 1;
      if (currentRun > longestStreak) {
        longestStreak = currentRun;
      }
    } else if (diffDays > 1) {
      currentRun = 1;
    }
  }

  // Calculate current streak
  let currentStreak = 0;
  if (lastActiveDate === todayStr || lastActiveDate === yesterdayStr) {
    currentStreak = 1;
    for (let i = uniqueDates.length - 1; i > 0; i--) {
      const curr = new Date(uniqueDates[i]);
      const prev = new Date(uniqueDates[i - 1]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalActiveDays,
    lastActiveDate,
    isTodayActive,
  };
}

/**
 * Calculates Performance Trend from historical test attempts
 */
export function calculateTrendFromAttempts(
  mcqAttempts: DbMcqAttempt[],
  writtenAttempts: DbWrittenAttempt[]
): PerformanceTrend {
  // Extract all completed test scores sorted chronologically
  const scoredItems: Array<{ percentage: number; date: string }> = [];

  for (const m of mcqAttempts) {
    if (m.status === 'completed' && m.data?.result?.percentage !== undefined) {
      scoredItems.push({
        percentage: Number(m.data.result.percentage),
        date: m.createdAt,
      });
    }
  }

  for (const w of writtenAttempts) {
    if (w.status === 'completed' && w.data?.result?.percentage !== undefined) {
      scoredItems.push({
        percentage: Number(w.data.result.percentage),
        date: w.createdAt,
      });
    }
  }

  scoredItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (scoredItems.length < 2) {
    const singleScore = scoredItems.length === 1 ? scoredItems[0].percentage : 0;
    return {
      direction: 'insufficient_data',
      label: scoredItems.length === 1 ? 'Starting Out' : 'No Test Data Yet',
      recentAverage: singleScore,
      previousAverage: 0,
      dataPointCount: scoredItems.length,
      description:
        scoredItems.length === 1
          ? 'Complete a few more tests to establish your learning performance trend.'
          : 'Take practice quizzes or written tests to begin tracking your performance trajectory.',
    };
  }

  // Split into recent half and earlier half
  const mid = Math.floor(scoredItems.length / 2);
  const earlier = scoredItems.slice(0, mid);
  const recent = scoredItems.slice(mid);

  const prevAvg = Math.round(earlier.reduce((acc, x) => acc + x.percentage, 0) / earlier.length);
  const recAvg = Math.round(recent.reduce((acc, x) => acc + x.percentage, 0) / recent.length);
  const delta = recAvg - prevAvg;

  if (delta >= 5) {
    return {
      direction: 'improving',
      label: 'Improving 📈',
      recentAverage: recAvg,
      previousAverage: prevAvg,
      dataPointCount: scoredItems.length,
      description: `Your average score rose from ${prevAvg}% to ${recAvg}%. Great momentum!`,
    };
  } else if (delta <= -8) {
    return {
      direction: 'needs_practice',
      label: 'Needs More Practice ⚠️',
      recentAverage: recAvg,
      previousAverage: prevAvg,
      dataPointCount: scoredItems.length,
      description: `Recent scores average ${recAvg}%. Review key concepts with RDS AI to boost understanding.`,
    };
  } else {
    return {
      direction: 'stable',
      label: 'Stable →',
      recentAverage: recAvg,
      previousAverage: prevAvg,
      dataPointCount: scoredItems.length,
      description: `Consistent performance averaging ${recAvg}%. Challenge yourself with advanced questions!`,
    };
  }
}

/**
 * Extracts Common Mistake Patterns from MCQ and Written Test Results
 */
export function extractMistakePatterns(
  mcqAttempts: DbMcqAttempt[],
  writtenAttempts: DbWrittenAttempt[],
  syllabus: ClassSyllabus
): StrengthWeaknessInsight['commonMistakes'] {
  const categoryCounts: Record<
    string,
    {
      category: string;
      description: string;
      count: number;
      subjectId: string;
      chapterId: string;
      topicId: string;
      topicTitle: string;
    }
  > = {};

  // 1. MCQ Mistakes
  for (const m of mcqAttempts) {
    if (m.status === 'completed' && m.data?.result?.questions) {
      const questions = m.data.result.questions;
      for (const q of questions) {
        if (!q.isCorrect) {
          const cat = q.mistakeCategory || 'Concept Application';
          const key = `${cat}_${m.subjectId}_${m.topicId}`;
          if (!categoryCounts[key]) {
            categoryCounts[key] = {
              category: cat,
              description: q.explanation
                ? `Review core principles: ${q.explanation.substring(0, 100)}...`
                : `Needs focused review in ${m.data.topicTitle || 'topic concepts'}`,
              count: 0,
              subjectId: m.subjectId,
              chapterId: m.chapterId,
              topicId: m.topicId,
              topicTitle: m.data.topicTitle || 'Topic',
            };
          }
          categoryCounts[key].count += 1;
        }
      }
    }
  }

  // 2. Written Mistakes
  for (const w of writtenAttempts) {
    if (w.status === 'completed' && w.data?.result?.evaluations) {
      const evals = w.data.result.evaluations;
      for (const ev of evals) {
        if (ev.missingPoints && ev.missingPoints.length > 0) {
          const cat = 'Incomplete Concept Details';
          const key = `${cat}_${w.subjectId}_${w.topicId}`;
          if (!categoryCounts[key]) {
            categoryCounts[key] = {
              category: cat,
              description: `Include key definition points: ${ev.missingPoints[0]}`,
              count: 0,
              subjectId: w.subjectId,
              chapterId: w.chapterId,
              topicId: w.topicId,
              topicTitle: w.data.topicTitle || 'Topic',
            };
          }
          categoryCounts[key].count += 1;
        }
        if (ev.mistakes && ev.mistakes.length > 0) {
          const cat = 'Conceptual Accuracy';
          const key = `${cat}_${w.subjectId}_${w.topicId}`;
          if (!categoryCounts[key]) {
            categoryCounts[key] = {
              category: cat,
              description: ev.mistakes[0],
              count: 0,
              subjectId: w.subjectId,
              chapterId: w.chapterId,
              topicId: w.topicId,
              topicTitle: w.data.topicTitle || 'Topic',
            };
          }
          categoryCounts[key].count += 1;
        }
      }
    }
  }

  return Object.values(categoryCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map((item) => ({
      ...item,
      recommendedAction: {
        type: item.category.includes('Written') ? 'written' : 'learn_ai',
        label: `Learn with RDS AI in ${item.topicTitle}`,
      },
    }));
}

/**
 * Generates Deterministic Personalized Recommendations
 */
export function generateStudentRecommendations(params: {
  classLevel: string;
  syllabus: ClassSyllabus;
  topicProgressList: DbTopicProgress[];
  recentEvents: DbLearningEvent[];
}): Recommendation[] {
  const { classLevel, syllabus, topicProgressList, recentEvents } = params;
  const recommendations: Recommendation[] = [];

  // Map progress by topicId
  const progressMap = new Map<string, DbTopicProgress>();
  for (const tp of topicProgressList) {
    progressMap.set(tp.topicId, tp);
  }

  // 1. Priority 1: In-Progress / Last active topic (Continue Learning)
  const inProgressTopics = topicProgressList
    .filter((tp) => tp.status === 'in_progress' || (tp.masteryScore > 0 && tp.masteryScore < 80 && !tp.lessonCompleted))
    .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());

  if (inProgressTopics.length > 0) {
    const topInProg = inProgressTopics[0];
    const subj = syllabus.subjects.find((s) => s.id === topInProg.subjectId);
    const chap = subj?.chapters.find((c) => c.id === topInProg.chapterId);
    const top = chap?.topics.find((t) => t.id === topInProg.topicId);

    if (subj && chap && top) {
      recommendations.push({
        id: `rec_cont_${top.id}`,
        type: 'continue_learning',
        title: `Continue: ${top.title}`,
        reason: `You were actively learning this in ${subj.name}. Finish the lesson to build mastery.`,
        actionLabel: 'Resume Topic',
        classLevel,
        subjectId: subj.id,
        chapterId: chap.id,
        topicId: top.id,
        targetPath: `/subjects/${subj.id}/chapters/${chap.id}/topics`,
        priority: 100,
        badge: 'In Progress',
      });
    }
  }

  // 2. Priority 2: Needs Practice (Mastery < 60% with at least 1 attempt)
  const weakTopics = topicProgressList
    .filter((tp) => (tp.mcqAttempts > 0 || tp.writtenAttempts > 0) && tp.masteryScore < 60)
    .sort((a, b) => a.masteryScore - b.masteryScore);

  if (weakTopics.length > 0) {
    const weak = weakTopics[0];
    const subj = syllabus.subjects.find((s) => s.id === weak.subjectId);
    const chap = subj?.chapters.find((c) => c.id === weak.chapterId);
    const top = chap?.topics.find((t) => t.id === weak.topicId);

    if (subj && chap && top) {
      recommendations.push({
        id: `rec_practice_${top.id}`,
        type: 'practice_weak_topic',
        title: `Practice: ${top.title}`,
        reason: `Your current mastery is ${weak.masteryScore}%. Taking a quick practice test will strengthen your concepts.`,
        actionLabel: 'Take Practice Test',
        classLevel,
        subjectId: subj.id,
        chapterId: chap.id,
        topicId: top.id,
        targetPath: `/test/mcq/setup`,
        priority: 90,
        badge: 'Practice Recommended',
      });
    }
  }

  // 3. Priority 3: Challenge High Mastery Topic (Mastery >= 80)
  const masteredTopics = topicProgressList
    .filter((tp) => tp.masteryScore >= 80)
    .sort((a, b) => b.masteryScore - a.masteryScore);

  if (masteredTopics.length > 0) {
    const strong = masteredTopics[0];
    const subj = syllabus.subjects.find((s) => s.id === strong.subjectId);
    const chap = subj?.chapters.find((c) => c.id === strong.chapterId);
    const top = chap?.topics.find((t) => t.id === strong.topicId);

    if (subj && chap && top) {
      recommendations.push({
        id: `rec_challenge_${top.id}`,
        type: 'challenge',
        title: `Challenge: ${top.title}`,
        reason: `You have strong ${strong.masteryScore}% mastery here! Try a comprehensive written answer test to test in-depth explanation.`,
        actionLabel: 'Try Written Test',
        classLevel,
        subjectId: subj.id,
        chapterId: chap.id,
        topicId: top.id,
        targetPath: `/test/written/setup`,
        priority: 70,
        badge: 'High Mastery',
      });
    }
  }

  // 4. Fallback if new student: Recommend Chapter 1 Topic 1 of Subject 1
  if (recommendations.length === 0 && syllabus.subjects.length > 0) {
    const firstSubj = syllabus.subjects[0];
    const firstChap = firstSubj.chapters[0];
    const firstTop = firstChap?.topics[0];

    if (firstSubj && firstChap && firstTop) {
      recommendations.push({
        id: `rec_start_${firstTop.id}`,
        type: 'continue_learning',
        title: `Start with ${firstTop.title}`,
        reason: `Begin your ${firstSubj.name} journey with Telangana SCERT foundation topics.`,
        actionLabel: 'Start Learning',
        classLevel,
        subjectId: firstSubj.id,
        chapterId: firstChap.id,
        topicId: firstTop.id,
        targetPath: `/subjects/${firstSubj.id}/chapters/${firstChap.id}/topics`,
        priority: 100,
        badge: 'Recommended First Step',
      });
    }
  }

  return recommendations.slice(0, 4);
}

/**
 * Builds Full Aggregated Student Analytics Overview
 */
export function buildStudentAnalyticsOverview(userId: string, classLevelStr?: string): StudentAnalyticsOverview {
  const user = cloudDb.findUserById(userId);
  const classLevel: ClassLevel = ((classLevelStr || user?.classLevel || 'Class 10') as ClassLevel);
  const syllabus = SYLLABUS_DATA[classLevel] || SYLLABUS_DATA['Class 10'];

  // Retrieve user data from DB
  const topicProgressList = cloudDb.getAllTopicProgress(userId, classLevel);
  const progressMap = new Map<string, DbTopicProgress>();
  for (const tp of topicProgressList) {
    progressMap.set(tp.topicId, tp);
  }

  const mcqAttempts = cloudDb.getMcqAttempts(userId);
  const writtenAttempts = cloudDb.getWrittenAttempts(userId);
  const rawEvents = cloudDb.getLearningEvents(userId, 30);
  const streakDb = cloudDb.getStudentStreak(userId);
  const unlockedAchDb = cloudDb.getStudentAchievements(userId);

  // 1. Build Subjects & Chapters Hierarchy
  let totalTopics = 0;
  let totalStartedTopics = 0;
  let totalCompletedTopics = 0;
  let totalMasterySum = 0;

  const subjectsProgress: SubjectProgress[] = syllabus.subjects.map((subj) => {
    let subjTopicsCount = 0;
    let subjStartedCount = 0;
    let subjCompletedCount = 0;
    let subjMasterySum = 0;
    let subjMcqScores: number[] = [];
    let subjWrittenScores: number[] = [];
    let subjLastActivity: string | undefined = undefined;

    const chaptersProgress: ChapterProgress[] = subj.chapters.map((chap) => {
      let chapCompletedCount = 0;
      let chapStartedCount = 0;
      let chapMasterySum = 0;
      let chapMcqScores: number[] = [];
      let chapWrittenScores: number[] = [];
      const weakTopics: Array<{ topicId: string; title: string; masteryScore: number }> = [];

      const topicsWithProgress = chap.topics.map((top) => {
        subjTopicsCount += 1;
        totalTopics += 1;

        const tp = progressMap.get(top.id);
        if (tp) {
          if (tp.status === 'completed' || tp.masteryScore >= 80) {
            chapCompletedCount += 1;
            subjCompletedCount += 1;
            totalCompletedTopics += 1;
          } else if (tp.status === 'in_progress' || tp.masteryScore > 0) {
            chapStartedCount += 1;
            subjStartedCount += 1;
            totalStartedTopics += 1;
          }

          chapMasterySum += tp.masteryScore;
          subjMasterySum += tp.masteryScore;
          totalMasterySum += tp.masteryScore;

          if (typeof tp.latestMcqScore === 'number') {
            chapMcqScores.push(tp.latestMcqScore);
            subjMcqScores.push(tp.latestMcqScore);
          }
          if (typeof tp.latestWrittenScore === 'number') {
            chapWrittenScores.push(tp.latestWrittenScore);
            subjWrittenScores.push(tp.latestWrittenScore);
          }

          if ((tp.mcqAttempts > 0 || tp.writtenAttempts > 0) && tp.masteryScore < 60) {
            weakTopics.push({
              topicId: top.id,
              title: top.title,
              masteryScore: tp.masteryScore,
            });
          }

          if (tp.lastActivityAt) {
            if (!subjLastActivity || new Date(tp.lastActivityAt) > new Date(subjLastActivity)) {
              subjLastActivity = tp.lastActivityAt;
            }
          }

          return {
            topicId: top.id,
            title: top.title,
            description: top.description,
            difficulty: top.difficulty,
            estimatedMinutes: top.estimatedMinutes,
            progress: {
              ...tp,
              status: (tp.status as any),
            },
          };
        }

        return {
          topicId: top.id,
          title: top.title,
          description: top.description,
          difficulty: top.difficulty,
          estimatedMinutes: top.estimatedMinutes,
        };
      });

      const chapTopicCount = chap.topics.length || 1;
      const chapAvgMastery = Math.round(chapMasterySum / chapTopicCount);
      const chapAvgMcq =
        chapMcqScores.length > 0
          ? Math.round(chapMcqScores.reduce((a, b) => a + b, 0) / chapMcqScores.length)
          : 0;
      const chapAvgWritten =
        chapWrittenScores.length > 0
          ? Math.round(chapWrittenScores.reduce((a, b) => a + b, 0) / chapWrittenScores.length)
          : 0;

      return {
        chapterId: chap.id,
        chapterNumber: chap.chapterNumber,
        title: chap.title,
        description: chap.description,
        totalTopics: chap.topics.length,
        completedTopics: chapCompletedCount,
        inProgressTopics: chapStartedCount,
        masteryAverage: chapAvgMastery,
        averageMcqScore: chapAvgMcq,
        averageWrittenScore: chapAvgWritten,
        weakTopics,
        topics: topicsWithProgress,
      };
    });

    const subjTopicCount = subjTopicsCount || 1;
    const subjAvgMastery = Math.round(subjMasterySum / subjTopicCount);
    const subjAvgMcq =
      subjMcqScores.length > 0
        ? Math.round(subjMcqScores.reduce((a, b) => a + b, 0) / subjMcqScores.length)
        : 0;
    const subjAvgWritten =
      subjWrittenScores.length > 0
        ? Math.round(subjWrittenScores.reduce((a, b) => a + b, 0) / subjWrittenScores.length)
        : 0;

    const completionPct = Math.round((subjCompletedCount / subjTopicCount) * 100);

    let statusTrend: SubjectProgress['statusTrend'] = 'Not Enough Data';
    if (subjAvgMastery >= 75) {
      statusTrend = 'Improving 📈';
    } else if (subjAvgMastery >= 50) {
      statusTrend = 'Stable →';
    } else if (subjStartedCount > 0 || subjCompletedCount > 0) {
      statusTrend = 'Needs More Practice ⚠️';
    }

    return {
      subjectId: subj.id,
      subjectName: subj.name,
      subjectCode: subj.code,
      icon: subj.icon,
      accentColor: subj.accentColor,
      totalTopics: subjTopicsCount,
      startedTopics: subjStartedCount,
      completedTopics: subjCompletedCount,
      completionPercentage: completionPct,
      averageMcqScore: subjAvgMcq,
      averageWrittenScore: subjAvgWritten,
      masteryScore: subjAvgMastery,
      totalAttempts: subjMcqScores.length + subjWrittenScores.length,
      statusTrend,
      lastActivityAt: subjLastActivity,
      chapters: chaptersProgress,
    };
  });

  // 2. Streaks
  const streak: LearningStreak = streakDb
    ? {
        currentStreak: streakDb.currentStreak,
        longestStreak: streakDb.longestStreak,
        totalActiveDays: streakDb.totalActiveDays,
        lastActiveDate: streakDb.lastActiveDate,
        activeDates: streakDb.activeDates || [],
        isTodayActive: streakDb.lastActiveDate === new Date().toISOString().split('T')[0],
      }
    : {
        currentStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0,
        lastActiveDate: '',
        activeDates: [],
        isTodayActive: false,
      };

  // 3. Performance Trend
  const trend = calculateTrendFromAttempts(mcqAttempts, writtenAttempts);

  // 4. Strengths & Weaknesses
  const strongTopics: StrengthWeaknessInsight['strongTopics'] = [];
  const improvingTopics: StrengthWeaknessInsight['improvingTopics'] = [];
  const needsPracticeTopics: StrengthWeaknessInsight['needsPracticeTopics'] = [];

  for (const tp of topicProgressList) {
    const subj = syllabus.subjects.find((s) => s.id === tp.subjectId);
    const chap = subj?.chapters.find((c) => c.id === tp.chapterId);
    const top = chap?.topics.find((t) => t.id === tp.topicId);

    if (subj && chap && top) {
      if (tp.masteryScore >= 80) {
        strongTopics.push({
          topicId: top.id,
          topicTitle: top.title,
          subjectId: subj.id,
          subjectName: subj.name,
          chapterId: chap.id,
          chapterTitle: chap.title,
          masteryScore: tp.masteryScore,
        });
      } else if (tp.masteryScore < 60 && (tp.mcqAttempts > 0 || tp.writtenAttempts > 0)) {
        needsPracticeTopics.push({
          topicId: top.id,
          topicTitle: top.title,
          subjectId: subj.id,
          subjectName: subj.name,
          chapterId: chap.id,
          chapterTitle: chap.title,
          masteryScore: tp.masteryScore,
          reason: `Accuracy: ${tp.latestMcqScore || tp.latestWrittenScore || 0}%`,
        });
      }

      // Check improvement
      if (
        tp.mcqAttempts >= 2 &&
        typeof tp.latestMcqScore === 'number' &&
        typeof tp.previousBestMcqScore === 'number' &&
        tp.latestMcqScore > tp.previousBestMcqScore
      ) {
        improvingTopics.push({
          topicId: top.id,
          topicTitle: top.title,
          subjectId: subj.id,
          subjectName: subj.name,
          chapterId: chap.id,
          chapterTitle: chap.title,
          delta: tp.latestMcqScore - tp.previousBestMcqScore,
          currentScore: tp.latestMcqScore,
        });
      } else if (
        tp.writtenAttempts >= 2 &&
        typeof tp.latestWrittenScore === 'number' &&
        typeof tp.previousBestWrittenScore === 'number' &&
        tp.latestWrittenScore > tp.previousBestWrittenScore
      ) {
        improvingTopics.push({
          topicId: top.id,
          topicTitle: top.title,
          subjectId: subj.id,
          subjectName: subj.name,
          chapterId: chap.id,
          chapterTitle: chap.title,
          delta: tp.latestWrittenScore - tp.previousBestWrittenScore,
          currentScore: tp.latestWrittenScore,
        });
      }
    }
  }

  const commonMistakes = extractMistakePatterns(mcqAttempts, writtenAttempts, syllabus);

  const insights: StrengthWeaknessInsight = {
    strongTopics: strongTopics.slice(0, 3),
    improvingTopics: improvingTopics.slice(0, 3),
    needsPracticeTopics: needsPracticeTopics.slice(0, 3),
    commonMistakes,
  };

  // 5. Recommendations
  const recommendations = generateStudentRecommendations({
    classLevel,
    syllabus,
    topicProgressList,
    recentEvents: rawEvents,
  });

  // 6. Achievements
  const unlockedMap = new Map<string, string>();
  for (const a of unlockedAchDb) {
    unlockedMap.set(a.achievementId, a.unlockedAt);
  }

  const achievements: StudentAchievement[] = ACHIEVEMENTS_REGISTRY.map((def) => {
    const isUnlocked = unlockedMap.has(def.id);
    let progress = 0;

    if (def.id === 'first_step') {
      progress = Math.min(1, rawEvents.length + mcqAttempts.length + writtenAttempts.length);
    } else if (def.id === 'streak_3' || def.id === 'streak_7') {
      progress = Math.min(def.targetValue, streak.currentStreak);
    } else if (def.id === 'quiz_explorer') {
      progress = Math.min(def.targetValue, mcqAttempts.filter((m) => m.status === 'completed').length);
    } else if (def.id === 'written_master') {
      progress = Math.min(def.targetValue, writtenAttempts.filter((w) => w.status === 'completed').length);
    } else if (def.id === 'high_achiever') {
      const hasHigh =
        mcqAttempts.some((m) => (m.data?.result?.percentage || 0) >= 90) ||
        writtenAttempts.some((w) => (w.data?.result?.percentage || 0) >= 90);
      progress = hasHigh ? 1 : 0;
    } else if (def.id === 'topic_master') {
      progress = strongTopics.length >= 1 ? 1 : 0;
    } else if (def.id === 'subject_explorer') {
      const activeSubjCount = subjectsProgress.filter((s) => s.startedTopics > 0 || s.completedTopics > 0).length;
      progress = Math.min(def.targetValue, activeSubjCount);
    } else if (def.id === 'rising_star') {
      progress = improvingTopics.length >= 1 ? 1 : 0;
    }

    return {
      id: `ach_${def.id}`,
      userId,
      achievementId: def.id,
      title: def.title,
      description: def.description,
      category: def.category,
      iconName: def.iconName,
      unlockedAt: unlockedMap.get(def.id),
      progress,
      targetValue: def.targetValue,
      isUnlocked: isUnlocked || progress >= def.targetValue,
    };
  });

  // Overall calculations
  const totalTopicCount = totalTopics || 1;
  const overallCompletionPct = Math.round((totalCompletedTopics / totalTopicCount) * 100);
  const averageMastery = Math.round(totalMasterySum / totalTopicCount);

  const completedMcqs = mcqAttempts.filter((m) => m.status === 'completed' && m.data?.result?.percentage !== undefined);
  const averageMcqAccuracy =
    completedMcqs.length > 0
      ? Math.round(completedMcqs.reduce((acc, m) => acc + Number(m.data.result.percentage), 0) / completedMcqs.length)
      : 0;

  const completedWritten = writtenAttempts.filter((w) => w.status === 'completed' && w.data?.result?.percentage !== undefined);
  const averageWrittenAccuracy =
    completedWritten.length > 0
      ? Math.round(completedWritten.reduce((acc, w) => acc + Number(w.data.result.percentage), 0) / completedWritten.length)
      : 0;

  return {
    overallCompletionPct,
    totalTopics: totalTopicCount,
    completedTopicsCount: totalCompletedTopics,
    inProgressTopicsCount: totalStartedTopics,
    totalSubjects: syllabus.subjects.length,
    activeSubjectsCount: subjectsProgress.filter((s) => s.startedTopics > 0 || s.completedTopics > 0).length,
    averageMastery,
    averageMcqAccuracy,
    averageWrittenAccuracy,
    totalTestsTaken: completedMcqs.length + completedWritten.length,
    trend,
    streak,
    recentActivity: rawEvents.map((e) => ({
      id: e.id,
      userId: e.userId,
      type: (e.type as any),
      classLevel: e.classLevel,
      subjectId: e.subjectId,
      chapterId: e.chapterId,
      topicId: e.topicId,
      metadata: e.metadata,
      createdAt: e.createdAt,
    })),
    achievements,
    recommendations,
    subjects: subjectsProgress,
    insights,
  };
}
