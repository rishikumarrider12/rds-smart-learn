import { ClassLevel, Subject, Chapter, Topic } from '../../types';
import { LearningLanguage } from '../ai/aiTypes';
import {
  AccuracyLevel,
  AnswerEvaluation,
  OverallWrittenFeedback,
  WrittenQuestion,
  WrittenTestAttempt,
  WrittenTestResult,
} from '../../types/writtenTest';
import { getAuthHeaders } from '../auth/authService';

export interface EvaluateAnswerParams {
  classLevel: ClassLevel;
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  question: WrittenQuestion;
  studentAnswer: string;
  language: LearningLanguage;
}

export interface ProgressCallbackData {
  currentIndex: number;
  totalQuestions: number;
  questionId: string;
  stage: 'evaluating' | 'analyzing_concepts' | 'verifying_rubric' | 'finalizing';
  statusText: string;
}

/**
 * Deterministic evaluation for empty answers - skips AI API call
 */
export function createEmptyAnswerEvaluation(question: WrittenQuestion): AnswerEvaluation {
  return {
    questionId: question.id,
    score: 0,
    maxMarks: question.maxMarks,
    percentage: 0,
    accuracyLevel: 'Needs Improvement',
    conceptualAccuracy: 0,
    strengths: [],
    correctPoints: [],
    missingPoints: question.keyPoints.length > 0
      ? question.keyPoints
      : ['Fundamental definition and concept explanation'],
    factualMistakes: [],
    improvementTips: [
      `Review ${question.concept} in your textbook.`,
      'Attempt to write at least the basic definitions and key terms in your next practice session.',
    ],
    teacherFeedback: "No answer was submitted for this question. That's okay—review the topic and try again.",
    modelAnswer: question.modelAnswer,
    evaluatedAt: new Date().toISOString(),
    isEmptyAnswer: true,
  };
}

/**
 * Builds the AI prompt for written answer evaluation
 */
function buildEvaluationPrompt(params: EvaluateAnswerParams): string {
  const { classLevel, subject, chapter, topic, question, studentAnswer, language } = params;

  return `You are RDS AI, a fair, patient, and educational answer evaluator for Telangana State Board (SCERT) school students.

You are evaluating:
Student Class: ${classLevel}
Subject: ${subject.name}
Chapter ${chapter.chapterNumber}: ${chapter.title}
Topic: ${topic.title}

Question:
"${question.question}"

Maximum Marks: ${question.maxMarks}
Tested Concept: ${question.concept}

Expected Key Points:
${question.keyPoints.map((kp, idx) => `${idx + 1}. ${kp}`).join('\n')}

Reference Model Answer:
"${question.modelAnswer}"

Student's Written Answer:
"""${studentAnswer}"""

Preferred Language: ${language}

Evaluation Principles & Guidelines:
1. Evaluate conceptual correctness and understanding, NOT exact word matching.
2. A student may express a correct idea using different words. Accept different wording when the meaning is conceptually sound.
3. Award marks fairly from 0 up to ${question.maxMarks}.
4. Consider the student's class level (${classLevel}).
5. Identify correct points clearly under "correctPoints" and "strengths".
6. Identify genuinely missing important points under "missingPoints".
7. Identify factual or conceptual mistakes ONLY when they are real factual/scientific errors under "factualMistakes". Do NOT classify minor wording differences as factual mistakes.
8. Do NOT heavily penalize minor spelling, typo, or minor grammar errors unless they alter the core scientific/mathematical meaning.
9. Provide constructive, encouraging improvement suggestions under "improvementTips".
10. Write warm, age-appropriate, encouraging "teacherFeedback". Never shame or insult the student.
11. The awarded "score" MUST be a number between 0 and ${question.maxMarks}.
12. "conceptualAccuracy" MUST be an integer between 0 and 100.
13. "accuracyLevel" MUST be one of: "Excellent", "Good", "Developing", "Needs Improvement".

Return ONLY valid JSON in this exact structure:
{
  "score": 4,
  "maxMarks": ${question.maxMarks},
  "percentage": 80,
  "accuracyLevel": "Good",
  "conceptualAccuracy": 85,
  "strengths": [
    "Clear understanding of the main definition"
  ],
  "correctPoints": [
    "Correctly stated the primary formula and its purpose"
  ],
  "missingPoints": [
    "Did not mention standard SI units in the final step"
  ],
  "factualMistakes": [],
  "improvementTips": [
    "Remember to include units when writing down your final answer"
  ],
  "teacherFeedback": "Great effort! You captured the core concept clearly. Adding standard units will make your answer complete for full marks.",
  "modelAnswer": "${question.modelAnswer.replace(/"/g, '\\"')}"
}`;
}

