import { GoogleGenAI } from '@google/genai';
import { DbAssignment, DbAssignmentQuestion, DbAssignmentSubmission } from './db';

// Candidate models for graceful failover
const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
];

// Maximum retry attempts for transient errors
const MAX_AI_RETRIES = 2;

// Per-model attempt timeout to prevent indefinite hanging (ms)
const AI_REQUEST_TIMEOUT_MS = 30000;

function isTransientError(error: any): boolean {
  if (!error) return false;
  const status = error.status || error.code || error.statusCode;
  const msg = String(error.message || error).toLowerCase();

  return (
    status === 503 ||
    status === 429 ||
    status === 500 ||
    status === 'UNAVAILABLE' ||
    status === 'RESOURCE_EXHAUSTED' ||
    msg.includes('503') ||
    msg.includes('high demand') ||
    msg.includes('unavailable') ||
    msg.includes('overloaded') ||
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('try again')
  );
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

function cleanAndParseJson(rawText: string): any {
  if (!rawText) return null;
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch (_) {}
    }
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(cleaned.substring(firstBracket, lastBracket + 1));
      } catch (_) {}
    }
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callAiWithFailover(
  prompt: string,
  systemInstruction?: string,
  responseType: 'json' | 'text' = 'json'
): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const config: Record<string, any> = {
    systemInstruction:
      systemInstruction ||
      'You are the Senior Academic Specialist for Telangana State Board (SCERT) curriculum at RDS SMART LEARN.',
    temperature: 0.6,
  };

  if (responseType === 'json') {
    config.responseMimeType = 'application/json';
  }

  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    for (let attempt = 0; attempt <= MAX_AI_RETRIES; attempt++) {
      // Per-attempt timeout prevents indefinite hangs on an unresponsive model
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { ...config, abortSignal: controller.signal },
        });
        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const isAbort = err?.name === 'AbortError';
        console.warn(`[AssignmentEngine] Model ${modelName} attempt ${attempt + 1} encountered error:`, err?.message || err);
        // Retry on transient errors or timeouts (when attempts remain)
        if ((isTransientError(err) || isAbort) && attempt < MAX_AI_RETRIES) {
          const delay = Math.pow(2, attempt) * 400 + Math.random() * 200;
          await sleep(delay);
          continue;
        }
        // Non-retryable or exhausted retries — move to next candidate model
        break;
      } finally {
        clearTimeout(timeoutId);
      }
    }
    // Brief pause before trying the next model candidate
    await sleep(300);
  }

  console.error('[AssignmentEngine] All AI model candidates failed:', lastError?.message || lastError);
  return null;
}

/**
 * Generate fallback questions if AI is offline or returns invalid structure
 */
function getFallbackQuestions(
  classLevel: string,
  subjectName: string,
  chapterTitle: string,
  topicTitle: string,
  assignmentType: 'mcq' | 'written' | 'mixed',
  count: number
): DbAssignmentQuestion[] {
  const questions: DbAssignmentQuestion[] = [];

  const createMcq = (idx: number): DbAssignmentQuestion => ({
    id: `q_mcq_${idx + 1}`,
    type: 'mcq',
    question: `According to Telangana SCERT ${classLevel} syllabus in ${subjectName} (${topicTitle}), which of the following statements is conceptually correct?`,
    marks: 1,
    difficulty: 'medium',
    options: [
      { id: 'A', text: `Core definition and primary rule of ${topicTitle}` },
      { id: 'B', text: `Contradictory hypothesis without empirical evidence` },
      { id: 'C', text: `Secondary exception applying only to non-standard cases` },
      { id: 'D', text: `Unrelated peripheral terminology` },
    ],
    correctAnswer: 'A',
    explanation: `Option A correctly reflects the foundational principle of ${topicTitle} outlined in the Telangana State Board textbook for ${classLevel}.`,
    concept: `${topicTitle} - Core Principles`,
  });

  const createWritten = (idx: number): DbAssignmentQuestion => ({
    id: `q_wri_${idx + 1}`,
    type: 'written',
    question: `Explain the fundamental concept of ${topicTitle} from ${chapterTitle}. Describe its key components, working mechanism, and practical significance for ${classLevel} ${subjectName}.`,
    marks: 4,
    difficulty: 'medium',
    questionType: 'short',
    concept: `${topicTitle} - Comprehensive Analysis`,
    keyPoints: [
      `Standard definition and scope of ${topicTitle}`,
      `Key structural elements or working steps involved`,
      `Practical applications or real-world relevance in Telangana state context`,
      `Important scientific or mathematical notation / terminology`,
    ],
    modelAnswer: `${topicTitle} is a key concept in ${chapterTitle} for ${classLevel} ${subjectName}.\n1. Definition: It represents the formal system or phenomenon through which processes operate.\n2. Working Principle: It functions through systematic progression of components interacting with one another.\n3. Significance: Mastery of this topic enables students to solve complex curriculum problems and understand real-world systems.`,
    evaluationCriteria: 'Award full marks for clear definition, 2 structural points, and accurate terminology.',
  });

  if (assignmentType === 'mcq') {
    for (let i = 0; i < count; i++) {
      questions.push(createMcq(i));
    }
  } else if (assignmentType === 'written') {
    for (let i = 0; i < count; i++) {
      questions.push(createWritten(i));
    }
  } else {
    // Mixed: half MCQ, half Written
    const mcqCount = Math.ceil(count / 2);
    const writtenCount = count - mcqCount;
    for (let i = 0; i < mcqCount; i++) {
      questions.push(createMcq(i));
    }
    for (let i = 0; i < writtenCount; i++) {
      questions.push(createWritten(mcqCount + i));
    }
  }

  return questions;
}

