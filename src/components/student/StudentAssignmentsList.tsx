import React, { useState, useEffect } from 'react';
import { fetchStudentAssignments } from '../../services/assignmentService';
import { StudentAssignmentItem } from '../../types/assignment';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  ChevronRight,
  RefreshCw,
  Layers,
  Sparkles,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

interface StudentAssignmentsListProps {
  onStartAssignment: (assignmentId: string) => void;
  onViewResult: (assignmentId: string) => void;
}

export const StudentAssignmentsList: React.FC<StudentAssignmentsListProps> = ({
  onStartAssignment,
  onViewResult,
}) => {
  const [assignments, setAssignments] = useState<StudentAssignmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'in_progress' | 'completed' | 'all'>('pending');

  const loadAssignments = async () => {
    setIsLoading(true);
    try {
      const res = await fetchStudentAssignments();
      setAssignments(res.assignments || []);
    } catch (err) {
      console.error('Failed to load student assignments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const pendingAssignments = assignments.filter(
    (a) => (!a.submissionStatus || a.submissionStatus === 'not_started') && a.status === 'published'
  );
  const inProgressAssignments = assignments.filter((a) => a.submissionStatus === 'in_progress');
  const completedAssignments = assignments.filter(
    (a) => a.submissionStatus === 'submitted' || a.submissionStatus === 'evaluated'
  );

  const displayedList =
    activeTab === 'pending'
      ? pendingAssignments
      : activeTab === 'in_progress'
      ? inProgressAssignments
      : activeTab === 'completed'
      ? completedAssignments
      : assignments;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0b1329] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                School Homework & Assessments
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
              Smart Assignments
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Assigned by your teachers aligned with the Telangana SCERT syllabus. Complete assignments to earn marks, receive AI insights, and teacher feedback.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center">
              <span className="text-[11px] text-cyan-300 font-medium">Pending Tasks</span>
              <p className="text-2xl font-extrabold text-white mt-0.5">{pendingAssignments.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <span className="text-[11px] text-emerald-300 font-medium">Completed</span>
              <p className="text-2xl font-extrabold text-white mt-0.5">{completedAssignments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[#0b1329] p-1.5 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Pending Due</span>
          {pendingAssignments.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-cyan-400 text-black font-extrabold text-[10px] flex items-center justify-center">
              {pendingAssignments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('in_progress')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'in_progress'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>In Progress</span>
          {inProgressAssignments.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-extrabold text-[10px] flex items-center justify-center">
              {inProgressAssignments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'completed'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Completed ({completedAssignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All ({assignments.length})
        </button>
      </div>

      {/* Assignment List Content */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-400" />
          <p className="text-sm font-medium">Loading your assignments...</p>
        </div>
      ) : displayedList.length === 0 ? (
        <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No assignments in this view</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeTab === 'pending'
              ? 'You have completed all pending homework assessments! Keep learning.'
              : 'No assignments found in this category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedList.map((asgn) => {
            const isCompleted =
              asgn.submissionStatus === 'submitted' || asgn.submissionStatus === 'evaluated';
            const isInProgress = asgn.submissionStatus === 'in_progress';
            const isPastDue = asgn.dueDate && new Date(asgn.dueDate) < new Date();

            return (
              <div
                key={asgn.id}
                className={`bg-[#0b1329] border rounded-3xl p-5 flex flex-col justify-between transition-all shadow-xl space-y-4 ${
                  isCompleted
                    ? 'border-emerald-500/30 hover:border-emerald-500/50'
                    : isInProgress
                    ? 'border-amber-500/30 hover:border-amber-500/50'
                    : isPastDue
                    ? 'border-rose-500/30 hover:border-rose-500/50'
                    : 'border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                      {asgn.subjectName}
                    </span>

                    {isCompleted ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Graded: {asgn.mySubmission?.percentage ?? 0}%
                      </span>
                    ) : isInProgress ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        In Progress
                      </span>
                    ) : isPastDue ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Overdue
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Pending
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white line-clamp-1">{asgn.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {asgn.chapterTitle} • {asgn.topicTitle}
                  </p>
                </div>

                {/* Details card */}
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      {asgn.questionCount} Questions ({asgn.totalPossibleMarks} Marks)
                    </span>
                    <span className="capitalize text-slate-300">{asgn.assignmentType}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      Due Date:
                    </span>
                    <span className={`text-[11px] font-medium ${isPastDue && !isCompleted ? 'text-rose-400' : 'text-slate-300'}`}>
                      {asgn.dueDate ? new Date(asgn.dueDate).toLocaleDateString() : 'No deadline'}
                    </span>
                  </div>

                  {asgn.mySubmission?.teacherFeedback && (
                    <div className="pt-1.5 border-t border-slate-800/60 flex items-start gap-1.5 text-emerald-300 text-[11px]">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-1 italic">Teacher: "{asgn.mySubmission?.teacherFeedback}"</span>
                    </div>
                  )}
                </div>

                {/* Footer Action Button */}
                <div>
                  {isCompleted ? (
                    <button
                      type="button"
                      onClick={() => onViewResult(asgn.id)}
                      className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Award className="w-3.5 h-3.5" /> View Evaluation & Solutions
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onStartAssignment(asgn.id)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
                    >
                      {isInProgress ? 'Resume Assessment' : 'Start Assessment'} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
