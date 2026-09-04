import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  startStudentAssignment,
  autosaveStudentAssignment,
  submitStudentAssignment,
} from '../services/assignmentService';
import { DbAssignment, DbAssignmentSubmission, DbAssignmentQuestion } from '../types/assignment';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Send,
  Save,
  RefreshCw,
  Layers,
  Sparkles,
  HelpCircle,
  X,
} from 'lucide-react';

interface StudentAssignmentPlayerScreenProps {
  assignmentId: string;
  onExit: () => void;
  onSubmitted: (assignmentId: string) => void;
}

export const StudentAssignmentPlayerScreen: React.FC<StudentAssignmentPlayerScreenProps> = ({
  assignmentId,
  onExit,
  onSubmitted,
}) => {
  const [assignment, setAssignment] = useState<DbAssignment | null>(null);
  const [submission, setSubmission] = useState<DbAssignmentSubmission | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Local state for answers: map of questionId -> { selectedOption, writtenAnswer }
  const [responses, setResponses] = useState<
    Record<string, { selectedOption?: string; writtenAnswer?: string; timeSpentSeconds?: number }>
  >({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Autosave debouncer
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initAssignment = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await startStudentAssignment(assignmentId);
      setAssignment(res.assignment);
      setSubmission(res.submission);

      if (res.submission && res.submission.questionResponses) {
        setResponses(res.submission.questionResponses);
      }
    } catch (err: any) {
      console.error('Failed to start assignment:', err);
      setErrorMsg(err.message || 'Failed to load assignment.');
    } finally {
      setIsLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    initAssignment();
  }, [initAssignment]);

  const triggerAutosave = useCallback((updatedResponses: typeof responses) => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(async () => {
      setIsAutosaving(true);
      try {
        const res = await autosaveStudentAssignment(assignmentId, updatedResponses);
        if (res.success) {
          setLastSavedTime(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.warn('Autosave background sync failed:', err);
      } finally {
        setIsAutosaving(false);
      }
    }, 1500);
  }, [assignmentId]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    const updated = {
      ...responses,
      [questionId]: {
        ...responses[questionId],
        selectedOption: optionId,
      },
    };
    setResponses(updated);
    triggerAutosave(updated);
  };

  const handleWrittenChange = (questionId: string, text: string) => {
    const updated = {
      ...responses,
      [questionId]: {
        ...responses[questionId],
        writtenAnswer: text,
      },
    };
    setResponses(updated);
    triggerAutosave(updated);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await submitStudentAssignment(assignmentId, responses);
      if (res.success) {
        onSubmitted(assignmentId);
      } else {
        throw new Error(res.message || 'Submission failed');
      }
    } catch (err: any) {
      console.error('Failed to submit assignment:', err);
      setErrorMsg(err.message || 'Failed to submit assignment.');
      setShowSubmitModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <p className="text-slate-300 font-medium">Preparing Assessment Environment...</p>
        <p className="text-xs text-slate-500 mt-1">Telangana SCERT Smart Assignment Engine</p>
      </div>
    );
  }

  if (!assignment || !assignment.questions || assignment.questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Unable to load assignment</h2>
        <p className="text-xs text-slate-400">{errorMsg || 'Assignment has no questions or is unavailable.'}</p>
        <button
          onClick={onExit}
          className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const questions = assignment.questions;
  const currentQ: DbAssignmentQuestion = questions[currentIdx] || questions[0];
  const isLastQuestion = currentIdx === questions.length - 1;

  // Question response status counts
  const answeredCount = questions.filter((q) => {
    const resp = responses[q.id];
    if (q.type === 'mcq') return Boolean(resp?.selectedOption);
    return Boolean(resp?.writtenAnswer && resp.writtenAnswer.trim().length > 0);
  }).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Bar with Context and Autosave Indicator */}
      <div className="bg-[#0b1329] border border-cyan-500/30 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {assignment.classLevel} • {assignment.subjectName}
            </span>
            <span className="text-xs text-slate-400">
              Ch {assignment.chapterNumber || ''}: {assignment.chapterTitle}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white mt-1">
            {assignment.title}
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Autosave Status */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            {isAutosaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>Autosaving...</span>
              </>
            ) : lastSavedTime ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved at {lastSavedTime}</span>
              </>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onExit}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
          >
            Save & Exit
          </button>
        </div>
      </div>

      {/* Progress & Question Index Navigator */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300">
            Question {currentIdx + 1} of {questions.length}
          </span>
          <span className="text-cyan-400 font-semibold">
            {answeredCount} / {questions.length} Answered
          </span>
        </div>

        {/* Question Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {questions.map((q, idx) => {
            const isAnswered =
              q.type === 'mcq'
                ? Boolean(responses[q.id]?.selectedOption)
                : Boolean(responses[q.id]?.writtenAnswer?.trim());
            const isCurrent = idx === currentIdx;

            return (
              <button
                key={q.id || idx}
                onClick={() => setCurrentIdx(idx)}
                className={`w-9 h-9 rounded-xl font-bold text-xs shrink-0 transition-all border ${
                  isCurrent
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/20'
                    : isAnswered
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-[#0b1329] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Question Meta */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 font-extrabold text-sm flex items-center justify-center">
              {currentIdx + 1}
            </span>
            <span className={`text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full ${currentQ.type === 'mcq' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'}`}>
              {currentQ.type.toUpperCase()} • {currentQ.marks || 1} {currentQ.marks === 1 ? 'Mark' : 'Marks'}
            </span>
          </div>

          <span className="text-xs text-slate-400">
            Concept: <strong className="text-slate-300">{currentQ.concept || assignment.topicTitle}</strong>
          </span>
        </div>

        {/* Question Prompt */}
        <div className="text-base sm:text-lg font-medium text-white leading-relaxed">
          {currentQ.question}
        </div>

        {/* Answer Area: MCQ vs Written */}
        {currentQ.type === 'mcq' ? (
          <div className="space-y-3 pt-2">
            {currentQ.options?.map((opt) => {
              const isSelected = responses[currentQ.id]?.selectedOption === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, opt.id)}
                  className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center gap-3.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? 'bg-cyan-500 text-black font-extrabold shadow-md'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {opt.id}
                  </div>
                  <span className="text-sm font-medium flex-1">{opt.text}</span>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Write your descriptive answer in detail:</span>
              <span>
                {(responses[currentQ.id]?.writtenAnswer || '').trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              rows={7}
              value={responses[currentQ.id]?.writtenAnswer || ''}
              onChange={(e) => handleWrittenChange(currentQ.id, e.target.value)}
              placeholder="Type your structured answer here according to Telangana SCERT standards..."
              className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
            />
            <p className="text-[11px] text-slate-500 italic">
              Tip: Include key definitions, formulas, step-by-step reasoning, and final conclusions.
            </p>
          </div>
        )}

        {/* Navigation Buttons within Player */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          <button
            type="button"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(currentIdx - 1)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-3">
            {!isLastQuestion ? (
              <button
                type="button"
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Send className="w-4 h-4" /> Review & Submit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b1329] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Submit Assignment?
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to submit <strong className="text-white">{assignment.title}</strong> for AI evaluation and teacher review.
            </p>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Questions:</span>
                <span className="font-bold text-white">{questions.length}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Answered Questions:</span>
                <span className="font-bold text-emerald-400">{answeredCount}</span>
              </div>
              {questions.length - answeredCount > 0 && (
                <div className="flex justify-between text-rose-400 pt-1 border-t border-slate-800">
                  <span>Unanswered Questions:</span>
                  <span className="font-bold">{questions.length - answeredCount}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Confirm & Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
