import React, { useState } from 'react';
import { Subject, Chapter, Topic, ClassLevel } from '../types';
import { LearningLanguage } from '../services/ai/aiTypes';
import { WrittenDifficulty, WrittenQuestionType, WrittenTestAttempt } from '../types/writtenTest';
import { generateWrittenQuestions } from '../services/test/writtenTestService';
import { saveWrittenTestAttempt } from '../services/test/writtenTestStorage';
import { getSubjectLanguage } from '../data/syllabusData';
import { WrittenTestSetup } from '../components/written-test/WrittenTestSetup';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

interface WrittenTestSetupScreenProps {
  classLevel: ClassLevel;
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  studentId: string;
  studentName: string;
  onTestStarted: (testId: string) => void;
  onBackToTopic: () => void;
  onNavigate: (target: 'dashboard' | 'subjects' | 'chapters' | 'topics' | 'learn') => void;
}

export const WrittenTestSetupScreen: React.FC<WrittenTestSetupScreenProps> = ({
  classLevel,
  subject,
  chapter,
  topic,
  studentId,
  studentName,
  onTestStarted,
  onBackToTopic,
  onNavigate,
}) => {
  const [questionType, setQuestionType] = useState<WrittenQuestionType>('mixed');
  const [difficulty, setDifficulty] = useState<WrittenDifficulty>('Mixed');
  const [questionCount, setQuestionCount] = useState<number>(5);
  // Academic content language is driven by the SUBJECT (Telugu subject ->
  // Telugu questions), not the UI language. The selector still allows override.
  const [language, setLanguage] = useState<LearningLanguage>(getSubjectLanguage(subject));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartTest = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const questions = await generateWrittenQuestions({
        classLevel,
        subject,
        chapter,
        topic,
        questionType,
        difficulty,
        questionCount,
        language,
      });

      if (!questions || questions.length === 0) {
        throw new Error('Could not generate written questions. Please try again.');
      }

      const testId = `wtest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const newAttempt: WrittenTestAttempt = {
        id: testId,
        studentId,
        studentName,
        createdAt: new Date().toISOString(),
        classLevel,
        subjectId: subject.id,
        subjectName: subject.name,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        topicId: topic.id,
        topicTitle: topic.title,
        difficulty,
        questionType,
        questionCount: questions.length,
        language,
        questions,
        answers: {},
        evaluations: {},
        currentQuestionIndex: 0,
        status: 'in-progress',
      };

      saveWrittenTestAttempt(newAttempt);
      onTestStarted(testId);
    } catch (err: any) {
      console.error('Failed to start written test:', err);
      setError(err?.message || 'Failed to prepare written test. Please verify your connection and retry.');
      setIsLoading(false);
    }
  };

  return (
    <div id="written-test-setup-screen" className="min-h-screen bg-[#070b19] pb-24 text-slate-100">
      {/* Top Header & Breadcrumbs */}
      <div className="bg-gradient-to-b from-[#0a1226] to-[#070b19] border-b border-emerald-500/20 pt-6 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Breadcrumbs
            currentClass={classLevel}
            subject={subject}
            chapter={chapter}
            topic={topic}
            onNavigate={onNavigate}
          />
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <WrittenTestSetup
          classLevel={classLevel}
          subject={subject}
          chapter={chapter}
          topic={topic}
          questionType={questionType}
          difficulty={difficulty}
          questionCount={questionCount}
          language={language}
          isLoading={isLoading}
          error={error}
          onQuestionTypeChange={setQuestionType}
          onDifficultyChange={setDifficulty}
          onQuestionCountChange={setQuestionCount}
          onLanguageChange={setLanguage}
          onStartTest={handleStartTest}
          onBack={onBackToTopic}
        />
      </main>
    </div>
  );
};
