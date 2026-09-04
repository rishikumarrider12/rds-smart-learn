import { getAuthHeaders } from './auth/authService';
import {
  School,
  TeacherAssignment,
  TeacherDashboardData,
  TeacherAssignmentAnalytics,
  PrincipalDashboardData,
  CompanyAdminDashboardData,
} from '../types/organization';
import { UserProfile, AccountStatus } from '../types/auth';
import { StudentAnalyticsOverview } from '../types/analytics';

// Public API
export async function fetchPublicSchools(): Promise<Array<{ id: string; name: string; schoolCode: string; city?: string; district?: string; state?: string }>> {
  const res = await fetch('/api/schools/public');
  if (!res.ok) {
    throw new Error('Failed to fetch schools list');
  }
  const data = await res.json();
  return data.schools || [];
}

// Teacher Portal API
export async function fetchTeacherDashboard(assignmentId?: string): Promise<TeacherDashboardData> {
  const url = assignmentId ? `/api/teacher/dashboard?assignmentId=${encodeURIComponent(assignmentId)}` : '/api/teacher/dashboard';
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch teacher dashboard data');
  }
  return res.json();
}

export async function fetchTeacherAssignmentAnalytics(assignmentId: string): Promise<TeacherAssignmentAnalytics> {
  const res = await fetch(`/api/teacher/assignment/${encodeURIComponent(assignmentId)}/analytics`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch assignment analytics');
  }
  const data = await res.json();
  return data.analytics;
}

export async function fetchTeacherStudentDeepView(
  studentId: string
): Promise<{ student: UserProfile; analytics: StudentAnalyticsOverview }> {
  const res = await fetch(`/api/teacher/students/${encodeURIComponent(studentId)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch student profile');
  }
  return res.json();
}

// Principal Portal API
export async function fetchPrincipalDashboard(): Promise<PrincipalDashboardData> {
  const res = await fetch('/api/principal/dashboard', { headers: getAuthHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch principal dashboard data');
  }
  return res.json();
}

export async function fetchPrincipalStudentDeepView(
  studentId: string
): Promise<{ student: UserProfile; analytics: StudentAnalyticsOverview }> {
  const res = await fetch(`/api/principal/students/${encodeURIComponent(studentId)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch student profile');
  }
  return res.json();
}

// Company Admin Platform API
export async function fetchCompanyAdminDashboard(): Promise<CompanyAdminDashboardData> {
  const res = await fetch('/api/admin/dashboard', { headers: getAuthHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch admin dashboard overview');
  }
  return res.json();
}

export async function fetchAdminSchools(filter?: { status?: AccountStatus; search?: string }): Promise<School[]> {
  const params = new URLSearchParams();
  if (filter?.status) params.append('status', filter.status);
  if (filter?.search) params.append('search', filter.search);

  const res = await fetch(`/api/admin/schools?${params.toString()}`, { headers: getAuthHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch schools list');
  }
  const data = await res.json();
  return data.schools || [];
}

export async function createAdminSchool(data: {
  name: string;
  schoolCode: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  contactEmail?: string;
  contactPhone?: string;
  principalId?: string;
}): Promise<School> {
  const res = await fetch('/api/admin/schools', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create school');
  }
  const resData = await res.json();
  return resData.school;
}

export async function updateAdminSchool(
  schoolId: string,
  data: Partial<School>
): Promise<School> {
  const res = await fetch(`/api/admin/schools/${encodeURIComponent(schoolId)}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update school');
  }
  const resData = await res.json();
  return resData.school;
}

export async function updateAdminSchoolStatus(
  schoolId: string,
  status: AccountStatus
): Promise<School> {
  const res = await fetch(`/api/admin/schools/${encodeURIComponent(schoolId)}/status`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update school status');
  }
  const resData = await res.json();
  return resData.school;
}

export async function assignAdminPrincipal(
  schoolId: string,
  principalId: string
): Promise<{ school: School; principal: UserProfile }> {
  const res = await fetch(`/api/admin/schools/${encodeURIComponent(schoolId)}/principal`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ principalId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to assign principal');
  }
  return res.json();
}

export async function fetchAdminTeacherAssignments(filter?: {
  teacherId?: string;
  schoolId?: string;
  classLevel?: string;
}): Promise<TeacherAssignment[]> {
  const params = new URLSearchParams();
  if (filter?.teacherId) params.append('teacherId', filter.teacherId);
  if (filter?.schoolId) params.append('schoolId', filter.schoolId);
  if (filter?.classLevel) params.append('classLevel', filter.classLevel);

  const res = await fetch(`/api/admin/teacher-assignments?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch teacher assignments');
  }
  const data = await res.json();
  return data.assignments || [];
}

export async function createAdminTeacherAssignment(data: {
  teacherId: string;
  schoolId: string;
  classLevel: string;
  subjectId: string;
  isActive?: boolean;
}): Promise<TeacherAssignment> {
  const res = await fetch('/api/admin/teacher-assignments', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create teacher assignment');
  }
  const resData = await res.json();
  return resData.assignment;
}

export async function updateAdminTeacherAssignment(
  assignmentId: string,
  data: Partial<TeacherAssignment>
): Promise<TeacherAssignment> {
  const res = await fetch(`/api/admin/teacher-assignments/${encodeURIComponent(assignmentId)}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update teacher assignment');
  }
  const resData = await res.json();
  return resData.assignment;
}

export async function deleteAdminTeacherAssignment(assignmentId: string): Promise<boolean> {
  const res = await fetch(`/api/admin/teacher-assignments/${encodeURIComponent(assignmentId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete teacher assignment');
  }
  return true;
}
