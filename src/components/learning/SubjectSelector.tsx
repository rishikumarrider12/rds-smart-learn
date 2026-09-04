import React from 'react';
import { useStudent } from '../../context/StudentContext';
import { getSyllabusForClass, TELANGANA_CLASSES } from '../../data/syllabusData';
import { Subject, ClassLevel } from '../../types';
import { getSubjectIcon } from '../dashboard/StudentDashboard';
import { 
  ArrowRight, 
  GraduationCap, 
  Layers, 
  Sparkles, 
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import { Breadcrumbs } from '../common/Breadcrumbs';

interface SubjectSelectorProps {
  onSelectSubject: (subject: Subject) => void;
  onBack: () => void;
  onNavigate: (target: 'dashboard' | 'subjects' | 'chapters' | 'topics' | 'learn') => void;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  onSelectSubject,
  onBack,
  onNavigate,
}) => {
  const { selectedClass, updateClass } = useStudent();
  const syllabus = getSyllabusForClass(selectedClass);

  return (
    <div id="subject-selection-page" className="min-h-screen bg-[#070b19] pb-20">
      {/* Top Header */}
      <div className="bg-gradient-to-b from-[#0a1226] to-[#070b19] border-b border-cyan-500/20 pt-6 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Breadcrumbs */}
          <Breadcrumbs
            currentClass={selectedClass}
            onNavigate={onNavigate}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Telangana State Board (SCERT)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Choose a Subject
              </h1>
              <p className="text-sm text-slate-300 mt-1">
                Select a subject to view its chapter syllabus and start learning with RDS AI.
              </p>
            </div>

            {/* Class Switcher Pills */}
            <div className="flex items-center gap-2 bg-[#090f23] p-1.5 rounded-xl border border-slate-800 self-start sm:self-center">
              <span className="text-xs text-slate-400 font-semibold pl-2 hidden sm:inline">Class:</span>
              <div className="flex gap-1">
                {TELANGANA_CLASSES.map((cls) => (
                  <button
                    key={cls}
                    id={`subject-select-class-${cls.toLowerCase().replace(' ', '-')}`}
                    onClick={() => updateClass(cls)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedClass === cls
                        ? 'bg-cyan-500 text-white shadow-md shadow-cyan-900/50'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {cls.replace('Class ', 'C')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Subjects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {syllabus.subjects.map((subj) => {
            const totalTopics = subj.chapters.reduce((acc, c) => acc + c.topics.length, 0);
            return (
              <div
                key={subj.id}
                id={`subject-card-${subj.id}`}
                onClick={() => onSelectSubject(subj)}
                className="group relative bg-[#090f23] hover:bg-[#0e1633] border border-slate-800 hover:border-cyan-500/60 rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-950/60 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Icon & Code */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subj.accentColor} p-0.5 shadow-lg flex items-center justify-center`}>
                      <div className="w-full h-full bg-[#070b18] rounded-[14px] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        {getSubjectIcon(subj.icon, 'w-7 h-7 text-cyan-300')}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#060a17] text-cyan-400 border border-cyan-500/20">
                      {subj.code}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-black text-white group-hover:text-cyan-300 transition-colors mb-2.5">
                    {subj.name}
                  </h2>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                    {subj.description}
                  </p>
                </div>

                {/* Bottom Stats */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      {subj.chapters.length} Chapters
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      {totalTopics} Topics
                    </span>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500 group-hover:text-white border border-cyan-500/30 flex items-center justify-center text-cyan-400 transition-all shadow-sm">
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
