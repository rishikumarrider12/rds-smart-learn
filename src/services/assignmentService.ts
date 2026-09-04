import {
  DbAssignment,
  DbAssignmentQuestion,
  DbAssignmentSubmission,
  TeacherAssignmentStats,
  StudentAssignmentItem,
  PrincipalAssignmentAnalytics,
  AdminAssignmentAnalytics,
} from '../types/assignment';

const API_BASE = '/api';

/**
 * Helper to fetch JSON with credentials and standard error extraction
 */
async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

// ==========================================
// 👩‍🏫 TEACHER ASSIGNMENT API CLIENT
// ==========================================

export async function fetchTeacherAssignments(params?: {
  schoolId?: string;
  classLevel?: string;
  subjectId?: string;
  status?: string;
}): Promise<{ success: boolean; assignments: (DbAssignment & TeacherAssignmentStats)[]; count: number }> {
  const query = new URLSearchParams();
  if (params?.schoolId) query.append('schoolId', params.schoolId);
  if (params?.classLevel) query.append('classLevel', params.classLevel);
  if (params?.subjectId) query.append('subjectId', params.subjectId);
  if (params?.status) query.append('status', params.status);

  const url = `${API_BASE}/teacher/assignments${query.toString() ? `?${query.toString()}` : ''}`;
  return fetchApi(url);
}

export async function fetchTeacherAssignmentDetails(
  assignmentId: string
): Promise<{ success: boolean; assignment: DbAssignment & TeacherAssignmentStats }> {
  return fetchApi(`${API_BASE}/teacher/assignments/${assignmentId}`);
}

