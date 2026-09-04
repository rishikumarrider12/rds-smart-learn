import { ClassLevel, Subject, Chapter, Topic } from '../../types';

export type LearningLanguage = 'English' | 'Telugu' | 'Hindi';

export type AiLearningMode =
  | 'ask_ai'
  | 'simple_explanation'
  | 'step_by_step'
  | 'examples'
  | 'quick_revision'
  | 'ask_me_questions';

export interface AiLearningContext {
  studentName: string;
  classLevel: ClassLevel;
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  language: LearningLanguage;
  mode: AiLearningMode;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  suggestedChips?: string[];
  learningContext?: {
    classLevel: ClassLevel;
    subjectName: string;
    chapterTitle: string;
    topicTitle: string;
    language: LearningLanguage;
  };
}

export interface StructuredSection {
  heading: string;
  content: string;
  highlightPoints?: string[];
  example?: string;
}

export interface StructuredStep {
  stepNumber: number;
  title: string;
  explanation: string;
  exampleOrFormula?: string;
  keyTakeaway: string;
}

export interface StructuredExample {
  title: string;
  problemOrContext: string;
  stepByStepSolution: string[];
  keyLearningPoint: string;
}

export interface StructuredLearningContent {
  title: string;
  mode: AiLearningMode;
  introduction?: string;
  sections?: StructuredSection[];
  steps?: StructuredStep[];
  examples?: StructuredExample[];
  importantPoints?: string[];
  keyFormulas?: string[];
  summary?: string;
  currentQuestion?: {
    questionText: string;
    hint?: string;
    conceptTarget: string;
  };
  suggestedActions?: string[];
}

export interface AiApiResponse {
  success: boolean;
  text?: string;
  structuredData?: StructuredLearningContent;
  error?: string;
  isConfigError?: boolean;
}
