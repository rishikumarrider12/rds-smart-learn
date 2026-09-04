import React from 'react';
import { useStudent } from '../../context/StudentContext';
import { Chapter, Subject, Topic } from '../../types';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { RdsAiChat } from '../ai/RdsAiChat';
import { ArrowLeft, Sparkles, Layers, BookOpen } from 'lucide-react';

interface AskRdsAiScreenProps {
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  initialQuestion?: string;
  onBackToTopicActions: () => void;
  onNavigateToLearnWithAi: () => void;
  onNavigate: (target: 'dashboard' | 'subjects' | 'chapters' | 'topics' | 'learn') => void;
}

export const AskRdsAiScreen: React.FC<AskRdsAiScreenProps> = ({
  subject,
  chapter,
  topic,
  initialQuestion,
  onBackToTopicActions,
  onNavigateToLearnWithAi,
  onNavigate,
}) => {
  const { selectedClass } = useStudent();

  return (
    <div id="ask-rds-ai-screen" className="min-h-screen bg-[#070b19] pb-16">
      {/* Top Breadcrumbs and Header */}
      <div className="bg-gradient-to-b from-[#0a1226] to-[#070b19] border-b border-cyan-500/20 pt-6 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Breadcrumbs
            currentClass={selectedClass}
            subject={subject}
            chapter={chapter}
            topic={topic}
            onNavigate={onNavigate}
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <button
                id="back-to-topic-actions-btn"
                onClick={onBackToTopicActions}
                className="mt-1 p-2 rounded-xl bg-[#0e172f] hover:bg-[#162447] text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Back to Topic Options"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {selectedClass}
                  </span>
                  <span className="text-slate-400 font-medium">{subject.name}</span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="text-slate-400 font-medium">Ch {chapter.chapterNumber}: {chapter.title}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
                  <span>Ask RDS AI &mdash; {topic.title}</span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Instant intelligent doubt solver tailored to Telangana SCERT syllabus.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="switch-to-learn-btn"
                onClick={onNavigateToLearnWithAi}
                className="px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Switch to Learn with AI</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <RdsAiChat
          subject={subject}
          chapter={chapter}
          topic={topic}
          initialQuestion={initialQuestion}
          onNavigateToLearn={onNavigateToLearnWithAi}
        />
      </div>
    </div>
  );
};
