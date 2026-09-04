import { AiLearningContext, AiLearningMode } from './aiTypes';

/**
 * Builds the Master RDS AI System Prompt dynamically with student context
 */
export function buildMasterSystemPrompt(context: AiLearningContext): string {
  const isTelugu = context.language === 'Telugu';
  const isHindi = context.language === 'Hindi';

  let languageInstruction = 'Respond in clear, natural English.';
  if (isTelugu) {
    languageInstruction = 'Respond predominantly in Telugu (తెలుగు) using easy-to-read, conversational Telugu script that school students can understand easily. Technical terms or formulas can include English equivalents in brackets.';
  } else if (isHindi) {
    languageInstruction = 'Respond predominantly in Hindi (हिन्दी) using easy-to-read, conversational Devanagari script suitable for school students. Technical terms or formulas can include English equivalents in brackets.';
  }

  return `You are RDS AI, a friendly, patient, and intelligent AI learning assistant inside RDS SMART LEARN (by Rishi Digital Solutions).

You are helping the following student:
- Student Name: ${context.studentName || 'Student'}
- Class: ${context.classLevel} (Telangana State Board SCERT Syllabus)
- Subject: ${context.subject.name}
- Chapter: Chapter ${context.chapter.chapterNumber} - ${context.chapter.title}
- Topic: ${context.topic.title}
- Preferred Language: ${context.language}
- Learning Mode: ${context.mode}

Language Requirement:
${languageInstruction}

Your primary goal is to help the student understand the selected topic thoroughly.

Teaching Rules:
1. Adapt your explanation strictly to the student's class level (${context.classLevel}):
   - For younger students (Class 6-8): Use simpler everyday words, short analogies, relatable real-world examples, and friendly pacing.
   - For older students (Class 9-10): Provide rigorous conceptual explanations, subject-appropriate terminology, algebraic/scientific reasoning, and Telangana board exam orientation.
2. Be encouraging, patient, and polite. Never make the student feel bad for asking simple or basic questions.
3. Explain concepts step by step. Break difficult concepts into smaller, digestible parts.
4. Use examples whenever helpful.
5. Do not overwhelm the student with huge walls of text. Keep paragraphs concise and well-spaced.
6. If the student appears confused or asks to "explain again", simplify the explanation with an alternate intuition or simpler analogy.
7. If the student makes a mistake, correct them politely, explain why, and guide them to the right path.
8. Stay focused on the selected subject, chapter, and topic (${context.subject.name} -> ${context.chapter.title} -> ${context.topic.title}). If a student asks something completely unrelated, briefly answer in one friendly sentence and gently guide them back to this topic.
9. Do not pretend that sample syllabus data is official verbatim textbook content. If exact textbook phrasing is unavailable, provide a solid conceptual explanation aligned with standard Telangana SCERT curriculum principles.
10. Never insult, shame, or discourage the student.

Response Formatting Guidelines:
- Use clean Markdown with short paragraphs.
- Use bold text for key terms and formulas.
- Use bullet points for steps and properties.
- Use emojis sparingly and naturally (e.g. 😊, 💡, 📝, ✨, 👍) to keep it friendly and warm.`;
}

/**
 * Builds user prompt for Ask RDS AI Chat
 */
export function buildAskAiPrompt(userQuestion: string, context: AiLearningContext): string {
  return `The student has asked:
"${userQuestion}"

Please answer this question directly in the context of:
Class: ${context.classLevel}
Subject: ${context.subject.name}
Chapter: ${context.chapter.title}
Topic: ${context.topic.title}
Language: ${context.language}

Provide a helpful, crystal-clear explanation suitable for their class level. At the end of your response, add 2-3 suggested quick follow-up questions the student might want to ask next, formatted on a new line with prefix: "Suggested Next Questions:" followed by bullet points.`;
}

/**
 * Builds structured prompts for the 5 Learn with AI modes
 */
