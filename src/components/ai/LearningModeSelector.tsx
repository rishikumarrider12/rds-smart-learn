import React from 'react';
import { 
  Sparkles, 
  ListOrdered, 
  Lightbulb, 
  Zap, 
  HelpCircle,
  LucideIcon 
} from 'lucide-react';
import { AiLearningMode } from '../../services/ai/aiTypes';

interface LearningModeConfig {
  id: AiLearningMode;
  label: string;
  shortDesc: string;
  emoji: string;
  icon: LucideIcon;
  color: string;
  bgActive: string;
}

export const LEARNING_MODES: LearningModeConfig[] = [
  {
    id: 'simple_explanation',
    label: 'Simple Explanation',
    shortDesc: 'Easy concepts & analogies',
    emoji: '🌟',
    icon: Sparkles,
    color: 'from-cyan-500 to-blue-600',
    bgActive: 'bg-cyan-500/20 text-cyan-300 border-cyan-400',
  },
  {
    id: 'step_by_step',
    label: 'Step-by-Step',
    shortDesc: 'Sequential breakdown',
    emoji: '🔢',
    icon: ListOrdered,
    color: 'from-blue-500 to-indigo-600',
    bgActive: 'bg-blue-500/20 text-blue-300 border-blue-400',
  },
  {
    id: 'examples',
    label: 'Examples & Solutions',
    shortDesc: 'Worked problems & models',
    emoji: '🔍',
    icon: Lightbulb,
    color: 'from-purple-500 to-pink-600',
    bgActive: 'bg-purple-500/20 text-purple-300 border-purple-400',
  },
  {
    id: 'quick_revision',
    label: 'Quick Revision',
    shortDesc: 'Key formulas & exam notes',
    emoji: '⚡',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    bgActive: 'bg-amber-500/20 text-amber-300 border-amber-400',
  },
  {
    id: 'ask_me_questions',
    label: 'Ask Me Questions',
    shortDesc: 'Interactive tutor test',
    emoji: '❓',
    icon: HelpCircle,
    color: 'from-emerald-500 to-teal-600',
    bgActive: 'bg-emerald-500/20 text-emerald-300 border-emerald-400',
  },
];

interface LearningModeSelectorProps {
  selectedMode: AiLearningMode;
  onSelectMode: (mode: AiLearningMode) => void;
  disabled?: boolean;
}

export const LearningModeSelector: React.FC<LearningModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Choose Learning Style
        </span>
        <span className="text-[11px] text-cyan-400 font-medium">
          5 AI Modes
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {LEARNING_MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              id={`mode-btn-${mode.id}`}
              type="button"
              disabled={disabled}
              onClick={() => onSelectMode(mode.id)}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? `${mode.bgActive} shadow-lg shadow-black/40 scale-[1.02] ring-1 ring-cyan-400/40`
                  : 'bg-[#090f23] hover:bg-[#0d1633] text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{mode.emoji}</span>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-300' : 'text-slate-500'}`} />
              </div>

              <div>
                <div className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-200'}`}>
                  {mode.label}
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  {mode.shortDesc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
