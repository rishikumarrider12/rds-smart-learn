import { 
  AiApiResponse, 
  AiLearningContext, 
  AiLearningMode, 
  ChatMessage, 
  LearningLanguage 
} from './aiTypes';
import { 
  buildAskAiPrompt, 
  buildLearnWithAiPrompt, 
  buildMasterSystemPrompt 
} from './aiPrompts';
import { syncAiConversationToCloud } from '../cloud/cloudDataService';
import { getAuthHeaders } from '../auth/authService';

const STORAGE_PREFIX = 'rds_ai_chat_v2';

/**
 * Generates unique storage key for topic conversation
 */
export function getStorageKey(
  classLevel: string,
  subjectId: string,
  chapterId: string,
  topicId: string
): string {
  const sanitize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${STORAGE_PREFIX}_${sanitize(classLevel)}_${sanitize(subjectId)}_${sanitize(chapterId)}_${sanitize(topicId)}`;
}

/**
 * Load conversation history from local storage
 */
export function getConversationHistory(
  classLevel: string,
  subjectId: string,
  chapterId: string,
  topicId: string
): ChatMessage[] {
  try {
    const key = getStorageKey(classLevel, subjectId, chapterId, topicId);
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load conversation history:', e);
  }
  return [];
}

/**
 * Save conversation history to local storage
 */
export function saveConversationHistory(
  classLevel: string,
  subjectId: string,
  chapterId: string,
  topicId: string,
  messages: ChatMessage[]
): void {
  try {
    const key = getStorageKey(classLevel, subjectId, chapterId, topicId);
    localStorage.setItem(key, JSON.stringify(messages));
    
    // Sync to cloud asynchronously
    syncAiConversationToCloud(classLevel, subjectId, chapterId, topicId, 'English', messages).catch((e) =>
      console.warn('Failed to sync AI conversation to cloud:', e)
    );
  } catch (e) {
    console.error('Failed to save conversation history:', e);
  }
}

/**
 * Clear conversation history
 */
export function clearConversationHistory(
  classLevel: string,
  subjectId: string,
  chapterId: string,
  topicId: string
): void {
  try {
    const key = getStorageKey(classLevel, subjectId, chapterId, topicId);
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Failed to clear conversation history:', e);
  }
}

/**
 * Extracts suggested chips from AI response text if present
 */
function extractSuggestedChips(text: string): { cleanedText: string; chips: string[] } {
  const chipMarker = /Suggested Next Questions:([\s\S]*)$/i;
  const match = text.match(chipMarker);

  if (!match) {
    return { cleanedText: text, chips: [] };
  }

  const chipsBlock = match[1];
  const cleanedText = text.replace(chipMarker, '').trim();

  const lines = chipsBlock
    .split('\n')
    .map((l) => l.replace(/^[-*•\d.]+\s*/, '').trim())
    .filter((l) => l.length > 3 && l.length < 80);

  return {
    cleanedText,
    chips: lines.slice(0, 4),
  };
}

/**
 * Client AI Service: Sends request to backend /api/ai/generate
 */
export async function sendAiChatMessage(
  context: AiLearningContext,
  userQuestion: string,
  history: ChatMessage[] = []
): Promise<{ text: string; suggestedChips: string[] }> {
  const systemInstruction = buildMasterSystemPrompt(context);
  const prompt = buildAskAiPrompt(userQuestion, context);

  // Format recent chat turns for multi-turn conversational context
  const recentHistory = history.slice(-6).map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));

  const contents = [
    ...recentHistory,
    {
      role: 'user',
      parts: [{ text: prompt }],
        },
  ];

  // Timeout guard to prevent indefinite hanging (frontend + backend)
  const AI_FETCH_TIMEOUT_MS = 45000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'same-origin',
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction,
        contents,
        mode: context.mode,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.text || '';
    const { cleanedText, chips } = extractSuggestedChips(rawText);

    return {
      text: cleanedText || 'I understand your question. Let us explore this topic step by step.',
      suggestedChips: chips.length > 0 ? chips : [
        'Can you give me an example?',
        'Explain step-by-step',
        'Why is this important?',
        'Ask me a question to test my understanding',
      ],
    };
  } catch (error: any) {
    console.error('AI chat error:', error);
    if (error.name === 'AbortError') {
      throw new Error('The request took too long. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fallback lesson content generator if upstream AI models are momentarily overloaded
 */
function generateFallbackLessonContent(context: AiLearningContext, mode: AiLearningMode): string {
  const { topic, chapter, subject, classLevel, studentName } = context;
  const t = topic.title;
  const c = chapter.title;
  const s = subject.name;

  if (mode === 'simple_explanation') {
    return `# 📘 ${t}\n\n**Subject:** ${s} | **Chapter ${chapter.chapterNumber}:** ${c} | **Class:** ${classLevel}\n\n---\n\n### 🌟 1. Core Concept Overview\nIn the Telangana State Board curriculum, **${t}** is a fundamental concept in **${c}**. It helps us understand the fundamental principles that govern how systems behave.\n\n### 💡 2. Everyday Analogy\nImagine you are observing a real-life situation where balance, energy, or logical steps take place. **${t}** provides the exact framework to calculate and predict the outcome accurately!\n\n### 🔑 3. Key Definitions to Remember\n- **Definition:** The fundamental rule and relations governing ${t}.\n- **Key Conditions:** Always verify the domain, initial assumptions, and correct units before applying principles.\n- **Significance:** Essential for both conceptual clarity and high scores in board examinations.\n\n### 📝 4. Quick Self-Check\n1. What is the main definition of ${t}?\n2. Can you explain one practical scenario where ${t} is used?\n\n*Tip: Feel free to switch modes above or ask RDS AI any specific doubt!*`;
  }

  if (mode === 'examples') {
    return `# 🌍 Real-World Applications: ${t}\n\n**Chapter ${chapter.chapterNumber}:** ${c}\n\n---\n\n### 🏗️ Example 1: Daily Life Applications\nWhenever we encounter practical situations related to ${c}, **${t}** explains the underlying science or mathematics behind what is occurring.\n\n### 🚀 Example 2: Engineering & Technology\nEngineers and scientists use the principles of **${t}** to design systems, construct infrastructure, and verify measurements with high precision.\n\n### 🌾 Example 3: Environmental & Social Context\nIn nature and everyday observations across Telangana, the laws and equations of **${t}** help us model and understand environmental and physical interactions.\n\n---\n\n*Practice connecting each example to textbook definitions to master 4-mark questions!*`;
  }

  if (mode === 'step_by_step') {
    return `# 🔢 Step-by-Step Problem Solving: ${t}\n\n**Subject:** ${s} &bull; **Chapter ${chapter.chapterNumber}:** ${c}\n\n---\n\n### 📋 Standard 4-Step Method\n\n1. **Step 1: Identify the Given Data**\n   - Write down all known variables with standard SI units or algebraic notation.\n   - Clarify what unknown is to be determined.\n\n2. **Step 2: State the Governing Formula / Rule**\n   - Explicitly write the formula or theorem for **${t}** before substituting values.\n\n3. **Step 3: Systematic Calculation**\n   - Substitute numbers carefully.\n   - Check arithmetic steps and preserve intermediate precision.\n\n4. **Step 4: Verification & Units**\n   - Review the final answer and ensure correct units and dimensional consistency are stated clearly.\n\n---\n\n*Mastering this 4-step sequence prevents common exam calculation errors!*`;
  }

  if (mode === 'quick_revision') {
    return `# 📌 Quick Revision Summary: ${t}\n\n**Chapter ${chapter.chapterNumber}:** ${c}\n\n---\n\n### ⚡ Key Takeaways\n\n| Concept Element | Essential Rule | Exam Application |\n| :--- | :--- | :--- |\n| **Core Law** | Fundamental principle of ${t} | Direct definition questions |\n| **Constraint Criteria** | Domain boundaries & signs | Numerical and analytical steps |\n| **Final Output** | Standard units & properties | Verifying calculated answers |\n\n### ⚠️ Common Traps\n- Forgetting to convert units to standard MKS/SI notation.\n- Overlooking sign conventions and boundary values.\n- Skipping the final verification step.\n\n---\n\n*Review this table before attempting practice quizzes or mock exams.*`;
  }

  return `# 🧠 Quick Concept Recall & Quiz: ${t}\n\n**Chapter ${chapter.chapterNumber}:** ${c}\n\n---\n\n### 🎯 Interactive Quiz Questions\n\n**Q1:** What is the primary purpose of studying ${t} in ${c}?\n*(Think about your answer, then verify with your textbook or ask RDS AI!)*\n\n**Q2:** Name two key rules or equations you must remember for ${t}.\n\n**Q3:** What is a common mistake students make in exam questions on this topic?\n\n---\n\n*Use the 'Ask RDS AI' tab if you want instant feedback on your answers!*`;
}

/**
 * Generate Structured Learning Lesson for "Learn with AI"
 */
export async function generateLearningLesson(
  context: AiLearningContext,
  mode: AiLearningMode,
  additionalInstruction?: string
): Promise<string> {
  const systemInstruction = buildMasterSystemPrompt({
    ...context,
    mode,
  });
  const prompt = buildLearnWithAiPrompt(mode, context, additionalInstruction);

    const contents = [
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  // Timeout guard to prevent indefinite hanging
  const AI_FETCH_TIMEOUT_MS = 45000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'same-origin',
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction,
        contents,
        mode,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      // If error is transient 503, fallback smoothly to curriculum lesson
      console.warn('API returned non-ok status, utilizing syllabus fallback:', errData);
      return generateFallbackLessonContent(context, mode);
    }

    const data = await response.json();
    return data.text || generateFallbackLessonContent(context, mode);
  } catch (error: any) {
    console.warn('Learning generation network issue, utilizing syllabus fallback:', error);
    return generateFallbackLessonContent(context, mode);
  } finally {
    clearTimeout(timeoutId);
  }
}