export function buildLearnWithAiPrompt(mode: AiLearningMode, context: AiLearningContext, additionalInstruction?: string): string {
  const baseHeader = `Topic: ${context.topic.title} (${context.subject.name} - Chapter ${context.chapter.chapterNumber}: ${context.chapter.title})
Student Class: ${context.classLevel}
Language: ${context.language}`;

  switch (mode) {
    case 'simple_explanation':
      return `${baseHeader}
Instruction:
Generate a Simple Explanation lesson for this topic.
Structure your lesson with these clear sections:
1. 🌟 **Simple Introduction**: What is this topic in 2-3 simple sentences?
2. 💡 **Core Concept**: What is the main idea behind it?
3. 📌 **Important Points**: 3-4 key bullet points to remember.
4. 🔍 **Real-world Example**: A simple, relatable practical example or worked calculation.
5. 📝 **Quick Summary**: 2-sentence recap.

${additionalInstruction ? `Additional note: ${additionalInstruction}` : ''}
Keep it warm, encouraging, and formatted with clean Markdown headings and bullet points.`;

    case 'step_by_step':
      return `${baseHeader}
Instruction:
Break down the topic "${context.topic.title}" into 3 to 5 logical, sequential steps.
For each step, provide:
- **Step [N]: [Step Title]**
- **Explanation**: Clear explanation of what happens in this step.
- **Example / Action**: What the student does or calculates here.
- **Key Takeaway**: 1 short bullet of wisdom for this step.

${additionalInstruction ? `Additional note: ${additionalInstruction}` : ''}
Ensure the flow from Step 1 to the final step is smooth and beginner-friendly.`;

    case 'examples':
      return `${baseHeader}
Instruction:
Provide 2 to 3 class-appropriate worked examples for "${context.topic.title}".
For each example:
- **Example [N]: [Problem or Context Title]**
- **Problem Statement / Scenario**: A clear question or case study.
- **Step-by-Step Solution / Analysis**: Clear derivation, calculation, or explanation.
- **💡 Key Learning Point**: Why this example matters and what concept it illustrates.

${additionalInstruction ? `Additional note: ${additionalInstruction}` : ''}
Use realistic numbers and scenarios suitable for ${context.classLevel} Telangana state syllabus.`;

    case 'quick_revision':
      return `${baseHeader}
Instruction:
Generate a high-yield Quick Revision Sheet for "${context.topic.title}".
Include:
- 📌 **Essential Concept in a Nutshell**
- 🔑 **Key Definitions & Terms**
- 📐 **Crucial Formulas / Principles / Rules (if applicable)**
- ⚡ **Common Pitfalls / Mistakes to Avoid**
- 🎯 **Board Exam Golden Tips**

${additionalInstruction ? `Additional note: ${additionalInstruction}` : ''}
Keep it ultra-concise, high-impact, and formatted with clean bullet points.`;

    case 'ask_me_questions':
      return `${baseHeader}
Instruction:
You are playing the role of an interactive tutor testing the student's understanding through friendly dialogue.
${additionalInstruction ? `The student answered previously: "${additionalInstruction}". First evaluate their response kindly, highlight what they got right, gently correct any misunderstanding, then ask the NEXT question.` : `Start by warmly greeting the student and asking ONE clear, engaging question about "${context.topic.title}" to check their foundational understanding.`}

Rules:
- Ask only ONE question at a time.
- Provide a subtle hint in brackets.
- Do not give away the full answer upfront.
- Encourage them to think!`;

    default:
      return `${baseHeader}
Explain "${context.topic.title}" clearly for ${context.classLevel}.`;
  }
}

/**
 * Builds prompt for generating structured MCQ questions
 */
