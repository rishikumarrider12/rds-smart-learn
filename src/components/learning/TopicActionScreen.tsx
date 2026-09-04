import React, { useState } from 'react';
import { useStudent } from '../../context/StudentContext';
import { Chapter, LearningActionType, Subject, Topic } from '../../types';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Phase2PreviewModal } from './Phase2PreviewModal';
import { 
  Bot, 
  BookOpen, 
  CheckSquare, 
  PenTool, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  GraduationCap, 
  Layers, 
  Clock, 
  HelpCircle,
  CheckCircle2,
  Share2,
  Bookmark
} from 'lucide-react';

interface TopicActionScreenProps {
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  onBackToTopics: () => void;
  onNavigateToAskAi: () => void;
  onNavigateToLearnWithAi: () => void;
  onNavigateToMcqTest: () => void;
  onNavigateToWrittenTest: () => void;
  onNavigate: (target: 'dashboard' | 'subjects' | 'chapters' | 'topics' | 'learn') => void;
}

export const TopicActionScreen: React.FC<TopicActionScreenProps> = ({
  subject,
  chapter,
  topic,
  onBackToTopics,
  onNavigateToAskAi,
  onNavigateToLearnWithAi,
  onNavigateToMcqTest,
  onNavigateToWrittenTest,
  onNavigate,
}) => {
  const { selectedClass } = useStudent();
  const [activeActionModal, setActiveActionModal] = useState<LearningActionType | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const actionCards = [
    {
      id: 'action-ask-ai',
      type: 'ask_ai' as LearningActionType,
      title: 'Ask RDS AI',
      emoji: '🤖',
      shortDescription: 'Ask questions about this topic.',
      tagline: 'Instant Doubt Solver',
      badge: 'Interactive AI',
      status: 'Live in Phase 2',
      color: 'from-cyan-500 to-blue-600',
      borderHover: 'hover:border-cyan-400',
      shadowHover: 'hover:shadow-cyan-950/60',
      icon: Bot,
      btnText: 'Ask a Question',
      onClick: () => onNavigateToAskAi(),
    },
    {
      id: 'action-learn-ai',
      type: 'learn_ai' as LearningActionType,
      title: 'Learn with AI',
      emoji: '📚',
      shortDescription: 'Get a simple step-by-step explanation.',
      tagline: 'Concepts & Formulas',
      badge: 'Step-by-Step',
      status: 'Live in Phase 2',
      color: 'from-blue-500 to-indigo-600',
      borderHover: 'hover:border-blue-400',
      shadowHover: 'hover:shadow-blue-950/60',
      icon: BookOpen,
      btnText: 'Start Explanation',
      onClick: () => onNavigateToLearnWithAi(),
    },
    {
      id: 'action-mcq-test',
      type: 'mcq_test' as LearningActionType,
      title: 'MCQ Test',
      emoji: '📝',
      shortDescription: 'Practice with multiple-choice questions.',
      tagline: 'Adaptive Quiz Engine',
      badge: 'Instant Score',
      status: 'Live in Phase 3',
      color: 'from-purple-500 to-pink-600',
      borderHover: 'hover:border-purple-400',
      shadowHover: 'hover:shadow-purple-950/60',
      icon: CheckSquare,
      btnText: 'Start MCQ Practice',
      onClick: () => onNavigateToMcqTest(),
    },
    {
      id: 'action-written-test',
      type: 'written_test' as LearningActionType,
      title: 'Written Answer Test',
      emoji: '✍️',
      shortDescription: 'Practice writing answers and get AI rubric feedback.',
      tagline: 'Board Exam Pattern',
      badge: 'Step Marks Rubric',
      status: 'Live in Phase 4',
      color: 'from-emerald-500 to-teal-600',
      borderHover: 'hover:border-emerald-400',
      shadowHover: 'hover:shadow-emerald-950/60',
      icon: PenTool,
      btnText: 'Practice Written Answers',
      onClick: () => onNavigateToWrittenTest(),
    },
  ];

  return (
    <div id="topic-action-screen" className="min-h-screen bg-[#070b19] pb-24">
      {/* Top Header & Breadcrumbs */}
      <div className="bg-gradient-to-b from-[#0a1226] to-[#070b19] border-b border-cyan-500/20 pt-6 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Breadcrumbs
            currentClass={selectedClass}
            subject={subject}
            chapter={chapter}
            topic={topic}
            onNavigate={onNavigate}
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div className="flex items-start gap-4">
              <button
                id="back-to-topics-btn"
                onClick={onBackToTopics}
                className="mt-1 p-2 rounded-xl bg-[#0e172f] hover:bg-[#162447] text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Back to Topics"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  <span className="font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {selectedClass}
                  </span>
                  <span className="text-slate-400 font-medium">{subject.name}</span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="text-slate-400 font-medium">Chapter {chapter.chapterNumber}: {chapter.title}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>{topic.title}</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                  {topic.description}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2.5 rounded-xl border transition-all text-xs font-bold flex items-center gap-1.5 ${
                  isBookmarked
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                    : 'bg-[#0e172f] hover:bg-[#152345] text-slate-400 hover:text-white border-slate-700'
                }`}
                title="Bookmark this topic"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                <span>{isBookmarked ? 'Saved' : 'Save Topic'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Learning Context Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-gradient-to-r from-[#0d162d] via-[#101f44] to-[#0d162d] border border-cyan-500/30 rounded-2xl p-5 shadow-lg shadow-cyan-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 flex-shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Selected Learning Context
              </div>
              <div className="text-sm sm:text-base font-bold text-white flex items-center flex-wrap gap-2 mt-0.5">
                <span>{selectedClass}</span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-cyan-300">{subject.name}</span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-slate-200">Ch {chapter.chapterNumber}: {chapter.title}</span>
                <span className="text-slate-500">&bull;</span>
                <span className="bg-cyan-500/20 px-2 py-0.5 rounded text-cyan-200 font-extrabold border border-cyan-500/30">
                  Topic: {topic.title}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>SCERT TS Syllabus</span>
          </div>
        </div>
      </div>

      {/* Main Section: "What would you like to do?" */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            RDS Learning Actions
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            What would you like to do?
          </h2>
          <p className="text-sm text-slate-400">
            Choose an AI learning or practice mode to master this topic.
          </p>
        </div>

        {/* 4 Large Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {actionCards.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                id={action.id}
                onClick={action.onClick}
                className={`group relative bg-[#090f23] hover:bg-[#0e1733] border border-slate-800 ${action.borderHover} rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${action.shadowHover} cursor-pointer flex flex-col justify-between`}
              >
                <div>
                  {/* Top Bar with Emoji Icon and Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} p-0.5 shadow-lg flex items-center justify-center`}>
                      <div className="w-full h-full bg-[#070b18] rounded-[14px] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        <span>{action.emoji}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#060a17] text-cyan-300 border border-cyan-500/30">
                        {action.badge}
                      </span>
                      <span className={`text-[10px] font-mono ${action.status.includes('Live') ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                        {action.status}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-black text-white group-hover:text-cyan-300 transition-colors mb-2">
                    {action.title}
                  </h3>

                  {/* Short description requested */}
                  <p className="text-sm text-slate-300 font-medium mb-3">
                    {action.shortDescription}
                  </p>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Topic: <strong className="text-slate-200">{topic.title}</strong> ({subject.name})
                  </p>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-8 pt-5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-cyan-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{action.btnText}</span>
                  </span>

                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500 group-hover:text-white border border-cyan-500/30 flex items-center justify-center text-cyan-400 transition-all shadow-sm">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Change Topic / Explore Other Chapter */}
        <div className="mt-12 text-center max-w-md mx-auto space-y-3">
          <button
            onClick={onBackToTopics}
            className="text-xs font-bold text-slate-400 hover:text-cyan-300 flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Select a different topic in {chapter.title}</span>
          </button>
        </div>
      </div>

      {/* Phase 2 Preview Interactive Modal */}
      {activeActionModal && (
        <Phase2PreviewModal
          actionType={activeActionModal}
          currentClass={selectedClass}
          subject={subject}
          chapter={chapter}
          topic={topic}
          onClose={() => setActiveActionModal(null)}
        />
      )}
    </div>
  );
};
