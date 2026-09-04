export type UserRole =
  | 'student'
  | 'teacher'
  | 'principal'
  | 'company_admin';

export type AccountStatus =
  | 'active'
  | 'inactive'
  | 'suspended';

export interface UserProfile {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  mobileNumber?: string;
  schoolId?: string;
  schoolName?: string;
  classLevel?: string; // 'Class 6' | 'Class 7' | 'Class 8' | 'Class 9' | 'Class 10'
  assignedClasses?: string[]; // For teachers, e.g. ['Class 9', 'Class 10']
  assignedSubjects?: string[];
  referenceName?: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  token: string;
  user: UserProfile;
  expiresAt: string;
}

export interface SignupInput {
  fullName: string;
  schoolId?: string;
  schoolName: string;
  classLevel: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  referenceName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateAccountByAdminInput {
  role: UserRole;
  fullName: string;
  email: string;
  mobileNumber?: string;
  schoolName?: string;
  schoolId?: string;
  assignedClasses?: string[]; // For teachers
  assignedSubjects?: string[];
  password?: string;
  initialPassword?: string;
  status?: AccountStatus;
}

export interface MigrationPayload {
  studentProfile?: any;
  mcqAttempts?: any[];
  writtenAttempts?: any[];
  aiConversations?: any[];
}