/**
 * Parse and validate AI evaluation output
 */
function validateEvaluationOutput(rawJson: any, question: WrittenQuestion): AnswerEvaluation | null {
  if (!rawJson || typeof rawJson !== 'object') return null;

  const maxMarks = question.maxMarks;
  let score = typeof rawJson.score === 'number' ? rawJson.score : Number(rawJson.score);
  if (isNaN(score)) score = 0;
  score = Math.max(0, Math.min(maxMarks, Math.round(score * 10) / 10));

  let percentage = typeof rawJson.percentage === 'number' ? rawJson.percentage : Math.round((score / maxMarks) * 100);
  percentage = Math.max(0, Math.min(100, percentage));

  let conceptualAccuracy = typeof rawJson.conceptualAccuracy === 'number'
    ? Math.max(0, Math.min(100, Math.round(rawJson.conceptualAccuracy)))
    : percentage;

  let accuracyLevel: AccuracyLevel = 'Developing';
  if (percentage >= 85) accuracyLevel = 'Excellent';
  else if (percentage >= 65) accuracyLevel = 'Good';
  else if (percentage >= 40) accuracyLevel = 'Developing';
  else accuracyLevel = 'Needs Improvement';

  if (['Excellent', 'Good', 'Developing', 'Needs Improvement'].includes(rawJson.accuracyLevel)) {
    accuracyLevel = rawJson.accuracyLevel as AccuracyLevel;
  }

  const toStringArray = (val: any): string[] => {
    if (Array.isArray(val)) {
      return val.filter((item) => typeof item === 'string' && item.trim().length > 0).map((s) => s.trim());
    }
    return [];
  };

  const strengths = toStringArray(rawJson.strengths);
  const correctPoints = toStringArray(rawJson.correctPoints);
  const missingPoints = toStringArray(rawJson.missingPoints);
  const factualMistakes = toStringArray(rawJson.factualMistakes);
  const improvementTips = toStringArray(rawJson.improvementTips);

  const teacherFeedback = typeof rawJson.teacherFeedback === 'string' && rawJson.teacherFeedback.trim()
    ? rawJson.teacherFeedback.trim()
    : (percentage >= 70
        ? 'Well written answer! You covered key concepts clearly.'
        : 'Good effort. Review the model answer and key points to strengthen your next response.');

  const modelAnswer = typeof rawJson.modelAnswer === 'string' && rawJson.modelAnswer.trim()
    ? rawJson.modelAnswer.trim()
    : question.modelAnswer;

  return {
    questionId: question.id,
    score,
    maxMarks,
    percentage,
    accuracyLevel,
    conceptualAccuracy,
    strengths: strengths.length > 0 ? strengths : ['Attempted the question with relevant thoughts.'],
    correctPoints,
    missingPoints,
    factualMistakes,
    improvementTips: improvementTips.length > 0 ? improvementTips : ['Review the model answer to practice standard exam points.'],
    teacherFeedback,
    modelAnswer,
    evaluatedAt: new Date().toISOString(),
    isPartialFailure: false,
  };
}

function normalizeAnswerWords(value: string): string[] {
  return value
    .toLocaleLowerCase()
    .normalize('NFKC')
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 1);
}

