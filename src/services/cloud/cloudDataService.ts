import { getAuthToken } from '../auth/authService';
import { TestAttempt } from '../../types/test';
import { WrittenTestAttempt } from '../../types/writtenTest';
import { ChatMessage } from '../ai/aiTypes';

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// --- Cloud AI Conversations ---
export async function syncAiConversationToCloud(
  classLevel: string,
  subjectId: string,
  chapterId: string,
  topicId: string,
  language: string,
  messages: ChatMessage[]
): Promise<void> {
  const token = getAuthToken();
  if (!token) return;

  try {
    await fetch('/api/user/ai-conversations', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        classLevel,
        subjectId,
        chapterId,
        topicId,
        language,
        messages,
      }),
    });
  } catch (err) {
    console.warn('[CloudDataService] Failed to sync AI conversation to cloud:', err);
  }
}

export async function fetchUserAiConversationsFromCloud(): Promise<any[]> {
  const token = getAuthToken();
  if (!token) return [];

  try {
    const res = await fetch('/api/user/ai-conversations', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.conversations || [];
  } catch (err) {
    console.warn('[CloudDataService] Failed to fetch AI conversations from cloud:', err);
    return [];
  }
}

// --- Cloud MCQ Tests ---
export async function syncMcqAttemptToCloud(attempt: TestAttempt): Promise<void> {
  const token = getAuthToken();
  if (!token) return;

  try {
    await fetch('/api/user/mcq-tests', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(attempt),
    });
  } catch (err) {
    console.warn('[CloudDataService] Failed to sync MCQ attempt to cloud:', err);
  }
}

export async function fetchUserMcqAttemptsFromCloud(): Promise<TestAttempt[]> {
  const token = getAuthToken();
  if (!token) return [];

  try {
    const res = await fetch('/api/user/mcq-tests', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.attempts || [];
  } catch (err) {
    console.warn('[CloudDataService] Failed to fetch MCQ attempts from cloud:', err);
    return [];
  }
}

// --- Cloud Written Tests ---
export async function syncWrittenAttemptToCloud(attempt: WrittenTestAttempt): Promise<void> {
  const token = getAuthToken();
  if (!token) return;

  try {
    await fetch('/api/user/written-tests', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(attempt),
    });
  } catch (err) {
    console.warn('[CloudDataService] Failed to sync written attempt to cloud:', err);
  }
}

export async function fetchUserWrittenAttemptsFromCloud(): Promise<WrittenTestAttempt[]> {
  const token = getAuthToken();
  if (!token) return [];

  try {
    const res = await fetch('/api/user/written-tests', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.attempts || [];
  } catch (err) {
    console.warn('[CloudDataService] Failed to fetch written attempts from cloud:', err);
    return [];
  }
}

// --- Collect Local Legacy Data for Migration ---
export function collectLocalLegacyProgress(): {
  hasData: boolean;
  mcqAttempts: TestAttempt[];
  writtenAttempts: WrittenTestAttempt[];
  aiConversations: any[];
  studentProfile: any;
} {
  try {
    // 1. Profile
    let studentProfile = null;
    const rawProfile = localStorage.getItem('rds_student_profile');
    if (rawProfile) {
      studentProfile = JSON.parse(rawProfile);
    }

    // 2. MCQ attempts
    const mcqAttempts: TestAttempt[] = [];
    const rawMcqIndex = localStorage.getItem('rds_mcq_attempts_index_v1');
    if (rawMcqIndex) {
      const ids: string[] = JSON.parse(rawMcqIndex);
      for (const id of ids) {
        const rawAttempt = localStorage.getItem(`rds_mcq_attempt_v1_${id}`);
        if (rawAttempt) {
          mcqAttempts.push(JSON.parse(rawAttempt));
        }
      }
    }

    // 3. Written attempts
    const writtenAttempts: WrittenTestAttempt[] = [];
    const rawWrittenIndex = localStorage.getItem('rds_written_attempts_index_v1');
    if (rawWrittenIndex) {
      const ids: string[] = JSON.parse(rawWrittenIndex);
      for (const id of ids) {
        const rawAttempt = localStorage.getItem(`rds_written_attempt_v1_${id}`);
        if (rawAttempt) {
          writtenAttempts.push(JSON.parse(rawAttempt));
        }
      }
    }

    // 4. AI conversations
    const aiConversations: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('rds_ai_chat_v2_')) {
        const rawChat = localStorage.getItem(key);
        if (rawChat) {
          const parts = key.replace('rds_ai_chat_v2_', '').split('_');
          aiConversations.push({
            classLevel: parts[0] || 'Class 10',
            subjectId: parts[1] || '',
            chapterId: parts[2] || '',
            topicId: parts[3] || '',
            language: 'English',
            messages: JSON.parse(rawChat),
          });
        }
      }
    }

    const hasData =
      mcqAttempts.length > 0 ||
      writtenAttempts.length > 0 ||
      aiConversations.length > 0 ||
      (studentProfile && studentProfile.name);

    return {
      hasData,
      mcqAttempts,
      writtenAttempts,
      aiConversations,
      studentProfile,
    };
  } catch (err) {
    console.error('[CloudDataService] Error collecting local legacy data:', err);
    return {
      hasData: false,
      mcqAttempts: [],
      writtenAttempts: [],
      aiConversations: [],
      studentProfile: null,
    };
  }
}