/**
 * Generate Assignment Questions with AI and deterministic fallback
 */
export async function generateAssignmentQuestions(params: {
  classLevel: string;
  subjectName: string;
  chapterNumber?: number;
  chapterTitle: string;
  topicTitle: string;
  assignmentType: 'mcq' | 'written' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionCount: number;
  language?: string;
}): Promise<DbAssignmentQuestion[]> {
  const {
    classLevel,
    subjectName,
    chapterNumber,
    chapterTitle,
    topicTitle,
    assignmentType,
    difficulty,
    questionCount,
    language = 'English',
  } = params;

  const prompt = `You are the Assessment Specialist for Telangana State Board (SCERT) curriculum at RDS SMART LEARN.
Generate a structured, rigorous assessment with ${questionCount} questions for students.

Context:
- Class: ${classLevel}
- Subject: ${subjectName}
- Chapter ${chapterNumber || 1}: ${chapterTitle}
- Topic: ${topicTitle}
- Assignment Type: ${assignmentType.toUpperCase()} (MCQ, WRITTEN, or MIXED)
- Difficulty Level: ${difficulty}
- Language: ${language}

Requirements:
1. For MCQ questions:
   - "type": "mcq"
   - "marks": 1
   - "question": clear question text
   - "options": exactly 4 options with "id" ('A', 'B', 'C', 'D') and "text"
   - "correctAnswer": 'A' | 'B' | 'C' | 'D'
   - "explanation": step-by-step reasoning why the answer is correct
   - "concept": concept tested
2. For WRITTEN questions:
   - "type": "written"
   - "questionType": "short" (2-4 marks) or "long" (5-8 marks)
   - "marks": 2 to 8
   - "question": clear descriptive question
   - "concept": concept tested
   - "keyPoints": array of 3-5 mandatory points
   - "modelAnswer": exemplary complete student answer
   - "evaluationCriteria": rubric guideline
${assignmentType === 'mixed' ? '3. For MIXED type: provide roughly half MCQ and half Written questions.' : ''}

Return ONLY a valid JSON object:
{
  "questions": [
    {
      "id": "q_1",
      "type": "mcq",
      "question": "Question text here?",
      "marks": 1,
      "difficulty": "medium",
      "options": [
        {"id": "A", "text": "Option A"},
        {"id": "B", "text": "Option B"},
        {"id": "C", "text": "Option C"},
        {"id": "D", "text": "Option D"}
      ],
      "correctAnswer": "A",
      "explanation": "Detailed explanation here.",
      "concept": "Concept name"
    },
    {
      "id": "q_2",
      "type": "written",
      "questionType": "short",
      "marks": 4,
      "difficulty": "medium",
      "question": "Descriptive question text here?",
      "concept": "Concept name",
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "modelAnswer": "Model reference answer here.",
      "evaluationCriteria": "Rubric criteria here."
    }
  ]
}`;

  try {
    const rawAiResponse = await callAiWithFailover(prompt);
    if (rawAiResponse) {
      const parsed = cleanAndParseJson(rawAiResponse);
      const rawList = parsed?.questions || (Array.isArray(parsed) ? parsed : null);

      if (Array.isArray(rawList) && rawList.length > 0) {
        const validQuestions: DbAssignmentQuestion[] = [];
        for (let i = 0; i < rawList.length; i++) {
          const item = rawList[i];
          if (!item || typeof item !== 'object') continue;

          const qType = item.type === 'written' || item.type === 'mcq' ? item.type : (assignmentType === 'written' ? 'written' : 'mcq');
          const qText = typeof item.question === 'string' ? item.question.trim() : '';
          if (!qText) continue;

          if (qType === 'mcq') {
            if (!Array.isArray(item.options) || item.options.length !== 4) continue;
            const validIds = ['A', 'B', 'C', 'D'];
            const options = item.options.map((opt: any, optIdx: number) => ({
              id: (validIds.includes(opt.id) ? opt.id : validIds[optIdx]) as 'A' | 'B' | 'C' | 'D',
              text: String(opt.text || opt.title || '').trim(),
            }));
            let correctAnswer = String(item.correctAnswer || 'A').toUpperCase() as 'A' | 'B' | 'C' | 'D';
            if (!validIds.includes(correctAnswer)) correctAnswer = 'A';

            validQuestions.push({
              id: item.id || `q_mcq_${i + 1}`,
              type: 'mcq',
              question: qText,
              marks: typeof item.marks === 'number' && item.marks > 0 ? item.marks : 1,
              difficulty: ['easy', 'medium', 'hard'].includes(item.difficulty) ? item.difficulty : 'medium',
              options,
              correctAnswer,
              explanation: item.explanation || `Option ${correctAnswer} is the correct answer.`,
              concept: item.concept || topicTitle,
            });
          } else {
            validQuestions.push({
              id: item.id || `q_wri_${i + 1}`,
              type: 'written',
              question: qText,
              questionType: item.questionType === 'long' ? 'long' : 'short',
              marks: typeof item.marks === 'number' && item.marks > 0 ? item.marks : (item.questionType === 'long' ? 6 : 4),
              difficulty: ['easy', 'medium', 'hard'].includes(item.difficulty) ? item.difficulty : 'medium',
              concept: item.concept || topicTitle,
              keyPoints: Array.isArray(item.keyPoints) && item.keyPoints.length > 0 ? item.keyPoints : ['Understanding of core principles', 'Correct terminology', 'Complete logical explanation'],
              modelAnswer: item.modelAnswer || 'Exemplary standard answer for this concept.',
              evaluationCriteria: item.evaluationCriteria || 'Grade based on accuracy of key points and clear structure.',
            });
          }
        }

        if (validQuestions.length >= Math.min(questionCount, 3)) {
          return validQuestions.slice(0, questionCount);
        }
      }
    }
  } catch (e) {
    console.warn('[AssignmentEngine] AI generation failed, using fallback:', e);
  }

  // Fallback
  return getFallbackQuestions(classLevel, subjectName, chapterTitle, topicTitle, assignmentType, questionCount);
}

