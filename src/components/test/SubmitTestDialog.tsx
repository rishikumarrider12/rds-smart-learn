import React from 'react';
import { AlertCircle, CheckCircle2, Send, X, ArrowLeft } from 'lucide-react';

interface SubmitTestDialogProps {
  isOpen: boolean;
  totalQuestions: number;
  answeredCount: number;
  onClose: () => void;
  onConfirmSubmit: () => void;
}

export const SubmitTestDialog: React.FC<SubmitTestDialogProps> = ({
  isOpen,
  totalQuestions,
  answeredCount,
  onClose,
  onConfirmSubmit,
}) => {
  if (!isOpen) return null;

  const unansweredCount = totalQuestions - answeredCount;
  const isAllAnswered = unansweredCount === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#090f23] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden animate-scale-up">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon */}
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isAllAnswered ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            {isAllAnswered ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text */}
        <div>
          <h3 className="text-xl font-bold text-white mb-2">
            {isAllAnswered ? 'Ready to Submit Your Test?' : 'Unanswered Questions Remaining'}
          </h3>
          <p className="text-sm text-slate-300">
            You have answered <span className="font-bold text-cyan-400">{answeredCount}</span> out of{' '}
            <span className="font-bold text-white">{totalQuestions}</span> questions.
          </p>
          {!isAllAnswered && (
            <p className="text-xs text-amber-300 mt-2 bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30">
              ⚠️ <span className="font-bold">{unansweredCount}</span> questions are currently unanswered. Once submitted, your answers cannot be changed.
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            id="dialog-review-test-btn"
            type="button"
            onClick={onClose}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Review Test</span>
          </button>

          <button
            id="dialog-confirm-submit-btn"
            type="button"
            onClick={onConfirmSubmit}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isAllAnswered ? 'Submit Test' : 'Submit Anyway'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
