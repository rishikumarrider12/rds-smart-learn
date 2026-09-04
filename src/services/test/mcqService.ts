import { 
  TestDifficulty, 
  TestQuestion, 
  TestQuestionOption, 
  OptionId, 
  TestAnswerMap, 
  TestResult, 
  AiTestFeedbackData, 
  QuestionEvaluationReview 
} from '../../types/test';
import { Subject, Chapter, Topic, ClassLevel } from '../../types';
import { LearningLanguage } from '../ai/aiTypes';
import { buildMcqGenerationPrompt, buildMistakeAnalysisPrompt } from '../ai/aiPrompts';
import { validateGeneratedLanguage } from '../ai/languageValidation';
import { LocalizedFallbackQuestion } from '../ai/localizedFallback';
import { getAuthHeaders } from '../auth/authService';

export interface GenerateMcqParams {
  studentName: string;
  classLevel: ClassLevel;
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  difficulty: TestDifficulty;
  questionCount: number;
  language: LearningLanguage;
}

/**
 * Validates generated raw questions from AI response
 */
function validateQuestions(rawQuestions: any[], expectedCount: number): TestQuestion[] | null {
  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    return null;
  }

  const validQuestions: TestQuestion[] = [];
  const seenQuestionTexts = new Set<string>();

  for (let i = 0; i < rawQuestions.length; i++) {
    const raw = rawQuestions[i];
    if (!raw || typeof raw !== 'object') continue;

    const questionText = typeof raw.question === 'string' ? raw.question.trim() : '';
    if (!questionText || seenQuestionTexts.has(questionText.toLowerCase())) {
      continue;
    }
    seenQuestionTexts.add(questionText.toLowerCase());

    // Validate options
    if (!Array.isArray(raw.options) || raw.options.length !== 4) {
      continue;
    }

    const options: TestQuestionOption[] = [];
    const validIds: OptionId[] = ['A', 'B', 'C', 'D'];
    let allOptionsValid = true;

    for (let optIdx = 0; optIdx < 4; optIdx++) {
      const opt = raw.options[optIdx];
      const optId = (opt?.id || validIds[optIdx]) as OptionId;
      const optText = typeof opt?.text === 'string' ? opt.text.trim() : '';

      if (!validIds.includes(optId) || !optText) {
        allOptionsValid = false;
        break;
      }
      options.push({
        id: validIds[optIdx], // Normalize to A, B, C, D in order
        text: optText,
      });
    }

    if (!allOptionsValid || options.length !== 4) {
      continue;
    }

    // Validate correctAnswer
    let correctAnswer = (typeof raw.correctAnswer === 'string' ? raw.correctAnswer.trim().toUpperCase() : '') as OptionId;
    if (!validIds.includes(correctAnswer)) {
      // If AI wrote full option text instead of letter, check matching text
      const matchedByText = options.find((o) => o.text.toLowerCase() === String(raw.correctAnswer).toLowerCase());
      if (matchedByText) {
        correctAnswer = matchedByText.id;
      } else {
        continue;
      }
    }

    const explanation = typeof raw.explanation === 'string' && raw.explanation.trim()
      ? raw.explanation.trim()
      : 'Option ' + correctAnswer + ' is the correct answer based on Telangana Board syllabus principles.';
    
    const concept = typeof raw.concept === 'string' && raw.concept.trim()
      ? raw.concept.trim()
      : 'Key Concept';

    validQuestions.push({
      id: raw.id ? String(raw.id) : `q_${i + 1}`,
      question: questionText,
      options,
      correctAnswer,
      explanation,
      concept,
    });
  }

  // Check if we have sufficient questions (allow slightly more if sliced, or at least 80% if edge case)
  if (validQuestions.length >= Math.min(expectedCount, 5)) {
    return validQuestions.slice(0, expectedCount);
  }

  return null;
}

/**
 * Parses JSON safely even if wrapped in markdown code fence
 */
function cleanAndParseJson(rawText: string): any {
  if (!rawText) return null;
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }
  return JSON.parse(cleaned);
}

