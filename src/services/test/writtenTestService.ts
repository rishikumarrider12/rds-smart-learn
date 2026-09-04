import { ClassLevel, Subject, Chapter, Topic } from '../../types';
import { LearningLanguage } from '../ai/aiTypes';
import { validateGeneratedLanguage } from '../ai/languageValidation';
import { WrittenDifficulty, WrittenQuestion, WrittenQuestionType } from '../../types/writtenTest';

export interface GenerateWrittenQuestionsParams {
  classLevel: ClassLevel;
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  questionType: WrittenQuestionType;
  difficulty: WrittenDifficulty;
  questionCount: number;
  language: LearningLanguage;
}

/**
 * Builds the AI prompt for written test generation
 */
export function buildWrittenQuestionPrompt(params: GenerateWrittenQuestionsParams): string {
  const { classLevel, subject, chapter, topic, questionType, difficulty, questionCount, language } = params;

  return `You are the Assessment Specialist for RDS SMART LEARN.
Generate a high-quality, pedagogically accurate set of ${questionCount} WRITTEN ANSWER questions for a student in Telangana State Board (SCERT) curriculum.

Context:
- Class Level: ${classLevel}
- Subject: ${subject.name}
- Chapter ${chapter.chapterNumber}: ${chapter.title}
- Topic: ${topic.title} (${topic.description})
- Question Type Preference: ${questionType.toUpperCase()} (Short answers: 2-5 marks, Long answers: 5-10 marks, Mixed: balanced mix)
- Difficulty: ${difficulty}
- Required Language: ${language}

Evaluation Requirements:
For each question, define:
1. "id": unique string identifier (e.g. "wq_1", "wq_2")
2. "question": clear, unambiguous question text in ${language} appropriate for class ${classLevel}
3. "questionType": "short" or "long"
4. "difficulty": "easy" | "medium" | "hard"
5. "maxMarks": integer marks (e.g., 2 to 4 for short questions, 5 to 8 for long questions)
6. "concept": concise concept tag tested (e.g., "${topic.title} - Working Mechanism")
7. "keyPoints": array of 3 to 6 essential conceptual points, keywords, or steps a student MUST mention to receive full marks
8. "modelAnswer": clear, exemplary standard answer in ${language} demonstrating perfect structure, step-by-step reasoning, and terminology for class ${classLevel}

Return ONLY valid JSON in this exact structure:
{
  "questions": [
    {
      "id": "wq_1",
      "question": "Question text here",
      "questionType": "short",
      "difficulty": "medium",
      "maxMarks": 4,
      "concept": "Concept name",
      "keyPoints": [
        "First key essential point",
        "Second key essential point",
        "Third key essential point"
      ],
      "modelAnswer": "Complete reference model answer here"
    }
  ]
}`;
}

/**
 * Validates generated written questions
 */
export function validateWrittenQuestions(rawList: any[], expectedCount: number): WrittenQuestion[] | null {
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return null;
  }

  const validQuestions: WrittenQuestion[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i];
    if (!item || typeof item !== 'object') continue;

    const id = (item.id && typeof item.id === 'string' && !seenIds.has(item.id))
      ? item.id
      : `wq_${i + 1}_${Date.now().toString().slice(-4)}`;
    seenIds.add(id);

    const question = typeof item.question === 'string' ? item.question.trim() : '';
    if (!question || question.length < 10) continue;

    const qType: 'short' | 'long' = (item.questionType === 'long' || item.questionType === 'short')
      ? item.questionType
      : (i % 2 === 0 ? 'short' : 'long');

    const diff: 'easy' | 'medium' | 'hard' = ['easy', 'medium', 'hard'].includes(item.difficulty)
      ? item.difficulty
      : 'medium';

    const maxMarks = typeof item.maxMarks === 'number' && item.maxMarks > 0
      ? Math.round(item.maxMarks)
      : (qType === 'short' ? 4 : 8);

    const concept = typeof item.concept === 'string' && item.concept.trim()
      ? item.concept.trim()
      : `Concept ${i + 1}`;

    const keyPoints = Array.isArray(item.keyPoints)
      ? item.keyPoints.filter((p: any) => typeof p === 'string' && p.trim().length > 0).map((p: string) => p.trim())
      : [];

    if (keyPoints.length === 0) {
      keyPoints.push(`Demonstrate accurate understanding of ${concept}`);
      keyPoints.push('Include relevant definitions and standard terminology');
    }

    const modelAnswer = typeof item.modelAnswer === 'string' && item.modelAnswer.trim()
      ? item.modelAnswer.trim()
      : 'A comprehensive model answer covering the core principles, definitions, and applications.';

    validQuestions.push({
      id,
      question,
      questionType: qType,
      difficulty: diff,
      maxMarks,
      concept,
      keyPoints,
      modelAnswer,
    });
  }

  return validQuestions.length > 0 ? validQuestions.slice(0, expectedCount) : null;
}

