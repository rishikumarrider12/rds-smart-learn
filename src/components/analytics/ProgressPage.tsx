import React, { useState, useEffect } from 'react';
import { useStudent } from '../../context/StudentContext';
import {
  StudentAnalyticsOverview,
  SubjectProgress,
  ChapterProgress,
  TopicProgress,
  StudentAchievement,
  Recommendation,
} from '../../types/analytics';
import {
  fetchStudentProgressDetails,
  fetchAiCoachInsight,
} from '../../services/analytics/analyticsService';
import {
  Sparkles,
  Flame,
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Target,
  BarChart3,
  BrainCircuit,
  GraduationCap,
  Layers,
  ArrowLeft,
  CheckSquare,
  PenTool,
  Zap,
} from 'lucide-react';

interface ProgressPageProps {
  onNavigate: (target: 'dashboard' | 'subjects' | 'chapters' | 'topics' | 'learn' | 'progress') => void;
  onSelectTopicForAction?: (subjectId: string, chapterId: string, topicId: string, actionType?: 'learn' | 'mcq' | 'written') => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({
  onNavigate,
  onSelectTopicForAction,
}) => {
  const { selectedClass, student } = useStudent();
  const [analytics, setAnalytics] = useState<StudentAnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [aiCoach, setAiCoach] = useState<{ insight: string; isAiGenerated: boolean } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchStudentProgressDetails(selectedClass);
      setAnalytics(data);
      if (data && data.subjects.length > 0 && selectedSubjectId === 'all') {
        // Expand first chapter by default
        const firstChId = data.subjects[0]?.chapters[0]?.chapterId;
        if (firstChId) {
          setExpandedChapters({ [firstChId]: true });
        }
      }
    } catch (err) {
      console.error('Failed to load progress details:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAiCoach = async () => {
    setAiLoading(true);
    try {
      const insightData = await fetchAiCoachInsight(selectedClass);
      setAiCoach(insightData);
    } catch (err) {
      console.warn('AI coach load failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClass]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const filteredSubjects = analytics?.subjects.filter((s) =>
    selectedSubjectId === 'all' ? true : s.subjectId === selectedSubjectId
  ) || [];

  const getMasteryColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 60) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    if (score >= 40) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-slate-400 bg-slate-800/40 border-slate-700';
  };

  const getMasteryBadge = (score: number) => {
    if (score >= 80) return 'Mastered';
    if (score >= 60) return 'Proficient';
    if (score >= 40) return 'Practicing';
    return 'Not Started';
  };

  return (
    <div id="student-progress-page" className="min-h-screen bg-[#060a17] text-slate-100 pb-28">
      {/* Top Header Bar */}
      <header className="bg-gradient-to-b from-[#0c1630] via-[#091124] to-[#060a17] border-b border-cyan-500/20 pt-8 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              id="back-to-dashboard-btn"
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0d1836] hover:bg-[#152450] text-slate-300 hover:text-cyan-300 border border-slate-700 transition-all text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>TS SCERT — {selectedClass}</span>
            </div>
          </div>

          {/* Title and Subtitle */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-cyan-400" />
                Learning Progress & Analytics
              </h1>
              <p className="text-sm sm:text-base text-slate-400 mt-1 max-w-2xl">
                Comprehensive mastery intelligence, streak consistency, and AI-recommended focus areas for your Telangana Board curriculum.
              </p>
            </div>

            <button
              id="refresh-analytics-btn"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0e1b3d] hover:bg-[#182b5e] border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-colors self-start md:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Analytics
            </button>
          </div>

          {/* Smart AI Coach Banner */}
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-[#0c1c3d]/70 to-indigo-950/60 border border-cyan-500/30 p-5 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                      RDS AI Learning Coach
                    </span>
                    {aiCoach?.isAiGenerated && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 font-mono">
                        Personalized
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-200 mt-1 leading-relaxed">
                    {aiCoach
                      ? aiCoach.insight
                      : analytics
                      ? `Welcome ${student?.name || 'Student'}! You are currently maintaining a ${analytics.streak.currentStreak}-day learning streak with ${analytics.overallCompletionPct}% syllabus progress. Keep testing your concepts to solidify exam readiness!`
                      : 'Analyzing your learning activities across Telangana State Board subjects...'}
                  </p>
                </div>
              </div>

              <button
                id="get-ai-coach-advice-btn"
                onClick={loadAiCoach}
                disabled={aiLoading}
                className="shrink-0 px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-2"
              >
                <Sparkles className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : 'text-cyan-300'}`} />
                {aiLoading ? 'Thinking...' : 'Get Coach Tip'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Syllabus Completion */}
          <div id="stat-syllabus-completion" className="bg-[#090f23] border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Syllabus Completion</span>
              <BookOpen className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{analytics?.overallCompletionPct || 0}%</span>
              <span className="text-xs text-slate-400 font-medium">
                ({analytics?.completedTopicsCount || 0}/{analytics?.totalTopics || 0} topics)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${analytics?.overallCompletionPct || 0}%` }}
              />
            </div>
          </div>

          {/* Card 2: Average Mastery */}
          <div id="stat-average-mastery" className="bg-[#090f23] border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Mastery</span>
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{analytics?.averageMastery || 0}%</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getMasteryColor(analytics?.averageMastery || 0)}`}>
                {getMasteryBadge(analytics?.averageMastery || 0)}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-3 flex items-center justify-between">
              <span>MCQ: {analytics?.averageMcqAccuracy || 0}%</span>
              <span>Written: {analytics?.averageWrittenAccuracy || 0}%</span>
            </div>
          </div>

          {/* Card 3: Learning Streak */}
          <div id="stat-learning-streak" className="bg-[#090f23] border border-slate-800 rounded-2xl p-5 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Streak</span>
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-300">{analytics?.streak.currentStreak || 0}</span>
              <span className="text-xs text-slate-400 font-medium">Days Active 🔥</span>
            </div>
            <div className="text-xs text-slate-400 mt-3 flex items-center justify-between">
              <span>Longest: {analytics?.streak.longestStreak || 0} days</span>
              <span>Total: {analytics?.streak.totalActiveDays || 0} days</span>
            </div>
          </div>

          {/* Card 4: Trajectory & Tests */}
          <div id="stat-performance-trajectory" className="bg-[#090f23] border border-slate-800 rounded-2xl p-5 hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trajectory</span>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-300">{analytics?.trend.label || 'Steady'}</span>
            </div>
            <div className="text-xs text-slate-400 mt-3 flex items-center justify-between">
              <span>Total Tests: {analytics?.totalTestsTaken || 0}</span>
              <span className="text-purple-300 font-mono text-[11px]">Recent: {analytics?.trend.recentAverage || 0}%</span>
            </div>
          </div>
        </div>

        {/* Actionable Recommendations Section */}
        {analytics?.recommendations && analytics.recommendations.length > 0 && (
          <div id="analytics-recommendations-section" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-bold text-white tracking-tight">Recommended Next Steps</h2>
              </div>
              <span className="text-xs text-slate-400">Personalized learning priorities</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  id={`rec-${rec.id}`}
                  className="bg-[#090f23] border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        {rec.badge || 'Priority'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">SCERT Curriculum</span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{rec.reason}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Topic Action</span>
                    <button
                      onClick={() => {
                        if (onSelectTopicForAction && rec.subjectId && rec.chapterId && rec.topicId) {
                          const action = rec.type === 'resume_test' ? 'mcq' : 'learn';
                          onSelectTopicForAction(rec.subjectId, rec.chapterId, rec.topicId, action);
                        } else {
                          onNavigate('subjects');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#070b19] text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
                    >
                      <span>{rec.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths & Weaknesses Intelligence Section */}
        <div id="analytics-strengths-weaknesses-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strong Topics */}
          <div className="bg-[#090f23] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Strong Concepts</h2>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">Mastery ≥ 80%</span>
            </div>

            {analytics?.insights.strongTopics && analytics.insights.strongTopics.length > 0 ? (
              <div className="space-y-3">
                {analytics.insights.strongTopics.map((topic) => (
                  <div
                    key={topic.topicId}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0c142c] border border-slate-800"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-white">{topic.topicTitle}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{topic.subjectName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {topic.masteryScore}% Mastery
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                Complete tests and score 80%+ on topics to highlight your mastery here.
              </div>
            )}
          </div>

          {/* Focus Areas (Needs Practice) */}
          <div className="bg-[#090f23] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Focus Areas for Improvement</h2>
              </div>
              <span className="text-xs font-mono text-amber-400 font-bold">Needs Practice</span>
            </div>

            {analytics?.insights.needsPracticeTopics && analytics.insights.needsPracticeTopics.length > 0 ? (
              <div className="space-y-3">
                {analytics.insights.needsPracticeTopics.map((topic) => (
                  <div
                    key={topic.topicId}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0c142c] border border-slate-800"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-white">{topic.topicTitle}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{topic.subjectName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {topic.masteryScore}%
                      </span>
                      <button
                        onClick={() => {
                          if (onSelectTopicForAction) {
                            onSelectTopicForAction(topic.subjectId, topic.chapterId, topic.topicId, 'mcq');
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
                      >
                        Practice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                Great job! No weak topics identified yet. Keep practicing to maintain high mastery.
              </div>
            )}
          </div>
        </div>

        {/* Common Mistake Patterns (if any) */}
        {analytics?.insights.commonMistakes && analytics.insights.commonMistakes.length > 0 && (
          <div id="analytics-mistakes-section" className="bg-[#090f23] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-pink-400" />
                <h2 className="text-lg font-bold text-white">Identified Conceptual Gap Patterns</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">AI Mistake Analysis</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.insights.commonMistakes.map((mistake, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#0c142c] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-pink-300">{mistake.category}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/30">
                      {mistake.count} occurrence(s)
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{mistake.topicTitle}</h4>
                  <p className="text-xs text-slate-300">{mistake.description}</p>
                  <p className="text-xs text-cyan-300/90 italic pt-1 border-t border-slate-800/80">
                    💡 Tip: {mistake.recommendedAction.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subject & Chapter Detailed Mastery Breakdown */}
        <div id="analytics-subject-breakdown-section" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                Subject & Chapter Curriculum Breakdown
              </h2>
              <p className="text-xs text-slate-400">Detailed topic mastery tracking across your syllabus</p>
            </div>

            {/* Subject Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedSubjectId('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedSubjectId === 'all'
                    ? 'bg-cyan-500 text-[#070b19]'
                    : 'bg-[#0e172f] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All Subjects
              </button>
              {analytics?.subjects.map((sub) => (
                <button
                  key={sub.subjectId}
                  onClick={() => setSelectedSubjectId(sub.subjectId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedSubjectId === sub.subjectId
                      ? 'bg-cyan-500 text-[#070b19]'
                      : 'bg-[#0e172f] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {sub.subjectName}
                </button>
              ))}
            </div>
          </div>

          {/* Subjects and Chapters Accordions */}
          <div className="space-y-6">
            {filteredSubjects.map((subject) => (
              <div
                key={subject.subjectId}
                id={`subject-card-${subject.subjectId}`}
                className="bg-[#090f23] border border-slate-800 rounded-2xl overflow-hidden shadow-lg"
              >
                {/* Subject Header */}
                <div className="p-5 bg-gradient-to-r from-[#0d1733] to-[#090f23] border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-white">{subject.subjectName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {subject.completedTopics}/{subject.totalTopics} topics completed · {subject.chapters.length} chapters
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Subject Mastery</span>
                      <span className="text-base font-black text-cyan-300">{subject.masteryScore}%</span>
                    </div>

                    <div className="w-32">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Progress</span>
                        <span className="font-bold text-white">{subject.completionPercentage}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${subject.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chapters List */}
                <div className="p-4 sm:p-5 space-y-3">
                  {subject.chapters.map((chapter) => {
                    const isExpanded = !!expandedChapters[chapter.chapterId];
                    return (
                      <div
                        key={chapter.chapterId}
                        id={`chapter-${chapter.chapterId}`}
                        className="rounded-xl bg-[#0c142c] border border-slate-800/80 overflow-hidden transition-all"
                      >
                        {/* Chapter Trigger Header */}
                        <div
                          onClick={() => toggleChapter(chapter.chapterId)}
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#101b3b] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-bold flex items-center justify-center font-mono">
                              Ch
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-white">{chapter.title}</h4>
                              <p className="text-[11px] text-slate-400">
                                {chapter.completedTopics}/{chapter.totalTopics} topics · Mastery: {chapter.masteryAverage}%
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="hidden sm:block w-24">
                              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-400 rounded-full"
                                  style={{ width: `${Math.round((chapter.completedTopics / Math.max(1, chapter.totalTopics)) * 100)}%` }}
                                />
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Chapter Topics Table / List */}
                        {isExpanded && (
                          <div className="p-4 pt-0 border-t border-slate-800/60 bg-[#080d1d] space-y-2 mt-2">
                            {chapter.topics.map((topic) => (
                              <div
                                key={topic.topicId}
                                id={`topic-row-${topic.topicId}`}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-[#0a1126] border border-slate-800/60 gap-3"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-white">{topic.title}</span>
                                    {topic.progress?.lessonCompleted && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                                        Lesson Completed
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                                    <span>MCQs: {topic.progress?.mcqAttempts ?? 0} attempts</span>
                                    {typeof topic.progress?.bestMcqScore === 'number' && (
                                      <span>Best MCQ: {topic.progress.bestMcqScore}%</span>
                                    )}
                                    <span>Written: {topic.progress?.writtenAttempts ?? 0} attempts</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 self-end sm:self-auto">
                                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getMasteryColor(topic.progress?.masteryScore ?? 0)}`}>
                                    {topic.progress?.masteryScore ?? 0}% Mastery
                                  </span>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      title="Learn with RDS AI"
                                      onClick={() => {
                                        if (onSelectTopicForAction) {
                                          onSelectTopicForAction(subject.subjectId, chapter.chapterId, topic.topicId, 'learn');
                                        }
                                      }}
                                      className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all text-xs font-medium flex items-center gap-1"
                                    >
                                      <BookOpen className="w-3.5 h-3.5" />
                                      <span className="hidden md:inline">Learn</span>
                                    </button>

