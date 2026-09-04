import React from 'react';
import { AlertTriangle, RefreshCw, HelpCircle, KeyRound } from 'lucide-react';

interface AiErrorStateProps {
  errorMessage: string;
  onRetry: () => void;
  isConfigError?: boolean;
}

export const AiErrorState: React.FC<AiErrorStateProps> = ({
  errorMessage,
  onRetry,
  isConfigError,
}) => {
  return (
    <div className="p-6 bg-gradient-to-b from-rose-950/30 to-[#0d1224] border border-rose-500/40 rounded-2xl text-slate-200">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0 mt-0.5">
          {isConfigError ? <KeyRound className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white">
              {isConfigError ? 'AI Service Setup Notice' : 'Unable to complete AI request'}
            </h4>
          </div>

          <p className="text-xs text-rose-200/90 leading-relaxed">
            {errorMessage || 'There was a temporary interruption while connecting to RDS AI.'}
          </p>

          {isConfigError && (
            <p className="text-xs text-slate-400 bg-[#070b18] p-2.5 rounded-lg border border-slate-800 font-mono">
              Tip: In Google AI Studio Build, configure the GEMINI_API_KEY secret in Settings to activate the live model.
            </p>
          )}

          <div className="pt-2 flex items-center gap-3">
            <button
              id="ai-error-retry-btn"
              type="button"
              onClick={onRetry}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-rose-950/40"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
