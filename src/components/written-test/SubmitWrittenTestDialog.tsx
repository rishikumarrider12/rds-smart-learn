import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  X, 
  PenTool, 
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { LearningLanguage } from '../../services/ai/aiTypes';
import { t } from '../../services/study/examText';

interface SubmitWrittenTestDialogProps {
  isOpen: boolean;
  totalQuestions: number;
  answeredCount: number;
  onClose: () => void;
  onConfirmSubmit: () => void;
  language?: LearningLanguage;
}

export const SubmitWrittenTestDialog: React.FC<SubmitWrittenTestDialogProps> = ({
  isOpen,
  totalQuestions,
  answeredCount,
  onClose,
  onConfirmSubmit,
  language = 'English',
}) => {
  if (!isOpen) return null;

  const unansweredCount = totalQuestions - answeredCount;
  const hasUnanswered = unansweredCount > 0;

  return (
    <div id="submit-written-test-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#090f23] border border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-6 relative text-slate-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-[#060a17] hover:bg-[#121d3f] border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Icon & Header */}
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            hasUnanswered 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {hasUnanswered ? <AlertTriangle className="w-6 h-6" /> : <FileCheck className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              {hasUnanswered ? t('unansweredQuestions', language) : t('readyToSubmit', language)}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              RDS AI will evaluate each written response
            </p>
          </div>
        </div>

        {/* Summary counts */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#060a17] border border-slate-800 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('answered', language)}</span>
            <span className="text-2xl font-black text-emerald-400">{answeredCount}</span>
            <span className="text-[10px] text-slate-400 block">/ {totalQuestions}</span>
          </div>

          <div className={`border rounded-2xl p-3.5 text-center ${
            hasUnanswered ? 'bg-amber-500/10 border-amber-500/30' : 'bg-[#060a17] border-slate-800'
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('notAnswered', language)}</span>
            <span className={`text-2xl font-black ${hasUnanswered ? 'text-amber-400' : 'text-slate-500'}`}>
              {unansweredCount}
            </span>
            <span className="text-[10px] text-slate-400 block">{t('questions', language)}</span>
          </div>
        </div>

        {/* Warning or Instruction Notice */}
        {hasUnanswered ? (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}.
            </p>
            <p className="text-amber-300/90 text-[11px]">
              Unanswered questions will receive 0 marks and will be marked for revision.
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs leading-relaxed flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Great job! All questions have answers ready for AI evaluation.</span>
          </div>
        )}

        <div className="text-[11px] text-slate-400 leading-normal">
          <strong className="text-slate-300">Note:</strong> Once submitted, the test attempt will be locked so RDS AI can generate comprehensive marks, rubric feedback, and model answer comparisons.
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-[#060a17] hover:bg-[#121d3f] border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all text-center"
          >
            {t('reviewAnswers', language)}
          </button>

          <button
            id="confirm-submit-test-btn"
            type="button"
            onClick={onConfirmSubmit}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>{hasUnanswered ? t('submitAnyway', language) : t('submitForEvaluation', language)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
