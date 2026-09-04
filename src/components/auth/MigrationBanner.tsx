import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CloudUpload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const MigrationBanner: React.FC = () => {
  const { showMigrationPrompt, migrationDataCount, dismissMigrationPrompt, executeMigration } = useAuth();
  const [isMigrating, setIsMigrating] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ success: boolean; text: string } | null>(null);

  if (!showMigrationPrompt) return null;

  const handleImport = async () => {
    setIsMigrating(true);
    setResultMsg(null);
    try {
      const res = await executeMigration();
      setResultMsg({ success: res.success, text: res.message });
      if (res.success) {
        setTimeout(() => {
          dismissMigrationPrompt();
        }, 3000);
      }
    } catch (err: any) {
      setResultMsg({ success: false, text: err.message || 'Failed to import progress.' });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div
      id="migration-prompt-banner"
      className="max-w-6xl mx-auto px-4 sm:px-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="bg-gradient-to-r from-blue-950/90 via-[#0d1c3a] to-purple-950/90 border border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-xl shadow-cyan-950/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 mt-0.5">
            <CloudUpload className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Local Progress Detected</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
                {migrationDataCount.mcqs} Tests • {migrationDataCount.written} Written • {migrationDataCount.chats} AI Chats
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed max-w-2xl">
              We found learning progress saved on this device. Would you like to connect this progress to your RDS SMART LEARN cloud account?
            </p>
            {resultMsg && (
              <div className={`mt-2 text-xs flex items-center gap-1.5 font-medium ${resultMsg.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                {resultMsg.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{resultMsg.text}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end shrink-0">
          <button
            id="migration-skip-btn"
            onClick={dismissMigrationPrompt}
            disabled={isMigrating}
            className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-all"
          >
            Skip for Now
          </button>
          <button
            id="migration-import-btn"
            onClick={handleImport}
            disabled={isMigrating}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-900/40 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isMigrating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <CloudUpload className="w-3.5 h-3.5" />
                <span>Import My Progress</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