/**
 * Fallback questions generator strictly mapped to Telangana syllabus topics
 * Ensures students can continue learning even during temporary API provider spikes
 */
function generateFallbackTopicQuestions(params: GenerateMcqParams): TestQuestion[] {
  const { topic, chapter, subject, difficulty, questionCount, language } = params;
  const tTitle = topic.title;
  const cTitle = chapter.title;
  const sName = subject.name;

  let templates: Array<{ q: string; opts: [string, string, string, string]; correct: OptionId; exp: string; concept: string }> = [
    {
      q: `What is the core principle or definition underlying ${tTitle} in ${cTitle}?`,
      opts: [
        `It establishes the foundational rules and laws governing ${tTitle}.`,
        `It only applies in laboratory experiments and not practical problems.`,
        `It is an outdated concept not included in current Telangana SCERT textbooks.`,
        `It is unrelated to the principles discussed in ${cTitle}.`
      ],
      correct: 'A',
      exp: `In the Telangana State Board curriculum for ${sName}, ${tTitle} is essential for understanding the fundamental principles of ${cTitle}.`,
      concept: `${tTitle} - Core Concept`,
    },
    {
      q: `Which of the following statements is mathematically or conceptually accurate regarding ${tTitle}?`,
      opts: [
        `Variables and conditions must satisfy the governing equations and definitions of ${tTitle}.`,
        `The parameters can be chosen arbitrarily without following theoretical laws.`,
        `There are no formulas or criteria required to verify results in ${tTitle}.`,
        `Results in ${tTitle} always contradict standard textbook theorems.`
      ],
      correct: 'A',
      exp: `Standard textbook definitions require adherence to the specific conditions and theorems defined under ${tTitle}.`,
      concept: `${tTitle} - Theoretical Criteria`,
    },
    {
      q: `When solving problems or analyzing phenomena related to ${tTitle}, what is the first recommended step?`,
      opts: [
        `Identify the given values, governing relations, and target unknowns carefully.`,
        `Guess the final answer without writing down steps or units.`,
        `Ignore the given constraints and use any unrelated formula.`,
        `Skip reading the problem statement entirely.`
      ],
      correct: 'A',
      exp: `A systematic approach in ${sName} involves listing known parameters, stating the applicable formula or rule for ${tTitle}, and calculating systematically.`,
      concept: `${tTitle} - Problem Solving Method`,
    },
    {
      q: `How is ${tTitle} typically applied in practical or real-world situations?`,
      opts: [
        `By using its governing principles to model, calculate, or interpret practical systems.`,
        `It has zero real-world utility and is solely theoretical.`,
        `By violating standard scientific and mathematical principles.`,
        `By substituting random values into arbitrary equations.`
      ],
      correct: 'A',
      exp: `${tTitle} connects theoretical concepts in ${cTitle} to real-life applications and state board examination problems.`,
      concept: `${tTitle} - Practical Application`,
    },
    {
      q: `Which common misconception should students avoid when studying ${tTitle}?`,
      opts: [
        `Assuming rules apply without checking the domain conditions or sign conventions.`,
        `Verifying units and step-by-step arithmetic carefully.`,
        `Drawing diagrams or writing down given data clearly.`,
        `Practicing textbook exercises and previous board exam questions.`
      ],
      correct: 'A',
      exp: `Students frequently lose marks by omitting domain conditions, sign conventions, or fundamental definitions in ${tTitle}.`,
      concept: `${tTitle} - Common Pitfalls & Accuracy`,
    },
    {
      q: `In the context of ${sName} Chapter ${chapter.chapterNumber} (${cTitle}), what is a key property of ${tTitle}?`,
      opts: [
        `It maintains consistent mathematical and scientific relationships under standard conditions.`,
        `Its properties change randomly every time it is evaluated.`,
        `It cannot be verified using standard experimental or algebraic methods.`,
        `It is completely isolated from all other topics in this chapter.`
      ],
      correct: 'A',
      exp: `Consistent relationships and verifiable properties are the bedrock of ${tTitle} in the SCERT syllabus.`,
      concept: `${tTitle} - Key Properties`,
    },
    {
      q: `What is the significance of mastering ${tTitle} for board exam preparation?`,
      opts: [
        `It carries regular weightage in both short-answer and analytical questions.`,
        `It is never asked in any state board or competitive exams.`,
        `It is only meant for optional reading and has no assessment value.`,
        `It replaces the need to study any other topic in ${cTitle}.`
      ],
      correct: 'A',
      exp: `${tTitle} is a core syllabus competency often tested in multiple choice, short answer, and application-based questions.`,
      concept: `${tTitle} - Exam Focus & Weightage`,
    },
    {
      q: `Which of the following best summarizes the relationship between ${tTitle} and ${cTitle}?`,
      opts: [
        `${tTitle} is a vital sub-topic that develops deeper mastery of ${cTitle}.`,
        `${tTitle} contradicts the main theme of ${cTitle}.`,
        `${tTitle} is an independent topic from another grade level.`,
        `${tTitle} is only applicable to non-academic hobbies.`
      ],
      correct: 'A',
      exp: `Each topic in Chapter ${chapter.chapterNumber} builds toward a complete conceptual mastery of ${cTitle}.`,
      concept: `${tTitle} - Conceptual Integration`,
    },
    {
      q: `When checking the validity of a solution related to ${tTitle}, which method is most reliable?`,
      opts: [
        `Substitute the obtained answer back into the original condition or equation.`,
        `Assume the answer is correct without verification.`,
        `Change the units randomly until it matches an option.`,
        `Erase the calculation and pick option D.`
      ],
      correct: 'A',
      exp: `Back-substitution and dimensional/conceptual sanity checks ensure high accuracy in ${sName}.`,
      concept: `${tTitle} - Solution Verification`,
    },
    {
      q: `What key skill is developed through practicing questions on ${tTitle}?`,
      opts: [
        `Critical thinking, conceptual clarity, and structured problem-solving.`,
        `Rote memorization without understanding core principles.`,
        `Avoiding all formulas and step-by-step reasoning.`,
        `Speed over accuracy without reviewing steps.`
      ],
      correct: 'A',
      exp: `The Telangana curriculum emphasizes analytical thinking and conceptual mastery in ${tTitle}.`,
      concept: `${tTitle} - Skill Development`,
    }
  ];

  // Language-aware fallback: when the subject language is Telugu or Hindi,
  // use scaffolded questions in the correct script so offline content still
  // matches the selected subject language (never English by default).
  if (language === 'Telugu' || language === 'Hindi') {
    const isTe = language === 'Telugu';
    templates = [];
    templates.push({
      q: isTe ? `${cTitle} పాఠ్యాంశంలో ${tTitle} గురించిన ప్రధాన భావన ఏమిటి?` : `${tTitle} के बारे में मुख्य अवधारणा क्या है ${cTitle} में?`,
      opts: isTe
        ? [`${tTitle} కు సంబంధించిన ప్రాథమిక నియమాలు, నిర్వచనాలు మరియు భావనలను ప్రతిబింబిస్తుంది.`, `ఇది ప్రయోగశాలకు మాత్రమే పరిమితం.`, `ఇది ప్రస్తుత పాఠ్యాంశానికి సంబంధం లేనిది.`, `ఇది ఇతర అంశాలకు విరుద్ధం.`]
        : [`${tTitle} के मूल नियमों और परिभाषाओं को दर्शाता है।`, `यह केवल प्रयोगशाला तक सीमित है।`, `इसका वर्तमान पाठ्यक्रम से कोई संबंध नहीं।`, `यह अन्य विषयों के विपरीत है।`],
      correct: 'A',
      exp: isTe ? `${tTitle} అనునది ${cTitle} పాఠ్యాంశంలోని ప్రాథమిక భావనలకు ఆధారం.` : `${tTitle} ${cTitle} में मूल अवधारणाओं का आधार है।`,
      concept: isTe ? `${tTitle} - ప్రధాన భావన` : `${tTitle} - मुख्य अवधारणा`,
    });
    templates.push({
      q: isTe ? `${tTitle} గురించి సరైన ప్రకటన ఏది?` : `${tTitle} के बारे में सही कथन कौन-सा है?`,
      opts: isTe
        ? [`ఇచ్చిన నిబంధనలు మరియు నిర్వచనాలకు అనుగుణంగా ఉంటుంది.`, `ఏ నియమం లేకుండా ఎంచుకోవచ్చు.`, `దీనిని నిర్ధారించలేము.`, `ఇది అన్ని భావనలకు విరుద్ధం.`]
        : [`यह दिए गए नियमों और परिभाषाओं के अनुरूप है।`, `इसे बिना नियम के चुना जा सकता है।`, `इसे प्रमाणित नहीं किया जा सकता।`, `यह सभी अवधारणाओं के विपरीत है।`],
      correct: 'A',
      exp: isTe ? `${tTitle} లోని నియమాలు మరియు నిర్వచనాలను పాటించాలి.` : `${tTitle} के नियमों और परिभाषाओं का पालन करना चाहिए।`,
      concept: isTe ? `${tTitle} - సిద్ధాంత ప్రమాణాలు` : `${tTitle} - सैद्धांतिक मानदंड`,
    });
    templates.push({
      q: isTe ? `${tTitle} సమస్యలను పరిష్కరించే మొదటి దశ ఏమిటి?` : `${tTitle} की समस्याओं को हल करने का पहला कदम क्या है?`,
      opts: isTe
        ? [`ఇచ్చిన విలువలు మరియు లక్ష్యాలను గుర్తించడం.`, `సోపానాలు లేకుండా ఊహించడం.`, `నిబంధనలను విస్మరించడం.`, `ప్రశ్న చదవకుండా సమాధానమివ్వడం.`]
        : [`दिए गए मानों और लक्ष्यों को पहचानना।`, `बिना चरणों के अनुमान लगाना।`, `शर्तों को अनदेखा करना।`, `प्रश्न बिना पढ़े उत्तर देना।`],
      correct: 'A',
      exp: isTe ? `${sName} లో మొదట విలువలను గుర్తించి ${tTitle} నియమాన్ని అన్వయించాలి.` : `${sName} में पहले मान पहचानकर ${tTitle} का नियम लागू करें।`,
      concept: isTe ? `${tTitle} - సమస్యా పరిష్కారం` : `${tTitle} - समस्या समाधान`,
    });
    templates.push({
      q: isTe ? `${tTitle} చదువుతున్నప్పుడు ఏ తప్పుడు అభిప్రాయం నుండి దూరంగా ఉండాలి?` : `${tTitle} पढ़ते समय किस भ्रांति से बचना चाहिए?`,
      opts: isTe
        ? [`నిబంధనలు, గుర్తు సంజ్ఞలు, నిర్వచనాలను విస్మరించడం.`, `నిబంధనలను పరిశీలించడం.`, `సరైన సూత్రాన్ని అన్వయించడం.`, `సమాధానాన్ని తిరిగి నిర్ధారించడం.`]
        : [`शर्तों, चिह्नों, परिभाषाओं को अनदेखा करना।`, `शर्तों की जाँच करना।`, `सही सूत्र लागू करना।`, `उत्तर को वापस जाँचना।`],
      correct: 'A',
      exp: isTe ? `${tTitle} లో నిబంధనలను, గుర్తులను విస్మరించరాదు.` : `${tTitle} में शर्तों और चिह्नों को अनदेखा नहीं करना चाहिए।`,
      concept: isTe ? `${tTitle} - సాధారణ దోషాలు` : `${tTitle} - सामान्य ग़लतियाँ`,
    });
  }

  const questions: TestQuestion[] = [];
  const count = Math.min(questionCount, templates.length);

  for (let i = 0; i < count; i++) {
    const tmpl = templates[i];
    const rotation = (i % 4);
    const originalOptions = tmpl.opts;
    const optionLetters: OptionId[] = ['A', 'B', 'C', 'D'];
    
    const rotatedTexts: string[] = [];
    let correctId: OptionId = 'A';

    for (let j = 0; j < 4; j++) {
      const sourceIndex = (j - rotation + 4) % 4;
      rotatedTexts.push(originalOptions[sourceIndex]);
      if (sourceIndex === 0) {
        correctId = optionLetters[j];
      }
    }

    questions.push({
      id: `topic_q_${i + 1}`,
      question: tmpl.q,
      options: [
        { id: 'A', text: rotatedTexts[0] },
        { id: 'B', text: rotatedTexts[1] },
        { id: 'C', text: rotatedTexts[2] },
        { id: 'D', text: rotatedTexts[3] },
      ],
      correctAnswer: correctId,
      explanation: tmpl.exp,
      concept: tmpl.concept,
    });
  }

  return questions;
}

