import React, { useState, useEffect } from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface AiLoadingStateProps {
  message?: string;
  topicTitle?: string;
}

const LOADING_TIPS = [
  'Adapting explanation for your class level...',
  'Connecting concepts with real-world examples...',
  'Preparing step-by-step guidance...',
  'Reviewing Telangana syllabus context...',
  'Formatting clear formulas and explanations...',
];

export const AiLoadingState: React.FC<AiLoadingStateProps> = ({
  message = 'RDS AI is thinking...',
  topicTitle,
}) => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-[#090f23]/90 border border-cyan-500/30 rounded-2xl text-center shadow-lg shadow-cyan-950/30 animate-pulse">
      <div className="relative mb-4">
        {/* Glowing avatar container */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <div className="w-full h-full bg-[#070b18] rounded-[14px] flex items-center justify-center">
            <Bot className="w-8 h-8 text-cyan-400 animate-bounce" />
          </div>
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-400 border-2 border-[#070b18] flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-[#070b18] animate-spin" />
        </div>
      </div>

      <h4 className="text-base font-bold text-white mb-1 flex items-center justify-center gap-2">
        <span>{message}</span>
      </h4>

      {topicTitle && (
        <p className="text-xs text-cyan-300 font-medium mb-3">
          Topic: <span className="underline decoration-cyan-500/40">{topicTitle}</span>
        </p>
      )}

      {/* Rotating encouraging tip */}
      <div className="h-6 flex items-center justify-center">
        <p className="text-xs text-slate-400 italic transition-all duration-300">
          "{LOADING_TIPS[tipIndex]}"
        </p>
      </div>

      {/* Animated progress dots */}
      <div className="flex items-center gap-1.5 mt-4">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" style={{ animationDuration: '1.2s' }} />
        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" style={{ animationDuration: '1.2s', animationDelay: '0.2s' }} />
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" style={{ animationDuration: '1.2s', animationDelay: '0.4s' }} />
      </div>
    </div>
  );
};
