import { AccountStatus, UserRole } from './auth';

export interface School {
  id: string;
  name: string;
  schoolCode: string;
  address?: string;
  city?: string;
  district?: string;
  state: string;
  country: string;
  contactEmail?: string;
  contactPhone?: string;
  principalId?: string;
  principalName?: string;
  /** Enriched counts returned by the admin schools API (real database records) */
  totalStudents?: number;
  totalTeachers?: number;
  isActive: boolean;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherAssignment {
  id: string;
  teacherId: string;
  teacherName?: string;
  teacherEmail?: string;
  schoolId: string;
  schoolName?: string;
  classLevel: string;
  subjectId: string;
  subjectName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentNeedingSupport {
  studentId: string;
  studentName: string;
  email?: string;
  classLevel: string;
  schoolId?: string;
  schoolName?: string;
  subjectId?: string;
  subjectName?: string;
  subjectMastery: number;
  overallMastery: number;
  mcqAccuracy: number;
  writtenAccuracy: number;
  totalAttempts: number;
  lastActivityAt: string;
  daysInactive: number;
  supportReason: string;
  flagType: 'low_mastery' | 'weak_tests' | 'inactivity' | 'needs_practice';
  recommendation: string;
}

export interface TeacherAssignmentStudentItem {
  id: string;
  fullName: string;
  email: string;
  classLevel: string;
  schoolId?: string;
  schoolName?: string;
  overallMastery: number;
  subjectMastery: number;
  topicsCompleted: number;
  totalTopics: number;
  mcqAccuracy: number;
  writtenAccuracy: number;
  totalAttempts: number;
  learningStreak: number;
  lastActivityAt: string;
  learningStatus: 'active' | 'steady' | 'needs_practice' | 'inactive';
}

export interface TeacherAssignmentAnalytics {
  assignment: TeacherAssignment;
  totalStudents: number;
  activeStudents: number;
  averageMastery: number;
  averageSyllabusCompletion: number;
  averageMcqAccuracy: number;
  averageWrittenAccuracy: number;
  strongestTopics: Array<{
    topicId: string;
    topicTitle: string;
    chapterTitle: string;
    averageScore: number;
  }>;
  attentionTopics: Array<{
    topicId: string;
    topicTitle: string;
    chapterTitle: string;
    averageScore: number;
    issueCount: number;
  }>;
  studentsNeedingSupport: StudentNeedingSupport[];
  recentActivity: Array<{
    studentId: string;
    studentName: string;
    type: string;
    topicTitle?: string;
    score?: number;
    timestamp: string;
  }>;
  isDemoData?: boolean;
  demoDataNotice?: string;
}

export interface TeacherDashboardData {
  teacher: {
    id: string;
    fullName: string;
    email: string;
    assignedSchools: Array<{ id: string; name: string }>;
    assignedClasses: string[];
    assignedSubjects: Array<{ id: string; name: string }>;
  };
  assignments: TeacherAssignment[];
  currentAssignment?: TeacherAssignment;
  students: TeacherAssignmentStudentItem[];
  analytics: TeacherAssignmentAnalytics;
  isDemoData?: boolean;
  demoDataNotice?: string;
}

export interface PrincipalClassMetric {
  classLevel: string;
  studentCount: number;
  activeStudents: number;
  averageMastery: number;
  averageCompletionPct: number;
  averageMcqAccuracy: number;
  averageWrittenAccuracy: number;
  studentsNeedingSupportCount: number;
}

export interface PrincipalSubjectMetric {
  subjectId: string;
  subjectName: string;
  classesTaught: string[];
  activeLearners: number;
  averageMastery: number;
  completionPercentage: number;
  strongestTopics: Array<{ topicId: string; topicTitle: string; averageScore: number }>;
  weakestTopics: Array<{ topicId: string; topicTitle: string; averageScore: number }>;
}

export interface PrincipalTeacherItem {
  id: string;
  fullName: string;
  email: string;
  status: AccountStatus;
  assignments: TeacherAssignment[];
  assignedClasses: string[];
  assignedSubjects: string[];
  totalAssignedStudents: number;
}

export interface PrincipalDashboardData {
  school: School;
  overview: {
    totalStudents: number;
    activeStudents: number;
    totalTeachers: number;
    totalClassesRepresented: number;
    overallSyllabusCompletion: number;
    overallAverageMastery: number;
    totalTestsCompleted: number;
    totalAiInteractions: number;
  };
  classes: PrincipalClassMetric[];
  subjects: PrincipalSubjectMetric[];
  studentsNeedingSupport: StudentNeedingSupport[];
  teachers: PrincipalTeacherItem[];
  recentActivity: Array<{
    id: string;
    studentId: string;
    studentName: string;
    classLevel: string;
    type: string;
    subjectName?: string;
    topicTitle?: string;
    timestamp: string;
  }>;
}

export interface CompanyAdminDashboardData {
  overview: {
    totalSchools: number;
    activeSchools: number;
    suspendedSchools: number;
    totalStudents: number;
    totalTeachers: number;
    totalPrincipals: number;
    totalCompanyAdmins: number;
    activeUsers: number;
    totalLearningEvents: number;
    totalTestsCompleted: number;
    recentRegistrationsCount: number;
  };
  schools: School[];
  recentUsers: Array<{
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    schoolName?: string;
    classLevel?: string;
    status: AccountStatus;
    createdAt: string;
  }>;
}