// Common English function words plus generic examination-stem verbs that must never
// count as "content" when measuring keyword relevance in deterministic fallback grading.
const STOP_WORDS = new Set([
  'the','a','an','and','or','but','if','then','than','so','for','of','to','in','on','at',
  'by','with','from','as','is','are','was','were','be','been','being','it','its','this','that',
  'these','those','they','them','their','there','he','she','we','you','your','my','me','our',
  'can','will','would','should','could','may','might','shall','do','does','did','has','have','had',
  'not','no','nor','yes','into','up','down','out','off','over','under','again','further','once',
  'here','about','against','between','before','after','above','below','both','each','few','more',
  'most','other','some','such','only','own','same','too','very','just','also',
  'use','uses','using','used','state','states','explain','explains','write','writes','describe',
  'describes','list','lists','define','defines','give','gives','mention','mentions','name','names',
  'outline','outlines','what','why','how','which','who','when','where',
]);

function isMeaninglessAnswer(answer: string): boolean {
  const words = normalizeAnswerWords(answer);
  if (words.length === 0) return true;

  const uniqueWords = new Set(words);
  const repeatedWordRatio = 1 - uniqueWords.size / words.length;
  // Catches repeated-word keyboard mash such as "zzzz zzzz zzzz" or "la la la la".
  if (words.length >= 3 && repeatedWordRatio >= 0.6) return true;

  // Catches long strings built from a tiny vocabulary (e.g. "ab ab cd ab cd ab cd...").
  if (words.length >= 8 && uniqueWords.size / words.length < 0.35) return true;

  // Catches short keyboard-mash with very few distinct characters (e.g. "aaaaaaaa").
  // NOTE: this is intentionally restricted to short strings - for long text the
  // finite-alphabet ratio is meaningless (any normal answer uses <=26 letters).
  const compact = words.join('');
  if (compact.length >= 6 && compact.length <= 40) {
    const uniqueCharacters = new Set(compact).size;
    if (uniqueCharacters / compact.length < 0.25) return true;
  }

  return false;
}

function createMeaninglessAnswerEvaluation(question: WrittenQuestion): AnswerEvaluation {
  return {
    questionId: question.id,
    score: 0,
    maxMarks: question.maxMarks,
    percentage: 0,
    accuracyLevel: 'Needs Improvement',
    conceptualAccuracy: 0,
    strengths: [],
    correctPoints: [],
    missingPoints: question.keyPoints,
    factualMistakes: [],
    improvementTips: [`Write an answer that directly addresses: ${question.question}`],
    teacherFeedback: 'This response does not address the question. Use the key terms from the lesson and explain the concept in your own words.',
    modelAnswer: question.modelAnswer,
    evaluatedAt: new Date().toISOString(),
    isPartialFailure: true,
  };
}

/**
 * Fallback evaluation when AI evaluation experiences network / parse failure.
 * Scores deterministically by counting how many required key-point ideas the
 * student's answer actually contains (stop-words excluded). This prevents
 * filler words or gibberish from earning arbitrary marks.
 */
