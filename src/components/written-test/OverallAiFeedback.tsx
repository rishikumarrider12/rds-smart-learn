import React from 'react';
import { 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  ArrowRight, 
  MessageSquare,
  RefreshCw,
  LayoutDashboard,
  Brain
} from 'lucide-react';
import { OverallWrittenFeedback } from '../../types/writtenTest';

interface OverallAiFeedbackProps {
  feedback: OverallWrittenFeedback;
  onDiscussWithAi: () => void;
  onLearnWeakTopics: (concept?: string) => void;
  onRetakeTest: () => void;
  onGoToDashboard: () => void;
}

export const OverallAiFeedback: React.FC<OverallAiFeedbackProps> = ({
  feedback,
  onDiscussWithAi,
  onLearnWeakTopics,
  onRetakeTest,
  onGoToDashboard,
}) => {
  return (
    <div id="overall-ai-feedback-section" className="bg-[#090f23] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3.5 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg flex items-center justify-center">
          <div className="w-full h-full bg-[#070b18] rounded-[14px] flex items-center justify-center text-cyan-300">
            <Bot className="w-6 h-6" />
          </div>
        </div>
        <div>
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
            Personalized Tutor Insights
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            RDS AI Written Test Analysis
          </h2>
        </div>
      </div>

      {/* Overall feedback narrative */}
      <div className="bg-[#060a17] border border-slate-800 rounded-2xl p-5 relative z-10">
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
          "{feedback.overallFeedback}"
        </p>
      </div>

      {/* Strong Areas vs Areas to Improve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {/* Strong Areas */}
        <div className="bg-[#060a17] border border-emerald-500/20 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Demonstrated Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {feedback.strongAreas.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas to Improve */}
        <div className="bg-[#060a17] border border-amber-500/20 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Key Areas to Revise</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {feedback.areasToImprove.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Common Mistakes Pattern if present */}
      {feedback.commonMistakes && feedback.commonMistakes.length > 0 && (
        <div className="bg-[#060a17] border border-purple-500/20 rounded-2xl p-5 space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
            <Brain className="w-4 h-4 text-purple-400" />
            <span>Answer Writing Pattern Observed</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {feedback.commonMistakes.map((cm, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">→</span>
                <span>{cm}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Learning Actions / Quick Action Buttons */}
      <div className="pt-2 space-y-3 relative z-10 border-t border-slate-800/80">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Recommended Next Steps
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Discuss with AI */}
          <button
            id="discuss-mistakes-with-ai-btn"
            type="button"
            onClick={onDiscussWithAi}
            className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-600/15 hover:from-cyan-500/25 hover:to-blue-600/25 border border-cyan-500/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-white group-hover:text-cyan-300">
                Discuss Mistakes with RDS AI
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Ask doubts on missed points
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-cyan-400">
              <span>Start Chat</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Learn Weak Topics */}
          <button
            id="learn-weak-topics-btn"
            type="button"
            onClick={() => onLearnWeakTopics()}
            className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-600/15 hover:from-blue-500/25 hover:to-indigo-600/25 border border-blue-500/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-white group-hover:text-blue-300">
                Learn Weak Topics
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Step-by-step concept lessons
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-blue-400">
              <span>Open Lesson</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Retake Test */}
          <button
            id="retake-written-test-btn"
            type="button"
            onClick={onRetakeTest}
            className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/15 to-pink-600/15 hover:from-purple-500/25 hover:to-pink-600/25 border border-purple-500/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-white group-hover:text-purple-300">
                Take Another Written Test
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Fresh questions & practice
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-purple-400">
              <span>New Test</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Back to Dashboard */}
          <button
            id="return-to-dashboard-btn"
            type="button"
            onClick={onGoToDashboard}
            className="p-4 rounded-2xl bg-[#060a17] hover:bg-[#121d3f] border border-slate-800 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-300 group-hover:text-white">
                Back to Dashboard
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Return to student hub
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-slate-200">
              <span>Dashboard</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
