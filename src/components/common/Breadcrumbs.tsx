import React from 'react';
import { ChevronRight, Home, Sparkles } from 'lucide-react';
import { ClassLevel, Subject, Chapter, Topic } from '../../types';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  /** Syllabus-path mode */
  currentClass?: ClassLevel;
  subject?: Subject | null;
  chapter?: Chapter | null;
  topic?: Topic | null;
  onNavigate?: (target: 'dashboard' | 'subjects' | 'chapters' | 'topics' | 'learn') => void;
  /** Generic label-chain mode used by test / assessment screens */
  items?: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  currentClass,
  subject,
  chapter,
  topic,
  onNavigate = () => {},
  items,
}) => {
  // Generic label-chain mode (assessment screens)
  if (items && items.length > 0) {
    return (
      <nav
        id="rds-learning-breadcrumbs"
        aria-label="Learning Path Breadcrumbs"
        className="w-full bg-[#0d1428]/80 backdrop-blur-md border border-cyan-500/20 rounded-xl px-4 py-2.5 shadow-sm shadow-cyan-950/40"
      >
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <React.Fragment key={`${item.label}-${idx}`}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />}
                {isLast ? (
                  <span
                    className="flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-400/40 text-cyan-200 font-semibold max-w-[220px] sm:max-w-sm truncate shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                    title={item.label}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0 animate-pulse" />
                    <span className="truncate">{item.label}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={item.onClick}
                    disabled={!item.onClick}
                    className={`py-1 px-2 rounded-md max-w-[200px] truncate transition-colors ${
                      item.onClick
                        ? 'text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/30'
                        : 'text-slate-400 cursor-default'
                    }`}
                    title={item.label}
                  >
                    <span className="truncate">{item.label}</span>
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav
      id="rds-learning-breadcrumbs"
      aria-label="Learning Path Breadcrumbs"
      className="w-full bg-[#0d1428]/80 backdrop-blur-md border border-cyan-500/20 rounded-xl px-4 py-2.5 shadow-sm shadow-cyan-950/40"
    >
      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium">
        {/* Step 1: Dashboard / Home */}
        <button
          id="breadcrumb-dashboard"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors py-1 px-1.5 rounded-md hover:bg-cyan-950/30"
          title="Go to Dashboard"
        >
          <Home className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Dashboard</span>
        </button>

        <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />

        {/* Step 2: Class */}
        <button
          id="breadcrumb-class"
          onClick={() => onNavigate('subjects')}
          className={`flex items-center gap-1 py-1 px-2 rounded-md font-semibold transition-all ${
            !subject
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/30'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
          <span>{currentClass}</span>
        </button>

        {/* Step 3: Subject */}
        {subject && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            <button
              id="breadcrumb-subject"
              onClick={() => onNavigate('chapters')}
              className={`flex items-center gap-1.5 py-1 px-2 rounded-md max-w-[160px] sm:max-w-xs truncate transition-all ${
                !chapter
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/30'
              }`}
              title={subject.name}
            >
              <span className="truncate">{subject.name}</span>
            </button>
          </>
        )}

        {/* Step 4: Chapter */}
        {chapter && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            <button
              id="breadcrumb-chapter"
              onClick={() => onNavigate('topics')}
              className={`flex items-center gap-1.5 py-1 px-2 rounded-md max-w-[180px] sm:max-w-xs truncate transition-all ${
                !topic
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/30'
              }`}
              title={`Ch ${chapter.chapterNumber}: ${chapter.title}`}
            >
              <span className="truncate">
                Ch {chapter.chapterNumber}: {chapter.title}
              </span>
            </button>
          </>
        )}

        {/* Step 5: Topic */}
        {topic && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            <div
              id="breadcrumb-active-topic"
              className="flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-400/40 text-cyan-200 font-semibold max-w-[220px] sm:max-w-sm truncate shadow-[0_0_10px_rgba(6,182,212,0.2)]"
              title={topic.title}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0 animate-pulse" />
              <span className="truncate">{topic.title}</span>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};