function createFallbackEvaluation(question: WrittenQuestion, studentAnswer: string): AnswerEvaluation {
  const contentWords = (text: string) => normalizeAnswerWords(text).filter((w) => !STOP_WORDS.has(w));
  const answerContent = contentWords(studentAnswer);
  const answerWords = new Set(answerContent);

  // 1) Count how many of the required key points are touched by the answer.
  let covered = 0;
  let total = 0;
  const isPointCovered = (kp: string) => {
    const kpWords = contentWords(kp);
    return kpWords.some((w) => answerWords.has(w));
  };
  if (question.keyPoints.length > 0) {
    for (const kp of question.keyPoints) {
      if (contentWords(kp).length === 0) continue;
      total += 1;
      if (isPointCovered(kp)) covered += 1;
    }
  }

  let score = 0;
  let isRelevant = covered > 0;

  if (total > 0) {
    const ratio = covered / total;
    // A keyword-dump that touches every point in a very short answer is capped at 60% -
    // it cannot demonstrate real understanding. Genuine explanatory answers earn full marks.
    const terseKeywordDump = covered === total && answerContent.length < question.keyPoints.length * 2;
    const cap = terseKeywordDump ? 0.6 : 1;
    score = Math.round(Math.min(question.maxMarks, question.maxMarks * ratio * cap) * 10) / 10;
  } else {
    // No explicit key points: fall back to overlap with model-answer content words.
    const expected = new Set(contentWords(`${question.concept} ${question.modelAnswer}`));
    const uniqueContent = new Set(answerContent);
    const relevantWords = new Set(answerContent.filter((w) => expected.has(w)));
    const relevance = uniqueContent.size > 0 ? relevantWords.size / uniqueContent.size : 0;
    isRelevant = relevance >= 0.15;
    score = isRelevant
      ? Math.round(Math.min(question.maxMarks * 0.6, question.maxMarks * relevance * 2) * 10) / 10
      : 0;
  }

  score = Math.max(0, Math.min(question.maxMarks, score));
  const percentage = Math.round((score / question.maxMarks) * 100);
  const accuracyLevel = score >= question.maxMarks * 0.7 ? 'Good' : score > 0 ? 'Developing' : 'Needs Improvement';

  const coveredPoints = isRelevant ? question.keyPoints.filter((kp) => isPointCovered(kp)) : [];
  const missingPoints = isRelevant ? question.keyPoints.filter((kp) => !isPointCovered(kp)) : question.keyPoints;

  return {
    questionId: question.id,
    score,
    maxMarks: question.maxMarks,
    percentage,
    accuracyLevel,
    conceptualAccuracy: percentage,
    strengths: isRelevant ? [`Used ${Math.min(covered, total || question.keyPoints.length)} of ${total || question.keyPoints.length} required ideas.`] : [],
    correctPoints: coveredPoints,
    missingPoints,
    factualMistakes: [],
    improvementTips: isRelevant
      ? ['Compare with the reference model answer to ensure all required textbook key points are covered.']
      : [`Address the question directly and include key concepts such as ${question.keyPoints.slice(0, 2).join(' and ')}.`],
    teacherFeedback: isRelevant
      ? `You covered ${Math.min(covered, total || question.keyPoints.length)} of ${total || question.keyPoints.length} required ideas. Add the missing key points and explain your reasoning clearly for higher marks.`
      : 'This response does not address the question. Review the topic and explain its key points in your own words.',
    modelAnswer: question.modelAnswer,
    evaluatedAt: new Date().toISOString(),
    isPartialFailure: true,
  };
}

/**
 * Evaluate a single written answer
 */
