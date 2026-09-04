import React, { useState, useEffect } from 'react';
import { useStudent } from '../../context/StudentContext';
import { getSyllabusForClass } from '../../data/syllabusData';
import { Subject, ClassLevel } from '../../types';
import { getAllTestAttempts } from '../../services/test/testStorage';
import { getAllWrittenTestAttempts } from '../../services/test/writtenTestStorage';
import { fetchStudentDashboardAnalytics } from '../../services/analytics/analyticsService';
import { StudentAnalyticsOverview } from '../../types/analytics';
import { StatCard } from '../ui/StatCard';
import { DashboardCard } from '../ui/DashboardCard';
import { StatusBadge } from '../ui/StatusBadge';
import { ProgressBar } from '../ui/ProgressBar';
import { LearningGapCard } from '../ui/LearningGapCard';
import {
  Calculator,
  Atom,
  Dna,
  Globe,
  BookOpen,
  Languages,
  Sparkles,
  ArrowRight,
  GraduationCap,
  School,
  Layers,
  CheckCircle2,
  Flame,
  Clock,
  TrendingUp,
  Award,
  ChevronRight,
  BookMarked,
  CheckSquare,
  PenTool,
  BarChart3,
  Target,
  Zap,
  AlertTriangle,
} from 'lucide-react';

interface StudentDashboardProps {
  onSelectSubject: (subject: Subject) => void;
  onContinueLearning: () => void;
  onExploreSubjects: () => void;
  onEditProfile: () => void;
  onViewTestResult?: (testId: string) => void;
  onNavigateToProgress?: () => void;
  onSelectTopicForAction?: (
    subjectId: string,
    chapterId: string,
    topicId: string,
    actionType?: 'learn' | 'mcq' | 'written'
  ) => void;
}