/**
 * Generate AI-Powered MCQ questions with validation and safe retry logic
 */
export async function generateMcqQuestions(params: GenerateMcqParams): Promise<TestQuestion[]> {
  const prompt = buildMcqGenerationPrompt({
    classLevel: params.classLevel,
    subjectName: params.subject.name,
    chapterTitle: params.chapter.title,
    chapterNumber: params.chapter.chapterNumber,
    topicTitle: params.topic.title,
    difficulty: params.difficulty,
    questionCount: params.questionCount,
    language: params.language,
  });

  const systemInstruction = `You are the Examination & Assessment AI Specialist for RDS SMART LEARN.
You generate high quality, pedagogically accurate multiple choice questions strictly aligned with the Telangana State Board (SCERT) curriculum for ${params.classLevel}.
You must always output strict JSON format adhering to the requested schema.`;

  let lastError: Error | null = null;
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
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
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned error status ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.text || '';
      const parsedData = cleanAndParseJson(rawText);

      const rawQuestions = parsedData?.questions || (Array.isArray(parsedData) ? parsedData : null);

      if (rawQuestions) {
        const validated = validateQuestions(rawQuestions, params.questionCount);
        if (validated && validated.length >= Math.min(params.questionCount, 4)) {
          // Language guard: for Telugu/Hindi requests, reject a response that
          // came back in the wrong script so the retry (or localized fallback)
          // produces correctly-languaged content.
          const languageOk = validateGeneratedLanguage(
            validated.map((q) => [q.question, ...q.options.map((o) => o.text), q.explanation].join('\n')),
            params.language
          );
          if (languageOk) {
            return validated;
          }
          throw new Error(`AI returned content in the wrong language (expected ${params.language}). Retrying...`);
        }
      }

      throw new Error('AI generated incomplete or malformed question set. Retrying...');
    } catch (err: any) {
      console.warn(`MCQ Generation attempt ${attempt} failed:`, err);
      lastError = err;
    }
  }

  // Gracefully fallback to curriculum-aligned standard question set if remote AI is temporarily busy
  console.info('Using syllabus-aligned practice question template for topic:', params.topic.title);
  const fallbackQuestions = generateFallbackTopicQuestions(params);
  if (fallbackQuestions && fallbackQuestions.length > 0) {
    return fallbackQuestions;
  }

  throw lastError || new Error('Failed to generate MCQ test questions after multiple attempts. Please try again.');
}

