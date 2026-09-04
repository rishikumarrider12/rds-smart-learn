import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchTeacherAssignments,
  publishTeacherAssignment,
  closeTeacherAssignment,
  archiveTeacherAssignment,
  deleteTeacherAssignment,
} from '../../services/assignmentService';
import { DbAssignment, TeacherAssignmentStats } from '../../types/assignment';
import { CreateAssignmentModal } from './CreateAssignmentModal';
import { AssignmentSubmissionsRosterModal } from './AssignmentSubmissionsRosterModal';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  Archive,
  Trash2,
  Share2,
  Calendar,
  Layers,
  Award,
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';

interface TeacherAssignmentManagerProps {
  teacherSchoolId?: string;
  teacherSchoolName?: string;
  defaultClassLevel?: string;
  defaultSubjectId?: string;
  onNavigateTopic?: (classLevel: string, subjectId: string, chapterId: string, topicId: string) => void;
}

export const TeacherAssignmentManager: React.FC<TeacherAssignmentManagerProps> = ({
  teacherSchoolId,
  teacherSchoolName,
  defaultClassLevel,
  defaultSubjectId,
}) => {
  const [assignments, setAssignments] = useState<(DbAssignment & TeacherAssignmentStats)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [inspectRosterAssignmentId, setInspectRosterAssignmentId] = useState<string | null>(null);

  const loadAssignments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchTeacherAssignments({
        schoolId: teacherSchoolId,
        status: statusFilter === 'all' ? undefined : statusFilter,
        classLevel: classFilter === 'all' ? undefined : classFilter,
      });
      setAssignments(res.assignments || []);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [teacherSchoolId, statusFilter, classFilter]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handlePublish = async (id: string) => {
    try {
      await publishTeacherAssignment(id);
      loadAssignments();
    } catch (err: any) {
      alert(err.message || 'Failed to publish assignment');
    }
  };

  const handleClose = async (id: string) => {
    try {
      await closeTeacherAssignment(id);
      loadAssignments();
    } catch (err: any) {
      alert(err.message || 'Failed to close assignment');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveTeacherAssignment(id);
      loadAssignments();
    } catch (err: any) {
      alert(err.message || 'Failed to archive assignment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this draft assignment?')) return;
    try {
      await deleteTeacherAssignment(id);
      loadAssignments();
    } catch (err: any) {
      alert(err.message || 'Failed to delete assignment');
    }
  };

  const filtered = assignments.filter((a) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchTopic = a.topicTitle.toLowerCase().includes(q);
      const matchSubject = a.subjectName.toLowerCase().includes(q);
      return matchTitle || matchTopic || matchSubject;
    }
    return true;
  });

  // Calculate high-level summary metrics
  const totalCount = assignments.length;
  const publishedCount = assignments.filter((a) => a.status === 'published').length;
  const totalSubmissions = assignments.reduce((sum, a) => sum + (a.submittedCount || 0), 0);
  const totalAssigned = assignments.reduce((sum, a) => sum + (a.assignedCount || 0), 0);
  const overallAvgCompletion =
    totalAssigned > 0 ? Math.round((totalSubmissions / totalAssigned) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Assignments</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{totalCount}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Curriculum assessments</span>
        </div>

        <div className="bg-[#0b1329] border border-cyan-500/20 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-cyan-300 font-medium">Active / Published</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-cyan-300 mt-2">{publishedCount}</p>
          <span className="text-[11px] text-cyan-400/80 mt-1 block">Open for student submissions</span>
        </div>

        <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Submissions</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">{totalSubmissions}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Graded & recorded</span>
        </div>

        <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Avg Completion Rate</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-400 mt-2">{overallAvgCompletion}%</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Across all assigned classes</span>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Create Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0b1329] p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title, topic, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published (Active)</option>
            <option value="draft">Drafts</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Classes</option>
            <option value="Class 10">Class 10</option>
            <option value="Class 9">Class 9</option>
            <option value="Class 8">Class 8</option>
            <option value="Class 7">Class 7</option>
            <option value="Class 6">Class 6</option>
          </select>
        </div>

        {/* Create Assignment CTA */}
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Smart Assignment
        </button>
      </div>

      {/* Assignment Cards List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-400" />
          <p className="text-sm font-medium">Loading Smart Assignments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No assignments found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Create your first homework assessment aligned with the Telangana SCERT curriculum using the AI question engine.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold shadow-lg hover:bg-cyan-400 transition-all"
          >
            Create New Assignment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((asgn) => {
            const isDraft = asgn.status === 'draft';
            const isPublished = asgn.status === 'published';
            const isClosed = asgn.status === 'closed';

            return (
              <div
                key={asgn.id}
                className="bg-[#0b1329] border border-slate-800/90 rounded-3xl p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-xl space-y-4"
              >
                {/* Header: Class, Subject, Status Badge */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                      {asgn.classLevel} • {asgn.subjectName}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                        isPublished
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isDraft
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {asgn.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white line-clamp-1">{asgn.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {asgn.chapterTitle} • {asgn.topicTitle}
                  </p>
                </div>

                {/* Assignment Stats & Due Date */}
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      {asgn.questions?.length || 0} Questions ({asgn.totalPossibleMarks || 0}M)
                    </span>
                    <span className="capitalize text-slate-300 font-medium">
                      {asgn.assignmentType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Submissions:
                    </span>
                    <span className="font-bold text-white">
                      {asgn.submittedCount || 0} / {asgn.assignedCount || 0} ({asgn.completionRate || 0}%)
                    </span>
                  </div>

                  {asgn.dueDate && (
                    <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        Due:
                      </span>
                      <span className="text-slate-300 text-[11px]">
                        {new Date(asgn.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    {isDraft && (
                      <button
                        type="button"
                        onClick={() => handleDelete(asgn.id)}
                        className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-all"
                        title="Delete Draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {isPublished && (
                      <button
                        type="button"
                        onClick={() => handleClose(asgn.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-all"
                        title="Close Assignment"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}
                    {isClosed && (
                      <button
                        type="button"
                        onClick={() => handleArchive(asgn.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-all"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isDraft ? (
                      <button
                        type="button"
                        onClick={() => handlePublish(asgn.id)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Publish
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setInspectRosterAssignmentId(asgn.id)}
                        className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Submissions
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <CreateAssignmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          setIsCreateOpen(false);
          loadAssignments();
        }}
        teacherSchoolId={teacherSchoolId}
        teacherSchoolName={teacherSchoolName}
        defaultClassLevel={defaultClassLevel}
        defaultSubjectId={defaultSubjectId}
      />

      {/* Submissions Roster Modal */}
      {inspectRosterAssignmentId && (
        <AssignmentSubmissionsRosterModal
          isOpen={Boolean(inspectRosterAssignmentId)}
          assignmentId={inspectRosterAssignmentId}
          onClose={() => setInspectRosterAssignmentId(null)}
        />
      )}
    </div>
  );
};