// Icon mapping helper
export const getSubjectIcon = (iconName: string, className: string = 'w-6 h-6') => {
  switch (iconName) {
    case 'Calculator':
      return <Calculator className={className} />;
    case 'Atom':
      return <Atom className={className} />;
    case 'Dna':
      return <Dna className={className} />;
    case 'Globe':
      return <Globe className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Languages':
      return <Languages className={className} />;
    default:
      return <BookOpen className={className} />;
  }
};

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onSelectSubject,
  onContinueLearning,
  onExploreSubjects,
  onEditProfile,
  onViewTestResult,
  onNavigateToProgress,
  onSelectTopicForAction,
}) => {
  const { student, selectedClass, selectedSubject, selectedChapter, selectedTopic } = useStudent();
  const syllabus = getSyllabusForClass(selectedClass);

  const [analytics, setAnalytics] = useState<StudentAnalyticsOverview | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const loadAnalytics = React.useCallback(async () => {
    setIsLoadingAnalytics(true);
    setAnalyticsError(null);
    try {
      const data = await fetchStudentDashboardAnalytics(selectedClass);
      if (data) {
        setAnalytics(data);
      } else {
        setAnalyticsError('Could not load your learning analytics right now.');
      }
    } catch (err) {
      console.error('[StudentDashboard] Failed to load analytics:', err);
      setAnalyticsError('Something went wrong while loading your learning analytics.');
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const studentName = student?.name || 'Student';
  const schoolName = student?.schoolName || 'Slate High School';

  const activeStreak = analytics?.streak.currentStreak || 0;
  const overallCompletion = analytics?.overallCompletionPct || 0;
  const averageMastery = analytics?.averageMastery || 0;
  const totalTests = analytics?.totalTestsTaken || 0;

  const topRecommendation = analytics?.recommendations?.[0];

  return (
    <div id="student-dashboard" className="space-y-6 sm:space-y-8">
      {/* 0. Analytics Load Error Banner (visible error state - never blank) */}
      {analyticsError && (
        <div
          id="student-analytics-error"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-rose-900">Something went wrong</p>
              <p className="text-xs text-rose-700 mt-0.5">{analyticsError} Your learning activity is safe — please try again.</p>
            </div>
          </div>
          <button
            id="student-analytics-retry-btn"
            onClick={loadAnalytics}
            disabled={isLoadingAnalytics}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
          >
            {isLoadingAnalytics ? 'Retrying…' : 'Try Again'}
          </button>
        </div>
      )}

      {/* 1. Greeting Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                {selectedClass} • TS SCERT
              </span>
              <span className="text-xs text-slate-500 font-medium">{schoolName}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Welcome back, {studentName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Telangana State Board curriculum learning portal, practice quizzes, and diagnostic analytics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          {onNavigateToProgress && (
            <button
              id="dashboard-view-analytics-btn"
              onClick={onNavigateToProgress}
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shadow-2xs"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>My Progress</span>
            </button>
          )}

          <button
            id="edit-profile-btn"
            onClick={onEditProfile}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
            title="Edit student profile details"
          >
            Change Class
          </button>
        </div>
      </div>

      {/* 2. Quick Real Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="student-kpi-streak"
          title="Daily Learning Streak"
          value={`${activeStreak} Days`}
          subtitle="Consistent study habit"
          icon={Flame}
          iconColor="amber"
        />

        <StatCard
          id="student-kpi-completion"
          title="Syllabus Completion"
          value={`${overallCompletion}%`}
          subtitle="SCERT Curriculum covered"
          icon={BookOpen}
          iconColor="blue"
        />

        <StatCard
          id="student-kpi-mastery"
          title="Average Concept Mastery"
          value={`${averageMastery}%`}
          subtitle="Across assessed topics"
          icon={Target}
          iconColor="emerald"
        />

        <StatCard
          id="student-kpi-tests"
          title="Assessments Taken"
          value={totalTests}
          subtitle="MCQ & written practice"
          icon={CheckSquare}
          iconColor="purple"
        />
      </div>

      {/* 3. Continue Learning / Smart Next Step Banner */}
      <div
        id="continue-learning-section"
        className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-7 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
      >
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/15 text-blue-100 text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{topRecommendation ? topRecommendation.badge : 'Recommended Focus'}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {topRecommendation ? (
              topRecommendation.title
            ) : selectedTopic ? (
              selectedTopic.title
            ) : selectedChapter ? (
              selectedChapter.title
            ) : selectedSubject ? (
              selectedSubject.name
            ) : (
              'Mathematics: Quadratic Equations & Factorization'
            )}
          </h3>

          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            {topRecommendation
              ? topRecommendation.reason
              : 'Continue where you left off to maintain your learning streak and exam readiness.'}
          </p>

          <div className="pt-2 max-w-sm">
            <div className="flex justify-between text-[11px] font-semibold text-blue-200 mb-1">
              <span>Class Progress</span>
              <span>{overallCompletion}% Complete</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, overallCompletion)}%` }}
              />
            </div>
          </div>
        </div>

        <button
          id="resume-learning-btn"
          onClick={() => {
            if (
              topRecommendation &&
              onSelectTopicForAction &&
              topRecommendation.subjectId &&
              topRecommendation.chapterId &&
              topRecommendation.topicId
            ) {
              const action = topRecommendation.type === 'resume_test' ? 'mcq' : 'learn';
              onSelectTopicForAction(
                topRecommendation.subjectId,
                topRecommendation.chapterId,
                topRecommendation.topicId,
                action
              );
            } else {
              onContinueLearning();
            }
          }}
          className="px-6 py-3 bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 shrink-0 self-start md:self-center"
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>{topRecommendation ? topRecommendation.actionLabel : 'Resume Learning'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3.1 Diagnosed Learning Focus & Gaps (if present) */}
      {analytics?.insights?.needsPracticeTopics && analytics.insights.needsPracticeTopics.length > 0 && (
        <div id="student-learning-gaps-section" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Recommended Focus Areas</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Topics where practice will boost your overall mastery and test readiness.
              </p>
            </div>
            {onNavigateToProgress && (
              <button
                onClick={onNavigateToProgress}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <span>View Full Analysis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.insights.needsPracticeTopics.slice(0, 2).map((item) => (
              <LearningGapCard
                key={item.topicId}
                topicName={item.topicTitle}
                subjectName={item.subjectName}
                severity={item.masteryScore < 40 ? 'critical' : 'moderate'}
                averageScore={item.masteryScore}
                evidence={item.reason || `Current concept mastery is ${item.masteryScore}%. Additional practice recommended.`}
                recommendedAction="Practice MCQ test or review with AI Tutor to clear concept doubts."
                actionLabel="Practice Topic"
                onAction={() => {
                  if (onSelectTopicForAction) {
                    onSelectTopicForAction(item.subjectId, item.chapterId, item.topicId, 'mcq');
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. Main Section: Select a Subject */}
      <div id="dashboard-subject-selection" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Curriculum Subjects</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                {selectedClass}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured chapters, topic-by-topic AI tutoring, and adaptive assessments.
            </p>
          </div>

          <button
            onClick={onExploreSubjects}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <span>Explore All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {syllabus.subjects.map((subj) => {
            const subjProgress = analytics?.subjects.find((s) => s.subjectId === subj.id);
            const compPct = subjProgress?.completionPercentage || 0;
            const mastery = subjProgress?.masteryScore || 0;

            return (
              <div
                key={subj.id}
                id={`subject-card-${subj.id}`}
                onClick={() => onSelectSubject(subj)}
                className="group bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-blue-400/80 rounded-2xl p-5 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-2xs">
                      {getSubjectIcon(subj.icon, 'w-5 h-5')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {mastery > 0 && (
                        <StatusBadge
                          variant={mastery >= 75 ? 'active' : 'needs_practice'}
                          label={`${mastery}% Mastery`}
                          size="sm"
                        />
                      )}
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {subj.code}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {subj.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {subj.description}
                  </p>
                </div>

                <div className="space-y-2 pt-4 mt-4 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>
                      {subj.chapters.length} Chapters •{' '}
                      {subj.chapters.reduce((acc, ch) => acc + ch.topics.length, 0)} Topics
                    </span>
                    <span className="text-blue-600 font-bold">{compPct}%</span>
                  </div>
                  <ProgressBar value={compPct} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Analytics & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subject Mastery Progress */}
        <div className="lg:col-span-7">
          <DashboardCard
            id="student-subject-mastery"
            title={
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Subject Mastery Breakdown</span>
              </div>
            }
            subtitle="Topic coverage and performance by academic subject"
            headerAction={
              onNavigateToProgress && (
                <button
                  onClick={onNavigateToProgress}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition-colors"
                >
                  <span>Detailed Analytics</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )
            }
          >
            <div className="space-y-3">
              {syllabus.subjects.slice(0, 4).map((sub) => {
                const subProgress = analytics?.subjects.find((s) => s.subjectId === sub.id);
                const pct = subProgress?.completionPercentage || 0;
                const mastery = subProgress?.masteryScore || 0;

                return (
                  <div key={sub.id} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">{sub.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-medium">Mastery: <b className="text-slate-800">{mastery}%</b></span>
                        <span className="text-blue-600 font-bold font-mono">{pct}% Done</span>
                      </div>
                    </div>
                    <ProgressBar value={pct} size="sm" />
                  </div>
                );
              })}
            </div>
          </DashboardCard>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-5">
          <DashboardCard
            id="student-recent-activity"
            title={
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Recent Submissions</span>
              </div>
            }
            subtitle="Recent quizzes and written answers"
          >
            <div className="space-y-2.5 text-xs">
              {(() => {
                const mcqAttempts = getAllTestAttempts()
                  .filter((a) => a.status === 'completed')
                  .map((a) => ({ ...a, type: 'mcq' as const }));
                const writtenAttempts = getAllWrittenTestAttempts()
                  .filter((a) => a.status === 'completed')
                  .map((a) => ({ ...a, type: 'written' as const }));

                const allCompleted = [...mcqAttempts, ...writtenAttempts].sort(
                  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                if (allCompleted.length > 0) {
                  return allCompleted.slice(0, 4).map((att) => {
                    const isWritten = att.type === 'written';
                    const scoreText = isWritten
                      ? `${(att as any).result?.totalScore}/${(att as any).result?.maxScore} Marks`
                      : `${(att as any).result?.score}/${att.questionCount}`;
                    const pct = (att as any).result?.percentage ?? 0;

                    return (
                      <div
                        key={att.id}
                        onClick={() => onViewTestResult?.(att.id)}
                        className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/90 flex items-center justify-between gap-3 cursor-pointer transition-colors shadow-2xs"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isWritten
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : 'bg-blue-50 text-blue-600 border border-blue-100'
                            }`}
                          >
                            {isWritten ? <PenTool className="w-3.5 h-3.5" /> : <CheckSquare className="w-3.5 h-3.5" />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 truncate">{att.topicTitle}</div>
                            <div className="text-slate-500 text-[11px] truncate">
                              {att.subjectName} • {isWritten ? 'Written Test' : 'MCQ Quiz'} • {scoreText}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-bold font-mono text-xs text-blue-600">
                          {pct}%
                        </div>
                      </div>
                    );
                  });
                }

                return (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No tests completed yet. Select a topic to begin practice!
                  </div>
                );
              })()}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};