export async function createTeacherAssignment(payload: {
  schoolId?: string;
  classLevel: string;
  subjectId: string;
  subjectName?: string;
  chapterId: string;
  chapterNumber?: number;
  chapterTitle: string;
  topicId: string;
  topicTitle: string;
  title: string;
  description?: string;
  assignmentType?: 'mcq' | 'written' | 'mixed';
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  questionCount?: number;
  dueDate?: string;
  allowLateSubmission?: boolean;
  studentTargetMode?: 'class' | 'selected_students';
  targetStudentIds?: string[];
  questions?: DbAssignmentQuestion[];
  status?: 'draft' | 'published';
}): Promise<{ success: boolean; assignment: DbAssignment; message: string }> {
  return fetchApi(`${API_BASE}/teacher/assignments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTeacherAssignment(
  assignmentId: string,
  payload: Partial<DbAssignment>
): Promise<{ success: boolean; assignment: DbAssignment; message: string }> {
  return fetchApi(`${API_BASE}/teacher/assignments/${assignmentId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function publishTeacherAssignment(
  assignmentId: string
): Promise<{ success: boolean; assignment: DbAssignment; message: string }> {
  return fetchApi(`${API_BASE}/teacher/assignments/${assignmentId}/publish`, {
    method: 'POST',
  });
}

export async function closeTeacherAssignment(
  assignmentId: string
): Promise<{ success: boolean; assignment: DbAssignment; message: string }> {
  return fetchApi(`${API_BASE}/teacher/assignments/${assignmentId}/close`, {
    method: 'POST',
  });
}

export async function archiveTeacherAssignment(
  assignmentId: string
): Promise<{ success: boolean; assignment: DbAssignment; message: string }> {
  return fetchApi(`${API_BASE}/teacher/assignments/${assignmentId}/archive`, {
    method: 'POST',
  });
}

export async function deleteTeacherAssignment(
  assignmentId: string
): Promise<{ success: boolean; message: string }> {
  return fetchApi(`${API_BASE}/teacher/assignments/${assignmentId}`, {
    method: 'DELETE',
  });
}

export async function generateAssignmentQuestionsAI(payload: {
  classLevel: string;
  subjectName: string;
  chapterNumber?: number;
  chapterTitle: string;
  topicTitle: string;
  assignmentType?: 'mcq' | 'written' | 'mixed';
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  questionCount?: number;
  language?: string;
}): Promise<{ success: boolean; questions: DbAssignmentQuestion[] }> {
  return fetchApi(`${API_BASE}/teacher/assignments/generate-questions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchAssignmentSubmissionsRoster(
  assignmentId: string
): Promise<{
  success: boolean;
  assignment: Partial<DbAssignment> & TeacherAssignmentStats;
  roster: Array<{
    studentId: string;
    studentName: string;
    studentEmail?: string;
    classLevel: string;
    status: string;
    submissionId?: string;
    startedAt?: string;
    submittedAt?: string;
    totalScore?: number;
    totalPossibleMarks?: number;
    percentage?: number;
    mcqScore?: number;
    writtenScore?: number;
    isLate?: boolean;
    teacherFeedback?: string;
    teacherReviewedAt?: string;
  }>;
}> {
  return fetchApi(`${API_BASE}/teacher/assignments/${assignmentId}/submissions`);
}

export async function fetchStudentSubmissionDetails(
  assignmentId: string,
  studentId: string
): Promise<{
  success: boolean;
  assignment: DbAssignment;
  student: any;
  submission: DbAssignmentSubmission | null;
}> {
  return fetchApi(`${API_BASE}/teacher/assignments/${assignmentId}/submissions/${studentId}`);
}

export async function submitTeacherFeedback(
  assignmentId: string,
  studentId: string,
  feedback: string
): Promise<{ success: boolean; submission: DbAssignmentSubmission; message: string }> {
  return fetchApi(`${API_BASE}/teacher/assignments/${assignmentId}/submissions/${studentId}/feedback`, {
    method: 'POST',
    body: JSON.stringify({ feedback }),
  });
}

// ==========================================
// 🎓 STUDENT ASSIGNMENT API CLIENT
// ==========================================

export async function fetchStudentAssignments(): Promise<{
  success: boolean;
  assignments: StudentAssignmentItem[];
}> {
  return fetchApi(`${API_BASE}/student/assignments`);
}

export async function fetchStudentAssignment(
  assignmentId: string
): Promise<{
  success: boolean;
  assignment: DbAssignment;
  submission: DbAssignmentSubmission | null;
}> {
  return fetchApi(`${API_BASE}/student/assignments/${assignmentId}`);
}

export async function startStudentAssignment(
  assignmentId: string
): Promise<{
  success: boolean;
  assignment: DbAssignment;
  submission: DbAssignmentSubmission;
}> {
  return fetchApi(`${API_BASE}/student/assignments/${assignmentId}/start`, {
    method: 'POST',
  });
}

export async function autosaveStudentAssignment(
  assignmentId: string,
  questionResponses: Record<string, { selectedOption?: string; writtenAnswer?: string; timeSpentSeconds?: number }>
): Promise<{ success: boolean; savedAt: string }> {
  return fetchApi(`${API_BASE}/student/assignments/${assignmentId}/autosave`, {
    method: 'POST',
    body: JSON.stringify({ questionResponses }),
  });
}

export async function submitStudentAssignment(
  assignmentId: string,
  questionResponses: Record<string, { selectedOption?: string; writtenAnswer?: string; timeSpentSeconds?: number }>
): Promise<{
  success: boolean;
  submission: DbAssignmentSubmission;
  assignment: DbAssignment;
  message: string;
}> {
  return fetchApi(`${API_BASE}/student/assignments/${assignmentId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ questionResponses }),
  });
}

export async function fetchStudentAssignmentResult(
  assignmentId: string
): Promise<{
  success: boolean;
  assignment: DbAssignment;
  submission: DbAssignmentSubmission;
}> {
  return fetchApi(`${API_BASE}/student/assignments/${assignmentId}/result`);
}

// ==========================================
// 🏛️ PRINCIPAL & ADMIN ANALYTICS API CLIENT
// ==========================================

export async function fetchPrincipalAssignmentAnalytics(): Promise<{
  success: boolean;
  analytics: PrincipalAssignmentAnalytics;
}> {
  return fetchApi(`${API_BASE}/principal/assignments/analytics`);
}

export async function fetchAdminAssignmentAnalytics(): Promise<{
  success: boolean;
  analytics: AdminAssignmentAnalytics;
}> {
  return fetchApi(`${API_BASE}/admin/assignments/analytics`);
}
