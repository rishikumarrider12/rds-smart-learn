import React, { useState, useEffect } from 'react';
import { Subject, Chapter, Topic } from '../types';
import { WrittenTestAttempt } from '../types/writtenTest';
import {
  getWrittenTestAttempt,
  saveWrittenTestAttempt,
} from '../services/test/writtenTestStorage';
import {
  evaluateSingleAnswer,
  calculateWrittenTestResult,
  generateOverallFeedback,
} from '../services/test/answerEvaluationService';
import { WrittenTestResultSummary } from '../components/written-test/WrittenTestResultSummary';
import { OverallAiFeedback } from '../components/written-test/OverallAiFeedback';
import { AnswerEvaluationCard } from '../components/written-test/AnswerEvaluationCard';
import { MistakeAnalysis } from '../components/written-test/MistakeAnalysis';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { t } from '../services/study/examText';
import { 
  ArrowLeft, 
  RotateCcw, 
  MessageSquare, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  Share2, 
  HelpCircle 
} from 'lucide-react';

interface WrittenTestResultScreenProps {
  testId: string;
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  onRetakeTest: () => void;
  onDiscussWithAi: (contextPrompt?: string) => void;
  onLearnWeakTopic: (concept?: string) => void;
  onBackToTopic: () => void;
  onNavigate: (target: 'dashboard' | 'subjects' | 'chapters' | 'topics' | 'learn') => void;
}

export const WrittenTestResultScreen: React.FC<WrittenTestResultScreenProps> = ({
  testId,
  subject,
  chapter,
  topic,
  onRetakeTest,
  onDiscussWithAi,
  onLearnWeakTopic,
  onBackToTopic,
  onNavigate,
}) => {
  const [attempt, setAttempt] = useState<WrittenTestAttempt | null>(null);
  const [retryingQuestionId, setRetryingQuestionId] = useState<string | null>(null);

  useEffect(() => {
    const loaded = getWrittenTestAttempt(testId);
    if (loaded) {
      setAttempt(loaded);
    }
  }, [testId]);

  // Handle single question evaluation retry
  const handleRetryQuestionEvaluation = async (questionId: string) => {
    if (!attempt) return;
    const question = attempt.questions.find((q) => q.id === questionId);
    if (!question) return;

    setRetryingQuestionId(questionId);

    try {
      const studentAnswer = attempt.answers[questionId] || '';
      const updatedEval = await evaluateSingleAnswer({
        classLevel: attempt.classLevel,
        subject,
        chapter,
        topic,
        question,
        studentAnswer,
        language: attempt.language,
      });

      const nextEvaluations = {
        ...attempt.evaluations,
        [questionId]: updatedEval,
      };

      const nextResult = calculateWrittenTestResult(attempt.questions, nextEvaluations, attempt.answers);
      const nextOverallFeedback = await generateOverallFeedback(attempt, nextEvaluations, nextResult);

      const updatedAttempt: WrittenTestAttempt = {
        ...attempt,
        evaluations: nextEvaluations,
        result: nextResult,
        aiOverallFeedback: nextOverallFeedback,
      };

      saveWrittenTestAttempt(updatedAttempt);
      setAttempt(updatedAttempt);
    } catch (err) {
      console.error('Retry evaluation error:', err);
    } finally {
      setRetryingQuestionId(null);
    }
  };

  // Build context prompt when discussing with RDS AI
  const handleStartDiscussion = () => {
    if (!attempt || !attempt.result) {
      onDiscussWithAi();
      return;
    }

    const missedPointsList: string[] = [];
    attempt.questions.forEach((q) => {
      const ev = attempt.evaluations[q.id];
      if (ev && ev.missingPoints && ev.missingPoints.length > 0) {
        missedPointsList.push(`• For "${q.question}": missing points: ${ev.missingPoints.join(', ')}`);
      }
    });

    const discussionPrompt = `I just completed a written test on ${topic.title} (${subject.name}, Chapter ${chapter.chapterNumber}: ${chapter.title}) and scored ${attempt.result.totalScore}/${attempt.result.maxScore} marks.

Here are the key points I missed in my answers:
${missedPointsList.slice(0, 4).join('\n')}

Can you explain these concepts simply and teach me how to write high-scoring answers for my Telangana board exams?`;

    onDiscussWithAi(discussionPrompt);
  };

  if (!attempt || !attempt.result) {
    return (
      <div className="min-h-screen bg-[#070b19] flex items-center justify-center p-4 text-slate-100">
        <div className="bg-[#090f23] border border-slate-800 rounded-2xl p-8 max-w-md text-center space-y-4">
          <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-lg font-bold">Loading Written Assessment Results...</h3>
        </div>
      </div>
    );
  }

  return (
    <div id="written-test-result-screen" className="min-h-screen bg-[#070b19] pb-24 text-slate-100">
      {/* Top Header & Breadcrumbs */}
      <div className="bg-gradient-to-b from-[#0a1226] to-[#070b19] border-b border-emerald-500/20 pt-6 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Breadcrumbs
            currentClass={attempt.classLevel}
            subject={subject}
            chapter={chapter}
            topic={topic}
            onNavigate={onNavigate}
          />

          <div className="flex items-center justify-between">
            <button
              onClick={onBackToTopic}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090f23] hover:bg-[#121d3f] border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Topic Hub</span>
            </button>

            <span className="text-xs text-emerald-400 font-mono font-bold">
              AI Evaluation Completed & Locked
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* 1. Result Summary Banner & 4 Stat Cards */}
        <WrittenTestResultSummary
          result={attempt.result}
          topicTitle={attempt.topicTitle}
          subjectName={attempt.subjectName}
          chapterTitle={attempt.chapterTitle}
          language={attempt.language}
        />

        {/* 2. Overall AI Feedback & Tutor Insights */}
        {attempt.aiOverallFeedback && (
          <OverallAiFeedback
            feedback={attempt.aiOverallFeedback}
            onDiscussWithAi={handleStartDiscussion}
            onLearnWeakTopics={(concept) => onLearnWeakTopic(concept || topic.title)}
            onRetakeTest={onRetakeTest}
            onGoToDashboard={() => onNavigate('dashboard')}
          />
        )}

        {/* 3. Weak Concept & Mistake Analysis Breakdown */}
        <MistakeAnalysis
          questions={attempt.questions}
          evaluations={attempt.evaluations}
          onSelectConceptToLearn={(concept) => onLearnWeakTopic(concept)}
        />

        {/* 4. Detailed Question by Question Evaluation Cards */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {t('detailedReview', attempt.language)}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review your written answers, teacher rubrics, missing textbook points, and model answers
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono font-bold">
              {attempt.questions.length} Questions
            </span>
          </div>

          <div className="space-y-6">
            {attempt.questions.map((question, idx) => {
              const evaluation = attempt.evaluations[question.id];
              const studentAnswer = attempt.answers[question.id] || '';

              if (!evaluation) return null;

              return (
                <AnswerEvaluationCard
                  key={question.id}
                  index={idx}
                  question={question}
                  studentAnswer={studentAnswer}
                  evaluation={evaluation}
                  onRetryEvaluation={handleRetryQuestionEvaluation}
                  isRetrying={retryingQuestionId === question.id}
                />
              );
            })}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={handleStartDiscussion}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>🤖 Discuss My Mistakes with RDS AI</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => onLearnWeakTopic(topic.title)}
              className="px-5 py-3.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>📚 Learn Weak Topics</span>
            </button>

            <button
              onClick={onRetakeTest}
              className="px-5 py-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>🔄 Take Another Test</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
