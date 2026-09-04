import React, { useState, useEffect } from 'react';
import { fetchStudentAssignmentResult } from '../services/assignmentService';
import { DbAssignment, DbAssignmentSubmission } from '../types/assignment';
import {
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  MessageSquare,
  ArrowLeft,
  RefreshCw,
  Layers,
  HelpCircle,
  TrendingUp,
  BrainCircuit,
  Calendar,
} from 'lucide-react';

interface StudentAssignmentResultScreenProps {
  assignmentId: string;
  onBackToAssignments: () => void;
  onPracticeTopic?: (topicId: string, chapterId: string, subjectId: string) => void;
  onAskAiWithQuestions?: (prompt: string) => void;
}

export const StudentAssignmentResultScreen: React.FC<StudentAssignmentResultScreenProps> = ({
  assignmentId,
  onBackToAssignments,
  onPracticeTopic,
  onAskAiWithQuestions,
}) => {
  const [data, setData] = useState<{
    assignment: DbAssignment;
    submission: DbAssignmentSubmission;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadResult = async () => {
      setIsLoading(true);
      try {
        const res = await fetchStudentAssignmentResult(assignmentId);
        setData(res);
      } catch (err: any) {
        console.error('Failed to load assignment result:', err);
        setErrorMsg(err.message || 'Failed to load assignment evaluation result.');
      } finally {
        setIsLoading(false);
      }
    };

    if (assignmentId) {
      loadResult();
    }
  }, [assignmentId]);

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <p className="text-slate-300 font-medium">Loading Assessment Insights...</p>
        <p className="text-xs text-slate-500 mt-1">Telangana SCERT Evaluation Engine</p>
      </div>
    );
  }

  if (!data || !data.submission) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Result Not Found</h2>
        <p className="text-xs text-slate-400">{errorMsg || 'Submission record could not be retrieved.'}</p>
        <button
          onClick={onBackToAssignments}
          className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
        >
          Back to Assignments
        </button>
      </div>
    );
  }

  const { assignment, submission } = data;
  const percentage = submission.percentage || 0;

  // Derive performance tier
  const tier =
    percentage >= 80
      ? { label: 'Mastered', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' }
      : percentage >= 60
      ? { label: 'Proficient', color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30' }
      : percentage >= 40
      ? { label: 'Developing', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' }
      : { label: 'Needs Practice', color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/30' };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0b1329] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {assignment.classLevel} • {assignment.subjectName}
              </span>
              <span className="text-xs text-slate-400">
                Ch {assignment.chapterNumber || ''}: {assignment.chapterTitle}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {assignment.title}
            </h1>
            <p className="text-xs text-slate-300">
              Submitted: {new Date(submission.submittedAt || '').toLocaleString()}
              {submission.isLate && <span className="ml-2 text-rose-400 font-bold">(Submitted Late)</span>}
            </p>
          </div>

          {/* Score & Tier Badge */}
          <div className="flex items-center gap-4">
            <div className={`p-5 rounded-3xl border ${tier.bg} ${tier.border} text-center min-w-[140px] shadow-xl`}>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Total Score
              </span>
              <p className="text-3xl font-extrabold text-white mt-1">
                {percentage}%
              </p>
              <span className={`text-xs font-extrabold mt-1 block ${tier.color}`}>
                {submission.totalScore} / {submission.totalPossibleMarks} Marks • {tier.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Feedback Banner (if provided) */}
      {submission.teacherFeedback && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/40 to-cyan-950/40 border border-indigo-500/40 shadow-xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Teacher's Personalized Feedback
            </h3>
            <p className="text-sm text-slate-200 mt-1 italic leading-relaxed">
              "{submission.teacherFeedback}"
            </p>
            {submission.teacherReviewedAt && (
              <span className="text-[10px] text-slate-500 mt-1 block">
                Reviewed on {new Date(submission.teacherReviewedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Question Breakdown Header */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          Question Breakdown & Model Solutions
        </h2>
        <span className="text-xs text-slate-400">
          {(submission.evaluationData?.mcqResults?.length || 0) + (submission.evaluationData?.writtenResults?.length || 0)} Questions Evaluated
        </span>
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {[
          ...(submission.evaluationData?.mcqResults ?? []),
          ...(submission.evaluationData?.writtenResults ?? []),
        ].map((q: any, idx) => {
          const isFullMarks = q.marksAwarded === q.maxMarks;
          const isPartial = q.marksAwarded > 0 && q.marksAwarded < q.maxMarks;

          return (
            <div
              key={q.questionId || idx}
              className="bg-[#0b1329] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-slate-800 text-cyan-400 font-extrabold text-xs flex items-center justify-center">
                    Q{idx + 1}
                  </span>
                  <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${q.type === 'mcq' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'}`}>
                    {q.type.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                      isFullMarks
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isPartial
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {q.marksAwarded} / {q.maxMarks} Marks
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-sm font-medium text-slate-100 leading-relaxed">
                {q.questionText}
              </div>

              {/* MCQ Evaluation Display */}
              {q.type === 'mcq' && (
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div
                      className={`p-3 rounded-2xl border ${
                        q.isCorrect
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold block opacity-80">
                        Your Choice
                      </span>
                      <p className="font-bold mt-0.5">{q.studentResponse || 'Not Answered'}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300">
                      <span className="text-[10px] uppercase font-bold block text-slate-500">
                        Correct Answer
                      </span>
                      <p className="font-bold text-emerald-400 mt-0.5">{q.correctAnswer}</p>
                    </div>
                  </div>

                  {q.explanation && (
                    <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-200">
                      <span className="font-bold block mb-0.5 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Textbook Explanation:
                      </span>
                      <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Written Answer Evaluation Display */}
              {q.type === 'written' && (
                <div className="space-y-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-slate-800 space-y-1 text-xs">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Your Written Answer:
                    </span>
                    <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {q.studentResponse || 'No answer submitted.'}
                    </p>
                  </div>

                  {q.modelAnswer && (
                    <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 space-y-1">
                      <span className="font-bold flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-purple-400" /> SCERT Model Answer:
                      </span>
                      <p className="text-slate-300 leading-relaxed">{q.modelAnswer}</p>
                    </div>
                  )}

                  {q.aiFeedback && (
                    <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
                      <span className="font-bold flex items-center gap-1">
                        <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" /> AI Evaluation Feedback:
                      </span>
                      <p className="text-slate-300 leading-relaxed">{q.aiFeedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
        <button
          type="button"
          onClick={onBackToAssignments}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Smart Assignments Hub
        </button>

        {onPracticeTopic && (
          <button
            type="button"
            onClick={() => onPracticeTopic(assignment.topicId, assignment.chapterId, assignment.subjectId)}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Practice Topic in RDS AI Engine
          </button>
        )}
      </div>
    </div>
  );
};
