import React, { useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { Subject, Chapter, Topic } from '../types';
import { TestDifficulty } from '../types/test';
import { LearningLanguage } from '../services/ai/aiTypes';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { TestSetup } from '../components/test/TestSetup';
import { TestLoading } from '../components/test/TestLoading';
import { generateMcqQuestions } from '../services/test/mcqService';
import { saveTestAttempt } from '../services/test/testStorage';
import { getSubjectLanguage } from '../data/syllabusData';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

interface McqTestSetupScreenProps {
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  onBackToTopicActions: () => void;
  onNavigateToSession: (testId: string) => void;
  onNavigateToResult: (testId: string) => void;
  onNavigate: (target: 'dashboard' | 'subjects' | 'chapters' | 'topics' | 'learn') => void;
}

export const McqTestSetupScreen: React.FC<McqTestSetupScreenProps> = ({
  subject,
  chapter,
  topic,
  onBackToTopicActions,
  onNavigateToSession,
  onNavigateToResult,
  onNavigate,
}) => {
  const { student, selectedClass } = useStudent();
  const [difficulty, setDifficulty] = useState<TestDifficulty>('Mixed');
  const [questionCount, setQuestionCount] = useState<number>(10);
  // Academic content language is driven by the SUBJECT (Telugu subject ->
  // Telugu questions), not by the UI text language. The selector below still
  // allows an explicit override.
  const [language, setLanguage] = useState<LearningLanguage>(getSubjectLanguage(subject));
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartGeneration = async () => {
    if (!selectedClass) return;

    setIsGenerating(true);
    setError(null);

    try {
      const generatedQuestions = await generateMcqQuestions({
        studentName: student?.name || 'Student',
        classLevel: selectedClass,
        subject,
        chapter,
        topic,
        difficulty,
        questionCount,
        language,
      });

      const testId = `mcq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newAttempt = {
        id: testId,
        studentId: student?.name || 'guest_student',
        studentName: student?.name || 'Student',
        createdAt: new Date().toISOString(),
        classLevel: selectedClass,
        subjectId: subject.id,
        subjectName: subject.name,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        topicId: topic.id,
        topicTitle: topic.title,
        difficulty,
        questionCount: generatedQuestions.length,
        language,
        questions: generatedQuestions,
        answers: {},
        currentQuestionIndex: 0,
        status: 'in-progress' as const,
      };

      saveTestAttempt(newAttempt);
      setIsGenerating(false);
      onNavigateToSession(testId);
    } catch (err: any) {
      console.error('Failed to generate test:', err);
      setError(
        err?.message ||
          'Failed to generate MCQ test questions. Please check your network and try again.'
      );
      setIsGenerating(false);
    }
  };

  const breadcrumbItems = [
    { label: selectedClass || 'Class', onClick: () => onNavigate('subjects') },
    { label: subject.name, onClick: () => onNavigate('chapters') },
    { label: `Ch ${chapter.chapterNumber}`, onClick: () => onNavigate('topics') },
    { label: topic.title, onClick: () => onNavigate('learn') },
    { label: 'MCQ Practice Test' },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={breadcrumbItems} />

        <button
          id="back-to-topic-actions-btn"
          type="button"
          onClick={onBackToTopicActions}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Topic</span>
        </button>
      </div>

      {/* Loading State */}
      {isGenerating ? (
        <TestLoading
          topicTitle={topic.title}
          difficulty={difficulty}
          questionCount={questionCount}
          onCancel={() => setIsGenerating(false)}
        />
      ) : (
        <>
          {/* Error Message */}
          {error && (
            <div className="max-w-2xl mx-auto bg-pink-950/80 border border-pink-500/50 rounded-2xl p-5 text-pink-200 text-sm flex items-start gap-3.5 shadow-lg">
              <AlertCircle className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-pink-300">Test Generation Issue</p>
                <p className="text-xs text-pink-200/90 mt-1">{error}</p>
                <button
                  type="button"
                  onClick={handleStartGeneration}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500 text-slate-950 font-bold text-xs hover:bg-pink-400 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Generation</span>
                </button>
              </div>
            </div>
          )}

          {/* Test Setup Component */}
          {selectedClass && (
            <TestSetup
              classLevel={selectedClass}
              subject={subject}
              chapter={chapter}
              topic={topic}
              language={language}
              difficulty={difficulty}
              questionCount={questionCount}
              onDifficultyChange={setDifficulty}
              onQuestionCountChange={setQuestionCount}
              onLanguageChange={setLanguage}
              onStartTest={handleStartGeneration}
              onViewPreviousResult={onNavigateToResult}
            />
          )}
        </>
      )}
    </div>
  );
};