/**
 * Fallback questions generator strictly mapped to Telangana syllabus topics
 */
function generateFallbackWrittenQuestions(params: GenerateWrittenQuestionsParams): WrittenQuestion[] {
  const { topic, chapter, subject, questionType, questionCount, classLevel, language } = params;
  const t = topic.title;
  const c = chapter.title;
  const s = subject.name;

  let templates: Array<{
    q: string;
    type: 'short' | 'long';
    diff: 'easy' | 'medium' | 'hard';
    marks: number;
    concept: string;
    keys: string[];
    model: string;
  }> = [
    {
      q: `Explain the fundamental concept of ${t} as taught in ${s} Chapter ${chapter.chapterNumber} (${c}). What is its primary significance?`,
      type: 'short',
      diff: 'easy',
      marks: 4,
      concept: `${t} - Core Definition & Purpose`,
      keys: [
        `Clear definition of ${t} in the context of ${c}`,
        'Correct statement of standard conditions or governing principles',
        'At least one practical significance or real-world application'
      ],
      model: `${t} represents a core foundation in ${c}. According to the Telangana SCERT curriculum, it defines how fundamental quantities and processes interact under standard conditions. Its significance lies in enabling accurate mathematical calculation and scientific interpretation of observable phenomena.`,
    },
    {
      q: `Describe the step-by-step procedure or working mechanism related to ${t}. What key precautions or criteria must be observed?`,
      type: 'long',
      diff: 'medium',
      marks: 8,
      concept: `${t} - Mechanism & Detailed Process`,
      keys: [
        'Systematic sequential steps explaining the process or derivation',
        'Identification of key variables, reagents, or parameters',
        'Mention of critical precautions, sign conventions, or domain limits',
        'Conclusion illustrating the final result or product'
      ],
      model: `To analyze ${t} effectively:\n1. Identify given baseline parameters and governing theorems.\n2. Apply the specific principles of ${c} in systematic sequence without skipping intermediate relations.\n3. Verify units and boundary conditions.\n4. Summarize the outcome clearly with standard academic notation.`,
    },
    {
      q: `State two important differences or practical applications of ${t} compared to other topics in ${c}.`,
      type: 'short',
      diff: 'medium',
      marks: 4,
      concept: `${t} - Comparison & Applications`,
      keys: [
        'Two distinct, valid comparison points or practical use-cases',
        'Accurate subject terminology without confusing definitions',
        'Clear cause-and-effect relationship'
      ],
      model: `${t} is specifically characterized by distinct criteria compared to neighboring topics in ${c}. In practical scenarios across science and mathematics, it is applied directly to calculate exact values and troubleshoot deviations in empirical observations.`,
    },
    {
      q: `Explain a common error or misconception students have regarding ${t}, and explain how to correctly solve or verify such problems.`,
      type: 'short',
      diff: 'hard',
      marks: 4,
      concept: `${t} - Error Analysis & Verification`,
      keys: [
        'Identification of a typical mistake (such as omitting units, sign errors, or incorrect formulas)',
        'Explanation of why the error occurs',
        'The correct verification method or back-substitution approach'
      ],
      model: `A frequent misconception in ${t} is applying formulas without checking prerequisite conditions or SI units. To verify accurately, students should always perform dimensional analysis and back-substitute results into the primary equation.`,
    },
    {
      q: `Provide an analytical explanation of ${t}, detailing its theoretical foundation, relevant mathematical formulas/diagrammatic representation, and its relevance in ${classLevel} board examinations.`,
      type: 'long',
      diff: 'hard',
      marks: 8,
      concept: `${t} - Comprehensive Synthesis & Exam Rubric`,
      keys: [
        'Comprehensive theoretical overview and origin',
        'Explicit formula, diagram description, or law statement',
        'Worked example or application demonstrating deep understanding',
        'Structured presentation adhering to State Board 8-mark question criteria'
      ],
      model: `${t} is one of the highest-weightage topics in Chapter ${chapter.chapterNumber} of ${s}. A thorough answer encompasses: 1) Stating the fundamental law and definition, 2) Deriving the primary formula or illustrating with a labeled schematic, 3) Detailing the conditions where it holds true, and 4) Providing an application scenario with standard units.`,
    }
  ];

  // Language-aware fallback for written tests: Telugu/Hindi scaffolds in the
  // correct script so offline questions match the selected subject language.
  if (language === 'Telugu' || language === 'Hindi') {
    const isTe = language === 'Telugu';
    templates = [];
    templates.push({
      q: isTe ? `${s} అధ్యాయం ${chapter.chapterNumber} (${c}) లో ${t} ప్రాథమిక భావన వివరించండి.` : `${s} अध्याय ${chapter.chapterNumber} (${c}) में ${t} की मूल अवधारणा समझाइए।`,
      type: 'short',
      diff: 'easy',
      marks: 4,
      concept: isTe ? `${t} - ప్రధాన నిర్వచనం` : `${t} - मुख्य परिभाषा`,
      keys: isTe
        ? [`${c} సందర్భంలో ${t} యొక్క స్పష్టమైన నిర్వచనం`, 'ప్రామాణిక నియమాలు లేదా పరిస్థితులను సరిగ్గా పేర్కొనుట', 'కనీసం ఒక ఆచరణాత్మక ప్రాముఖ్యత']
        : [`${c} के संदर्भ में ${t} की स्पष्ट परिभाषा`, 'मानक नियमों या शर्तों का सही कथन', 'कम से कम एक व्यावहारिक महत्व'],
      model: isTe
        ? `${t} అనునది ${c} యొక్క మూలాధారం. SCERT పాఠ్యాంశం ప్రకారం ఇది ప్రామాణిక పరిస్థితుల్లో మూలభాగాల చర్యను వివరిస్తుంది.`
        : `${t} ${c} का मूल आधार है। SCERT पाठ्यक्रम के अनुसार यह मानक परिस्थितियों में मूलभूत प्रक्रियाओं की व्याख्या करता है।`,
    });
    templates.push({
      q: isTe ? `${t} కు సంబంధించిన దశల వారీ పద్ధతి లేదా పనిచేయు విధానాన్ని వివరించండి.` : `${t} से संबंधित चरण-दर-चरण विधि या कार्य प्रणाली का वर्णन कीजिए।`,
      type: 'long',
      diff: 'medium',
      marks: 8,
      concept: isTe ? `${t} - పద్ధతి & ప్రక్రియ` : `${t} - विधि एवं प्रक्रिया`,
      keys: isTe
        ? ['ప్రక్రియ లేదా వివరణను వివరించే క్రమబద్ధమైన సోపానాలు', 'కీలక చరరాశులు లేదా పారామితుల గుర్తింపు', 'కీలక జాగ్రత్తలు, సంజ్ఞా నియమాలు పేర్కొనుట', 'తుది ఫలితం యొక్క నిర్ధారణ']
        : ['प्रक्रिया या व्युत्पत्ति समझाने वाले क्रमबद्ध चरण', 'प्रमुख चर या मापदंडों की पहचान', 'महत्वपूर्ण सावधानियाँ, चिह्न नियम बताना', 'अंतिम परिणाम का निष्कर्ष'],
      model: isTe
        ? `${t} విశ్లేషించడానికి: 1) ఇచ్చిన పారామితులను గుర్తించండి. 2) ${c} యొక్క నియమాలను క్రమంలో అన్వయించండి. 3) యూనిట్లు నిర్ధారించుకోండి. 4) ఫలితాన్ని స్పష్టంగా రాయండి.`
        : `${t} का विश्लेषण करने हेतु: 1) दिए गए मापदंड पहचानें। 2) ${c} के नियम क्रम से लागू करें। 3) इकाइयाँ जाँचें। 4) परिणाम स्पष्ट रूप से लिखें।`,
    });
    templates.push({
      q: isTe ? `${t} గురించి విద్యార్థులకు ఉండే ఒక సాధారణ తప్పు/అపోహను వివరించండి.` : `${t} के बारे में विद्यार्थियों की एक सामान्य भ्रांति समझाइए।`,
      type: 'short',
      diff: 'hard',
      marks: 4,
      concept: isTe ? `${t} - దోష విశ్లేషణ` : `${t} - त्रुटि विश्लेषण`,
      keys: isTe
        ? ['సాధారణ తప్పు గుర్తింపు (యూనిట్లు, సంజ్ఞలు, సూత్రాలను వదిలేయడం)', 'తప్పు జరగడానికి కారణం వివరణ', 'సరైన నిర్ధారణ పద్ధతి']
        : ['सामान्य त्रुटि पहचान (इकाइयाँ, चिह्न, सूत्र छोड़ना)', 'त्रुटि का कारण स्पष्ट करना', 'सही जाँच विधि'],
      model: isTe
        ? `${t} లో తరచూ ప్రాథమిక నిబంధనలను లేదా SI యూనిట్లను తనిఖీ చేయకుండా సూత్రాలను వర్తింపజేయడం తప్పు. ఎల్లప్పుడూ తిరిగి సమీకరణలో నిర్ధారించాలి.`
        : `${t} में प्रायः शर्तें या इकाइयाँ जाँचे बिना सूत्र लागू करना ग़लत है। हमेशा वापस समीकरण में जाँचें।`,
    });
  }

  const results: WrittenQuestion[] = [];
  const count = Math.min(questionCount, templates.length);

  for (let i = 0; i < count; i++) {
    const tmpl = templates[i];
    results.push({
      id: `wq_fallback_${i + 1}`,
      question: tmpl.q,
      questionType: questionType === 'mixed' ? tmpl.type : (questionType === 'short' ? 'short' : 'long'),
      difficulty: tmpl.diff,
      maxMarks: questionType === 'short' ? 4 : (questionType === 'long' ? 8 : tmpl.marks),
      concept: tmpl.concept,
      keyPoints: tmpl.keys,
      modelAnswer: tmpl.model,
    });
  }

  return results;
}