                                    <button
                                      title="Practice MCQ Test"
                                      onClick={() => {
                                        if (onSelectTopicForAction) {
                                          onSelectTopicForAction(subject.subjectId, chapter.chapterId, topic.topicId, 'mcq');
                                        }
                                      }}
                                      className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all text-xs font-medium flex items-center gap-1"
                                    >
                                      <CheckSquare className="w-3.5 h-3.5" />
                                      <span className="hidden md:inline">MCQ</span>
                                    </button>

                                    <button
                                      title="Practice Written Test"
                                      onClick={() => {
                                        if (onSelectTopicForAction) {
                                          onSelectTopicForAction(subject.subjectId, chapter.chapterId, topic.topicId, 'written');
                                        }
                                      }}
                                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all text-xs font-medium flex items-center gap-1"
                                    >
                                      <PenTool className="w-3.5 h-3.5" />
                                      <span className="hidden md:inline">Written</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Achievements Section */}
        <div id="analytics-achievements-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Milestones & Achievements</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Unlocked: {analytics?.achievements.filter((a) => a.isUnlocked).length || 0} / {analytics?.achievements.length || 0}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics?.achievements.map((ach) => (
              <div
                key={ach.achievementId}
                id={`ach-card-${ach.achievementId}`}
                className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                  ach.isUnlocked
                    ? 'bg-[#0c1630] border-cyan-500/40 shadow-lg shadow-cyan-950/40'
                    : 'bg-[#080d1d] border-slate-800 opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    ach.isUnlocked
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-[#070b19] font-black'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Award className="w-6 h-6" />
                </div>

                <div className="space-y-1 w-full">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{ach.title}</h4>
                    {ach.isUnlocked && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold font-mono">
                        Unlocked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{ach.description}</p>
                  {!ach.isUnlocked && (
                    <div className="mt-2 pt-1">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>
                          {ach.progress}/{ach.targetValue}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.round((ach.progress / ach.targetValue) * 100))}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
