import React from 'react';
import { useStudent } from '../../context/StudentContext';
import { Chapter, Subject, Topic } from '../../types';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Layers, 
  CheckCircle2, 
  BookOpen,
  Zap,
  Target
} from 'lucide-react';

interface TopicSelectorProps {
  subject: Subject;
  chapter: Chapter;
  onSelectTopic: (topic: Topic) => void;
  onBackToChapters: () => void;
  onNavigate: (target: 'dashboard' | 'subjects' | 'chapters' | 'topics' | 'learn') => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  subject,
  chapter,
  onSelectTopic,
  onBackToChapters,
  onNavigate,
}) => {
  const { selectedClass } = useStudent();

  const getDifficultyBadge = (difficulty?: string) => {
    switch (difficulty) {
      case 'Basic':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Intermediate':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Advanced':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div id="topic-selection-page" className="min-h-screen bg-[#070b19] pb-20">
      {/* Top Header & Breadcrumbs */}
      <div className="bg-gradient-to-b from-[#0a1226] to-[#070b19] border-b border-cyan-500/20 pt-6 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Breadcrumbs
            currentClass={selectedClass}
            subject={subject}
            chapter={chapter}
            onNavigate={onNavigate}
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div className="flex items-start gap-4">
              <button
                id="back-to-chapters-btn"
                onClick={onBackToChapters}
                className="mt-1 p-2 rounded-xl bg-[#0e172f] hover:bg-[#162447] text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Back to Chapters"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {selectedClass} &bull; {subject.name}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Chapter {chapter.chapterNumber}: {chapter.title}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Choose a Topic
                </h1>
                <p className="text-sm text-slate-300">
                  Select a specific concept to activate the RDS AI learning and practice module.
                </p>
              </div>
            </div>

            {/* Chapter Badge */}
            <div className="bg-[#0d162d] border border-cyan-500/30 rounded-2xl p-3 px-4 self-start md:self-auto space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>{chapter.title}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {chapter.topics.length} focused micro-topics
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topics List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-4">
        {chapter.topics.map((topic, index) => {
          return (
            <div
              key={topic.id}
              id={`topic-item-${topic.id}`}
              onClick={() => onSelectTopic(topic)}
              className="group relative bg-[#090f23] hover:bg-[#0e1733] border border-slate-800 hover:border-cyan-400/60 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/60 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                {/* Topic Index Number */}
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:border-cyan-400 text-cyan-300 group-hover:text-white font-black font-mono flex items-center justify-center text-sm flex-shrink-0 transition-all shadow-sm">
                  {index + 1}
                </div>

                {/* Topic Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center flex-wrap gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {topic.title}
                    </h2>
                    {topic.difficulty && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyBadge(topic.difficulty)}`}>
                        {topic.difficulty}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
                    {topic.description}
                  </p>
                </div>
              </div>

              {/* Right Side: Estimated Duration & Action Button */}
              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                {topic.estimatedMinutes && (
                  <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{topic.estimatedMinutes} mins</span>
                  </span>
                )}

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/10 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-blue-600 border border-cyan-500/30 group-hover:border-transparent text-cyan-300 group-hover:text-white text-xs font-bold transition-all shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Topic</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
