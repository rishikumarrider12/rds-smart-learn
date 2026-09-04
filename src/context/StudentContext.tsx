import React, { createContext, useContext, useState, useEffect } from 'react';
import { Chapter, ClassLevel, StudentProfile, Subject, Topic } from '../types';
import { getChapterById, getSubjectById, getSyllabusForClass, getTopicById } from '../data/syllabusData';

export type SupportedLanguage = 'English' | 'Telugu' | 'Hindi';

interface StudentContextType {
  student: StudentProfile | null;
  selectedClass: ClassLevel;
  selectedSubject: Subject | null;
  selectedChapter: Chapter | null;
  selectedTopic: Topic | null;
  language: SupportedLanguage;
  isOnboarded: boolean;
  saveStudentProfile: (profile: StudentProfile) => void;
  updateClass: (newClass: ClassLevel) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  selectSubject: (subject: Subject) => void;
  selectChapter: (chapter: Chapter) => void;
  selectTopic: (topic: Topic) => void;
  setFullContext: (subjectId: string, chapterId?: string, topicId?: string) => void;
  clearLearningSelection: () => void;
  resetAll: () => void;
}

const STORAGE_KEYS = {
  PROFILE: 'rds_student_profile',
  LEARNING_STATE: 'rds_learning_state',
  LANGUAGE: 'rds_preferred_language',
};

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<StudentProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading student profile from localStorage:', e);
    }
    return null;
  });

  const [selectedClass, setSelectedClass] = useState<ClassLevel>(() => {
    return student?.selectedClass || 'Class 10';
  });

  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (savedLang === 'Telugu' || savedLang === 'Hindi' || savedLang === 'English') {
        return savedLang;
      }
      if (student?.preferredLanguage) {
        return student.preferredLanguage;
      }
    } catch (e) {
      console.error('Error loading language preference:', e);
    }
    return 'English';
  });

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Sync selectedClass when student changes
  useEffect(() => {
    if (student?.selectedClass) {
      setSelectedClass(student.selectedClass);
    }
  }, [student]);

  // Load saved learning selection on boot if matches current class
  useEffect(() => {
    try {
      const savedLearning = localStorage.getItem(STORAGE_KEYS.LEARNING_STATE);
      if (savedLearning) {
        const parsed = JSON.parse(savedLearning);
        if (parsed.classLevel === selectedClass && parsed.subjectId) {
          const sub = getSubjectById(selectedClass, parsed.subjectId);
          if (sub) {
            setSelectedSubject(sub);
            if (parsed.chapterId) {
              const chap = getChapterById(selectedClass, parsed.subjectId, parsed.chapterId);
              if (chap) {
                setSelectedChapter(chap);
                if (parsed.topicId) {
                  const top = getTopicById(selectedClass, parsed.subjectId, parsed.chapterId, parsed.topicId);
                  if (top) {
                    setSelectedTopic(top);
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('Error restoring learning state:', e);
    }
  }, [selectedClass]);

  // Persist learning state changes
  useEffect(() => {
    try {
      if (selectedSubject) {
        const stateToSave = {
          classLevel: selectedClass,
          subjectId: selectedSubject.id,
          chapterId: selectedChapter?.id || null,
          topicId: selectedTopic?.id || null,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.LEARNING_STATE, JSON.stringify(stateToSave));
      }
    } catch (e) {
      console.error('Error persisting learning state:', e);
    }
  }, [selectedClass, selectedSubject, selectedChapter, selectedTopic]);

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLang);
      if (student) {
        const updated = { ...student, preferredLanguage: newLang };
        setStudent(updated);
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Error saving language:', e);
    }
  };

  const saveStudentProfile = (profile: StudentProfile) => {
    const enriched = {
      ...profile,
      preferredLanguage: profile.preferredLanguage || language,
      onboardedAt: new Date().toISOString(),
    };
    setStudent(enriched);
    setSelectedClass(profile.selectedClass);
    if (profile.preferredLanguage) {
      setLanguageState(profile.preferredLanguage);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(enriched));
      if (profile.preferredLanguage) {
        localStorage.setItem(STORAGE_KEYS.LANGUAGE, profile.preferredLanguage);
      }
    } catch (e) {
      console.error('Error saving profile:', e);
    }
  };

  const updateClass = (newClass: ClassLevel) => {
    setSelectedClass(newClass);
    if (student) {
      const updated = { ...student, selectedClass: newClass };
      setStudent(updated);
      try {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
      } catch (e) {
        console.error('Error updating class in profile:', e);
      }
    }
    // Clear selections on class change because subject IDs differ
    setSelectedSubject(null);
    setSelectedChapter(null);
    setSelectedTopic(null);
    localStorage.removeItem(STORAGE_KEYS.LEARNING_STATE);
  };

  const selectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedChapter(null);
    setSelectedTopic(null);
  };

  const selectChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setSelectedTopic(null);
  };

  const selectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
  };

  const setFullContext = (subjectId: string, chapterId?: string, topicId?: string) => {
    const sub = getSubjectById(selectedClass, subjectId);
    if (sub) {
      setSelectedSubject(sub);
      if (chapterId) {
        const chap = getChapterById(selectedClass, subjectId, chapterId);
        if (chap) {
          setSelectedChapter(chap);
          if (topicId) {
            const top = getTopicById(selectedClass, subjectId, chapterId, topicId);
            if (top) {
              setSelectedTopic(top);
            }
          }
        }
      }
    }
  };

  const clearLearningSelection = () => {
    setSelectedSubject(null);
    setSelectedChapter(null);
    setSelectedTopic(null);
    localStorage.removeItem(STORAGE_KEYS.LEARNING_STATE);
  };

  const resetAll = () => {
    setStudent(null);
    setSelectedSubject(null);
    setSelectedChapter(null);
    setSelectedTopic(null);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.LEARNING_STATE);
  };

  return (
    <StudentContext.Provider
      value={{
        student,
        selectedClass,
        selectedSubject,
        selectedChapter,
        selectedTopic,
        language,
        isOnboarded: !!student && !!student.name.trim(),
        saveStudentProfile,
        updateClass,
        setLanguage,
        selectSubject,
        selectChapter,
        selectTopic,
        setFullContext,
        clearLearningSelection,
        resetAll,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
