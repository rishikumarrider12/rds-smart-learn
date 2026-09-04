import React, { useEffect, useState } from 'react';
import { Bot, Sparkles, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

interface TestLoadingProps {
  topicTitle: string;
  difficulty: string;
  questionCount: number;
  onCancel: () => void;
}

export const TestLoading: React.FC<TestLoadingProps> = ({
  topicTitle,
  difficulty,
  questionCount,
  onCancel,
}) => {
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    `RDS AI is preparing your test...`,
    `Creating ${difficulty} questions for ${topicTitle}...`,
    `Checking syllabus accuracy for Telangana SCERT standards...`,
    `Validating question clarity and option uniqueness...`,
    `Finalizing your ${questionCount}-question practice session...`,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 text-center">
      <div className="bg-[#090f23]/90 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

        {/* Animated AI Core */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 animate-pulse shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#060a17] rounded-[22px] flex items-center justify-center">
              <Bot className="w-12 h-12 text-cyan-400 animate-bounce" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded-full shadow-md">
            <Sparkles className="w-4 h-4 text-white animate-spin" />
          </div>
        </div>

        {/* Dynamic status message */}
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 min-h-[3rem] flex items-center justify-center transition-all duration-300">
          {messages[messageIndex]}
        </h2>

        <p className="text-slate-400 text-sm max-w-md mx-auto mb-8">
          Generating {questionCount} questions at <span className="text-cyan-400 font-semibold">{difficulty}</span> difficulty level. Please wait a moment...
        </p>

        {/* Progress Bar indicator */}
        <div className="w-full max-w-md mx-auto bg-slate-800/80 rounded-full h-2 overflow-hidden mb-8 border border-slate-700/50">
          <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full animate-indeterminate" />
        </div>

        {/* Cancel Button */}
        <button
          id="cancel-test-gen-btn"
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-slate-700/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel and Return</span>
        </button>
      </div>
    </div>
  );
};