/**
 * Clean and parse JSON response safely
 */
function cleanAndParseJson(raw: string): any {
  if (!raw || typeof raw !== 'string') return null;
  let cleaned = raw.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Main function to generate written questions
 */
export async function generateWrittenQuestions(params: GenerateWrittenQuestionsParams): Promise<WrittenQuestion[]> {
  const prompt = buildWrittenQuestionPrompt(params);
  const systemInstruction = `You are the Assessment Specialist for RDS SMART LEARN.
You generate high quality, pedagogically accurate written assessment questions strictly aligned with the Telangana State Board (SCERT) curriculum for ${params.classLevel}.
You must always output strict JSON format matching the requested schema.`;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        const validated = validateWrittenQuestions(rawQuestions, params.questionCount);
        if (validated && validated.length >= Math.min(params.questionCount, 3)) {
          // Language guard for Telugu/Hindi requests.
          const languageOk = validateGeneratedLanguage(
            validated.map((q) => [q.question, ...(q.keyPoints || []), q.modelAnswer].join('\n')),
            params.language
          );
          if (languageOk) {
            return validated;
          }
          throw new Error(`AI returned written content in the wrong language (expected ${params.language}). Retrying...`);
        }
      }
    } catch (err) {
      console.warn(`Written question generation attempt ${attempt} failed:`, err);
    }
  }

  // Gracefully fallback to curriculum-aligned standard question set
  console.info('Using syllabus-aligned written question templates for topic:', params.topic.title);
  const fallback = generateFallbackWrittenQuestions(params);
  if (fallback && fallback.length > 0) {
    return fallback;
  }

  throw new Error('Unable to generate written questions at this moment. Please try again.');
}
