import React from 'react';
import { useStudent } from '../../context/StudentContext';
import { Chapter, Subject } from '../../types';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { getSubjectIcon } from '../dashboard/StudentDashboard';
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Layers, 
  Sparkles,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ChapterSelectorProps {
  subject: Subject;
  onSelectChapter: (chapter: Chapter) => void;
  onBackToSubjects: () => void;
  onNavigate: (target: 'dashboard' | 'subjects' | 'chapters' | 'topics' | 'learn') => void;
}

export const ChapterSelector: React.FC<ChapterSelectorProps> = ({
  subject,
  onSelectChapter,
  onBackToSubjects,
  onNavigate,
}) => {
  const { selectedClass } = useStudent();

  return (
    <div id="chapter-selection-page" className="min-h-screen bg-[#070b19] pb-20">
      {/* Top Header & Breadcrumbs */}
      <div className="bg-gradient-to-b from-[#0a1226] to-[#070b19] border-b border-cyan-500/20 pt-6 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Breadcrumbs
            currentClass={selectedClass}
            subject={subject}
            onNavigate={onNavigate}
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div className="flex items-start gap-4">
              <button
                id="back-to-subjects-btn"
                onClick={onBackToSubjects}
                className="mt-1 p-2 rounded-xl bg-[#0e172f] hover:bg-[#162447] text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Back to Subjects"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {selectedClass} &bull; {subject.name}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {subject.chapters.length} Chapters Available
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Choose a Chapter
                </h1>
                <p className="text-sm text-slate-300">
                  Select a chapter from the Telangana SCERT syllabus to explore topic-wise micro-learning.
                </p>
              </div>
            </div>

            {/* Subject Summary Badge */}
            <div className="flex items-center gap-3 bg-[#0d162d] border border-cyan-500/30 rounded-2xl p-3 px-4 self-start md:self-auto">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${subject.accentColor} p-0.5 shadow-md flex items-center justify-center`}>
                <div className="w-full h-full bg-[#070b18] rounded-[10px] flex items-center justify-center text-white">
                  {getSubjectIcon(subject.icon, 'w-5 h-5 text-cyan-300')}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-white">{subject.name}</div>
                <div className="text-[11px] text-cyan-400 font-mono">{subject.code}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters List / Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {subject.chapters.map((chapter) => {
            return (
              <div
                key={chapter.id}
                id={`chapter-card-${chapter.id}`}
                onClick={() => onSelectChapter(chapter)}
                className="group relative bg-[#090f23] hover:bg-[#0e1633] border border-slate-800 hover:border-cyan-500/60 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/50 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Chapter Number & Topic Count */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      Chapter {chapter.chapterNumber}
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      {chapter.topics.length} Topics
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                    {chapter.title}
                  </h2>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                    {chapter.description}
                  </p>
                </div>

                {/* Bottom preview topics */}
                <div className="pt-4 border-t border-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Topics preview:
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {chapter.topics.slice(0, 3).map((t) => (
                      <span
                        key={t.id}
                        className="text-[11px] px-2 py-0.5 rounded bg-[#060a17] text-slate-300 border border-slate-800"
                      >
                        {t.title}
                      </span>
                    ))}
                    {chapter.topics.length > 3 && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 font-bold">
                        +{chapter.topics.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-cyan-400 font-bold group-hover:translate-x-1 transition-transform">
                    <span>Explore Topics</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