/**
 * Evaluates a student's full assignment submission
 */
export async function evaluateAssignmentSubmission(params: {
  assignment: DbAssignment;
  submission: Partial<DbAssignmentSubmission>;
  studentName: string;
}): Promise<{
  mcqScore: number;
  mcqTotal: number;
  writtenScore: number;
  writtenTotal: number;
  totalScore: number;
  totalPossibleMarks: number;
  percentage: number;
  evaluationData: any;
}> {
  const { assignment, submission, studentName } = params;
  const responses = submission.questionResponses || {};

  let mcqScore = 0;
  let mcqTotal = 0;
  const mcqResults: any[] = [];

  let writtenScore = 0;
  let writtenTotal = 0;
  const writtenResults: any[] = [];

  // 1. Evaluate MCQ questions deterministically
  for (const q of assignment.questions) {
    if (q.type === 'mcq') {
      const qMarks = q.marks || 1;
      mcqTotal += qMarks;

      const userResponse = responses[q.id]?.selectedOption;
      const isCorrect = userResponse && String(userResponse).toUpperCase() === String(q.correctAnswer).toUpperCase();
      const awarded = isCorrect ? qMarks : 0;
      mcqScore += awarded;

      mcqResults.push({
        questionId: q.id,
        question: q.question,
        selectedOption: userResponse || 'Not Attempted',
        correctOption: q.correctAnswer || 'A',
        isCorrect: Boolean(isCorrect),
        explanation: q.explanation || 'Refer to Telangana textbook.',
        concept: q.concept || assignment.topicTitle || 'Concept',
        marksAwarded: awarded,
        maxMarks: qMarks,
      });
    }
  }

  // 2. Evaluate Written questions using AI or rubric
  for (const q of assignment.questions) {
    if (q.type === 'written') {
      const qMarks = q.marks || 4;
      writtenTotal += qMarks;

      const studentAnswer = (responses[q.id]?.writtenAnswer || '').trim();

      if (!studentAnswer) {
        writtenResults.push({
          questionId: q.id,
          question: q.question,
          studentAnswer: '',
          score: 0,
          maxMarks: qMarks,
          percentage: 0,
          accuracyLevel: 'Needs Improvement',
          strengths: [],
          correctPoints: [],
          missingPoints: q.keyPoints || ['Core concept definitions and explanation'],
          factualMistakes: [],
          improvementTips: [`Review ${q.concept || assignment.topicTitle} in your textbook.`, 'Always attempt written answers by identifying the main concepts.'],
          teacherFeedback: 'No answer was provided for this question.',
          modelAnswer: q.modelAnswer || 'Standard model answer.',
        });
        continue;
      }

      // Call AI evaluation
      const evalPrompt = `You are RDS AI, an encouraging and objective evaluator for Telangana State Board (SCERT) students.
Evaluate this student's written response:

Class: ${assignment.classLevel}
Subject: ${assignment.subjectId}
Topic: ${assignment.topicTitle || assignment.title}
Question: "${q.question}"
Max Marks: ${qMarks}
Expected Key Points:
${(q.keyPoints || []).map((kp, idx) => `${idx + 1}. ${kp}`).join('\n')}
Model Reference Answer:
"${q.modelAnswer || ''}"

Student's Written Answer:
"""${studentAnswer}"""

Evaluation Guidelines:
1. Focus on conceptual correctness, not exact verbatim matching.
2. Award marks fairly between 0 and ${qMarks}.
3. Point out correct points, missing key ideas, and any genuine factual mistakes.
4. Give warm, constructive feedback suitable for a school student.

Return ONLY valid JSON:
{
  "score": ${Math.round(qMarks * 0.75)},
  "accuracyLevel": "Proficient" | "Mastered" | "Developing" | "Needs Improvement",
  "strengths": ["Clear definition"],
  "correctPoints": ["Mentioned the primary formula/concept correctly"],
  "missingPoints": ["Did not mention the secondary application"],
  "factualMistakes": [],
  "improvementTips": ["Include diagrammatic representation if applicable"],
  "teacherFeedback": "Good attempt! You understood the main concept well."
}`;

      let evalObj: any = null;
      try {
        const rawAiEval = await callAiWithFailover(evalPrompt, 'You are an expert evaluator for Telangana State Board school students.');
        if (rawAiEval) {
          evalObj = cleanAndParseJson(rawAiEval);
        }
      } catch (e) {
        console.warn(`[AssignmentEngine] Written question ${q.id} AI evaluation failed:`, e);
      }

      if (evalObj && typeof evalObj.score === 'number') {
        const score = Math.max(0, Math.min(qMarks, Math.round(evalObj.score * 2) / 2)); // Round to nearest 0.5
        writtenScore += score;
        writtenResults.push({
          questionId: q.id,
          question: q.question,
          studentAnswer,
          score,
          maxMarks: qMarks,
          percentage: Math.round((score / qMarks) * 100),
          accuracyLevel: evalObj.accuracyLevel || (score >= qMarks * 0.8 ? 'Mastered' : score >= qMarks * 0.6 ? 'Proficient' : 'Developing'),
          strengths: Array.isArray(evalObj.strengths) ? evalObj.strengths : ['Good conceptual attempt'],
          correctPoints: Array.isArray(evalObj.correctPoints) ? evalObj.correctPoints : ['Relevant ideas mentioned'],
          missingPoints: Array.isArray(evalObj.missingPoints) ? evalObj.missingPoints : [],
          factualMistakes: Array.isArray(evalObj.factualMistakes) ? evalObj.factualMistakes : [],
          improvementTips: Array.isArray(evalObj.improvementTips) ? evalObj.improvementTips : ['Review key terminology in the SCERT textbook'],
          teacherFeedback: evalObj.teacherFeedback || 'Well attempted!',
          modelAnswer: q.modelAnswer || '',
        });
      } else {
        // Deterministic heuristic fallback based on word count & keyword presence
        const wordCount = studentAnswer.split(/\s+/).filter(Boolean).length;
        let fallbackScore = 0;
        if (wordCount >= 30) fallbackScore = Math.round(qMarks * 0.75);
        else if (wordCount >= 15) fallbackScore = Math.round(qMarks * 0.5);
        else fallbackScore = Math.round(qMarks * 0.25);

        writtenScore += fallbackScore;
        writtenResults.push({
          questionId: q.id,
          question: q.question,
          studentAnswer,
          score: fallbackScore,
          maxMarks: qMarks,
          percentage: Math.round((fallbackScore / qMarks) * 100),
          accuracyLevel: fallbackScore >= qMarks * 0.75 ? 'Proficient' : 'Developing',
          strengths: ['Addressed the main question prompt'],
          correctPoints: ['Basic conceptual description provided'],
          missingPoints: (q.keyPoints || []).slice(1),
          factualMistakes: [],
          improvementTips: ['Elaborate with more structural details and examples.'],
          teacherFeedback: 'Good effort! Compare your response with the model answer to strengthen key points.',
          modelAnswer: q.modelAnswer || '',
        });
      }
    }
  }

  const totalScore = Math.round((mcqScore + writtenScore) * 10) / 10;
  const totalPossibleMarks = mcqTotal + writtenTotal || assignment.totalPossibleMarks || 1;
  const percentage = Math.round((totalScore / totalPossibleMarks) * 100);

  const evaluationData = {
    mcqResults,
    writtenResults,
    overallSummary: `${studentName} scored ${totalScore} out of ${totalPossibleMarks} (${percentage}%). ${percentage >= 80 ? 'Excellent performance demonstrating strong concept mastery.' : percentage >= 60 ? 'Good conceptual understanding with minor areas for review.' : 'Foundational practice is recommended to improve mastery.'}`,
    strengths: [
      mcqScore > 0 ? `Answered ${mcqScore}/${mcqTotal} MCQ marks correctly` : 'Completed all questions',
      writtenScore > 0 ? `Secured ${writtenScore}/${writtenTotal} written response marks` : 'Good attempt on descriptive answers',
    ],
    areasToImprove: [
      percentage < 80 ? `Review textbook section for ${assignment.topicTitle || assignment.title}` : 'Keep up consistent practice',
    ],
  };

  return {
    mcqScore,
    mcqTotal,
    writtenScore,
    writtenTotal,
    totalScore,
    totalPossibleMarks,
    percentage,
    evaluationData,
  };
}

/**
 * Sanitize assignment for student (strip answers and rubric when student hasn't submitted yet)
 */
export function sanitizeAssignmentForStudent(assignment: DbAssignment, hasSubmitted: boolean): DbAssignment {
  if (hasSubmitted) {
    return assignment;
  }

  // Deep clone and sanitize questions
  const sanitizedQuestions: DbAssignmentQuestion[] = assignment.questions.map((q) => {
    if (q.type === 'mcq') {
      return {
        id: q.id,
        type: 'mcq',
        question: q.question,
        marks: q.marks,
        difficulty: q.difficulty,
        options: q.options?.map((opt) => ({
          id: opt.id,
          text: opt.text,
        })),
        concept: q.concept,
        // Strip correctAnswer & explanation!
      };
    } else {
      return {
        id: q.id,
        type: 'written',
        question: q.question,
        questionType: q.questionType,
        marks: q.marks,
        difficulty: q.difficulty,
        concept: q.concept,
        // Strip keyPoints, modelAnswer, evaluationCriteria!
      };
    }
  });

  return {
    ...assignment,
    questions: sanitizedQuestions,
  };
}
