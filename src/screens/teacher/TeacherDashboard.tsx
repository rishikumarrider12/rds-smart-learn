import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchTeacherDashboard,
  fetchTeacherAssignmentAnalytics,
  fetchTeacherStudentDeepView,
} from '../../services/organizationService';
import {
  TeacherDashboardData,
  TeacherAssignment,
  TeacherAssignmentStudentItem,
  StudentNeedingSupport,
} from '../../types/organization';
import { StudentAnalyticsOverview } from '../../types/analytics';
import { UserProfile } from '../../types/auth';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { TeacherAssignmentManager } from '../../components/teacher/TeacherAssignmentManager';
import { StatCard } from '../../components/ui/StatCard';
import { DashboardCard } from '../../components/ui/DashboardCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { LearningGapCard } from '../../components/ui/LearningGapCard';
import { InsightCard } from '../../components/ui/InsightCard';
import {
  GraduationCap,
  Users,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Search,
  Filter,
  ArrowRight,
  Eye,
  X,
  Sparkles,
  RefreshCw,
  HelpCircle,
  BrainCircuit,
  FileText,
  Building,
  Flame,
  ChevronRight,
  Layers,
  BarChart3,
  Calendar,
  CheckSquare,
  ChevronDown,
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigate: (path: string) => void;
  onSelectTopic?: (topicId: string) => void;
  activeSection?: string;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onNavigate,
  onSelectTopic,
  activeSection,
}) => {
  // Active sidebar section — URL-driven via /teacher/:section (App.tsx parses
  // the path and passes it here). Defaults to the dashboard overview.
  const section = activeSection || 'dashboard';
  // Real browser path so the sidebar highlights the active section correctly.
  const teacherPath = section === 'dashboard' ? '/teacher' : `/teacher/${section}`;
  const { user } = useAuth();
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'steady' | 'needs_practice' | 'inactive'>('all');

  // Deep student inspection modal
  const [inspectedStudent, setInspectedStudent] = useState<{
    profile: UserProfile;
    analytics: StudentAnalyticsOverview;
  } | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);

  const loadDashboard = useCallback(async (asgnId?: string) => {
    try {
      if (asgnId) setIsSwitching(true);
      else setIsLoading(true);

      const res = await fetchTeacherDashboard(asgnId);
      setData(res);
      if (res.currentAssignment) {
        setSelectedAssignmentId(res.currentAssignment.id);
      }
    } catch (err) {
      console.error('Failed to load teacher dashboard:', err);
    } finally {
      setIsLoading(false);
      setIsSwitching(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleAssignmentChange = (newAsgnId: string) => {
    setSelectedAssignmentId(newAsgnId);
    loadDashboard(newAsgnId);
  };

  const handleInspectStudent = async (studentId: string) => {
    setIsInspecting(true);
    try {
      const res = await fetchTeacherStudentDeepView(studentId);
      setInspectedStudent({
        profile: res.student,
        analytics: res.analytics,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to fetch student details');
    } finally {
      setIsInspecting(false);
    }
  };

  const filteredStudents = (data?.students || []).filter((s) => {
    if (statusFilter !== 'all' && s.learningStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchEmail = s.email.toLowerCase().includes(q);
      return matchName || matchEmail;
    }
    return true;
  });

  if (isLoading && !data) {
    return (
      <DashboardLayout
        currentPath={teacherPath}
        onNavigate={onNavigate}
        title="Teacher Dashboard"
        subtitle="Classroom Diagnostics & Student Learning Gaps"
        activeSection={section}
      >
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Loading Academic Analytics...</h3>
          <p className="text-xs text-slate-500 mt-1">Connecting to Telangana SCERT Curriculum Engine</p>
        </div>
      </DashboardLayout>
    );
  }

  const currentAsgn = data?.currentAssignment;
  const analytics = data?.analytics;
  const isDemo = Boolean(data?.isDemoData || currentAsgn?.schoolName?.includes('Demo') || analytics?.isDemoData);

  return (
    <DashboardLayout
      currentPath={teacherPath}
      onNavigate={onNavigate}
      title="Teacher Dashboard"
      subtitle={`${currentAsgn ? `${currentAsgn.classLevel} • ${currentAsgn.subjectName}` : 'Academic Portal'} • ${currentAsgn?.schoolName || user?.schoolName || 'Telangana SCERT'}`}
      isDemoData={isDemo}
      activeSection={section}
    >
      <div id="teacher-dashboard-view" className="space-y-6 sm:space-y-8">
      {/* 1. Header & Summary Section with Assignment Dropdown */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                Teacher Dashboard
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {currentAsgn?.schoolName || user?.schoolName || 'Telangana State Institution'}
              </span>
              {isDemo && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  Demonstration Environment — Sample Academic Records
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Welcome, {user?.fullName || 'Teacher'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Monitor classroom learning, assessment performance and student learning gaps.
            </p>
          </div>
        </div>

        {/* Classroom Allocation Selector */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
          {data?.assignments && data.assignments.length > 0 && (
            <div className="relative">
              <select
                aria-label="Select Assigned Class"
                value={selectedAssignmentId}
                onChange={(e) => handleAssignmentChange(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs cursor-pointer"
              >
                {data.assignments.map((asgn) => (
                  <option key={asgn.id} value={asgn.id}>
                    {asgn.classLevel} • {asgn.subjectName || asgn.subjectId}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          <button
            onClick={() => onNavigate('/dashboard')}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Student Syllabus View</span>
          </button>

          <button
            onClick={() => loadDashboard(selectedAssignmentId)}
            disabled={isSwitching}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition-colors shadow-2xs"
            title="Refresh Classroom Data"
          >
            <RefreshCw className={`w-4 h-4 ${isSwitching ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Top KPI Row */}
      {(section === 'dashboard' || section === 'assessments' || section === 'insights') && analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            id="kpi-active-students"
            title="Active Students"
            value={`${analytics.activeStudents} / ${analytics.totalStudents}`}
            subtitle={`${Math.round((analytics.activeStudents / Math.max(1, analytics.totalStudents)) * 100)}% attendance rate this week`}
            icon={Users}
            iconColor="blue"
          />

          <StatCard
            id="kpi-avg-mastery"
            title="Average Mastery"
            value={`${analytics.averageMastery}%`}
            subtitle="Diagnostic rubric score"
            icon={Award}
            iconColor="emerald"
          />

          <StatCard
            id="kpi-assessment-completion"
            title="Assessment Completion"
            value={`${analytics.averageSyllabusCompletion}%`}
            subtitle="SCERT curriculum coverage"
            icon={CheckSquare}
            iconColor="purple"
          />

          <StatCard
            id="kpi-needing-support"
            title="Students Needing Support"
            value={analytics.studentsNeedingSupport.length}
            subtitle={analytics.studentsNeedingSupport.length > 0 ? "Targeted interventions recommended" : "Classroom performing well"}
            icon={AlertTriangle}
            iconColor={analytics.studentsNeedingSupport.length > 0 ? 'amber' : 'emerald'}
          />
        </div>
      )}

      {/* 3. Second Row: Class Performance & Learning Gap Summary */}
      {(section === 'dashboard' || section === 'assessments' || section === 'learning-gaps' || section === 'insights') && (
      <div className={`grid grid-cols-1 gap-6 ${section === 'dashboard' ? 'lg:grid-cols-2' : ''}`}>
        {/* Left: Class Performance Breakdown */}
        {(section === 'dashboard' || section === 'assessments' || section === 'insights') && analytics && (
          <DashboardCard
            id="class-performance-card"
            title={
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Classroom Performance & Diagnostics</span>
              </div>
            }
            subtitle={`Current cohort: ${currentAsgn?.classLevel || 'Class 10'} • ${currentAsgn?.subjectName || 'Mathematics'}`}
          >
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">Objective MCQ Assessment Accuracy</span>
                  </div>
                  <span className="text-xs font-extrabold text-blue-700">{analytics.averageMcqAccuracy}%</span>
                </div>
                <ProgressBar value={analytics.averageMcqAccuracy} variant="blue" size="md" />
                <p className="text-[11px] text-slate-500">
                  Based on multiple-choice diagnostic tests across chapters
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-slate-800">Written Question Rubric Score</span>
                  </div>
                  <span className="text-xs font-extrabold text-purple-700">{analytics.averageWrittenAccuracy}%</span>
                </div>
                <ProgressBar value={analytics.averageWrittenAccuracy} variant="purple" size="md" />
                <p className="text-[11px] text-slate-500">
                  Assessed via AI conceptual step-by-step rubric evaluation
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">Overall Syllabus Progress</span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700">{analytics.averageSyllabusCompletion}%</span>
                </div>
                <ProgressBar value={analytics.averageSyllabusCompletion} variant="emerald" size="md" />
                <p className="text-[11px] text-slate-500">
                  SCERT syllabus topics completed with practice or test attempts
                </p>
              </div>
            </div>
          </DashboardCard>
        )}

        {/* Right: Learning Gap Summary */}
        {(section === 'dashboard' || section === 'learning-gaps') && (
        <DashboardCard
          id="learning-gaps-summary-card"
          title={
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Learning Gap Summary</span>
            </div>
          }
          subtitle="Top conceptual bottlenecks detected across classroom assessments"
        >
          {analytics?.attentionTopics && analytics.attentionTopics.length > 0 ? (
            <div className="space-y-3">
              {analytics.attentionTopics.map((top) => (
                <LearningGapCard
                  key={top.topicId}
                  topicName={top.topicTitle}
                  subjectName={currentAsgn?.subjectName || 'Subject'}
                  studentsAffectedCount={top.issueCount || 1}
                  averageScore={top.averageScore}
                  severity={top.averageScore < 45 ? 'high' : top.averageScore < 65 ? 'moderate' : 'low'}
                  evidence={`Chapter focus: ${top.chapterTitle}`}
                  recommendedAction={
                    top.averageScore < 45
                      ? `Conduct in-class walkthrough of ${top.topicTitle} foundational formulas.`
                      : `Assign targeted 5-question review worksheet to build problem-solving fluency.`
                  }
                  actionLabel="Review Topic"
                  onAction={() => {
                    if (onSelectTopic) onSelectTopic(top.topicId);
                    else onNavigate('/dashboard');
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="No critical learning gaps"
              description="Classroom learners are maintaining steady mastery across all completed topics."
            />
          )}
        </DashboardCard>
        )}
      </div>
      )}

      {/* 4. Actionable "Students Needing Support" Panel */}
      {(section === 'dashboard' || section === 'students' || section === 'learning-gaps') &&
        analytics && analytics.studentsNeedingSupport.length > 0 && (
        <DashboardCard
          id="students-needing-support-panel"
          headerClassName="p-5 sm:px-6 border-b border-amber-100 bg-amber-50/40"
          title={
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-slate-900 font-bold">
                Students Needing Targeted Intervention ({analytics.studentsNeedingSupport.length})
              </span>
            </div>
          }
          subtitle="Diagnostic alerts based on mastery thresholds and activity continuity"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.studentsNeedingSupport.map((stu) => (
              <div
                key={stu.studentId}
                className="p-4 rounded-xl bg-white border border-amber-200/80 shadow-2xs flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{stu.studentName}</span>
                    <StatusBadge variant="needs_practice" label={stu.flagType.replace('_', ' ')} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 font-medium">{stu.supportReason}</p>
                  <p className="text-[11px] text-blue-800 mt-2 flex items-start gap-1.5 bg-blue-50 p-2 rounded-lg border border-blue-100">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{stu.recommendation}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">
                    Mastery: <span className="font-bold text-slate-800">{stu.subjectMastery}%</span> • Inactive: <span className="font-bold text-slate-800">{stu.daysInactive}d</span>
                  </span>
                  <button
                    onClick={() => handleInspectStudent(stu.studentId)}
                    className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 text-xs transition-colors"
                  >
                    <span>Inspect Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      )}

      {/* 5. Student Performance Data Table */}
      {(section === 'dashboard' || section === 'students') && (
      <DashboardCard
        id="student-roster-card"
        title={
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Student Performance ({filteredStudents.length})</span>
          </div>
        }
        subtitle="Individual student mastery, syllabus completion, and assessment diagnostics"
        headerAction={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              {(['all', 'active', 'steady', 'needs_practice'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        }
        bodyClassName="p-0"
      >
        {filteredStudents.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title="No students found"
              description="No learners match your search query in this classroom allocation."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="rds-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Mastery</th>
                  <th>Assessment Score</th>
                  <th>Completion</th>
                  <th>Learning Status</th>
                  <th>Primary Learning Gap</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((stu) => {
                  // Derive primary learning gap or strong topic
                  const hasGap = stu.learningStatus === 'needs_practice' || stu.subjectMastery < 60;
                  const gapLabel = hasGap
                    ? 'Open profile for learning gap details'
                    : 'Steady across attested syllabus topics';

                  return (
                    <tr key={stu.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200/60 shrink-0">
                            {stu.fullName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{stu.fullName}</p>
                            <p className="text-[11px] text-slate-500 leading-tight">{stu.email}</p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="flex items-center gap-2.5 min-w-[120px]">
                          <ProgressBar value={stu.subjectMastery} size="sm" className="flex-1" />
                          <span className="font-bold text-slate-800 text-xs">{stu.subjectMastery}%</span>
                        </div>
                      </td>

                      <td>
                        <div className="space-y-0.5 text-xs">
                          <p className="text-slate-800 font-bold">
                            MCQ: {stu.mcqAccuracy}%
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Written: {stu.writtenAccuracy}%
                          </p>
                        </div>
                      </td>

                      <td>
                        <div className="text-xs">
                          <span className="font-bold text-slate-800">
                            {stu.topicsCompleted} / {stu.totalTopics}
                          </span>
                          <span className="text-[10px] text-slate-500 block">Topics</span>
                        </div>
                      </td>

                      <td>
                        <StatusBadge status={stu.learningStatus} size="sm" />
                      </td>

                      <td>
                        <span className={`text-xs ${hasGap ? 'text-amber-800 font-medium' : 'text-slate-500'}`}>
                          {gapLabel}
                        </span>
                      </td>

                      <td className="text-right">
                        <button
                          onClick={() => handleInspectStudent(stu.id)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg font-bold transition-colors text-xs inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Student</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
      )}

      {/* 5b. My Classes Section */}
      {section === 'classes' && (
        <DashboardCard
          id="teacher-my-classes-card"
          title={
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>My Classes</span>
            </div>
          }
          subtitle="Your assigned classroom allocations. Select a class to load its academic analytics."
        >
          {data?.assignments && data.assignments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.assignments.map((asgn) => {
                const isSelected = selectedAssignmentId === asgn.id;
                return (
                  <button
                    key={asgn.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleAssignmentChange(asgn.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{asgn.classLevel}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{asgn.subjectName || asgn.subjectId}</p>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {asgn.schoolName || user?.schoolName || 'Slate High School'}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white uppercase shrink-0">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No class allocations yet"
              description="Once the Super Admin assigns classes to you, they will appear here."
            />
          )}
        </DashboardCard>
      )}

      {/* 5c. Assignments Section */}
      {section === 'assignments' && (
        <TeacherAssignmentManager
          teacherSchoolId={user?.schoolId}
          teacherSchoolName={user?.schoolName}
        />
      )}

      {/* 6. Student Deep Inspection Modal */}
      {inspectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                  {inspectedStudent.profile.fullName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {inspectedStudent.profile.fullName}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      {inspectedStudent.profile.classLevel || 'Class 10'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {inspectedStudent.profile.email} • {inspectedStudent.profile.schoolName || user?.schoolName || 'Telangana State Institution'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedStudent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Summary Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-500">Current Streak</span>
                <p className="text-xl font-extrabold text-amber-600 mt-0.5">
                  {inspectedStudent.analytics.streak?.currentStreak || 0} Days
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-500">Overall Mastery</span>
                <p className="text-xl font-extrabold text-blue-600 mt-0.5">
                  {inspectedStudent.analytics.averageMastery}%
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-500">Assessments</span>
                <p className="text-xl font-extrabold text-emerald-600 mt-0.5">
                  {inspectedStudent.analytics.averageMcqAccuracy}% avg
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-500">Completion</span>
                <p className="text-xl font-extrabold text-purple-600 mt-0.5">
                  {inspectedStudent.analytics.overallCompletionPct}%
                </p>
              </div>
            </div>

            {/* Recommended Teacher Actions */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2">
              <div className="flex items-center gap-2 text-blue-900 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Recommended Teacher Actions</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 font-medium pl-1">
                {inspectedStudent.analytics.averageMastery < 50 ? (
                  <>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      <span>Review foundational concepts and formulas with the student in next class.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      <span>Assign additional practice worksheets for weak topics.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      <span>Encourage reassessment after remedial walkthrough.</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      <span>Assign targeted challenge problems to maintain steady momentum.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      <span>Monitor progress next week on chapter written test submissions.</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Strong Topics & Learning Gaps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Column: Strong Topics */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Strong Topics
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {inspectedStudent.analytics.insights?.strongTopics?.length || 0} Topics
                  </span>
                </div>
                {inspectedStudent.analytics.insights?.strongTopics && inspectedStudent.analytics.insights.strongTopics.length > 0 ? (
                  <div className="space-y-2">
                    {inspectedStudent.analytics.insights.strongTopics.slice(0, 3).map((st, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 truncate pr-2">{st.topicTitle}</span>
                        <span className="text-xs font-extrabold text-emerald-700">{st.masteryScore}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No mastered topics recorded yet.</p>
                )}
              </div>

              {/* Right Column: Learning Gaps */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Learning Gaps
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {inspectedStudent.analytics.insights?.needsPracticeTopics?.length || 0} Gaps
                  </span>
                </div>
                {inspectedStudent.analytics.insights?.needsPracticeTopics && inspectedStudent.analytics.insights.needsPracticeTopics.length > 0 ? (
                  <div className="space-y-2">
                    {inspectedStudent.analytics.insights.needsPracticeTopics.slice(0, 3).map((wt, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 truncate pr-2">{wt.topicTitle}</span>
                        <span className="text-xs font-extrabold text-amber-800">{wt.masteryScore}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No critical learning gaps detected.</p>
                )}
              </div>
            </div>

            {/* Subject Breakdown */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2.5">
                Subject Progress Breakdown
              </h4>
              <div className="space-y-2">
                {inspectedStudent.analytics.subjects.map((sub) => (
                  <div
                    key={sub.subjectId}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{sub.subjectName}</p>
                      <p className="text-[11px] text-slate-500">
                        {sub.completedTopics} of {sub.totalTopics} topics completed • {sub.totalAttempts} assessment attempts
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-blue-600">{sub.masteryScore}%</span>
                      <p className="text-[10px] text-slate-500">Mastery</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setInspectedStudent(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};