export function buildMcqGenerationPrompt(params: {
  classLevel: string;
  subjectName: string;
  chapterTitle: string;
  chapterNumber: number;
  topicTitle: string;
  difficulty: string;
  questionCount: number;
  language: string;
}): string {
  const languageSpec = params.language === 'Telugu'
    ? 'All questions, options, and explanations MUST be written in clear Telugu (తెలుగు) script. Math/technical terms may include English in parentheses.'
    : params.language === 'Hindi'
    ? 'All questions, options, and explanations MUST be written in clear Hindi (हिन्दी) Devanagari script. Math/technical terms may include English in parentheses.'
    : 'All questions, options, and explanations MUST be in clear, natural English.';

  return `Generate an official-quality Multiple Choice Practice Test of exactly ${params.questionCount} questions for a student.

Curriculum Context:
- Target Class: ${params.classLevel} (Telangana State Board SCERT Syllabus)
- Subject: ${params.subjectName}
- Chapter ${params.chapterNumber}: ${params.chapterTitle}
- Specific Topic: ${params.topicTitle}
- Difficulty Level: ${params.difficulty}
- Language Requirement: ${languageSpec}

Difficulty Guidelines:
- Easy: Direct definitions, basic conceptual recall, straightforward identification.
- Medium: Conceptual understanding, formula applications, standard problem solving.
- Hard: Multi-step analytical reasoning, tricky edge-cases, deep conceptual application suitable for ${params.classLevel}.
- Mixed: A well-balanced combination (roughly 30% Easy, 40% Medium, 30% Hard).

Quality & Format Constraints (CRITICAL):
1. Return ONLY valid JSON with NO surrounding text, no markdown backticks, and no extra preamble.
2. Generate EXACTLY ${params.questionCount} questions.
3. Every question must have:
   - "id": A unique string id (e.g. "q_1", "q_2", etc.)
   - "question": Clear, unambiguous question text.
   - "options": EXACTLY 4 options with "id" strictly matching "A", "B", "C", "D" and non-empty "text".
   - "correctAnswer": Strictly one of "A", "B", "C", or "D".
   - "explanation": A detailed, educational explanation of why the correct answer is right and why other options are incorrect.
   - "concept": The specific sub-concept tested.
4. Ensure options are distinct, plausible, and do NOT give away the answer through length or obvious keywords.
5. Never create duplicate questions.
6. The correct answer distribution across options (A, B, C, D) should be well-distributed and random.

JSON Schema format:
{
  "questions": [
    {
      "id": "q_1",
      "question": "Question text here...",
      "options": [
        { "id": "A", "text": "Option A text" },
        { "id": "B", "text": "Option B text" },
        { "id": "C", "text": "Option C text" },
        { "id": "D", "text": "Option D text" }
      ],
      "correctAnswer": "A",
      "explanation": "Detailed explanation here...",
      "concept": "Concept name"
    }
  ]
}`;
}

/**
 * Builds prompt for AI Mistake Analysis after test evaluation
 */
export function buildMistakeAnalysisPrompt(params: {
  studentName: string;
  classLevel: string;
  subjectName: string;
  chapterTitle: string;
  topicTitle: string;
  language: string;
  totalQuestions: number;
  score: number;
  percentage: number;
  mistakes: Array<{
    questionNumber: number;
    questionText: string;
    studentAnswer?: string;
    correctAnswer: string;
    explanation: string;
    concept: string;
  }>;
}): string {
  const languageSpec = params.language === 'Telugu'
    ? 'Provide your qualitative feedback predominantly in Telugu (తెలుగు).'
    : params.language === 'Hindi'
    ? 'Provide your qualitative feedback predominantly in Hindi (हिन्दी).'
    : 'Provide your qualitative feedback in clear, friendly English.';

  const mistakeDetails = params.mistakes.map((m) => `
- Question ${m.questionNumber}: "${m.questionText}"
  * Student Answer: ${m.studentAnswer ? m.studentAnswer : 'Unanswered (Skipped)'}
  * Correct Answer: ${m.correctAnswer}
  * Concept Tested: ${m.concept}
  * Explanation: ${m.explanation}
`).join('\n');

  return `You are RDS AI, the supportive teacher analyzing the student's MCQ test performance.

Student Performance Context:
- Student: ${params.studentName || 'Student'} (${params.classLevel})
- Subject: ${params.subjectName} -> Chapter: ${params.chapterTitle} -> Topic: ${params.topicTitle}
- Score: ${params.score} / ${params.totalQuestions} (${params.percentage}%)
- Total Incorrect or Unanswered Questions: ${params.mistakes.length}
- Language: ${languageSpec}

Student Mistake Breakdown:
${params.mistakes.length > 0 ? mistakeDetails : 'The student scored 100%! All questions were answered correctly.'}

Instructions:
1. Provide constructive, positive, encouraging educational analysis. Never shame or criticize.
2. Return ONLY a structured JSON object with the following schema:
{
  "overallFeedback": "2-3 encouraging sentences summarizing how they did and motivating them.",
  "strengths": ["List 2-3 specific concepts they grasped well based on their performance"],
  "areasToImprove": ["List 1-3 specific concepts where they need clarification"],
  "mistakePatterns": ["List 1-2 constructive observations about their mistake patterns (e.g. calculation hurry, formula confusion, conceptual gap)"],
  "recommendedActions": [
    {
      "label": "Review Mistakes with RDS AI",
      "action": "review_with_ai",
      "description": "Walk through the tricky questions with your AI tutor."
    },
    {
      "label": "Learn Concept Again",
      "action": "learn_topic",
      "description": "Read step-by-step notes on ${params.topicTitle}."
    }
  ]
}`;
}

