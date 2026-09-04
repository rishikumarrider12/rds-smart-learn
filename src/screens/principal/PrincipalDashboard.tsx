import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchPrincipalDashboard,
  fetchPrincipalStudentDeepView,
} from '../../services/organizationService';
import { PrincipalDashboardData, StudentNeedingSupport } from '../../types/organization';
import { StudentAnalyticsOverview } from '../../types/analytics';
import { UserProfile } from '../../types/auth';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/ui/StatCard';
import { DashboardCard } from '../../components/ui/DashboardCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Building2,
  Users,
  GraduationCap,
  Award,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Search,
  Eye,
  X,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  School,
  Sparkles,
  Layers,
  Flame,
  CheckSquare,
} from 'lucide-react';

interface PrincipalDashboardProps {
  onNavigate: (path: string) => void;
  activeSection?: string;
}

export const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({
  onNavigate,
  activeSection = 'overview',
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<PrincipalDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'classes' | 'subjects' | 'teachers' | 'support'>('classes');

  // Deep student inspection
  const [inspectedStudent, setInspectedStudent] = useState<{
    profile: UserProfile;
    analytics: StudentAnalyticsOverview;
  } | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchPrincipalDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load principal dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleInspectStudent = async (studentId: string) => {
    setIsInspecting(true);
    try {
      const res = await fetchPrincipalStudentDeepView(studentId);
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

  const school = data?.school;
  const overview = data?.overview;

  if (isLoading && !data) {
    return (
      <DashboardLayout
        currentPath="/principal"
        onNavigate={onNavigate}
        title="Principal Portal"
        subtitle="Institutional Academic Analytics"
      >
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
            <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Loading Institutional Analytics...</h3>
          <p className="text-xs text-slate-500 mt-1">Aggregating Telangana SCERT Academic Performance</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      currentPath="/principal"
      onNavigate={onNavigate}
      title="Principal Portal"
      subtitle={`${school?.name || user?.schoolName || 'Institutional Dashboard'} • Telangana SCERT`}
    >
      <div id="principal-dashboard-view" className="space-y-6 sm:space-y-8">
        {/* 1. School Header Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Principal Portal
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  CODE: {school?.schoolCode || 'SCERT-TS'} • {school?.district || 'Hyderabad'}, {school?.state || 'Telangana'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                {school?.name || user?.schoolName || 'Institutional Dashboard'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Institution-wide academic mastery, class-level syllabus completion, faculty assignments, and diagnostic flags.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Explore Curriculum</span>
            </button>
            <button
              onClick={loadDashboard}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition-colors shadow-2xs"
              title="Refresh School Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. School Overview KPI Grid */}
        {overview && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              id="principal-kpi-enrolled"
              title="Total Students Enrolled"
              value={overview.totalStudents}
              subtitle={`${overview.activeStudents} active learners`}
              icon={GraduationCap}
              iconColor="emerald"
            />

            <StatCard
              id="principal-kpi-mastery"
              title="School Average Mastery"
              value={`${overview.overallAverageMastery}%`}
              subtitle="Across all classes & subjects"
              icon={Award}
              iconColor="blue"
            />

            <StatCard
              id="principal-kpi-faculty"
              title="Teaching Faculty"
              value={overview.totalTeachers}
              subtitle="Assigned subject educators"
              icon={Users}
              iconColor="purple"
            />

            <StatCard
              id="principal-kpi-support"
              title="Intervention Flags"
              value={data?.studentsNeedingSupport.length ?? 0}
              subtitle="Students requiring attention"
              icon={AlertTriangle}
              iconColor={(data?.studentsNeedingSupport.length ?? 0) > 0 ? 'amber' : 'emerald'}
            />
          </div>
        )}

        {/* 3. Secondary Metrics Bar */}
        {overview && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Syllabus Completion</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{overview.overallSyllabusCompletion}%</h3>
                <p className="text-xs text-slate-500 mt-0.5">SCERT syllabus mapped</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assessments Taken</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{overview.totalTestsCompleted}</h3>
                <p className="text-xs text-slate-500 mt-0.5">MCQ and written test submissions</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <CheckSquare className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Learner Ratio</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                  {overview.totalStudents > 0 ? Math.round((overview.activeStudents / overview.totalStudents) * 100) : 0}%
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{overview.activeStudents} of {overview.totalStudents} enrolled</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        {/* 4. Tab Navigation Header */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'classes', label: 'Class-Wise Analytics', count: data?.classes.length },
            { id: 'subjects', label: 'Subject Performance', count: data?.subjects.length },
            { id: 'teachers', label: 'Faculty Roster', count: data?.teachers.length },
            { id: 'support', label: 'Students Needing Support', count: data?.studentsNeedingSupport.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    activeTab === tab.id ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 5. Tab Contents */}

        {/* TAB 1: Class-Wise Analytics */}
        {activeTab === 'classes' && (
          <DashboardCard
            id="principal-class-breakdown"
            title={
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>Class-Wise Performance Breakdown</span>
              </div>
            }
            subtitle="Aggregated mastery and syllabus completion across all grades"
            bodyClassName="p-0"
          >
            <div className="overflow-x-auto">
              <table className="rds-table">
                <thead>
                  <tr>
                    <th>Class Level</th>
                    <th>Enrolled Students</th>
                    <th>Active Learners</th>
                    <th>Average Mastery</th>
                    <th>Syllabus Completion</th>
                    <th>Support Flags</th>
                    <th>Accuracy (MCQ / Written)</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.classes || []).map((cls) => (
                    <tr key={cls.classLevel}>
                      <td className="font-bold text-slate-900">{cls.classLevel}</td>
                      <td>{cls.studentCount} students</td>
                      <td className="text-emerald-700 font-semibold">{cls.activeStudents}</td>
                      <td>
                        <div className="flex items-center gap-2.5 min-w-[120px]">
                          <ProgressBar value={cls.averageMastery} size="sm" className="flex-1" />
                          <span className="font-bold text-slate-800 text-xs">{cls.averageMastery}%</span>
                        </div>
                      </td>
                      <td>
                        <span className="font-semibold text-purple-700">{cls.averageCompletionPct}%</span>
                      </td>
                      <td className="font-mono text-slate-700">{cls.studentsNeedingSupportCount}</td>
                      <td className="text-slate-600">
                        {cls.averageMcqAccuracy}% / {cls.averageWrittenAccuracy}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        )}

        {/* TAB 2: Subject Performance */}
        {activeTab === 'subjects' && (
          <DashboardCard
            id="principal-subject-breakdown"
            title={
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Subject-Wise Mastery Breakdown</span>
              </div>
            }
            subtitle="Performance and curriculum health indicators across academic subjects"
            bodyClassName="p-0"
          >
            <div className="overflow-x-auto">
              <table className="rds-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Average Mastery</th>
                    <th>Syllabus Completion</th>
                    <th>Active Learners</th>
                    <th>Diagnostic Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.subjects || []).map((sub) => (
                    <tr key={sub.subjectId}>
                      <td className="font-bold text-slate-900">{sub.subjectName}</td>
                      <td>
                        <span className="font-bold text-blue-700 text-sm">{sub.averageMastery}%</span>
                      </td>
                      <td>
                        <span className="font-semibold text-purple-700">{sub.completionPercentage}%</span>
                      </td>
                      <td className="font-mono text-slate-700">{sub.activeLearners}</td>
                      <td>
                        {sub.weakestTopics.length > 0 ? (
                          <StatusBadge variant="needs_practice" label={`${sub.weakestTopics.length} Weak Topics`} size="sm" />
                        ) : (
                          <StatusBadge variant="success" label="On Track" size="sm" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        )}

        {/* TAB 3: Faculty Roster */}
        {activeTab === 'teachers' && (
          <DashboardCard
            id="principal-teacher-roster"
            title={
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span>Teaching Faculty Allocations ({data?.teachers.length || 0})</span>
              </div>
            }
            subtitle="Educator assignments and subject responsibilities"
            bodyClassName="p-0"
          >
            <div className="overflow-x-auto">
              <table className="rds-table">
                <thead>
                  <tr>
                    <th>Teacher</th>
                    <th>Email</th>
                    <th>Assigned Classes</th>
                    <th>Assigned Subjects</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.teachers || []).map((t) => (
                    <tr key={t.id}>
                      <td>
                        <p className="font-bold text-slate-900">{t.fullName}</p>
                      </td>
                      <td className="text-slate-600 text-xs">{t.email}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {t.assignedClasses && t.assignedClasses.length > 0 ? (
                            t.assignedClasses.map((c) => (
                              <span key={c} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                                {c}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs italic">None</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {t.assignedSubjects && t.assignedSubjects.length > 0 ? (
                            t.assignedSubjects.map((s) => (
                              <span key={s} className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs italic">None</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={t.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        )}

        {/* TAB 4: Students Needing Support */}
        {activeTab === 'support' && (
          <DashboardCard
            id="principal-support-panel"
            title={
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Institutional Support Alerts ({data?.studentsNeedingSupport.length || 0})</span>
              </div>
            }
            subtitle="Learners across all classrooms requiring academic interventions"
          >
            {(!data?.studentsNeedingSupport || data.studentsNeedingSupport.length === 0) ? (
              <EmptyState
                icon={CheckCircle2}
                title="All students performing well"
                description="No critical academic flags active across any classroom."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.studentsNeedingSupport.map((stu) => (
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
            )}
          </DashboardCard>
        )}

        {/* Student Deep Inspection Modal */}
        {inspectedStudent && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                    {inspectedStudent.profile.fullName[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {inspectedStudent.profile.fullName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {inspectedStudent.profile.classLevel || 'Class 10'} • {inspectedStudent.profile.email}
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Overall Mastery</span>
                  <p className="text-xl font-extrabold text-blue-600 mt-0.5">
                    {inspectedStudent.analytics.averageMastery}%
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Syllabus Covered</span>
                  <p className="text-xl font-extrabold text-purple-600 mt-0.5">
                    {inspectedStudent.analytics.overallCompletionPct}%
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500">MCQ Accuracy</span>
                  <p className="text-xl font-extrabold text-emerald-600 mt-0.5">
                    {inspectedStudent.analytics.averageMcqAccuracy}%
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Learning Streak</span>
                  <p className="text-xl font-extrabold text-amber-600 mt-0.5">
                    {inspectedStudent.analytics.streak?.currentStreak || 0} Days
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-900 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Institutional Intervention Insight</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {inspectedStudent.analytics.averageMastery < 50
                    ? `Foundational learning gap observed. Recommend assigning subject teacher review and remedial practice modules.`
                    : `Student maintains standard progression. Keep monitoring regular attendance and chapter assessment submissions.`}
                </p>
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
