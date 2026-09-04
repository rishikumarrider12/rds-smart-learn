import React from 'react';
import { 
  Bot, 
  BookOpen, 
  CheckSquare, 
  PenTool, 
  Sparkles, 
  X, 
  ArrowRight, 
  Layers, 
  CheckCircle2,
  Clock,
  Zap
} from 'lucide-react';
import { Chapter, ClassLevel, LearningActionType, Subject, Topic } from '../../types';

interface Phase2PreviewModalProps {
  actionType: LearningActionType | null;
  currentClass: ClassLevel;
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  onClose: () => void;
}

export const Phase2PreviewModal: React.FC<Phase2PreviewModalProps> = ({
  actionType,
  currentClass,
  subject,
  chapter,
  topic,
  onClose,
}) => {
  if (!actionType) return null;

  const actionConfigs: Record<
    LearningActionType,
    {
      title: string;
      subtitle: string;
      emoji: string;
      badge: string;
      icon: React.ElementType;
      color: string;
      description: string;
      features: string[];
      previewPrompt: string;
    }
  > = {
    ask_ai: {
      title: 'Ask RDS AI Tutor',
      subtitle: 'Instant contextual doubts resolver powered by Gemini',
      emoji: '🤖',
      badge: 'Interactive Doubt Clearing',
      icon: Bot,
      color: 'from-cyan-500 to-blue-600',
      description: `Ask any question directly related to "${topic.title}". RDS AI understands the Telangana SCERT textbook definitions and will guide you step-by-step without giving away answers immediately.`,
      features: [
        'Context-aware answers mapped directly to TS SCERT syllabus',
        'Conversational follow-ups with voice & text prompts',
        'Step-by-step mathematical & scientific formulas breakdowns',
        'Safe, student-friendly tone with zero hallicunations'
      ],
      previewPrompt: `How do we split the middle term in quadratic equations when the constant term is negative?`,
    },
    learn_ai: {
      title: 'Learn with AI (Step-by-Step)',
      subtitle: 'Structured micro-lessons simplified for your class',
      emoji: '📚',
      badge: 'Concept Breakdown',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-600',
      description: `Get an interactive, highly visual explanation of "${topic.title}". Broken into easy digestible chunks with real-world examples, diagrams, and summary flashcards.`,
      features: [
        'Bite-sized sections (Overview, Core Concepts, Worked Examples)',
        'Key definitions and formulas highlighted for board exams',
        'Interactive checks for understanding after each section',
        'Multi-lingual support (English & Telugu explanations)'
      ],
      previewPrompt: `Explain the standard form and steps to solve quadratic equations by factorization.`,
    },
    mcq_test: {
      title: 'Smart MCQ Practice Test',
      subtitle: 'Adaptive multiple-choice questions with instant scoring',
      emoji: '📝',
      badge: 'Self-Assessment',
      icon: CheckSquare,
      color: 'from-purple-500 to-pink-600',
      description: `Practice timed and untimed multiple-choice questions generated specifically for "${topic.title}". Includes previous years Telangana board exam pattern questions.`,
      features: [
        'Instant grading with detailed explanations for all 4 options',
        'Identify common distractors and concept traps',
        'Adaptive difficulty matching your current proficiency level',
        'Detailed streak & accuracy reports'
      ],
      previewPrompt: `What are the roots of the quadratic equation x² - 5x + 6 = 0? (A) 2, 3  (B) -2, -3  (C) 1, 6  (D) -1, -6`,
    },
    written_test: {
      title: 'Written Answer Practice Test',
      subtitle: 'Master 2-mark, 4-mark & 8-mark board exam questions',
      emoji: '✍️',
      badge: 'Board Exam Preparation',
      icon: PenTool,
      color: 'from-emerald-500 to-teal-600',
      description: `Practice writing structured answers for "${topic.title}". AI will review your steps, mathematical notations, and award step marks aligned with the Telangana SCERT evaluation scheme.`,
      features: [
        'Telangana Board model questions (Very Short, Short, Long essays)',
        'Step-marking rubric and presentation feedback',
        'Suggested keywords, formula statements, and conclusion lines',
        'Handwritten photo upload & digital editor support'
      ],
      previewPrompt: `Find the roots of 2x² - 7x + 3 = 0 by the method of factorization. (4 Marks Question)`,
    },
  };

  const config = actionConfigs[actionType];
  const Icon = config.icon;

  return (
    <div
      id="phase2-preview-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050814]/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-[#090f23] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/80 overflow-hidden">
        {/* Top Glow */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="close-preview-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-[#0e172f] hover:bg-[#152345] border border-slate-700 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.color} p-0.5 shadow-lg flex items-center justify-center flex-shrink-0`}>
            <div className="w-full h-full bg-[#070b18] rounded-[14px] flex items-center justify-center text-2xl">
              <span>{config.emoji}</span>
            </div>
          </div>

          <div className="space-y-1 pr-8">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Phase 2 Feature Preview
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {config.badge}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {config.title}
            </h3>
            <p className="text-xs text-slate-400">
              {config.subtitle}
            </p>
          </div>
        </div>

        {/* Selected Topic Context Box */}
        <div className="p-3.5 bg-[#060a17] border border-slate-800 rounded-xl mb-5 text-xs text-slate-300 flex items-center flex-wrap gap-2">
          <span className="text-cyan-400 font-bold">Active Learning Target:</span>
          <span>{currentClass}</span>
          <span>&bull;</span>
          <span>{subject.name}</span>
          <span>&bull;</span>
          <span>Ch {chapter.chapterNumber}: {chapter.title}</span>
          <span>&bull;</span>
          <strong className="text-white">{topic.title}</strong>
        </div>

        {/* Description & Features */}
        <div className="space-y-4 mb-6">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {config.description}
          </p>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              What will be available in Phase 2:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {config.features.map((feat, i) => (
                <div
                  key={i}
                  className="p-2.5 bg-[#0e162f] rounded-lg border border-slate-800 flex items-start gap-2 text-xs text-slate-200"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sample AI Prompt / Question Preview */}
          <div className="p-3.5 bg-[#0a1126] border border-cyan-500/20 rounded-xl space-y-1.5">
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              Sample Interactive Interaction Preview
            </div>
            <div className="text-xs text-slate-300 font-mono italic bg-[#060a17] p-2.5 rounded-lg border border-slate-800">
              "{config.previewPrompt}"
            </div>
          </div>
        </div>

        {/* Footer info & Dismiss */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 text-center sm:text-left">
            <Clock className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>Phase 1 Frontend Foundation is active and ready for AI backend binding.</span>
          </div>

          <button
            id="modal-understand-btn"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-950"
          >
            Got it, Back to Topic Actions
          </button>
        </div>
      </div>
    </div>
  );
};
