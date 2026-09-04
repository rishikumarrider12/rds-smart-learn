export type ClassLevel = 'Class 6' | 'Class 7' | 'Class 8' | 'Class 9' | 'Class 10';

export interface StudentProfile {
  name: string;
  schoolName: string;
  selectedClass: ClassLevel;
  preferredLanguage?: 'English' | 'Telugu' | 'Hindi';
  onboardedAt?: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  estimatedMinutes?: number;
  difficulty?: 'Basic' | 'Intermediate' | 'Advanced';
  learningObjectives?: string[];
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  description: string;
  topics: Topic[];
  iconName?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string; // Lucide icon identifier
  accentColor: string; // Tailwind color class or hex
  gradient: string;
  chaptersCount: number;
  topicsCount: number;
  chapters: Chapter[];
}

export interface ClassSyllabus {
  classLevel: ClassLevel;
  academicBoard: 'Telangana State Board (SCERT)';
  curriculumVersion?: string;
  academicYear?: string;
  sourceAuthority?: string;
  sourceReference?: string;
  subjects: Subject[];
}

export interface LearningContextState {
  student: StudentProfile | null;
  selectedSubject: Subject | null;
  selectedChapter: Chapter | null;
  selectedTopic: Topic | null;
}

export type AppRoute = 
  | '/'
  | '/onboarding'
  | '/dashboard'
  | '/subjects'
  | '/chapters'
  | '/topics'
  | '/learn'
  | '/ask-ai'
  | '/learn-with-ai'
  | '/mcq-test'
  | string; // Support dynamic test session routes like /mcq-test/session/:id and /mcq-test/result/:id

export type LearningActionType = 'ask_ai' | 'learn_ai' | 'mcq_test' | 'written_test';

export * from './test';
export * from './auth';
export * from './organization';
export * from './assignment';

