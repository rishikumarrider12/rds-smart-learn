import { LearningLanguage } from '../ai/aiTypes';

/**
 * Lightweight UI localization for the exam-taking flow.
 * When the learner selects Telugu the key navigation / submit / review labels
 * are rendered in Telugu; otherwise English is returned so nothing else changes.
 */
export type ExamTextKey =
  | 'previousQuestion'
  | 'nextQuestion'
  | 'skip'
  | 'finishSubmit'
  | 'submitTest'
  | 'questionPalette'
  | 'answered'
  | 'inProgress'
  | 'notAnswered'
  | 'current'
  | 'questions'
  | 'submitAnyway'
  | 'submitForEvaluation'
  | 'unansweredQuestions'
  | 'readyToSubmit'
  | 'reviewAnswers'
  | 'writtenTest'
  | 'exitTest'
  | 'status'
  | 'readyToEvaluate'
  | 'pending'
  | 'attemptedCount'
  | 'testComplete'
  | 'totalScoreAwarded'
  | 'marksObtained'
  | 'percentage'
  | 'conceptAccuracy'
  | 'detailedReview'
  | 'questionsAnswered';

type Dictionary = Record<ExamTextKey, { en: string; te: string }>;

const DICT: Dictionary = {
  previousQuestion: { en: 'Previous Question', te: 'మునుపటి ప్రశ్న' },
  nextQuestion: { en: 'Next Question', te: 'తరువాత ప్రశ్న' },
  skip: { en: 'Skip', te: 'దాటవేయి' },
  finishSubmit: { en: 'Finish & Submit Test', te: 'పరీక్ష పూర్తి చేసి సమర్పించండి' },
  submitTest: { en: 'Submit Test', te: 'పరీక్ష సమర్పించండి' },
  questionPalette: { en: 'Question Palette', te: 'ప్రశ్న ప్యాలెట్' },
  answered: { en: 'Answered', te: 'జవాబు ఇవ్వబడింది' },
  inProgress: { en: 'In Progress', te: 'కొనసాగుతోంది' },
  notAnswered: { en: 'Not Answered', te: 'జవాబు ఇవ్వలేదు' },
  current: { en: 'Current', te: 'ప్రస్తుతం' },
  questions: { en: 'Questions', te: 'ప్రశ్నలు' },
  submitAnyway: { en: 'Submit Anyway', te: 'ఏమైనా సమర్పించండి' },
  submitForEvaluation: { en: 'Submit for Evaluation', te: 'మూల్యాంకనం కోసం సమర్పించండి' },
  unansweredQuestions: { en: 'Unanswered Questions', te: 'జవాబు ఇవ్వని ప్రశ్నలు' },
  readyToSubmit: { en: 'Ready to Submit Test?', te: 'పరీక్ష సమర్పించడానికి సిద్ధంగా ఉన్నారా?' },
  reviewAnswers: { en: 'Review Answers', te: 'జవాబులను సమీక్షించండి' },
  writtenTest: { en: 'Written Test', te: 'వ్రాత పరీక్ష' },
  exitTest: { en: 'Exit Test to Learning Hub', te: 'నేర్చుకునే కేంద్రానికి నిష్క్రమించండి' },
  status: { en: 'Status', te: 'స్థితి' },
  readyToEvaluate: { en: 'Ready to Evaluate', te: 'మూల్యాంకనానికి సిద్ధం' },
  pending: { en: 'Pending', te: 'వేచి ఉంది' },
  attemptedCount: { en: 'attempted', te: 'జవాబులిచ్చారు' },
  testComplete: { en: 'Written Test Complete!', te: 'వ్రాత పరీక్ష పూర్తయింది!' },
  totalScoreAwarded: { en: 'Total Score Awarded', te: 'పొందిన మొత్తం స్కోరు' },
  detailedReview: { en: 'Detailed Question-by-Question Review', te: 'ప్రశ్నల వారీగా వివరణాత్మక సమీక్ష' },
  marksObtained: { en: 'Marks Obtained', te: 'పొందిన మార్కులు' },
  percentage: { en: 'Percentage', te: 'శాతం' },
  conceptAccuracy: { en: 'Concept Accuracy', te: 'భావన ఖచ్చితత్వం' },
  questionsAnswered: { en: 'Questions Answered', te: 'జవాబులిచ్చిన ప్రశ్నలు' },
};

function isTelugu(language: LearningLanguage): boolean {
  return language === 'Telugu';
}

export function t(key: ExamTextKey, language: LearningLanguage): string {
  const lang = isTelugu(language) ? 'te' : 'en';
  return DICT[key][lang];
}

export function questionProgress(current: number, total: number, language: LearningLanguage): string {
  return isTelugu(language) ? `ప్రశ్న ${current} / ${total}` : `Question ${current} of ${total}`;
}

export function answeredProgress(answered: number, total: number, language: LearningLanguage): string {
  return isTelugu(language)
    ? `${answered}/${total} జవాబులిచ్చారు`
    : `${answered}/${total} Answered`;
}

export function pendingCount(count: number, language: LearningLanguage): string {
  return isTelugu(language) ? `${count} వేచి ఉంది` : `${count} Pending`;
}