/**
 * Calculates deterministic test score and statistics
 * NOTE: AI is never used to determine whether answers are correct.
 */
export function calculateDeterministicResult(
  questions: TestQuestion[],
  answers: TestAnswerMap
): TestResult {
  const totalQuestions = questions.length;
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  for (const q of questions) {
    const studentAns = answers[q.id];
    if (!studentAns) {
      unanswered++;
    } else if (studentAns === q.correctAnswer) {
      correct++;
    } else {
      incorrect++;
    }
  }

  const score = correct;
  const percentage = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

  let performanceMessage = '';
  if (percentage >= 90) {
    performanceMessage = 'Excellent work! You have a strong understanding of this topic.';
  } else if (percentage >= 70) {
    performanceMessage = "Great job! You understand most of the topic. Let's review a few areas.";
  } else if (percentage >= 50) {
    performanceMessage = 'Good effort! You have understood some important concepts, but revision will help.';
  } else {
    performanceMessage = "Keep going! Let's review this topic together and improve step by step.";
  }

  return {
    totalQuestions,
    correct,
    incorrect,
    unanswered,
    score,
    percentage,
    performanceMessage,
  };
}

/**
 * Generate detailed question evaluation review items for the results screen
 */
export function buildQuestionEvaluationReviews(
  questions: TestQuestion[],
  answers: TestAnswerMap
): QuestionEvaluationReview[] {
  return questions.map((q, index) => {
    const studentAnswer = answers[q.id];
    const isUnanswered = !studentAnswer;
    const isCorrect = studentAnswer === q.correctAnswer;

    return {
      questionNumber: index + 1,
      questionId: q.id,
      questionText: q.question,
      options: q.options,
      studentAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      isUnanswered,
      explanation: q.explanation,
      concept: q.concept,
    };
  });
}

