import { ClassLevel, ClassSyllabus, Subject, Chapter, Topic } from '../types';
import { CLASS_6_SYLLABUS } from './curriculum/class6';
import { CLASS_7_SYLLABUS } from './curriculum/class7';
import { CLASS_8_SYLLABUS } from './curriculum/class8';
import { CLASS_9_SYLLABUS } from './curriculum/class9';
import { CLASS_10_SYLLABUS } from './curriculum/class10';

export const TELANGANA_CLASSES: ClassLevel[] = [
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10'
];

export const SYLLABUS_DATA: Record<ClassLevel, ClassSyllabus> = {
  'Class 6': CLASS_6_SYLLABUS,
  'Class 7': CLASS_7_SYLLABUS,
  'Class 8': CLASS_8_SYLLABUS,
  'Class 9': CLASS_9_SYLLABUS,
  'Class 10': CLASS_10_SYLLABUS
};

export const getSyllabusForClass = (classLevel: ClassLevel): ClassSyllabus => {
  return SYLLABUS_DATA[classLevel] || SYLLABUS_DATA['Class 10'];
};

/**
 * All unique subjects configured in the RDS SMART LEARN curriculum.
 * Derived directly from SYLLABUS_DATA so the subject list is always in sync
 * with the actual curriculum (Telugu, Hindi, English, Mathematics,
 * Physical Science, Biological Science, Social Studies).
 */
export const ALL_SUBJECTS: Subject[] = (() => {
  const seen = new Map<string, Subject>();
  (Object.keys(SYLLABUS_DATA) as ClassLevel[]).forEach((cls) => {
    SYLLABUS_DATA[cls].subjects.forEach((subj) => {
      if (!seen.has(subj.name)) {
        seen.set(subj.name, subj);
      }
    });
  });
  return Array.from(seen.values());
})();

/**
 * Human-readable subject names for all subjects available in the curriculum.
 * Use this instead of hardcoding subject lists in UI components.
 */
export const ALL_SUBJECT_NAMES: string[] = ALL_SUBJECTS.map((s) => s.name);

/**
 * Single source of truth mapping a subject to its academic content language.
 * Telugu subjects -> Telugu content, Hindi subjects -> Hindi content,
 * everything else (Mathematics, Science, Social Studies, custom Other
 * Subjects) -> English. Used by MCQ generation, written tests, AI lessons
 * and the AI tutor so generated content is ALWAYS in the subject's language.
 */
export type SubjectLanguage = 'English' | 'Telugu' | 'Hindi';

export function getSubjectLanguage(subject: Subject | string): SubjectLanguage {
  const name = typeof subject === 'string' ? subject : subject.name;
  const n = String(name).toLowerCase();
  if (n.includes('telugu') || /[\u0C00-\u0C7F]/.test(name)) return 'Telugu';
  if (n.includes('hindi') || /[\u0900-\u097F]/.test(name)) return 'Hindi';
  return 'English';
}

export const getSubjectById = (classLevel: ClassLevel, subjectId: string): Subject | undefined => {
  const syllabus = getSyllabusForClass(classLevel);
  return syllabus.subjects.find(s => s.id === subjectId);
};

export const getChapterById = (classLevel: ClassLevel, subjectId: string, chapterId: string): Chapter | undefined => {
  const subject = getSubjectById(classLevel, subjectId);
  return subject?.chapters.find(c => c.id === chapterId);
};

export const getTopicById = (classLevel: ClassLevel, subjectId: string, chapterId: string, topicId: string): Topic | undefined => {
  const chapter = getChapterById(classLevel, subjectId, chapterId);
  return chapter?.topics.find(t => t.id === topicId);
};
