import React, { useState, useEffect } from 'react';
import {
  fetchAssignmentSubmissionsRoster,
  fetchStudentSubmissionDetails,
  submitTeacherFeedback,
} from '../../services/assignmentService';
import { DbAssignment, DbAssignmentSubmission } from '../../types/assignment';
import {
  X,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Send,
  Calendar,
  FileText,
  ChevronRight,
} from 'lucide-react';

interface AssignmentSubmissionsRosterModalProps {
  isOpen: boolean;
  assignmentId: string;
  onClose: () => void;
}

export const AssignmentSubmissionsRosterModal: React.FC<AssignmentSubmissionsRosterModalProps> = ({
  isOpen,
  assignmentId,
  onClose,
}) => {
  const [data, setData] = useState<{
    assignment: any;
    roster: Array<{
      studentId: string;
      studentName: string;
      studentEmail?: string;
      classLevel: string;
      status: string;
      submissionId?: string;
      submittedAt?: string;
      totalScore?: number;
      totalPossibleMarks?: number;
      percentage?: number;
      isLate?: boolean;
      teacherFeedback?: string;
    }>;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Inspected student submission
  const [inspectedStudentId, setInspectedStudentId] = useState<string | null>(null);
  const [inspectedDetail, setInspectedDetail] = useState<{
    assignment: DbAssignment;
    student: any;
    submission: DbAssignmentSubmission | null;
  } | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);

  const loadRoster = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAssignmentSubmissionsRoster(assignmentId);
      setData(res);
    } catch (err) {
      console.error('Failed to load submissions roster:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && assignmentId) {
      loadRoster();
      setInspectedStudentId(null);
      setInspectedDetail(null);
    }
  }, [isOpen, assignmentId]);

  const handleInspectStudent = async (studentId: string) => {
    setInspectedStudentId(studentId);
    setIsLoadingDetail(true);
    try {
      const res = await fetchStudentSubmissionDetails(assignmentId, studentId);
      setInspectedDetail(res);
      setFeedbackInput(res.submission?.teacherFeedback || '');
    } catch (err: any) {
      alert(err.message || 'Failed to load student submission details');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleSaveFeedback = async () => {
    if (!inspectedStudentId || !feedbackInput.trim()) return;
    setIsSavingFeedback(true);
    try {
      await submitTeacherFeedback(assignmentId, inspectedStudentId, feedbackInput.trim());
      await handleInspectStudent(inspectedStudentId);
      await loadRoster();
    } catch (err: any) {
      alert(err.message || 'Failed to save feedback');
    } finally {
      setIsSavingFeedback(false);
    }
  };

  if (!isOpen) return null;

  const filteredRoster = (data?.roster || []).filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.studentName.toLowerCase().includes(q);
      const matchEmail = item.studentEmail?.toLowerCase().includes(q);
      return matchName || matchEmail;
    }
    return true;
  });

  const assignment = data?.assignment;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0b1329] border border-cyan-500/30 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-[#0e1730]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {assignment?.title || 'Assignment Submissions'}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
                  {assignment?.classLevel} • {assignment?.subjectName}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {assignment?.topicTitle} • Due: {assignment?.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No deadline'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row */}
        {assignment && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#080d1e] border-b border-slate-800">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400">Assigned Students</span>
              <p className="text-lg font-bold text-white mt-0.5">{assignment.assignedCount || 0}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400">Submissions</span>
              <p className="text-lg font-bold text-cyan-300 mt-0.5">
                {assignment.submittedCount || 0} / {assignment.assignedCount || 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400">Completion Rate</span>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">{assignment.completionRate || 0}%</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400">Average Class Score</span>
              <p className="text-lg font-bold text-amber-400 mt-0.5">{assignment.averageScore || 0}%</p>
            </div>
          </div>
        )}

        {/* Main Content Area: Split View when inspecting a student */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left: Students Roster List */}
          <div className={`p-5 overflow-y-auto space-y-4 ${inspectedStudentId ? 'md:w-1/2 border-r border-slate-800' : 'w-full'}`}>
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="in_progress">In Progress</option>
                <option value="not_started">Not Started</option>
              </select>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                <p className="text-xs">Loading class roster...</p>
              </div>
            ) : filteredRoster.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No students match your criteria.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredRoster.map((item) => {
                  const isSelected = inspectedStudentId === item.studentId;
                  const isDone = item.status === 'submitted' || item.status === 'evaluated';

                  return (
                    <div
                      key={item.studentId}
                      onClick={() => handleInspectStudent(item.studentId)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isDone
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : item.status === 'in_progress'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {item.studentName.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            {item.studentName}
                            {item.isLate && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-medium">
                                Late
                              </span>
                            )}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {item.studentEmail || item.classLevel}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        {isDone ? (
                          <div>
                            <span className="text-xs font-extrabold text-emerald-400">
                              {item.percentage}%
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              {item.totalScore}/{item.totalPossibleMarks} marks
                            </span>
                          </div>
                        ) : (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.status === 'in_progress'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {item.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Submission Inspector & Feedback Panel */}
          {inspectedStudentId && (
            <div className="md:w-1/2 p-5 overflow-y-auto bg-[#080d1e]/80 border-t md:border-t-0 flex flex-col space-y-4">
              {isLoadingDetail ? (
                <div className="py-20 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                  <p className="text-xs">Loading student answers and AI evaluation...</p>
                </div>
              ) : inspectedDetail ? (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {inspectedDetail.student?.fullName || 'Student Evaluation'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {inspectedDetail.submission
                          ? `Submitted: ${new Date(inspectedDetail.submission.submittedAt || '').toLocaleString()}`
                          : 'No submission recorded yet'}
                      </p>
                    </div>
                    {inspectedDetail.submission && (
                      <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-sm">
                        {inspectedDetail.submission.percentage}% ({inspectedDetail.submission.totalScore}/{inspectedDetail.submission.totalPossibleMarks} Marks)
                      </div>
                    )}
                  </div>

                  {/* Question Responses Breakdown */}
                  {(inspectedDetail.submission &&
                    ((inspectedDetail.submission.evaluationData?.mcqResults?.length || 0) +
                      (inspectedDetail.submission.evaluationData?.writtenResults?.length || 0)) > 0) ? (
                    <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                      {[
                        ...(inspectedDetail.submission.evaluationData?.mcqResults ?? []),
                        ...(inspectedDetail.submission.evaluationData?.writtenResults ?? []),
                      ].map((q: any, idx: number) => (
                        <div
                          key={q.questionId || idx}
                          className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-300">
                              Q{idx + 1} ({q.type.toUpperCase()})
                            </span>
                            <span className={`font-extrabold ${q.marksAwarded === q.maxMarks ? 'text-emerald-400' : q.marksAwarded > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                              {q.marksAwarded} / {q.maxMarks} marks
                            </span>
                          </div>

                          <p className="text-xs text-slate-200">{q.questionText}</p>

                          {q.type === 'mcq' && (
                            <div className="text-xs space-y-1 bg-black/40 p-2 rounded-xl">
                              <p className="text-slate-300">
                                Student Answer: <span className="font-bold text-cyan-300">{q.studentResponse || 'Not answered'}</span>
                              </p>
                              <p className="text-slate-400">
                                Correct Answer: <span className="font-bold text-emerald-400">{q.correctAnswer}</span>
                              </p>
                              {q.explanation && (
                                <p className="text-[11px] text-slate-400 italic mt-1">{q.explanation}</p>
                              )}
                            </div>
                          )}

                          {q.type === 'written' && (
                            <div className="text-xs space-y-2 bg-black/40 p-2.5 rounded-xl">
                              <div>
                                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                                  Student's Written Response:
                                </span>
                                <p className="text-slate-200 mt-0.5 whitespace-pre-wrap">
                                  {q.studentResponse || 'No answer submitted.'}
                                </p>
                              </div>
                              {q.aiFeedback && (
                                <div className="p-2 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-200">
                                  <span className="font-bold flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-indigo-400" /> AI Evaluation:
                                  </span>
                                  <p className="text-slate-300 mt-0.5">{q.aiFeedback}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      Student has not completed this assessment yet.
                    </div>
                  )}

                  {/* Teacher Feedback Box */}
                  {inspectedDetail.submission && (
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                        Teacher's Personalized Feedback
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={feedbackInput}
                          onChange={(e) => setFeedbackInput(e.target.value)}
                          placeholder="e.g. Excellent grasp of logarithms! Review the quadratic formula."
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          type="button"
                          onClick={handleSaveFeedback}
                          disabled={isSavingFeedback || !feedbackInput.trim()}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isSavingFeedback ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
