import React, { useState, useEffect } from 'react';
import {
  createTeacherAssignment,
  generateAssignmentQuestionsAI,
} from '../../services/assignmentService';
import { TELANGANA_CLASSES, getSyllabusForClass } from '../../data/syllabusData';
import { ClassLevel, Subject, Chapter, Topic } from '../../types';
import { DbAssignmentQuestion } from '../../types/assignment';
import {
  X,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  FileText,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
} from 'lucide-react';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teacherSchoolId?: string;
  teacherSchoolName?: string;
  defaultClassLevel?: string;
  defaultSubjectId?: string;
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  teacherSchoolId,
  teacherSchoolName,
  defaultClassLevel,
  defaultSubjectId,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Curriculum Selection
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(
    (defaultClassLevel as ClassLevel) || 'Class 10'
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    defaultSubjectId || ''
  );
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');

  // Step 2: Details & Settings
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignmentType, setAssignmentType] = useState<'mixed' | 'mcq' | 'written'>('mixed');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [dueDate, setDueDate] = useState<string>('');
  const [allowLateSubmission, setAllowLateSubmission] = useState(true);

  // Step 3: Questions List & Editor
  const [questions, setQuestions] = useState<DbAssignmentQuestion[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Derived syllabus entities
  const syllabus = getSyllabusForClass(selectedClass);
  const subjects = syllabus.subjects;
  const currentSubject: Subject | undefined = subjects.find(
    (s) => s.id.toLowerCase().replace(/\s+/g, '_') === selectedSubjectId.toLowerCase().replace(/\s+/g, '_')
  ) || subjects[0];

  const chapters = currentSubject?.chapters || [];
  const currentChapter: Chapter | undefined = chapters.find(
    (c) => c.id === selectedChapterId
  ) || chapters[0];

  const topics = currentChapter?.topics || [];
  const currentTopic: Topic | undefined = topics.find(
    (t) => t.id === selectedTopicId
  ) || topics[0];

  // Auto-select defaults
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  useEffect(() => {
    if (chapters.length > 0 && (!selectedChapterId || !chapters.some((c) => c.id === selectedChapterId))) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [chapters, selectedChapterId]);

  useEffect(() => {
    if (topics.length > 0 && (!selectedTopicId || !topics.some((t) => t.id === selectedTopicId))) {
      setSelectedTopicId(topics[0].id);
    }
  }, [topics, selectedTopicId]);

  // Set default due date (7 days from now)
  useEffect(() => {
    if (!dueDate) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      d.setHours(23, 59, 0, 0);
      setDueDate(d.toISOString().slice(0, 16));
    }
  }, [dueDate]);

  // Update title automatically when topic changes if user hasn't typed a custom title
  useEffect(() => {
    if (currentTopic && currentChapter) {
      setTitle(`${currentTopic.title} - Homework Assessment`);
      setDescription(
        `Complete the practice assessment on ${currentTopic.title} from Telangana SCERT ${selectedClass} ${currentSubject?.name}.`
      );
    }
  }, [currentTopic, currentChapter, selectedClass, currentSubject]);

  if (!isOpen) return null;

  const handleGenerateQuestions = async () => {
    if (!currentSubject || !currentChapter || !currentTopic) return;
    setIsGeneratingAi(true);
    setErrorMsg(null);

    try {
      const res = await generateAssignmentQuestionsAI({
        classLevel: selectedClass,
        subjectName: currentSubject.name,
        chapterNumber: currentChapter.chapterNumber,
        chapterTitle: currentChapter.title,
        topicTitle: currentTopic.title,
        assignmentType,
        difficulty,
        questionCount,
      });

      if (res.success && res.questions && res.questions.length > 0) {
        setQuestions(res.questions);
      } else {
        throw new Error('Failed to generate questions.');
      }
    } catch (err: any) {
      console.error('Question generation failed:', err);
      setErrorMsg(err.message || 'Question generation failed. Using default template.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleProceedToQuestions = async () => {
    if (!title.trim()) {
      setErrorMsg('Please provide a title for the assignment.');
      return;
    }
    setErrorMsg(null);
    setStep(3);
    if (questions.length === 0) {
      await handleGenerateQuestions();
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!currentSubject || !currentChapter || !currentTopic) {
      setErrorMsg('Please select a valid subject, chapter, and topic.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Assignment title is required.');
      return;
    }
    if (questions.length === 0) {
      setErrorMsg('Please add or generate at least one question.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      await createTeacherAssignment({
        schoolId: teacherSchoolId,
        classLevel: selectedClass,
        subjectId: currentSubject.id,
        subjectName: currentSubject.name,
        chapterId: currentChapter.id,
        chapterNumber: currentChapter.chapterNumber,
        chapterTitle: currentChapter.title,
        topicId: currentTopic.id,
        topicTitle: currentTopic.title,
        title: title.trim(),
        description: description.trim(),
        assignmentType,
        difficulty,
        questionCount: questions.length,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        allowLateSubmission,
        studentTargetMode: 'class',
        questions,
        status,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to create assignment:', err);
      setErrorMsg(err.message || 'Failed to create assignment.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddManualQuestion = (type: 'mcq' | 'written') => {
    const newId = `q_${Date.now().toString().slice(-4)}`;
    if (type === 'mcq') {
      setQuestions([
        ...questions,
        {
          id: newId,
          type: 'mcq',
          question: 'New Telangana SCERT MCQ Question text here?',
          marks: 1,
          difficulty: 'medium',
          options: [
            { id: 'A', text: 'Option A' },
            { id: 'B', text: 'Option B' },
            { id: 'C', text: 'Option C' },
            { id: 'D', text: 'Option D' },
          ],
          correctAnswer: 'A',
          explanation: 'Explanation based on Telangana SCERT textbook.',
          concept: currentTopic?.title || 'Concept',
        },
      ]);
    } else {
      setQuestions([
        ...questions,
        {
          id: newId,
          type: 'written',
          question: 'New descriptive question exploring core concepts?',
          questionType: 'short',
          marks: 4,
          difficulty: 'medium',
          concept: currentTopic?.title || 'Concept',
          keyPoints: ['Definition', 'Core mechanism', 'Application'],
          modelAnswer: 'Complete model answer according to SCERT standards.',
          evaluationCriteria: 'Award full marks for all key points clearly explained.',
        },
      ]);
    }
    setEditingQuestionIdx(questions.length);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
    if (editingQuestionIdx === idx) setEditingQuestionIdx(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0b1329] border border-cyan-500/30 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-[#0e1730]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Create Smart Assignment
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
                  Telangana SCERT
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Step {step} of 3 • {teacherSchoolName || 'Institution Classroom'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Progress Indicator */}
        <div className="px-6 py-3 bg-[#080d1e] border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-cyan-400 font-semibold' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-800 text-slate-400'}`}>
              1
            </span>
            <span>1. Syllabus & Topic</span>
          </div>
          <div className="w-8 h-[1px] bg-slate-800" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-cyan-400 font-semibold' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-800 text-slate-400'}`}>
              2
            </span>
            <span>2. Parameters & Deadline</span>
          </div>
          <div className="w-8 h-[1px] bg-slate-800" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-cyan-400 font-semibold' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-800 text-slate-400'}`}>
              3
            </span>
            <span>3. Review Questions</span>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: Syllabus Selection */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Class Level
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {TELANGANA_CLASSES.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => {
                        setSelectedClass(cls);
                        const s = getSyllabusForClass(cls);
                        if (s.subjects.length > 0) {
                          setSelectedSubjectId(s.subjects[0].id);
                          if (s.subjects[0].chapters.length > 0) {
                            setSelectedChapterId(s.subjects[0].chapters[0].id);
                            if (s.subjects[0].chapters[0].topics.length > 0) {
                              setSelectedTopicId(s.subjects[0].chapters[0].topics[0].id);
                            }
                          }
                        }
                      }}
                      className={`py-3 px-2 rounded-xl text-center font-bold text-xs transition-all border ${
                        selectedClass === cls
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Subject
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {subjects.map((sub) => {
                    const isSelected =
                      selectedSubjectId.toLowerCase().replace(/\s+/g, '_') ===
                      sub.id.toLowerCase().replace(/\s+/g, '_');
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubjectId(sub.id);
                          if (sub.chapters.length > 0) {
                            setSelectedChapterId(sub.chapters[0].id);
                            if (sub.chapters[0].topics.length > 0) {
                              setSelectedTopicId(sub.chapters[0].topics[0].id);
                            }
                          }
                        }}
                        className={`p-3 rounded-2xl text-left transition-all border flex items-center gap-3 ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500/60 text-white shadow-md'
                            : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          {sub.name.slice(0, 1)}
                        </div>
                        <span className="text-xs font-semibold">{sub.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Chapter
                  </label>
                  <select
                    value={selectedChapterId}
                    onChange={(e) => {
                      setSelectedChapterId(e.target.value);
                      const chap = chapters.find((c) => c.id === e.target.value);
                      if (chap && chap.topics.length > 0) {
                        setSelectedTopicId(chap.topics[0].id);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                  >
                    {chapters.map((chap) => (
                      <option key={chap.id} value={chap.id}>
                        Ch {chap.chapterNumber}: {chap.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Topic / Concept
                  </label>
                  <select
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                  >
                    {topics.map((top) => (
                      <option key={top.id} value={top.id}>
                        {top.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Topic Summary Card */}
              {currentTopic && (
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-cyan-200">
                      Curriculum Target: {currentTopic.title}
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {selectedClass} • {currentSubject?.name} • Chapter {currentChapter?.chapterNumber}: {currentChapter?.title}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Parameters & Deadline */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Real Numbers & Logarithms Homework"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Instructions / Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide instructions for students..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Assignment Format
                  </label>
                  <select
                    value={assignmentType}
                    onChange={(e) => setAssignmentType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                  >
                    <option value="mixed">Mixed (MCQ + Written)</option>
                    <option value="mcq">MCQ Only</option>
                    <option value="written">Written / Descriptive Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                  >
                    <option value="easy">Easy (Foundational)</option>
                    <option value="medium">Medium (Standard Board)</option>
                    <option value="hard">Hard (Advanced Application)</option>
                    <option value="mixed">Mixed Difficulty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Question Count
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Due Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="allowLate"
                    checked={allowLateSubmission}
                    onChange={(e) => setAllowLateSubmission(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                  <label htmlFor="allowLate" className="text-xs text-slate-300 cursor-pointer">
                    Allow late submissions (marked as late)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Question Review & AI Generation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Questions ({questions.length})
                  </h4>
                  <p className="text-xs text-slate-400">
                    Total Marks: {questions.reduce((sum, q) => sum + (q.marks || 1), 0)} marks
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateQuestions}
                    disabled={isGeneratingAi}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                    {isGeneratingAi ? 'Regenerating AI...' : 'Regenerate Questions'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddManualQuestion('mcq')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> +MCQ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddManualQuestion('written')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> +Written
                  </button>
                </div>
              </div>

              {isGeneratingAi && (
                <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
                  <p className="text-sm font-bold text-white">Gemini Academic AI is drafting questions...</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Aligning with Telangana SCERT syllabus for {selectedClass} {currentSubject?.name}
                  </p>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-3">
                {questions.map((q, idx) => {
                  const isEditing = editingQuestionIdx === idx;
                  return (
                    <div
                      key={q.id || idx}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-cyan-400 font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${q.type === 'mcq' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'}`}>
                            {q.type.toUpperCase()} • {q.marks || 1}M
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {q.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingQuestionIdx(isEditing ? null : idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Question Text */}
                      {!isEditing ? (
                        <p className="text-xs text-slate-200 font-medium">
                          {q.question}
                        </p>
                      ) : (
                        <textarea
                          rows={2}
                          value={q.question}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[idx].question = e.target.value;
                            setQuestions(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-xl bg-black border border-slate-700 text-white text-xs"
                        />
                      )}

                      {/* MCQ Options */}
                      {q.type === 'mcq' && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {q.options.map((opt) => {
                            const isCorrect = q.correctAnswer === opt.id;
                            return (
                              <div
                                key={opt.id}
                                className={`p-2 rounded-xl border flex items-center gap-2 ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-black/40 border-slate-800 text-slate-300'}`}
                              >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${isCorrect ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                                  {opt.id}
                                </span>
                                <span className="text-xs truncate">{opt.text}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Written Model Answer */}
                      {q.type === 'written' && q.modelAnswer && (
                        <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-[11px] text-purple-200">
                          <span className="font-bold">Model Answer: </span>
                          <span className="text-slate-300">{q.modelAnswer}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0e1730]/90 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step === 1 && (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                Continue to Parameters <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={handleProceedToQuestions}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                Generate & Review Questions <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave('draft')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave('published')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Publish Assignment
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