/**
 * Optional AI Mistake Analysis: Calls Gemini to generate educational feedback on student mistakes
 */
export async function generateAiMistakeAnalysis(params: {
  studentName: string;
  classLevel: ClassLevel;
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  language: LearningLanguage;
  questions: TestQuestion[];
  answers: TestAnswerMap;
  result: TestResult;
}): Promise<AiTestFeedbackData> {
  const reviews = buildQuestionEvaluationReviews(params.questions, params.answers);
  const mistakes = reviews
    .filter((r) => !r.isCorrect)
    .map((r) => ({
      questionNumber: r.questionNumber,
      questionText: r.questionText,
      studentAnswer: r.studentAnswer,
      correctAnswer: r.correctAnswer,
      explanation: r.explanation,
      concept: r.concept,
    }));

  const prompt = buildMistakeAnalysisPrompt({
    studentName: params.studentName,
    classLevel: params.classLevel,
    subjectName: params.subject.name,
    chapterTitle: params.chapter.title,
    topicTitle: params.topic.title,
    language: params.language,
    totalQuestions: params.result.totalQuestions,
    score: params.result.score,
    percentage: params.result.percentage,
    mistakes,
  });

  const systemInstruction = `You are RDS AI, a supportive teacher providing constructive educational feedback to a student on their practice test.`;

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
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    const parsed = cleanAndParseJson(data.text || '');

    if (parsed && typeof parsed === 'object') {
      return {
        overallFeedback: parsed.overallFeedback || params.result.performanceMessage,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Solid effort across foundational questions.'],
        areasToImprove: Array.isArray(parsed.areasToImprove) ? parsed.areasToImprove : ['Review tricky steps in problem solving.'],
        mistakePatterns: Array.isArray(parsed.mistakePatterns) ? parsed.mistakePatterns : ['Double-check question details before picking an answer.'],
        recommendedActions: Array.isArray(parsed.recommendedActions) && parsed.recommendedActions.length > 0
          ? parsed.recommendedActions
          : [
              {
                label: 'Review Mistakes with RDS AI',
                action: 'review_with_ai',
                description: 'Chat with RDS AI to walk through incorrect questions.',
              },
              {
                label: 'Learn Weak Topics',
                action: 'learn_topic',
                description: 'Read step-by-step lessons on this topic.',
              },
            ],
      };
    }
  } catch (err) {
    console.warn('AI Mistake Analysis error, falling back to local heuristic feedback:', err);
  }

  // Fallback heuristic educational feedback
  return {
    overallFeedback: params.result.performanceMessage,
    strengths: [
      `Completed the ${params.topic.title} practice test with dedication.`,
      `Attempted ${params.result.totalQuestions - params.result.unanswered} out of ${params.result.totalQuestions} questions.`,
    ],
    areasToImprove: mistakes.map((m) => `Question ${m.questionNumber}: ${m.concept}`),
    mistakePatterns: [
      'Take an extra moment to re-read options carefully when formulas are involved.',
    ],
    recommendedActions: [
      {
        label: 'Review Mistakes with RDS AI',
        action: 'review_with_ai',
        description: 'Ask RDS AI to clarify the concepts you found challenging.',
      },
      {
        label: 'Learn with AI',
        action: 'learn_topic',
        description: `Explore step-by-step explanations for ${params.topic.title}.`,
      },
    ],
  };
}