export async function evaluateSingleAnswer(params: EvaluateAnswerParams): Promise<AnswerEvaluation> {
  const { question, studentAnswer } = params;

  // 1. Check for empty answer
  if (!studentAnswer || studentAnswer.trim().length === 0) {
    return createEmptyAnswerEvaluation(question);
  }

  if (isMeaninglessAnswer(studentAnswer)) {
    return createMeaninglessAnswerEvaluation(question);
  }

  // 2. Build prompt & call server AI
  const prompt = buildEvaluationPrompt(params);
  const systemInstruction = `You are RDS AI, an expert, encouraging, and fair school examination evaluator for Telangana State Board.
Evaluate conceptual understanding rather than exact word matching.
Return strict JSON format matching the schema.`;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify({
          systemInstruction,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          responseType: 'json',
        }),
      });

      if (!response.ok) {
        throw new Error(`Evaluation endpoint returned status ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.text || '';
      
      let parsed: any = null;
      try {
        let cleaned = rawText.trim();
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        parsed = JSON.parse(cleaned);
      } catch {
        const first = rawText.indexOf('{');
        const last = rawText.lastIndexOf('}');
        if (first !== -1 && last !== -1) {
          parsed = JSON.parse(rawText.substring(first, last + 1));
        }
      }

      if (parsed) {
        const validated = validateEvaluationOutput(parsed, question);
        if (validated) {
          return validated;
        }
      }
    } catch (err) {
      console.warn(`Evaluation attempt ${attempt} for question ${question.id} encountered error:`, err);
    }
  }

  // Fallback with graceful retry indicator
  console.info(`Using fallback evaluation for question ${question.id}`);
  return createFallbackEvaluation(question, studentAnswer);
}

/**
 * Sequential / Controlled evaluation of all questions with progress callbacks
 */
export async function evaluateAllWrittenAnswers(
  attempt: WrittenTestAttempt,
  subject: Subject,
  chapter: Chapter,
  topic: Topic,
  onProgress?: (progress: ProgressCallbackData) => void
): Promise<Record<string, AnswerEvaluation>> {
  const evaluations: Record<string, AnswerEvaluation> = {};
  const total = attempt.questions.length;

  for (let i = 0; i < total; i++) {
    const question = attempt.questions[i];
    const studentAnswer = attempt.answers[question.id] || '';

    onProgress?.({
      currentIndex: i + 1,
      totalQuestions: total,
      questionId: question.id,
      stage: 'evaluating',
      statusText: `Evaluating answer ${i + 1} of ${total}...`,
    });

    try {
      const evalResult = await evaluateSingleAnswer({
        classLevel: attempt.classLevel,
        subject,
        chapter,
        topic,
        question,
        studentAnswer,
        language: attempt.language,
      });

      evaluations[question.id] = evalResult;
    } catch (err) {
      console.error(`Failed to evaluate question ${question.id}:`, err);
      evaluations[question.id] = createFallbackEvaluation(question, studentAnswer);
    }
  }

  return evaluations;
}

/**
 * Calculate deterministic test scores & metrics
 * AI is never asked to calculate the totals.
 */
export function calculateWrittenTestResult(
  questions: WrittenQuestion[],
  evaluations: Record<string, AnswerEvaluation>,
  answers: Record<string, string>
): WrittenTestResult {
  let totalScore = 0;
  let maxScore = 0;
  let totalAccuracySum = 0;
  let answeredCount = 0;

  for (const q of questions) {
    const maxMarks = q.maxMarks;
    maxScore += maxMarks;

    const evaluation = evaluations[q.id];
    if (evaluation) {
      totalScore += Math.min(maxMarks, Math.max(0, evaluation.score));
      totalAccuracySum += evaluation.conceptualAccuracy || 0;
    }

    const ans = answers[q.id];
    if (ans && ans.trim().length > 0) {
      answeredCount++;
    }
  }

  totalScore = Math.round(totalScore * 10) / 10;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const conceptualAccuracy = questions.length > 0 ? Math.round(totalAccuracySum / questions.length) : 0;

  let performanceBadge = 'Needs Revision';
  let badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  let performanceMessage = 'Good effort! Review the model answers and practice the weak topics to boost your exam readiness.';

  if (percentage >= 90) {
    performanceBadge = 'Outstanding Mastery';
    badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    performanceMessage = 'Exceptional conceptual clarity! Your written answers demonstrate thorough understanding of the Telangana syllabus.';
  } else if (percentage >= 75) {
    performanceBadge = 'Strong Conceptual Grasp';
    badgeColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    performanceMessage = 'Very well done! You have a solid grasp of key concepts with just a few specific points to polish.';
  } else if (percentage >= 50) {
    performanceBadge = 'Good Progress';
    badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    performanceMessage = 'Good foundational understanding. Reviewing missing points will help you write complete 4-mark and 8-mark answers.';
  }

  return {
    totalScore,
    maxScore,
    percentage,
    conceptualAccuracy,
    questionsAnswered: answeredCount,
    totalQuestions: questions.length,
    performanceBadge,
    badgeColor,
    performanceMessage,
  };
}

/**
 * Generate overall AI feedback from evaluated summaries
 */
export async function generateOverallFeedback(
  attempt: WrittenTestAttempt,
  evaluations: Record<string, AnswerEvaluation>,
  result: WrittenTestResult
): Promise<OverallWrittenFeedback> {
  const evaluatedList = attempt.questions.map((q) => {
    const e = evaluations[q.id];
    return {
      concept: q.concept,
      maxMarks: q.maxMarks,
      score: e?.score ?? 0,
      accuracy: e?.conceptualAccuracy ?? 0,
      correctPoints: e?.correctPoints ?? [],
      missingPoints: e?.missingPoints ?? [],
      factualMistakes: e?.factualMistakes ?? [],
    };
  });

  const prompt = `You are RDS AI. Synthesize an overall educational review for a ${attempt.classLevel} student's written test on "${attempt.topicTitle}" in ${attempt.subjectName}.

Test Metrics:
- Total Score: ${result.totalScore}/${result.maxScore} (${result.percentage}%)
- Conceptual Accuracy: ${result.conceptualAccuracy}%
- Answered: ${result.questionsAnswered}/${result.totalQuestions}

Question Breakdown:
${JSON.stringify(evaluatedList, null, 2)}

Provide encouraging, structured, actionable advice strictly derived from the evaluated data above.

Return ONLY valid JSON in this exact structure:
{
  "overallFeedback": "2-3 encouraging sentences summarizing the student's conceptual grasp.",
  "strongAreas": ["Concept or skill student demonstrated well", "Another strong area"],
  "areasToImprove": ["Specific concept or missing point to revise", "Another area"],
  "commonMistakes": ["Pattern of mistake noticed, e.g. omitting units or leaving out definitions"],
  "recommendedLearningActions": [
    {
      "label": "Review with RDS AI",
      "action": "review_with_ai",
      "description": "Discuss your missed points directly with your AI tutor.",
      "targetConcept": "${attempt.topicTitle}"
    },
    {
      "label": "Study Step-by-Step Lesson",
      "action": "learn_topic",
      "description": "Read structured explanations on key concepts in this topic.",
      "targetConcept": "${attempt.topicTitle}"
    }
  ]
}`;

  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'same-origin',
      body: JSON.stringify({
        systemInstruction: 'You are RDS AI, an encouraging and pedagogical tutor for Telangana State Board students. Output strict JSON.',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        responseType: 'json',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const rawText = data.text || '';
      let parsed: any = null;

      let cleaned = rawText.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const first = rawText.indexOf('{');
        const last = rawText.lastIndexOf('}');
        if (first !== -1 && last !== -1) {
          parsed = JSON.parse(rawText.substring(first, last + 1));
        }
      }

      if (parsed && typeof parsed.overallFeedback === 'string') {
        return {
          overallFeedback: parsed.overallFeedback,
          strongAreas: Array.isArray(parsed.strongAreas) ? parsed.strongAreas : ['Active participation and effort in written problem-solving.'],
          areasToImprove: Array.isArray(parsed.areasToImprove) ? parsed.areasToImprove : ['Incorporate all key formula conditions and definitions.'],
          commonMistakes: Array.isArray(parsed.commonMistakes) ? parsed.commonMistakes : [],
          recommendedLearningActions: Array.isArray(parsed.recommendedLearningActions) && parsed.recommendedLearningActions.length > 0
            ? parsed.recommendedLearningActions
            : [
                {
                  label: 'Discuss Mistakes with RDS AI',
                  action: 'review_with_ai',
                  description: 'Ask RDS AI to explain the exact points you missed.',
                  targetConcept: attempt.topicTitle,
                },
                {
                  label: 'Learn with AI Lesson',
                  action: 'learn_topic',
                  description: 'Walk through formulas and step-by-step solutions.',
                  targetConcept: attempt.topicTitle,
                },
              ],
        };
      }
    }
  } catch (err) {
    console.warn('Overall feedback generation encountered error, using fallback summary:', err);
  }

  // Fallback overall feedback
  return {
    overallFeedback: `You scored ${result.totalScore} out of ${result.maxScore} (${result.percentage}%) on ${attempt.topicTitle}. Practicing with the model answers will help turn your good ideas into top-scoring board examination responses!`,
    strongAreas: [
      `Attempted questions on ${attempt.topicTitle} with good initiative.`,
      'Demonstrated understanding of core chapter definitions.',
    ],
    areasToImprove: [
      'Incorporate all prerequisite conditions and standard textbook terms.',
      'Check model answers to structure multi-mark answers systematically.',
    ],
    commonMistakes: [
      'Omitting intermediate steps or standard units in short-answer explanations.',
    ],
    recommendedLearningActions: [
      {
        label: 'Discuss Mistakes with RDS AI',
        action: 'review_with_ai',
        description: 'Ask RDS AI to explain the exact points you missed.',
        targetConcept: attempt.topicTitle,
      },
      {
        label: 'Learn with AI',
        action: 'learn_topic',
        description: 'Review step-by-step explanations and formulas.',
        targetConcept: attempt.topicTitle,
      },
    ],
  };
}
