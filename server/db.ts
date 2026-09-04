import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getSyllabusForClass } from '../src/data/syllabusData';

export type UserRole = 'student' | 'teacher' | 'principal' | 'company_admin';
export type AccountStatus = 'active' | 'inactive' | 'suspended';

/**
 * Normalizes a subject name into a stable comparison key
 * (lowercase, whitespace collapsed to underscores) — matches the legacy
 * subjectId mangling used when teacher assignments were created.
 */
export function normalizeSubjectKey(name: string): string {
  return String(name).trim().toLowerCase().replace(/\s+/g, '_');
}

/**
 * Resolves a requested subject (display name, mangled legacy id, or real
 * curriculum id) against the official class syllabus.
 * Returns the real curriculum subjectId + display name when the subject is a
 * standard curriculum subject; custom "Other Subject" values keep a stable
 * custom key and their original display name.
 */
export function resolveCurriculumSubject(
  classLevel: string,
  subjectNameOrId: string
): { subjectId: string; subjectName: string; isCustom: boolean } {
  const raw = String(subjectNameOrId || '').trim();
  if (!raw) return { subjectId: 'custom_subject', subjectName: 'Unspecified', isCustom: true };
  const syllabus = getSyllabusForClass(classLevel as any);
  // 1. Real curriculum subject id (e.g. 'c9-tel')
  const byId = syllabus.subjects.find((s) => s.id.toLowerCase() === raw.toLowerCase());
  if (byId) return { subjectId: byId.id, subjectName: byId.name, isCustom: false };
  // 2. Subject display-name match (case-insensitive / mangled key)
  const key = normalizeSubjectKey(raw);
  const byName = syllabus.subjects.find(
    (s) => normalizeSubjectKey(s.name) === key || s.name.toLowerCase() === raw.toLowerCase()
  );
  if (byName) return { subjectId: byName.id, subjectName: byName.name, isCustom: false };
  // 3. Custom "Other Subject" — isolated from the standard syllabus
  return { subjectId: key || 'custom_subject', subjectName: raw, isCustom: true };
}

/**
 * Read-path resolver: determines the proper subjectId + display name for an
 * existing teacher-assignment record. Fixes legacy records whose subjectId
 * stored a mangled subject name (e.g. 'telugu_(తెలుగు_-_ప్రథమ_భాష)') without
 * requiring any data migration.
 */
export function resolveSubjectDisplayName(
  classLevel: string,
  subjectId: string,
  storedSubjectName?: string
): { subjectId: string; subjectName: string } {
  const syllabus = getSyllabusForClass(classLevel as any);
  const raw = String(subjectId || '');
  const byId = syllabus.subjects.find((s) => s.id.toLowerCase() === raw.toLowerCase());
  if (byId) return { subjectId: byId.id, subjectName: byId.name };
  const byName = syllabus.subjects.find((s) => normalizeSubjectKey(s.name) === normalizeSubjectKey(raw));
  if (byName) return { subjectId: byName.id, subjectName: byName.name };
  return { subjectId: raw, subjectName: storedSubjectName || raw };
}

export interface DbUser {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  passwordHash: string;
  salt: string;
  mobileNumber?: string;
  schoolId?: string;
  schoolName?: string;
  classLevel?: string;
  assignedClasses?: string[];
  assignedSubjects?: string[];
  referenceName?: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DbSchool {
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
  contactMobile?: string;
  principalId?: string;
  isActive: boolean;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DbTeacherAssignment {
  id: string;
  teacherId: string;
  schoolId: string;
  classLevel: string; // e.g. 'Class 10'
  subjectId: string; // curriculum id (e.g. 'c10-maths') or custom key for Other Subjects
  subjectName?: string; // display name (curriculum name or approved Other Subject)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbSession {
  token: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  lastActiveAt?: string;
}

export interface DbPasswordReset {
  token: string;
  email: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
  ipAddress?: string;
}

export type TeacherRequestStatus = 'pending' | 'approved' | 'rejected';

/**
 * Permission-based teacher signup request.
 * A request does NOT create a usable account — a real teacher User row is only
 * created when a company_admin (Super Admin) approves the request.
 */
export interface DbTeacherRequest {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  employeeId?: string;
  qualification?: string;
  passwordHash: string;
  salt: string;
  schoolId?: string;
  schoolName: string;
  requestedClasses: string[];
  requestedSubjects: string[];
  otherSubject?: string;
  status: TeacherRequestStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface DbAiConversation {
  id: string;
  userId: string;
  classLevel: string;
  subjectId: string;
  chapterId: string;
  topicId: string;
  language: string;
  messages: any[];
  createdAt: string;
  updatedAt: string;
}

export interface DbMcqAttempt {
  id: string;
  userId: string;
  classLevel: string;
  subjectId: string;
  chapterId: string;
  topicId: string;
  data: any;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbWrittenAttempt {
  id: string;
  userId: string;
  classLevel: string;
  subjectId: string;
  chapterId: string;
  topicId: string;
  data: any;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbAiUsage {
  userId: string;
  date: string; // Format: YYYY-MM-DD
  requestCount: number;
  lastRequestAt: string;
}

export interface DbLearningEvent {
  id: string;
  userId: string;
  type: string;
  classLevel?: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface DbTopicProgress {
  id: string;
  userId: string;
  classLevel: string;
  subjectId: string;
  chapterId: string;
  topicId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  lessonCompleted: boolean;
  mcqAttempts: number;
  writtenAttempts: number;
  bestMcqScore?: number;
  latestMcqScore?: number;
  previousBestMcqScore?: number;
  bestWrittenScore?: number;
  latestWrittenScore?: number;
  previousBestWrittenScore?: number;
  masteryScore: number;
  lastActivityAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface DbStudentAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  createdAt: string;
}

export interface DbLearningStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  activeDates: string[];  // ['YYYY-MM-DD']
  updatedAt: string;
}

export interface DbAssignmentQuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface DbAssignmentQuestion {
  id: string;
  type: 'mcq' | 'written';
  question: string;
  marks: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  // MCQ fields
  options?: DbAssignmentQuestionOption[];
  correctAnswer?: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  concept?: string;
  // Written fields
  keyPoints?: string[];
  modelAnswer?: string;
  evaluationCriteria?: string;
  questionType?: 'short' | 'long';
}

export interface DbAssignment {
  id: string;
  teacherId: string;
  schoolId: string;
  classLevel: string;
  subjectId: string;
  chapterId: string;
  chapterNumber?: number;
  chapterTitle?: string;
  topicId: string;
  topicTitle?: string;
  title: string;
  description?: string;
  assignmentType: 'mcq' | 'written' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionCount: number;
  status: 'draft' | 'published' | 'closed' | 'archived';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  dueDate?: string;
  allowLateSubmission: boolean;
  studentTargetMode: 'class' | 'selected_students';
  targetStudentIds?: string[];
  questions: DbAssignmentQuestion[];
  totalPossibleMarks: number;
  metadata?: Record<string, any>;
}

export interface DbAssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  schoolId: string;
  classLevel: string;
  subjectId: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'evaluated' | 'late';
  startedAt?: string;
  submittedAt?: string;
  updatedAt: string;
  mcqScore?: number;
  mcqTotal?: number;
  writtenScore?: number;
  writtenTotal?: number;
  totalScore?: number;
  totalPossibleMarks?: number;
  percentage?: number;
  questionResponses: Record<string, {
    selectedOption?: string;
    writtenAnswer?: string;
    timeSpentSeconds?: number;
  }>;
  evaluationData?: {
    mcqResults?: any[];
    writtenResults?: any[];
    overallSummary?: string;
    strengths?: string[];
    areasToImprove?: string[];
  };
  teacherFeedback?: string;
  teacherReviewedAt?: string;
  teacherReviewedBy?: string;
  isLate: boolean;
  attemptNumber: number;
}

export interface DatabaseSchema {
  version: number;
  users: DbUser[];
  schools: DbSchool[];
  teacherAssignments: DbTeacherAssignment[];
  assignments: DbAssignment[];
  assignmentSubmissions: DbAssignmentSubmission[];
  sessions: DbSession[];
  passwordResets: DbPasswordReset[];
  teacherAccountRequests: DbTeacherRequest[];
  aiConversations: DbAiConversation[];
  mcqAttempts: DbMcqAttempt[];
  writtenAttempts: DbWrittenAttempt[];
  aiUsage: DbAiUsage[];
  learningEvents: DbLearningEvent[];
  topicProgress: DbTopicProgress[];
  achievements: DbStudentAchievement[];
  learningStreaks: DbLearningStreak[];
  migrationMetadata?: {
    migratedAt?: string;
    lastBackupFile?: string;
    schemaVersion?: number;
  };
}

const DB_DIR = path.join(process.cwd(), '.rds_cloud_data');
const BACKUPS_DIR = path.join(DB_DIR, 'backups');
const DB_FILE = path.join(DB_DIR, 'rds_database.json');
const DB_TMP_FILE = path.join(DB_DIR, 'rds_database.tmp.json');

const INITIAL_DB: DatabaseSchema = {
  version: 6,
  users: [],
  schools: [],
  teacherAssignments: [],
  assignments: [],
  assignmentSubmissions: [],
  sessions: [],
  passwordResets: [],
  teacherAccountRequests: [],
  aiConversations: [],
  mcqAttempts: [],
  writtenAttempts: [],
  aiUsage: [],
  learningEvents: [],
  topicProgress: [],
  achievements: [],
  learningStreaks: [],
  migrationMetadata: {
    schemaVersion: 6,
  },
};

/**
 * Production-ready Persistent Database Engine with Automated Backup,
 * Atomic File Locking, and Role-Based User Data Isolation.
 */
export class CloudDatabase {
  private db: DatabaseSchema;
  private isInitialized = false;

  constructor() {
    this.db = { ...INITIAL_DB };
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (!fs.existsSync(BACKUPS_DIR)) {
        fs.mkdirSync(BACKUPS_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);

        // Perform safe backup before migration or startup
        this.createBackupSync(raw);

        // Auto-migrate schema if needed
        this.db = this.migrateSchema(parsed);
      } else {
        this.persist();
      }

      this.isInitialized = true;
      this.bootstrapAdmin();
      this.initializeRealEnvironment();
    } catch (err) {
      console.error('[CloudDatabase] Initialization error, using in-memory store:', err);
      this.db = { ...INITIAL_DB };
      this.bootstrapAdmin();
      this.initializeRealEnvironment();
    }
  }

  /**
   * Creates an automated, immutable backup of the database
   */
  private createBackupSync(rawContent: string): string | null {
    try {
      if (!fs.existsSync(BACKUPS_DIR)) {
        fs.mkdirSync(BACKUPS_DIR, { recursive: true });
      }
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(BACKUPS_DIR, `rds_db_backup_${timestamp}.json`);
      fs.writeFileSync(backupPath, rawContent, 'utf-8');
      
      // Clean old backups keeping the 10 most recent
      const files = fs.readdirSync(BACKUPS_DIR)
        .filter((f) => f.startsWith('rds_db_backup_') && f.endsWith('.json'))
        .sort();
      if (files.length > 10) {
        for (const oldFile of files.slice(0, files.length - 10)) {
          try {
            fs.unlinkSync(path.join(BACKUPS_DIR, oldFile));
          } catch (_) {}
        }
      }
      return backupPath;
    } catch (e) {
      console.warn('[CloudDatabase] Could not create backup snapshot:', e);
      return null;
    }
  }

  /**
   * Safe, Idempotent Database Schema Migration (v1/v2/v3 -> v4)
   */
  private migrateSchema(loadedData: any): DatabaseSchema {
    const version = loadedData.version || 1;

    // 1. Schools migration - enrich existing schools with schoolCode, city, district, state, country, isActive
    let existingSchools: DbSchool[] = [];
    if (Array.isArray(loadedData.schools) && loadedData.schools.length > 0) {
      existingSchools = loadedData.schools.map((s: any, idx: number) => {
        const code = s.schoolCode || `TS-SCH-${String(idx + 1).padStart(3, '0')}`;
        return {
          id: s.id || `sch_ts_${idx + 1}`,
          name: s.name || 'Telangana Institution',
          schoolCode: code,
          address: s.address !== undefined ? s.address : 'Telangana, India',
          city: s.city !== undefined ? s.city : 'Hyderabad',
          district: s.district !== undefined ? s.district : 'Hyderabad',
          state: s.state !== undefined && s.state ? s.state : 'Telangana',
          country: s.country !== undefined && s.country ? s.country : 'India',
          contactEmail: s.contactEmail !== undefined ? s.contactEmail : '',
          contactPhone: s.contactPhone !== undefined ? s.contactPhone : (s.contactMobile || ''),
          contactMobile: s.contactMobile || s.contactPhone || '',
          principalId: s.principalId || undefined,
          isActive: s.isActive !== undefined ? Boolean(s.isActive) : s.status !== 'suspended' && s.status !== 'inactive',
          status: s.status || 'active',
          createdAt: s.createdAt || new Date().toISOString(),
          updatedAt: s.updatedAt || s.createdAt || new Date().toISOString(),
        };
      });
    }

    // 2. Users migration - match schoolId if schoolName matches known schools, preserve existing data
    const existingUsers: DbUser[] = Array.isArray(loadedData.users)
      ? loadedData.users.map((u: any) => {
          let schoolId = u.schoolId;
          let schoolName = u.schoolName;

          if (!schoolId && schoolName && existingSchools.length > 0) {
            const matched = existingSchools.find(
              (s) => s.name.trim().toLowerCase() === schoolName.trim().toLowerCase()
            );
            if (matched) {
              schoolId = matched.id;
              schoolName = matched.name;
            }
          }

          return {
            ...u,
            schoolId,
            schoolName,
            status: u.status || 'active',
            updatedAt: u.updatedAt || u.createdAt || new Date().toISOString(),
          };
        })
      : [];

    // 3. Teacher assignments migration - convert existing teacher assignedClasses & assignedSubjects to teacherAssignments
    let existingAssignments: DbTeacherAssignment[] = Array.isArray(loadedData.teacherAssignments)
      ? loadedData.teacherAssignments
      : [];

    // Auto-generate teacher assignments only for teachers who have a valid assigned schoolId in existingSchools
    const teachers = existingUsers.filter((u) => u.role === 'teacher');
    for (const t of teachers) {
      const hasAssignments = existingAssignments.some((a) => a.teacherId === t.id);
      if (!hasAssignments && t.schoolId) {
        const schoolExists = existingSchools.some((s) => s.id === t.schoolId);
        if (schoolExists) {
          const classes = t.assignedClasses && t.assignedClasses.length > 0 ? t.assignedClasses : ['Class 10'];
          const subjects = t.assignedSubjects && t.assignedSubjects.length > 0 ? t.assignedSubjects : ['mathematics'];

          for (const cls of classes) {
            for (const sub of subjects) {
              existingAssignments.push({
                id: `asgn_${crypto.randomUUID().slice(0, 8)}`,
                teacherId: t.id,
                schoolId: t.schoolId,
                classLevel: cls,
                subjectId: sub.toLowerCase().replace(/\s+/g, '_'),
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
          }
        }
      }
    }

    // 4. Principal linkage - link principal to school if matched
    const principals = existingUsers.filter((u) => u.role === 'principal');
    for (const p of principals) {
      if (p.schoolId) {
        const sch = existingSchools.find((s) => s.id === p.schoolId);
        if (sch && !sch.principalId) {
          sch.principalId = p.id;
        }
      } else if (p.schoolName) {
        const sch = existingSchools.find(
          (s) => s.name.trim().toLowerCase() === p.schoolName?.trim().toLowerCase()
        );
        if (sch) {
          p.schoolId = sch.id;
          if (!sch.principalId) sch.principalId = p.id;
        }
      }
    }

    const migrated: DatabaseSchema = {
      version: 6,
      users: existingUsers,
      schools: existingSchools,
      teacherAssignments: existingAssignments,
      assignments: Array.isArray(loadedData.assignments) ? loadedData.assignments : [],
      assignmentSubmissions: Array.isArray(loadedData.assignmentSubmissions) ? loadedData.assignmentSubmissions : [],
      sessions: Array.isArray(loadedData.sessions) ? loadedData.sessions : [],
      passwordResets: Array.isArray(loadedData.passwordResets) ? loadedData.passwordResets : [],
      teacherAccountRequests: Array.isArray(loadedData.teacherAccountRequests) ? loadedData.teacherAccountRequests : [],
      aiConversations: Array.isArray(loadedData.aiConversations) ? loadedData.aiConversations : [],
      mcqAttempts: Array.isArray(loadedData.mcqAttempts) ? loadedData.mcqAttempts : [],
      writtenAttempts: Array.isArray(loadedData.writtenAttempts) ? loadedData.writtenAttempts : [],
      aiUsage: Array.isArray(loadedData.aiUsage) ? loadedData.aiUsage : [],
      learningEvents: Array.isArray(loadedData.learningEvents) ? loadedData.learningEvents : [],
      topicProgress: Array.isArray(loadedData.topicProgress) ? loadedData.topicProgress : [],
      achievements: Array.isArray(loadedData.achievements) ? loadedData.achievements : [],
      learningStreaks: Array.isArray(loadedData.learningStreaks) ? loadedData.learningStreaks : [],
      migrationMetadata: {
        schemaVersion: 6,
        migratedAt: new Date().toISOString(),
      },
    };

    if (version < 6) {
      console.log(`[CloudDatabase] Migrated database schema from v${version} to v6 (Teacher Approval Workflow) successfully.`);
      this.persistDirect(migrated);
    }

    return migrated;
  }

  /**
   * Atomic file persistence to prevent file corruption during sudden restarts
   */
  private persist() {
    this.persistDirect(this.db);
  }

  private persistDirect(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      // Write to temp file first, then atomically rename
      const jsonStr = JSON.stringify(data, null, 2);
      fs.writeFileSync(DB_TMP_FILE, jsonStr, 'utf-8');
      fs.renameSync(DB_TMP_FILE, DB_FILE);
    } catch (err) {
      console.error('[CloudDatabase] Atomic persist error:', err);
    }
  }

  /**
   * PBKDF2 Password Hashing with SHA-512 and 100,000 iterations
   */
  public hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const s = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, s, 100000, 64, 'sha512').toString('hex');
    return { hash, salt: s };
  }

  public verifyPassword(password: string, hash: string, salt: string): boolean {
    try {
      const { hash: calculated } = this.hashPassword(password, salt);
      return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(calculated, 'hex'));
    } catch (e) {
      return false;
    }
  }

  /**
   * Automatically bootstrap an initial Company Admin account if none exists
   */
  private bootstrapAdmin() {
    const adminExists = this.db.users.some((u) => u.role === 'company_admin');
    if (!adminExists) {
      const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
      const adminPassword = process.env.ADMIN_INIT_PASSWORD;
      if (!adminEmail || !adminPassword) {
        console.warn('[CloudDatabase] Skipping Company Admin bootstrap: ADMIN_EMAIL and ADMIN_INIT_PASSWORD must be configured.');
        return;
      }
      const { hash, salt } = this.hashPassword(adminPassword);

      const superAdmin: DbUser = {
        id: 'usr_admin_' + crypto.randomUUID().slice(0, 8),
        role: 'company_admin',
        fullName: 'RDS System Administrator',
        email: adminEmail,
        passwordHash: hash,
        salt,
        status: 'active',
        schoolName: 'Rishi Digital Solutions HQ',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.db.users.push(superAdmin);
      this.persist();
      console.log(`[CloudDatabase] Bootstrapped Company Admin account: ${adminEmail}`);
    }
  }

  /**
   * Returns true when the deterministic demonstration environment is explicitly enabled
   * via the RDS_DEMO_MODE environment variable. By default (and for the real Slate High
   * School deployment) demo/sample data is NEVER seeded.
   */
  private demoModeEnabled(): boolean {
    return process.env.RDS_DEMO_MODE === 'true';
  }

  /**
   * Initializes the real school environment.
   *
   * - When RDS_DEMO_MODE === 'true', the optional demonstration cohort (for development
   *   testing only) is seeded. This is NEVER the default.
   * - Otherwise, any previously-seeded demo/sample records are purged and the first real
   *   organization (Slate High School) is configured so the platform starts with genuine
   *   administrator-created data only.
   */
  private initializeRealEnvironment() {
    if (this.demoModeEnabled()) {
      this.bootstrapDemoData();
      return;
    }
    this.purgeDemoData();
    this.bootstrapSlateHighSchool();
  }

  /**
   * Removes all demonstration/sample records (demo school, demo users, generated
   * statistics, assessments, streaks, attempts) from the persisted database so the
   * default environment contains only genuine, administrator-created school data.
   */
  private purgeDemoData() {
    const demoSchoolIds = new Set(
      this.db.schools
        .filter((s) => s.id.toLowerCase().includes('demo') || /demo/i.test(s.name))
        .map((s) => s.id)
    );
    const demoUserIds = new Set(
      this.db.users
        .filter(
          (u) =>
            u.id.toLowerCase().includes('demo') ||
            (u.schoolId && demoSchoolIds.has(u.schoolId)) ||
            /demo/i.test(u.schoolName || '')
        )
        .map((u) => u.id)
    );

    const beforeUsers = this.db.users.length;
    const beforeSchools = this.db.schools.length;

    this.db.schools = this.db.schools.filter((s) => !demoSchoolIds.has(s.id));
    this.db.users = this.db.users.filter((u) => !demoUserIds.has(u.id));
    // Remove sessions for users/schools that no longer exist (orphaned after purge)
    const retainedUserIds = new Set(this.db.users.map((u) => u.id));
    this.db.sessions = this.db.sessions.filter((s) => retainedUserIds.has(s.userId));
    this.db.teacherAssignments = this.db.teacherAssignments.filter(
      (a) => !demoUserIds.has(a.teacherId) && !demoSchoolIds.has(a.schoolId)
    );
    this.db.assignments = (this.db.assignments || []).filter(
      (a) => !demoSchoolIds.has(a.schoolId) && !demoUserIds.has(a.teacherId)
    );
    this.db.assignmentSubmissions = (this.db.assignmentSubmissions || []).filter(
      (s) => !demoUserIds.has(s.studentId) && !demoSchoolIds.has(s.schoolId)
    );
    this.db.topicProgress = (this.db.topicProgress || []).filter((tp) => !demoUserIds.has(tp.userId));
    this.db.learningStreaks = (this.db.learningStreaks || []).filter((ls) => !demoUserIds.has(ls.userId));
    this.db.achievements = (this.db.achievements || []).filter((a) => !demoUserIds.has(a.userId));
    this.db.mcqAttempts = (this.db.mcqAttempts || []).filter((m) => !demoUserIds.has(m.userId));
    this.db.writtenAttempts = (this.db.writtenAttempts || []).filter((w) => !demoUserIds.has(w.userId));
    this.db.aiConversations = (this.db.aiConversations || []).filter((c) => !demoUserIds.has(c.userId));
    this.db.learningEvents = (this.db.learningEvents || []).filter((e) => !demoUserIds.has(e.userId));
    this.db.aiUsage = (this.db.aiUsage || []).filter((u) => !demoUserIds.has(u.userId));

    if (beforeUsers !== this.db.users.length || beforeSchools !== this.db.schools.length) {
      this.persist();
      console.log(
        '[CloudDatabase] Purged demonstration/sample records. The platform now uses only genuine school data.'
      );
    }
  }

  /**
   * Configures the first real organization: Slate High School.
   * Only the school name is set by default — no real contact information is invented.
   */
  private bootstrapSlateHighSchool() {
    const existing = this.db.schools.find(
      (s) => s.name.trim().toLowerCase() === 'slate high school' || s.schoolCode === 'SLATE-HS-01'
    );
    if (existing) return;

    this.db.schools.push({
      id: 'sch_slate_hs_01',
      name: 'Slate High School',
      schoolCode: 'SLATE-HS-01',
      address: '',
      city: '',
      district: '',
      state: 'Telangana',
      country: 'India',
      contactEmail: '',
      contactPhone: '',
      principalId: undefined,
      isActive: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    this.persist();
    console.log('[CloudDatabase] Configured the first real organization: Slate High School.');
  }

  /**
   * Real (non-fabricated) platform-wide counters used by analytics dashboards.
   */
  public getLearningEventCount(): number {
    return Array.isArray(this.db.learningEvents) ? this.db.learningEvents.length : 0;
  }

  /**
   * Deterministic Demonstration Environment & Sample Academic Records
   * (Enabled ONLY when RDS_DEMO_MODE === 'true' — never the default system experience.)
   * Used for school leadership demonstrations without mixing with live school data.
   */
  private bootstrapDemoData() {
    const DEMO_SCHOOL_ID = 'sch_ts_demo_01';
    const DEMO_SCHOOL_NAME = 'Telangana Model School (Demo Campus)';

    // 1. Ensure Demo School Exists
    let demoSchool = this.db.schools.find((s) => s.id === DEMO_SCHOOL_ID);
    if (!demoSchool) {
      demoSchool = {
        id: DEMO_SCHOOL_ID,
        name: DEMO_SCHOOL_NAME,
        schoolCode: 'TS-DEMO-001',
        address: 'Road No. 12, Banjara Hills',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        contactEmail: 'contact@tsmodel.edu.in',
        contactPhone: '+91 40 2333 4455',
        contactMobile: '+91 98490 12345',
        principalId: 'usr_principal_demo_01',
        isActive: true,
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
      };
      this.db.schools.push(demoSchool);
    }

    // 2. Demo Principal
    if (!this.db.users.some((u) => u.email.toLowerCase() === 'principal@tsmodel.edu.in')) {
      const { hash, salt } = this.hashPassword('Principal@RDS2026');
      this.db.users.push({
        id: 'usr_principal_demo_01',
        role: 'principal',
        fullName: 'Dr. K. V. Raman (Principal)',
        email: 'principal@tsmodel.edu.in',
        passwordHash: hash,
        salt,
        status: 'active',
        schoolId: DEMO_SCHOOL_ID,
        schoolName: DEMO_SCHOOL_NAME,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
      });
    }

    // 3. Demo Teacher
    const DEMO_TEACHER_ID = 'usr_teacher_demo_01';
    if (!this.db.users.some((u) => u.email.toLowerCase() === 'teacher@tsmodel.edu.in')) {
      const { hash, salt } = this.hashPassword('Teacher@RDS2026');
      this.db.users.push({
        id: DEMO_TEACHER_ID,
        role: 'teacher',
        fullName: 'Mrs. Sunitha Devi (Senior Faculty)',
        email: 'teacher@tsmodel.edu.in',
        passwordHash: hash,
        salt,
        status: 'active',
        schoolId: DEMO_SCHOOL_ID,
        schoolName: DEMO_SCHOOL_NAME,
        assignedClasses: ['Class 10', 'Class 9'],
        assignedSubjects: ['c10-maths', 'c10-phy-sci', 'c9-maths'],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
      });
    }

    // 4. Demo Teacher Assignments
    const defaultAsgns: Omit<DbTeacherAssignment, 'createdAt' | 'updatedAt'>[] = [
      {
        id: 'asgn_demo_10_math',
        teacherId: DEMO_TEACHER_ID,
        schoolId: DEMO_SCHOOL_ID,
        classLevel: 'Class 10',
        subjectId: 'c10-maths',
        isActive: true,
      },
      {
        id: 'asgn_demo_10_phy',
        teacherId: DEMO_TEACHER_ID,
        schoolId: DEMO_SCHOOL_ID,
        classLevel: 'Class 10',
        subjectId: 'c10-phy-sci',
        isActive: true,
      },
      {
        id: 'asgn_demo_9_math',
        teacherId: DEMO_TEACHER_ID,
        schoolId: DEMO_SCHOOL_ID,
        classLevel: 'Class 9',
        subjectId: 'c9-maths',
        isActive: true,
      },
    ];

    for (const asgn of defaultAsgns) {
      if (!this.db.teacherAssignments.some((a) => a.id === asgn.id)) {
        this.db.teacherAssignments.push({
          ...asgn,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 5. Demo Students (Cohort of 8 realistic TS SCERT learners)
    const demoStudentsConfig = [
      {
        id: 'usr_stu_demo_01',
        name: 'Rahul Sharma',
        email: 'rahul.s@tsmodel.edu.in',
        persona: 'Strong Performer',
        streak: 14,
        daysAgoActive: 0,
        mathMastery: 88,
        mathMcq: 92,
        mathWritten: 85,
        topicsDone: ['t-1-1', 't-1-2', 't-2-1', 't-2-2', 't-3-1', 't-3-2', 't-4-1', 't-5-1'],
        weakTopic: undefined,
      },
      {
        id: 'usr_stu_demo_02',
        name: 'Priya Reddy',
        email: 'priya.r@tsmodel.edu.in',
        persona: 'Steady Learner',
        streak: 6,
        daysAgoActive: 1,
        mathMastery: 72,
        mathMcq: 70,
        mathWritten: 74,
        topicsDone: ['t-1-1', 't-1-2', 't-2-1', 't-3-1', 't-4-1'],
        weakTopic: undefined,
      },
      {
        id: 'usr_stu_demo_03',
        name: 'K. Sai Kiran',
        email: 'saikiran.k@tsmodel.edu.in',
        persona: 'Weak Concepts (Needs Attention)',
        streak: 2,
        daysAgoActive: 2,
        mathMastery: 46,
        mathMcq: 42,
        mathWritten: 40,
        topicsDone: ['t-1-1', 't-5-1'],
        weakTopic: 'Quadratic Equations & Roots',
      },
      {
        id: 'usr_stu_demo_04',
        name: 'Ananya Rao',
        email: 'ananya.r@tsmodel.edu.in',
        persona: 'Showing Improvement',
        streak: 8,
        daysAgoActive: 0,
        mathMastery: 68,
        mathMcq: 78,
        mathWritten: 65,
        topicsDone: ['t-1-1', 't-1-2', 't-2-1', 't-3-1'],
        weakTopic: undefined,
      },
      {
        id: 'usr_stu_demo_05',
        name: 'M. Vikram',
        email: 'vikram.m@tsmodel.edu.in',
        persona: 'Low Engagement (Inactive)',
        streak: 0,
        daysAgoActive: 12,
        mathMastery: 40,
        mathMcq: 38,
        mathWritten: 0,
        topicsDone: ['t-1-1'],
        weakTopic: undefined,
      },
      {
        id: 'usr_stu_demo_06',
        name: 'Sneha Patel',
        email: 'sneha.p@tsmodel.edu.in',
        persona: 'Requires Academic Support',
        streak: 1,
        daysAgoActive: 3,
        mathMastery: 38,
        mathMcq: 35,
        mathWritten: 30,
        topicsDone: ['t-1-1'],
        weakTopic: 'Real Numbers & Divisibility',
      },
      {
        id: 'usr_stu_demo_07',
        name: 'G. Tharun Kumar',
        email: 'tharun.g@tsmodel.edu.in',
        persona: 'Steady Learner',
        streak: 7,
        daysAgoActive: 1,
        mathMastery: 76,
        mathMcq: 78,
        mathWritten: 72,
        topicsDone: ['t-1-1', 't-1-2', 't-2-1', 't-2-2', 't-3-1'],
        weakTopic: undefined,
      },
      {
        id: 'usr_stu_demo_08',
        name: 'D. Kavya Sri',
        email: 'kavya.d@tsmodel.edu.in',
        persona: 'Top Active Performer',
        streak: 12,
        daysAgoActive: 0,
        mathMastery: 91,
        mathMcq: 95,
        mathWritten: 88,
        topicsDone: ['t-1-1', 't-1-2', 't-2-1', 't-2-2', 't-3-1', 't-3-2', 't-4-1', 't-5-1', 't-6-1'],
        weakTopic: undefined,
      },
    ];

    const studentDefaultPass = 'Student@RDS2026';
    const { hash: stuHash, salt: stuSalt } = this.hashPassword(studentDefaultPass);

    for (const cfg of demoStudentsConfig) {
      if (!this.db.users.some((u) => u.id === cfg.id || u.email.toLowerCase() === cfg.email.toLowerCase())) {
        const lastActiveDate = new Date(Date.now() - cfg.daysAgoActive * 24 * 60 * 60 * 1000).toISOString();

        this.db.users.push({
          id: cfg.id,
          role: 'student',
          fullName: cfg.name,
          email: cfg.email,
          passwordHash: stuHash,
          salt: stuSalt,
          status: 'active',
          schoolId: DEMO_SCHOOL_ID,
          schoolName: DEMO_SCHOOL_NAME,
          classLevel: 'Class 10',
          createdAt: '2026-01-05T00:00:00.000Z',
          updatedAt: lastActiveDate,
        });

        // Seed Streak
        const existingStreak = this.db.learningStreaks.find((s) => s.userId === cfg.id);
        if (!existingStreak) {
          this.db.learningStreaks.push({
            userId: cfg.id,
            currentStreak: cfg.streak,
            longestStreak: Math.max(cfg.streak, 10),
            totalActiveDays: cfg.streak * 2 + 5,
            lastActiveDate: lastActiveDate.split('T')[0],
            activeDates: [lastActiveDate.split('T')[0]],
            updatedAt: lastActiveDate,
          });
        }

        // Seed Topic Progress in Class 10 Maths
        for (const topId of cfg.topicsDone) {
          const tpId = `tp_${cfg.id}_${topId}`;
          if (!this.db.topicProgress.some((p) => p.id === tpId)) {
            this.db.topicProgress.push({
              id: tpId,
              userId: cfg.id,
              classLevel: 'Class 10',
              subjectId: 'c10-maths',
              chapterId: 'c10-math-ch1',
              topicId: topId,
              status: 'completed',
              lessonCompleted: true,
              masteryScore: cfg.mathMastery,
              mcqAttempts: 2,
              writtenAttempts: cfg.mathWritten > 0 ? 1 : 0,
              bestMcqScore: cfg.mathMcq,
              latestMcqScore: cfg.mathMcq,
              bestWrittenScore: cfg.mathWritten,
              latestWrittenScore: cfg.mathWritten,
              lastActivityAt: lastActiveDate,
              completedAt: lastActiveDate,
              updatedAt: lastActiveDate,
            });
          }
        }

        // Seed MCQ Attempt
        const mcqId = `mcq_demo_${cfg.id}_01`;
        if (!this.db.mcqAttempts.some((m) => m.id === mcqId)) {
          this.db.mcqAttempts.push({
            id: mcqId,
            userId: cfg.id,
            classLevel: 'Class 10',
            subjectId: 'c10-maths',
            chapterId: 'c10-math-ch1',
            topicId: 't-1-1',
            status: 'completed',
            data: {
              topicTitle: 'Euclid Division Lemma & Fundamental Theorem',
              difficulty: 'medium',
              totalQuestions: 5,
              score: Math.round((cfg.mathMcq / 100) * 5),
              percentage: cfg.mathMcq,
              result: {
                totalQuestions: 5,
                score: Math.round((cfg.mathMcq / 100) * 5),
                percentage: cfg.mathMcq,
                correctCount: Math.round((cfg.mathMcq / 100) * 5),
                incorrectCount: 5 - Math.round((cfg.mathMcq / 100) * 5),
                skippedCount: 0,
                timeSpentSeconds: 240,
              },
            },
            createdAt: lastActiveDate,
            updatedAt: lastActiveDate,
          });
        }

        // Seed Written Attempt if applicable
        if (cfg.mathWritten > 0) {
          const writId = `writ_demo_${cfg.id}_01`;
          if (!this.db.writtenAttempts.some((w) => w.id === writId)) {
            this.db.writtenAttempts.push({
              id: writId,
              userId: cfg.id,
              classLevel: 'Class 10',
              subjectId: 'c10-maths',
              chapterId: 'c10-math-ch1',
              topicId: 't-1-1',
              status: 'completed',
              data: {
                topicTitle: 'Euclid Division Lemma & Fundamental Theorem',
                difficulty: 'medium',
                totalMarks: 10,
                score: Math.round((cfg.mathWritten / 100) * 10),
                percentage: cfg.mathWritten,
                result: {
                  totalMarks: 10,
                  score: Math.round((cfg.mathWritten / 100) * 10),
                  percentage: cfg.mathWritten,
                  evaluationSummary: 'Good conceptual clarity demonstrated with clear algebraic steps.',
                },
              },
              createdAt: lastActiveDate,
              updatedAt: lastActiveDate,
            });
          }
        }
      }
    }

    this.persist();
    console.log(`[CloudDatabase] Bootstrapped Demonstration Environment with ${demoStudentsConfig.length} sample learner records.`);
  }

  // ==========================================
  // 👤 USER OPERATIONS
  // ==========================================
  public findUserByEmail(email: string): DbUser | null {
    if (!email) return null;
    return this.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  }

  public findUserById(id: string): DbUser | null {
    if (!id) return null;
    return this.db.users.find((u) => u.id === id) || null;
  }

  public createUser(user: Omit<DbUser, 'id' | 'createdAt' | 'updatedAt'>): DbUser {
    const newUser: DbUser = {
      ...user,
      id: `usr_${user.role}_${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.db.users.push(newUser);
    this.persist();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<Omit<DbUser, 'id' | 'passwordHash' | 'salt' | 'createdAt'>>): DbUser | null {
    const user = this.findUserById(id);
    if (!user) return null;

    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return user;
  }

  public updatePassword(id: string, newPassword: string): boolean {
    const user = this.findUserById(id);
    if (!user) return false;

    const { hash, salt } = this.hashPassword(newPassword);
    user.passwordHash = hash;
    user.salt = salt;
    user.updatedAt = new Date().toISOString();
    this.persist();
    return true;
  }

  public listUsers(filter?: {
    role?: UserRole;
    schoolId?: string;
    schoolName?: string;
    status?: AccountStatus;
    search?: string;
  }): DbUser[] {
    return this.db.users.filter((u) => {
      if (filter?.role && u.role !== filter.role) return false;
      if (filter?.status && u.status !== filter.status) return false;
      if (filter?.schoolId && u.schoolId !== filter.schoolId) return false;
      if (filter?.schoolName && u.schoolName?.toLowerCase() !== filter.schoolName.toLowerCase()) return false;
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        const matchName = u.fullName.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchSchool = u.schoolName?.toLowerCase().includes(q) || false;
        if (!matchName && !matchEmail && !matchSchool) return false;
      }
      return true;
    });
  }

  // ==========================================
  // 🏫 SCHOOL OPERATIONS (PHASE 7)
  // ==========================================
  public listSchools(filter?: { status?: AccountStatus; isActive?: boolean; search?: string }): DbSchool[] {
    return this.db.schools.filter((s) => {
      if (filter?.status && s.status !== filter.status) return false;
      if (filter?.isActive !== undefined && s.isActive !== filter.isActive) return false;
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchCode = s.schoolCode.toLowerCase().includes(q);
        const matchCity = s.city?.toLowerCase().includes(q) || false;
        const matchDistrict = s.district?.toLowerCase().includes(q) || false;
        if (!matchName && !matchCode && !matchCity && !matchDistrict) return false;
      }
      return true;
    });
  }

  public findSchoolById(id: string): DbSchool | null {
    if (!id) return null;
    return this.db.schools.find((s) => s.id === id) || null;
  }

  public findSchoolByCode(code: string): DbSchool | null {
    if (!code) return null;
    return (
      this.db.schools.find((s) => s.schoolCode.trim().toLowerCase() === code.trim().toLowerCase()) || null
    );
  }

  public createSchool(school: Omit<DbSchool, 'id' | 'createdAt' | 'updatedAt'>): DbSchool {
    const id = `sch_ts_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const newSchool: DbSchool = {
      ...school,
      id,
      state: school.state || 'Telangana',
      country: school.country || 'India',
      isActive: school.isActive !== undefined ? school.isActive : school.status !== 'suspended' && school.status !== 'inactive',
      status: school.status || 'active',
      createdAt: now,
      updatedAt: now,
    };
    this.db.schools.push(newSchool);
    this.persist();
    return newSchool;
  }

  public updateSchool(
    id: string,
    updates: Partial<Omit<DbSchool, 'id' | 'createdAt'>>
  ): DbSchool | null {
    const school = this.findSchoolById(id);
    if (!school) return null;

    Object.assign(school, updates, { updatedAt: new Date().toISOString() });
    if (updates.status) {
      school.isActive = updates.status === 'active';
    }

    // If name changed, update schoolName on users linked to this schoolId
    if (updates.name && updates.name !== school.name) {
      for (const u of this.db.users) {
        if (u.schoolId === id) {
          u.schoolName = updates.name;
          u.updatedAt = new Date().toISOString();
        }
      }
    }

    this.persist();
    return school;
  }

  public setSchoolStatus(id: string, status: AccountStatus): DbSchool | null {
    const school = this.findSchoolById(id);
    if (!school) return null;

    school.status = status;
    school.isActive = status === 'active';
    school.updatedAt = new Date().toISOString();

    this.persist();
    return school;
  }

  public assignPrincipalToSchool(
    schoolId: string,
    principalId: string
  ): { school: DbSchool; principal: DbUser } | null {
    const school = this.findSchoolById(schoolId);
    if (!school) return null;

    const principal = this.findUserById(principalId);
    if (!principal || principal.role !== 'principal') return null;

    // Clear principalId on other schools if this principal was previously assigned
    for (const s of this.db.schools) {
      if (s.id !== schoolId && s.principalId === principalId) {
        s.principalId = undefined;
        s.updatedAt = new Date().toISOString();
      }
    }

    school.principalId = principalId;
    school.updatedAt = new Date().toISOString();

    principal.schoolId = schoolId;
    principal.schoolName = school.name;
    principal.updatedAt = new Date().toISOString();

    this.persist();
    return { school, principal };
  }

  // ==========================================
  // 👨‍🏫 TEACHER ASSIGNMENTS OPERATIONS (PHASE 7)
  // ==========================================
  public listTeacherAssignments(filter?: {
    teacherId?: string;
    schoolId?: string;
    classLevel?: string;
    subjectId?: string;
    isActive?: boolean;
  }): DbTeacherAssignment[] {
    return this.db.teacherAssignments.filter((a) => {
      if (filter?.teacherId && a.teacherId !== filter.teacherId) return false;
      if (filter?.schoolId && a.schoolId !== filter.schoolId) return false;
      if (filter?.classLevel && a.classLevel !== filter.classLevel) return false;
      if (filter?.subjectId && a.subjectId.toLowerCase() !== filter.subjectId.toLowerCase()) return false;
      if (filter?.isActive !== undefined && a.isActive !== filter.isActive) return false;
      return true;
    });
  }

  public findTeacherAssignmentById(id: string): DbTeacherAssignment | null {
    if (!id) return null;
    return this.db.teacherAssignments.find((a) => a.id === id) || null;
  }

  public createTeacherAssignment(
    assignment: Omit<DbTeacherAssignment, 'id' | 'createdAt' | 'updatedAt'>
  ): DbTeacherAssignment {
    // Check if identical active assignment already exists
    const existing = this.db.teacherAssignments.find(
      (a) =>
        a.teacherId === assignment.teacherId &&
        a.schoolId === assignment.schoolId &&
        a.classLevel === assignment.classLevel &&
        a.subjectId.toLowerCase() === assignment.subjectId.toLowerCase()
    );

    if (existing) {
      existing.isActive = assignment.isActive !== undefined ? assignment.isActive : true;
      if (assignment.subjectName) existing.subjectName = assignment.subjectName;
      existing.updatedAt = new Date().toISOString();
      this.persist();
      return existing;
    }

    const id = `asgn_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const newAssignment: DbTeacherAssignment = {
      ...assignment,
      id,
      isActive: assignment.isActive !== undefined ? assignment.isActive : true,
      createdAt: now,
      updatedAt: now,
    };

    this.db.teacherAssignments.push(newAssignment);

    // Synchronize teacher assignedClasses and assignedSubjects summary on user record
    const teacher = this.findUserById(assignment.teacherId);
    if (teacher) {
      const activeAsgns = this.db.teacherAssignments.filter(
        (a) => a.teacherId === assignment.teacherId && a.isActive
      );
      const classes = Array.from(new Set(activeAsgns.map((a) => a.classLevel)));
      const subjects = Array.from(new Set(activeAsgns.map((a) => a.subjectId)));
      teacher.assignedClasses = classes;
      teacher.assignedSubjects = subjects;
      if (!teacher.schoolId) {
        teacher.schoolId = assignment.schoolId;
        const sch = this.findSchoolById(assignment.schoolId);
        if (sch) teacher.schoolName = sch.name;
      }
      teacher.updatedAt = now;
    }

    this.persist();
    return newAssignment;
  }

  public updateTeacherAssignment(
    id: string,
    updates: Partial<Omit<DbTeacherAssignment, 'id' | 'createdAt'>>
  ): DbTeacherAssignment | null {
    const asgn = this.findTeacherAssignmentById(id);
    if (!asgn) return null;

    Object.assign(asgn, updates, { updatedAt: new Date().toISOString() });

    // Sync teacher profile summary
    const teacher = this.findUserById(asgn.teacherId);
    if (teacher) {
      const activeAsgns = this.db.teacherAssignments.filter(
        (a) => a.teacherId === asgn.teacherId && a.isActive
      );
      teacher.assignedClasses = Array.from(new Set(activeAsgns.map((a) => a.classLevel)));
      teacher.assignedSubjects = Array.from(new Set(activeAsgns.map((a) => a.subjectId)));
      teacher.updatedAt = new Date().toISOString();
    }

    this.persist();
    return asgn;
  }

  public setTeacherAssignmentStatus(id: string, isActive: boolean): DbTeacherAssignment | null {
    return this.updateTeacherAssignment(id, { isActive });
  }

  public deleteTeacherAssignment(id: string): boolean {
    const initialLen = this.db.teacherAssignments.length;
    const asgn = this.findTeacherAssignmentById(id);
    const teacherId = asgn?.teacherId;

    this.db.teacherAssignments = this.db.teacherAssignments.filter((a) => a.id !== id);
    const deleted = this.db.teacherAssignments.length < initialLen;

    if (deleted && teacherId) {
      const teacher = this.findUserById(teacherId);
      if (teacher) {
        const activeAsgns = this.db.teacherAssignments.filter(
          (a) => a.teacherId === teacherId && a.isActive
        );
        teacher.assignedClasses = Array.from(new Set(activeAsgns.map((a) => a.classLevel)));
        teacher.assignedSubjects = Array.from(new Set(activeAsgns.map((a) => a.subjectId)));
        teacher.updatedAt = new Date().toISOString();
      }
    }

    this.persist();
    return deleted;
  }

  // ==========================================
  // 🔐 ROLE-BASED SCOPING & AUTHORIZATION HELPERS (PHASE 7)
  // ==========================================
  public listStudentsBySchool(schoolId: string, classLevel?: string): DbUser[] {
    const school = this.findSchoolById(schoolId);
    return this.db.users.filter((u) => {
      if (u.role !== 'student') return false;
      const matchSchool =
        u.schoolId === schoolId ||
        (school && u.schoolName?.trim().toLowerCase() === school.name.trim().toLowerCase());
      if (!matchSchool) return false;
      if (classLevel && u.classLevel !== classLevel) return false;
      return true;
    });
  }

  public getStudentsForClass(schoolId: string, classLevel?: string): DbUser[] {
    return this.listStudentsBySchool(schoolId, classLevel);
  }

  public listTeachersBySchool(schoolId: string): DbUser[] {
    const school = this.findSchoolById(schoolId);
    const teacherIdsFromAsgns = new Set(
      this.db.teacherAssignments.filter((a) => a.schoolId === schoolId && a.isActive).map((a) => a.teacherId)
    );

    return this.db.users.filter((u) => {
      if (u.role !== 'teacher') return false;
      if (teacherIdsFromAsgns.has(u.id)) return true;
      if (u.schoolId === schoolId) return true;
      if (school && u.schoolName?.trim().toLowerCase() === school.name.trim().toLowerCase()) return true;
      return false;
    });
  }

  public findPrincipalBySchool(schoolId: string): DbUser | null {
    const school = this.findSchoolById(schoolId);
    if (!school) return null;

    if (school.principalId) {
      const p = this.findUserById(school.principalId);
      if (p && p.role === 'principal') return p;
    }

    return (
      this.db.users.find(
        (u) =>
          u.role === 'principal' &&
          (u.schoolId === schoolId || u.schoolName?.trim().toLowerCase() === school.name.trim().toLowerCase())
      ) || null
    );
  }

  public getTeacherActiveAssignments(teacherId: string): DbTeacherAssignment[] {
    return this.db.teacherAssignments.filter((a) => a.teacherId === teacherId && a.isActive);
  }

  public isTeacherAuthorizedForStudent(
    teacherId: string,
    studentId: string,
    subjectId?: string
  ): boolean {
    const student = this.findUserById(studentId);
    if (!student || student.role !== 'student') return false;

    const teacher = this.findUserById(teacherId);
    if (!teacher || teacher.role !== 'teacher' || teacher.status !== 'active') return false;

    const assignments = this.getTeacherActiveAssignments(teacherId);
    if (assignments.length === 0) return false;

    return assignments.some((asgn) => {
      const school = this.findSchoolById(asgn.schoolId);
      // Deny access if assigned school is suspended or inactive
      if (!school || school.status !== 'active' || !school.isActive) {
        return false;
      }

      const classMatch = asgn.classLevel === student.classLevel;
      const schoolMatch =
        student.schoolId === asgn.schoolId ||
        (student.schoolName && student.schoolName.trim().toLowerCase() === school.name.trim().toLowerCase());

      if (!classMatch || !schoolMatch) return false;

      if (subjectId) {
        const cleanSub = subjectId.toLowerCase().replace(/\s+/g, '_');
        return asgn.subjectId.toLowerCase().replace(/\s+/g, '_') === cleanSub;
      }

      return true;
    });
  }

  public isPrincipalAuthorizedForSchool(principalId: string, schoolId: string): boolean {
    const principal = this.findUserById(principalId);
    if (!principal || principal.role !== 'principal' || principal.status !== 'active') return false;

    const school = this.findSchoolById(schoolId);
    if (!school || school.status !== 'active' || !school.isActive) return false;

    const matchesId = principal.schoolId === schoolId || school.principalId === principalId;
    const matchesName = Boolean(principal.schoolName && principal.schoolName.trim().toLowerCase() === school.name.trim().toLowerCase());

    return matchesId || matchesName;
  }

  public isPrincipalAuthorizedForStudent(principalId: string, studentId: string): boolean {
    const student = this.findUserById(studentId);
    if (!student || student.role !== 'student') return false;

    const principal = this.findUserById(principalId);
    if (!principal || principal.role !== 'principal' || principal.status !== 'active') return false;

    // Determine principal's authorized active school
    let principalSchool: DbSchool | null = null;
    if (principal.schoolId) {
      principalSchool = this.findSchoolById(principal.schoolId);
    } else if (principal.schoolName) {
      principalSchool = this.listSchools().find(
        (s) => s.name.trim().toLowerCase() === principal.schoolName?.trim().toLowerCase()
      ) || null;
    }

    if (!principalSchool || principalSchool.status !== 'active' || !principalSchool.isActive) {
      return false;
    }

    if (student.schoolId && principalSchool.id === student.schoolId) {
      return true;
    }

    if (student.schoolName && student.schoolName.trim().toLowerCase() === principalSchool.name.trim().toLowerCase()) {
      return true;
    }

    return false;
  }

  // ==========================================
  // 🔑 SESSION OPERATIONS
  // ==========================================
  public createSession(userId: string): DbSession {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Purge expired sessions for this user
    this.db.sessions = this.db.sessions.filter(
      (s) => s.userId !== userId || new Date(s.expiresAt) > new Date()
    );

    const session: DbSession = {
      token,
      userId,
      expiresAt,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    this.db.sessions.push(session);
    this.persist();
    return session;
  }

  public findSession(token: string): (DbSession & { user: DbUser }) | null {
    if (!token) return null;
    const session = this.db.sessions.find((s) => s.token === token);
    if (!session) return null;

    if (new Date(session.expiresAt) < new Date()) {
      // Expired session cleanup
      this.db.sessions = this.db.sessions.filter((s) => s.token !== token);
      this.persist();
      return null;
    }

    const user = this.findUserById(session.userId);
    if (!user) return null;

    session.lastActiveAt = new Date().toISOString();
    return { ...session, user };
  }

  public deleteSession(token: string): void {
    if (!token) return;
    this.db.sessions = this.db.sessions.filter((s) => s.token !== token);
    this.persist();
  }

  // ==========================================
  // 🔐 PASSWORD RESET OPERATIONS
  // ==========================================
  public createPasswordReset(email: string, ipAddress?: string): string {
    const token = crypto.randomBytes(24).toString('hex');
    // 1-hour expiration
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Invalidate all previous unused resets for this email address
    this.db.passwordResets = this.db.passwordResets.filter(
      (r) => r.email.toLowerCase() !== email.toLowerCase().trim()
    );

    this.db.passwordResets.push({
      token,
      email: email.toLowerCase().trim(),
      expiresAt,
      used: false,
      createdAt: new Date().toISOString(),
      ipAddress,
    });
    this.persist();
    return token;
  }

  public verifyPasswordReset(token: string): string | null {
    if (!token) return null;
    const reset = this.db.passwordResets.find((r) => r.token === token && !r.used);
    if (!reset) return null;

    if (new Date(reset.expiresAt) < new Date()) {
      return null;
    }

    return reset.email;
  }

  public markPasswordResetUsed(token: string): void {
    if (!token) return;
    const reset = this.db.passwordResets.find((r) => r.token === token);
    if (reset) {
      reset.used = true;
      this.persist();
    }
  }

  // ==========================================
  // 📝 TEACHER ACCOUNT REQUESTS (APPROVAL WORKFLOW)
  // ==========================================
  public findTeacherRequestByEmail(email: string): DbTeacherRequest | null {
    if (!email) return null;
    return (
      this.db.teacherAccountRequests.find(
        (r) => r.email.toLowerCase().trim() === email.toLowerCase().trim()
      ) || null
    );
  }

  public findTeacherRequestById(id: string): DbTeacherRequest | null {
    if (!id) return null;
    return this.db.teacherAccountRequests.find((r) => r.id === id) || null;
  }

  public createTeacherRequest(data: {
    fullName: string;
    email: string;
    passwordHash: string;
    salt: string;
    schoolId?: string;
    schoolName: string;
    phone?: string;
    employeeId?: string;
    qualification?: string;
    requestedClasses: string[];
    requestedSubjects: string[];
    otherSubject?: string;
  }): DbTeacherRequest {
    if (!Array.isArray(this.db.teacherAccountRequests)) {
      this.db.teacherAccountRequests = [];
    }
    const request: DbTeacherRequest = {
      id: `treq_${crypto.randomUUID().slice(0, 10)}`,
      fullName: data.fullName.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone?.trim(),
      employeeId: data.employeeId?.trim(),
      qualification: data.qualification?.trim(),
      passwordHash: data.passwordHash,
      salt: data.salt,
      schoolId: data.schoolId,
      schoolName: data.schoolName.trim(),
      requestedClasses: data.requestedClasses,
      requestedSubjects: data.requestedSubjects,
      otherSubject: data.otherSubject ? String(data.otherSubject).trim() : undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.db.teacherAccountRequests.push(request);
    this.persist();
    return request;
  }

  public listTeacherRequests(status?: TeacherRequestStatus): DbTeacherRequest[] {
    if (!Array.isArray(this.db.teacherAccountRequests)) return [];
    const list = status
      ? this.db.teacherAccountRequests.filter((r) => r.status === status)
      : [...this.db.teacherAccountRequests];
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Approves a pending request and provisions the REAL teacher account.
   * Returns { user, assignments } so callers can report exactly what was created.
   */
  public approveTeacherRequest(
    requestId: string,
    reviewedBy: string,
    options: {
      schoolId?: string;
      assignedClasses?: string[];
      assignedSubjects?: string[];
      accountStatus?: AccountStatus;
    } = {}
  ): { user: DbUser; assignments: DbTeacherAssignment[]; request: DbTeacherRequest } | null {
    const req = this.findTeacherRequestById(requestId);
    if (!req || req.status !== 'pending') return null;

    const emailTaken = this.findUserByEmail(req.email);
    if (emailTaken) return null; // cannot approve into an existing account

    const schoolId = options.schoolId || req.schoolId;
    const school = schoolId ? this.findSchoolById(schoolId) : null;
    const schoolName = school?.name || req.schoolName;

    const user = this.createUser({
      role: 'teacher',
      fullName: req.fullName,
      email: req.email,
      passwordHash: req.passwordHash,
      salt: req.salt,
      mobileNumber: req.phone,
      schoolId: school?.id,
      schoolName,
      assignedClasses: [],
      assignedSubjects: [],
      status: options.accountStatus || 'active',
    });

    const classes = options.assignedClasses?.length ? options.assignedClasses : req.requestedClasses;
    const subjects = options.assignedSubjects?.length ? options.assignedSubjects : req.requestedSubjects;
    const assignments: DbTeacherAssignment[] = [];
    for (const cls of classes) {
      for (const sub of subjects) {
        // Resolve the requested subject against the official class syllabus so
        // assignments store real curriculum ids (e.g. 'c9-tel') plus a display
        // name. Custom "Other Subject" values stay isolated as custom subjects.
        const resolved = resolveCurriculumSubject(cls, sub);
        assignments.push(
          this.createTeacherAssignment({
            teacherId: user.id,
            schoolId: school?.id || '',
            classLevel: cls,
            subjectId: resolved.subjectId,
            subjectName: resolved.subjectName,
            isActive: true,
          })
        );
      }
    }

    req.status = 'approved';
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = reviewedBy;
    req.schoolId = school?.id || req.schoolId;

    this.persist();
    return { user, assignments, request: req };
  }

  public rejectTeacherRequest(
    requestId: string,
    reviewedBy: string,
    rejectionReason: string
  ): DbTeacherRequest | null {
    const req = this.findTeacherRequestById(requestId);
    if (!req || req.status !== 'pending') return null;
    req.status = 'rejected';
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = reviewedBy;
    req.rejectionReason = rejectionReason.trim();
    this.persist();
    return req;
  }

  // ==========================================
  // 🤖 AI USAGE & QUOTA TRACKING
  // ==========================================
  public trackAiUsage(
    userId: string,
    maxDailyQuota = 100
  ): { allowed: boolean; currentCount: number; limit: number; remaining: number; resetDate: string } {
    const today = new Date().toISOString().split('T')[0];
    
    // Find or create daily usage record
    let record = this.db.aiUsage.find((u) => u.userId === userId && u.date === today);
    if (!record) {
      record = {
        userId,
        date: today,
        requestCount: 0,
        lastRequestAt: new Date().toISOString(),
      };
      this.db.aiUsage.push(record);
    }

    // Clean old usage records older than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    this.db.aiUsage = this.db.aiUsage.filter((u) => u.date >= sevenDaysAgo);

    if (record.requestCount >= maxDailyQuota) {
      return {
        allowed: false,
        currentCount: record.requestCount,
        limit: maxDailyQuota,
        remaining: 0,
        resetDate: today,
      };
    }

    record.requestCount += 1;
    record.lastRequestAt = new Date().toISOString();
    this.persist();

    return {
      allowed: true,
      currentCount: record.requestCount,
      limit: maxDailyQuota,
      remaining: Math.max(0, maxDailyQuota - record.requestCount),
      resetDate: today,
    };
  }

  // ==========================================
  // 💬 AI CONVERSATIONS PERSISTENCE
  // ==========================================
  public getAiConversations(userId: string): DbAiConversation[] {
    return this.db.aiConversations.filter((c) => c.userId === userId);
  }

  public saveAiConversation(
    userId: string,
    convData: {
      id?: string;
      classLevel: string;
      subjectId: string;
      chapterId: string;
      topicId: string;
      language: string;
      messages: any[];
    }
  ): DbAiConversation {
    const id = convData.id || `conv_${userId}_${convData.classLevel}_${convData.subjectId}_${convData.chapterId}_${convData.topicId}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    
    const existingIndex = this.db.aiConversations.findIndex((c) => c.id === id && c.userId === userId);
    
    const conv: DbAiConversation = {
      id,
      userId,
      classLevel: convData.classLevel,
      subjectId: convData.subjectId,
      chapterId: convData.chapterId,
      topicId: convData.topicId,
      language: convData.language,
      messages: convData.messages,
      createdAt: existingIndex >= 0 ? this.db.aiConversations[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.db.aiConversations[existingIndex] = conv;
    } else {
      this.db.aiConversations.push(conv);
    }

    this.persist();
    return conv;
  }

  // ==========================================
  // 📝 MCQ ATTEMPTS PERSISTENCE
  // ==========================================
  public getMcqAttempts(userId: string): DbMcqAttempt[] {
    return this.db.mcqAttempts
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getMcqAttempt(userId: string, attemptId: string): DbMcqAttempt | null {
    return this.db.mcqAttempts.find((a) => a.id === attemptId && a.userId === userId) || null;
  }

  public saveMcqAttempt(userId: string, attempt: any): DbMcqAttempt {
    const id = attempt.id;
    const existingIndex = this.db.mcqAttempts.findIndex((a) => a.id === id && a.userId === userId);

    const dbAttempt: DbMcqAttempt = {
      id,
      userId,
      classLevel: attempt.classLevel || 'Class 10',
      subjectId: attempt.subjectId || '',
      chapterId: attempt.chapterId || '',
      topicId: attempt.topicId || '',
      data: attempt,
      status: attempt.status || 'in_progress',
      createdAt: existingIndex >= 0 ? this.db.mcqAttempts[existingIndex].createdAt : (attempt.createdAt || new Date().toISOString()),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Immutability: do not allow modifying submitted answers
      if (this.db.mcqAttempts[existingIndex].status === 'completed' && attempt.status !== 'completed') {
        return this.db.mcqAttempts[existingIndex];
      }
      this.db.mcqAttempts[existingIndex] = dbAttempt;
    } else {
      this.db.mcqAttempts.push(dbAttempt);
    }

    this.persist();
    return dbAttempt;
  }

  // ==========================================
  // ✍️ WRITTEN ATTEMPTS PERSISTENCE
  // ==========================================
  public getWrittenAttempts(userId: string): DbWrittenAttempt[] {
    return this.db.writtenAttempts
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getWrittenAttempt(userId: string, attemptId: string): DbWrittenAttempt | null {
    return this.db.writtenAttempts.find((a) => a.id === attemptId && a.userId === userId) || null;
  }

  public saveWrittenAttempt(userId: string, attempt: any): DbWrittenAttempt {
    const id = attempt.id;
    const existingIndex = this.db.writtenAttempts.findIndex((a) => a.id === id && a.userId === userId);

    const dbAttempt: DbWrittenAttempt = {
      id,
      userId,
      classLevel: attempt.classLevel || 'Class 10',
      subjectId: attempt.subjectId || '',
      chapterId: attempt.chapterId || '',
      topicId: attempt.topicId || '',
      data: attempt,
      status: attempt.status || 'draft',
      createdAt: existingIndex >= 0 ? this.db.writtenAttempts[existingIndex].createdAt : (attempt.createdAt || new Date().toISOString()),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Immutability for submitted/evaluated tests
      if (this.db.writtenAttempts[existingIndex].status === 'completed' && attempt.status !== 'completed') {
        return this.db.writtenAttempts[existingIndex];
      }
      this.db.writtenAttempts[existingIndex] = dbAttempt;
    } else {
      this.db.writtenAttempts.push(dbAttempt);
    }

    this.persist();
    return dbAttempt;
  }

  // ==========================================
  // 📊 LEARNING EVENTS PERSISTENCE
  // ==========================================
  public recordLearningEvent(
    userId: string,
    eventData: {
      type: string;
      classLevel?: string;
      subjectId?: string;
      chapterId?: string;
      topicId?: string;
      metadata?: Record<string, any>;
    }
  ): DbLearningEvent {
    const event: DbLearningEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      type: eventData.type,
      classLevel: eventData.classLevel,
      subjectId: eventData.subjectId,
      chapterId: eventData.chapterId,
      topicId: eventData.topicId,
      metadata: eventData.metadata,
      createdAt: new Date().toISOString(),
    };

    if (!Array.isArray(this.db.learningEvents)) {
      this.db.learningEvents = [];
    }

    this.db.learningEvents.unshift(event);
    if (this.db.learningEvents.length > 500) {
      this.db.learningEvents = this.db.learningEvents.slice(0, 500);
    }

    // Meaningful learning actions trigger streak update
    const meaningfulActions = [
      'lesson_completed',
      'mcq_completed',
      'written_test_completed',
      'topic_completed',
      'ai_question_asked',
      'revision_completed',
    ];
    if (meaningfulActions.includes(eventData.type)) {
      this.recordActiveDay(userId);
    }

    // Auto-update topic progress if topicId provided
    if (eventData.topicId && eventData.classLevel && eventData.subjectId && eventData.chapterId) {
      if (eventData.type === 'lesson_completed') {
        this.markTopicStatus(userId, eventData.classLevel, eventData.subjectId, eventData.chapterId, eventData.topicId, {
          lessonCompleted: true,
          status: 'completed',
        });
      } else if (eventData.type === 'lesson_started' || eventData.type === 'ai_question_asked') {
        this.markTopicStatus(userId, eventData.classLevel, eventData.subjectId, eventData.chapterId, eventData.topicId, {
          status: 'in_progress',
        });
      } else if (eventData.type === 'mcq_completed' && eventData.metadata?.percentage !== undefined) {
        const percentage = Number(eventData.metadata.percentage);
        const existing = this.getTopicProgress(userId, eventData.classLevel, eventData.subjectId, eventData.chapterId, eventData.topicId);
        const mcqAttempts = (existing?.mcqAttempts || 0) + 1;
        const previousBestMcqScore = existing?.bestMcqScore;
        const bestMcqScore = existing?.bestMcqScore !== undefined ? Math.max(existing.bestMcqScore, percentage) : percentage;
        this.saveTopicProgress(userId, {
          classLevel: eventData.classLevel,
          subjectId: eventData.subjectId,
          chapterId: eventData.chapterId,
          topicId: eventData.topicId,
          mcqAttempts,
          latestMcqScore: percentage,
          bestMcqScore,
          previousBestMcqScore,
          lastActivityAt: new Date().toISOString(),
        });
      } else if (eventData.type === 'written_test_completed' && eventData.metadata?.percentage !== undefined) {
        const percentage = Number(eventData.metadata.percentage);
        const existing = this.getTopicProgress(userId, eventData.classLevel, eventData.subjectId, eventData.chapterId, eventData.topicId);
        const writtenAttempts = (existing?.writtenAttempts || 0) + 1;
        const previousBestWrittenScore = existing?.bestWrittenScore;
        const bestWrittenScore = existing?.bestWrittenScore !== undefined ? Math.max(existing.bestWrittenScore, percentage) : percentage;
        this.saveTopicProgress(userId, {
          classLevel: eventData.classLevel,
          subjectId: eventData.subjectId,
          chapterId: eventData.chapterId,
          topicId: eventData.topicId,
          writtenAttempts,
          latestWrittenScore: percentage,
          bestWrittenScore,
          previousBestWrittenScore,
          lastActivityAt: new Date().toISOString(),
        });
      }
    }

    this.persist();
    return event;
  }

  public getLearningEvents(userId: string, limit = 50): DbLearningEvent[] {
    if (!Array.isArray(this.db.learningEvents)) return [];
    return this.db.learningEvents
      .filter((e) => e.userId === userId)
      .slice(0, limit);
  }

  // ==========================================
  // 📈 TOPIC PROGRESS & MASTERY PERSISTENCE
  // ==========================================
  public getTopicProgress(
    userId: string,
    classLevel: string,
    subjectId: string,
    chapterId: string,
    topicId: string
  ): DbTopicProgress | null {
    if (!Array.isArray(this.db.topicProgress)) return null;
    return (
      this.db.topicProgress.find(
        (tp) =>
          tp.userId === userId &&
          tp.classLevel === classLevel &&
          tp.subjectId === subjectId &&
          tp.chapterId === chapterId &&
          tp.topicId === topicId
      ) || null
    );
  }

  public getAllTopicProgress(userId: string, classLevel?: string): DbTopicProgress[] {
    if (!Array.isArray(this.db.topicProgress)) return [];
    return this.db.topicProgress.filter((tp) => {
      if (tp.userId !== userId) return false;
      if (classLevel && tp.classLevel !== classLevel) return false;
      return true;
    });
  }

  public saveTopicProgress(
    userId: string,
    progressData: Partial<DbTopicProgress> & {
      classLevel: string;
      subjectId: string;
      chapterId: string;
      topicId: string;
    }
  ): DbTopicProgress {
    if (!Array.isArray(this.db.topicProgress)) {
      this.db.topicProgress = [];
    }

    const { classLevel, subjectId, chapterId, topicId } = progressData;
    const id = `tp_${userId}_${classLevel}_${subjectId}_${chapterId}_${topicId}`
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');

    const existingIndex = this.db.topicProgress.findIndex((tp) => tp.id === id);
    const existing = existingIndex >= 0 ? this.db.topicProgress[existingIndex] : null;

    const lessonCompleted =
      progressData.lessonCompleted !== undefined
        ? progressData.lessonCompleted
        : (existing ? existing.lessonCompleted : false);

    const mcqAttempts = progressData.mcqAttempts !== undefined
      ? progressData.mcqAttempts
      : (existing ? existing.mcqAttempts : 0);

    const writtenAttempts = progressData.writtenAttempts !== undefined
      ? progressData.writtenAttempts
      : (existing ? existing.writtenAttempts : 0);

    const bestMcqScore = progressData.bestMcqScore !== undefined ? progressData.bestMcqScore : existing?.bestMcqScore;
    const latestMcqScore = progressData.latestMcqScore !== undefined ? progressData.latestMcqScore : existing?.latestMcqScore;
    const previousBestMcqScore = progressData.previousBestMcqScore !== undefined ? progressData.previousBestMcqScore : existing?.previousBestMcqScore;
    const bestWrittenScore = progressData.bestWrittenScore !== undefined ? progressData.bestWrittenScore : existing?.bestWrittenScore;
    const latestWrittenScore = progressData.latestWrittenScore !== undefined ? progressData.latestWrittenScore : existing?.latestWrittenScore;
    const previousBestWrittenScore = progressData.previousBestWrittenScore !== undefined ? progressData.previousBestWrittenScore : existing?.previousBestWrittenScore;

    // Calculate deterministic mastery score
    let learningScore = lessonCompleted ? 20 : (mcqAttempts > 0 || writtenAttempts > 0 ? 10 : 0);
    const hasMcq = mcqAttempts > 0 && typeof latestMcqScore === 'number';
    const hasWritten = writtenAttempts > 0 && typeof latestWrittenScore === 'number';

    let testScore = 0;
    if (hasMcq && hasWritten) {
      testScore = (bestMcqScore || 0) * 0.15 + (latestMcqScore || 0) * 0.20 + (bestWrittenScore || 0) * 0.15 + (latestWrittenScore || 0) * 0.20;
    } else if (hasMcq) {
      testScore = (bestMcqScore || 0) * 0.30 + (latestMcqScore || 0) * 0.40;
    } else if (hasWritten) {
      testScore = (bestWrittenScore || 0) * 0.30 + (latestWrittenScore || 0) * 0.40;
    }

    let practiceBonus = 0;
    if (mcqAttempts + writtenAttempts >= 2) practiceBonus += 5; // Repetition bonus
    // Improvement bonus (+5 max): Compare latest attempt against the highest score of attempts before it
    if ((hasMcq && typeof previousBestMcqScore === 'number' && (latestMcqScore || 0) > previousBestMcqScore && mcqAttempts >= 2) ||
        (hasWritten && typeof previousBestWrittenScore === 'number' && (latestWrittenScore || 0) > previousBestWrittenScore && writtenAttempts >= 2)) {
      practiceBonus += 5;
    }

    const calculatedMastery = Math.min(100, Math.max(0, Math.round(learningScore + testScore + practiceBonus)));
    const masteryScore = progressData.masteryScore !== undefined ? progressData.masteryScore : calculatedMastery;

    let status: 'not_started' | 'in_progress' | 'completed' = progressData.status || (existing ? existing.status : 'not_started');
    if (masteryScore >= 80 || lessonCompleted) {
      status = 'completed';
    } else if (masteryScore > 0 || mcqAttempts > 0 || writtenAttempts > 0) {
      status = 'in_progress';
    }

    const completedAt = status === 'completed'
      ? (existing?.completedAt || new Date().toISOString())
      : undefined;

    const topicProg: DbTopicProgress = {
      id,
      userId,
      classLevel,
      subjectId,
      chapterId,
      topicId,
      status,
      lessonCompleted,
      mcqAttempts,
      writtenAttempts,
      bestMcqScore,
      latestMcqScore,
      previousBestMcqScore,
      bestWrittenScore,
      latestWrittenScore,
      previousBestWrittenScore,
      masteryScore,
      lastActivityAt: progressData.lastActivityAt || new Date().toISOString(),
      completedAt,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.db.topicProgress[existingIndex] = topicProg;
    } else {
      this.db.topicProgress.push(topicProg);
    }

    this.persist();
    return topicProg;
  }

  public markTopicStatus(
    userId: string,
    classLevel: string,
    subjectId: string,
    chapterId: string,
    topicId: string,
    updates: {
      lessonCompleted?: boolean;
      status?: 'not_started' | 'in_progress' | 'completed';
    }
  ): DbTopicProgress {
    const existing = this.getTopicProgress(userId, classLevel, subjectId, chapterId, topicId);
    return this.saveTopicProgress(userId, {
      classLevel,
      subjectId,
      chapterId,
      topicId,
      lessonCompleted: updates.lessonCompleted !== undefined ? updates.lessonCompleted : existing?.lessonCompleted,
      status: updates.status || existing?.status || 'in_progress',
      lastActivityAt: new Date().toISOString(),
    });
  }

  // ==========================================
  // 🔥 LEARNING STREAKS PERSISTENCE
  // ==========================================
  public getStudentStreak(userId: string): DbLearningStreak | null {
    if (!Array.isArray(this.db.learningStreaks)) return null;
    return this.db.learningStreaks.find((s) => s.userId === userId) || null;
  }

  public recordActiveDay(userId: string, dateStr?: string): DbLearningStreak {
    if (!Array.isArray(this.db.learningStreaks)) {
      this.db.learningStreaks = [];
    }

    const today = dateStr || new Date().toISOString().split('T')[0];
    let streakRecord = this.db.learningStreaks.find((s) => s.userId === userId);

    if (!streakRecord) {
      streakRecord = {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        totalActiveDays: 1,
        lastActiveDate: today,
        activeDates: [today],
        updatedAt: new Date().toISOString(),
      };
      this.db.learningStreaks.push(streakRecord);
      this.persist();
      return streakRecord;
    }

    const activeDatesSet = new Set(streakRecord.activeDates || []);
    activeDatesSet.add(today);
    const sortedDates = Array.from(activeDatesSet).sort();

    // Recalculate streak metrics
    let longest = 1;
    let run = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        run += 1;
        if (run > longest) longest = run;
      } else if (diff > 1) {
        run = 1;
      }
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const lastDate = sortedDates[sortedDates.length - 1];

    let current = 0;
    if (lastDate === today || lastDate === yesterdayStr) {
      current = 1;
      for (let i = sortedDates.length - 1; i > 0; i--) {
        const curr = new Date(sortedDates[i]);
        const prev = new Date(sortedDates[i - 1]);
        const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          current += 1;
        } else {
          break;
        }
      }
    }

    streakRecord.currentStreak = current;
    streakRecord.longestStreak = Math.max(longest, current);
    streakRecord.totalActiveDays = sortedDates.length;
    streakRecord.lastActiveDate = lastDate;
    streakRecord.activeDates = sortedDates;
    streakRecord.updatedAt = new Date().toISOString();

    this.persist();
    return streakRecord;
  }

  // ==========================================
  // 🏆 STUDENT ACHIEVEMENTS PERSISTENCE
  // ==========================================
  public getStudentAchievements(userId: string): DbStudentAchievement[] {
    if (!Array.isArray(this.db.achievements)) return [];
    return this.db.achievements.filter((a) => a.userId === userId);
  }

  public unlockAchievement(userId: string, achievementId: string): DbStudentAchievement {
    if (!Array.isArray(this.db.achievements)) {
      this.db.achievements = [];
    }

    const id = `ach_${userId}_${achievementId}`;
    const existing = this.db.achievements.find((a) => a.id === id);
    if (existing) return existing;

    const ach: DbStudentAchievement = {
      id,
      userId,
      achievementId,
      unlockedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.db.achievements.push(ach);
    this.persist();
    return ach;
  }

  // ==========================================
  // 🔄 SAFE IDEMPOTENT ANALYTICS BACKFILL
  // ==========================================
  public backfillStudentAnalytics(userId: string): void {
    const mcqs = this.getMcqAttempts(userId);
    const written = this.getWrittenAttempts(userId);
    const convos = this.getAiConversations(userId);

    // 1. Rebuild topic progress per topic
    const topicMap: Record<string, {
      classLevel: string;
      subjectId: string;
      chapterId: string;
      topicId: string;
      mcqs: DbMcqAttempt[];
      written: DbWrittenAttempt[];
      hasConvo: boolean;
      lastDate: string;
    }> = {};

    for (const m of mcqs) {
      if (m.topicId) {
        const k = `${m.classLevel}_${m.subjectId}_${m.chapterId}_${m.topicId}`;
        if (!topicMap[k]) {
          topicMap[k] = {
            classLevel: m.classLevel || 'Class 10',
            subjectId: m.subjectId,
            chapterId: m.chapterId,
            topicId: m.topicId,
            mcqs: [],
            written: [],
            hasConvo: false,
            lastDate: m.createdAt,
          };
        }
        topicMap[k].mcqs.push(m);
        if (new Date(m.createdAt) > new Date(topicMap[k].lastDate)) {
          topicMap[k].lastDate = m.createdAt;
        }
      }
    }

    for (const w of written) {
      if (w.topicId) {
        const k = `${w.classLevel}_${w.subjectId}_${w.chapterId}_${w.topicId}`;
        if (!topicMap[k]) {
          topicMap[k] = {
            classLevel: w.classLevel || 'Class 10',
            subjectId: w.subjectId,
            chapterId: w.chapterId,
            topicId: w.topicId,
            mcqs: [],
            written: [],
            hasConvo: false,
            lastDate: w.createdAt,
          };
        }
        topicMap[k].written.push(w);
        if (new Date(w.createdAt) > new Date(topicMap[k].lastDate)) {
          topicMap[k].lastDate = w.createdAt;
        }
      }
    }

    for (const c of convos) {
      if (c.topicId) {
        const k = `${c.classLevel}_${c.subjectId}_${c.chapterId}_${c.topicId}`;
        if (!topicMap[k]) {
          topicMap[k] = {
            classLevel: c.classLevel || 'Class 10',
            subjectId: c.subjectId,
            chapterId: c.chapterId,
            topicId: c.topicId,
            mcqs: [],
            written: [],
            hasConvo: true,
            lastDate: c.createdAt,
          };
        } else {
          topicMap[k].hasConvo = true;
        }
      }
    }

    // Save consolidated topic progress
    for (const item of Object.values(topicMap)) {
      const completedMcqs = item.mcqs.filter((m) => m.status === 'completed' && m.data?.result?.percentage !== undefined);
      const completedWritten = item.written.filter((w) => w.status === 'completed' && w.data?.result?.percentage !== undefined);

      completedMcqs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const mcqScores = completedMcqs.map((m) => Number(m.data.result.percentage));
      const latestMcq = mcqScores.length > 0 ? mcqScores[mcqScores.length - 1] : undefined;
      const bestMcq = mcqScores.length > 0 ? Math.max(...mcqScores) : undefined;
      const prevMcqScores = mcqScores.slice(0, mcqScores.length - 1);
      const previousBestMcq = prevMcqScores.length > 0 ? Math.max(...prevMcqScores) : undefined;

      completedWritten.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const writtenScores = completedWritten.map((w) => Number(w.data.result.percentage));
      const latestWritten = writtenScores.length > 0 ? writtenScores[writtenScores.length - 1] : undefined;
      const bestWritten = writtenScores.length > 0 ? Math.max(...writtenScores) : undefined;
      const prevWrittenScores = writtenScores.slice(0, writtenScores.length - 1);
      const previousBestWritten = prevWrittenScores.length > 0 ? Math.max(...prevWrittenScores) : undefined;

      this.saveTopicProgress(userId, {
        classLevel: item.classLevel,
        subjectId: item.subjectId,
        chapterId: item.chapterId,
        topicId: item.topicId,
        mcqAttempts: item.mcqs.length,
        writtenAttempts: item.written.length,
        bestMcqScore: bestMcq,
        latestMcqScore: latestMcq,
        previousBestMcqScore: previousBestMcq,
        bestWrittenScore: bestWritten,
        latestWrittenScore: latestWritten,
        previousBestWrittenScore: previousBestWritten,
        lastActivityAt: item.lastDate,
      });
    }

    // 2. Rebuild active dates & streaks from all timestamped records
    const allDates: string[] = [];
    for (const m of mcqs) allDates.push(m.createdAt.split('T')[0]);
    for (const w of written) allDates.push(w.createdAt.split('T')[0]);
    for (const c of convos) allDates.push(c.createdAt.split('T')[0]);

    for (const d of allDates) {
      this.recordActiveDay(userId, d);
    }
  }

  // =========================================================================
  // 📚 PHASE 8A: SMART ASSIGNMENT & HOMEWORK ENGINE METHODS
  // =========================================================================

  /**
   * Create a new assignment (draft or published)
   */
  public createAssignment(data: Omit<DbAssignment, 'id' | 'createdAt' | 'updatedAt'>): DbAssignment {
    const id = `asg_${crypto.randomUUID().slice(0, 10)}`;
    const now = new Date().toISOString();

    const newAssignment: DbAssignment = {
      id,
      ...data,
      questions: Array.isArray(data.questions) ? data.questions : [],
      allowLateSubmission: Boolean(data.allowLateSubmission),
      studentTargetMode: data.studentTargetMode || 'class',
      targetStudentIds: Array.isArray(data.targetStudentIds) ? data.targetStudentIds : undefined,
      totalPossibleMarks: data.totalPossibleMarks || data.questions.reduce((sum, q) => sum + (q.marks || 1), 0),
      createdAt: now,
      updatedAt: now,
      publishedAt: data.status === 'published' ? now : undefined,
    };

    if (!Array.isArray(this.db.assignments)) {
      this.db.assignments = [];
    }

    this.db.assignments.push(newAssignment);
    this.persist();
    return newAssignment;
  }

  /**
   * Update an existing assignment
   */
  public updateAssignment(id: string, updates: Partial<DbAssignment>): DbAssignment | null {
    if (!Array.isArray(this.db.assignments)) {
      this.db.assignments = [];
      return null;
    }

    const idx = this.db.assignments.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    const current = this.db.assignments[idx];

    // If publishing for the first time
    let publishedAt = current.publishedAt;
    if (updates.status === 'published' && current.status !== 'published' && !publishedAt) {
      publishedAt = new Date().toISOString();
    }

    const updated: DbAssignment = {
      ...current,
      ...updates,
      id: current.id, // Immutable ID
      teacherId: current.teacherId, // Immutable Creator
      schoolId: current.schoolId, // Immutable School
      publishedAt,
      updatedAt: new Date().toISOString(),
    };

    if (updates.questions) {
      updated.totalPossibleMarks = updates.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    }

    this.db.assignments[idx] = updated;
    this.persist();
    return updated;
  }

  /**
   * Find assignment by ID
   */
  public findAssignmentById(id: string): DbAssignment | null {
    if (!Array.isArray(this.db.assignments)) return null;
    return this.db.assignments.find((a) => a.id === id) || null;
  }

  /**
   * Delete assignment (only if in draft status and no submissions exist)
   */
  public deleteAssignment(id: string): boolean {
    if (!Array.isArray(this.db.assignments)) return false;
    const idx = this.db.assignments.findIndex((a) => a.id === id);
    if (idx === -1) return false;

    // Check for submissions
    const hasSubmissions = (this.db.assignmentSubmissions || []).some((s) => s.assignmentId === id);
    if (hasSubmissions) {
      return false;
    }

    this.db.assignments.splice(idx, 1);
    this.persist();
    return true;
  }

  /**
   * List assignments with rich filters
   */
  public listAssignments(filter?: {
    schoolId?: string;
    teacherId?: string;
    classLevel?: string;
    subjectId?: string;
    status?: string;
    studentId?: string;
  }): DbAssignment[] {
    if (!Array.isArray(this.db.assignments)) return [];

    let list = [...this.db.assignments];

    if (filter?.schoolId) {
      list = list.filter((a) => a.schoolId === filter.schoolId);
    }
    if (filter?.teacherId) {
      list = list.filter((a) => a.teacherId === filter.teacherId);
    }
    if (filter?.classLevel) {
      list = list.filter((a) => a.classLevel === filter.classLevel);
    }
    if (filter?.subjectId) {
      list = list.filter((a) => a.subjectId === filter.subjectId);
    }
    if (filter?.status) {
      list = list.filter((a) => a.status === filter.status);
    }

    // If filtered by student, only show assignments targeted to that student
    if (filter?.studentId) {
      const student = this.findUserById(filter.studentId);
      if (student) {
        list = list.filter((a) => {
          if (a.status === 'draft') return false;
          if (a.schoolId !== student.schoolId) return false;
          if (a.classLevel !== student.classLevel) return false;
          if (a.studentTargetMode === 'selected_students') {
            return Array.isArray(a.targetStudentIds) && a.targetStudentIds.includes(student.id);
          }
          return true;
        });
      }
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Find a specific student's submission for an assignment
   */
  public findAssignmentSubmission(assignmentId: string, studentId: string): DbAssignmentSubmission | null {
    if (!Array.isArray(this.db.assignmentSubmissions)) return null;
    return this.db.assignmentSubmissions.find(
      (s) => s.assignmentId === assignmentId && s.studentId === studentId
    ) || null;
  }

  /**
   * Find a submission by its own unique ID
   */
  public findAssignmentSubmissionById(submissionId: string): DbAssignmentSubmission | null {
    if (!Array.isArray(this.db.assignmentSubmissions)) return null;
    return this.db.assignmentSubmissions.find((s) => s.id === submissionId) || null;
  }

  /**
   * List all submissions for an assignment
   */
  public listSubmissionsForAssignment(assignmentId: string): DbAssignmentSubmission[] {
    if (!Array.isArray(this.db.assignmentSubmissions)) return [];
    return this.db.assignmentSubmissions.filter((s) => s.assignmentId === assignmentId);
  }

  /**
   * List all submissions for a student
   */
  public listSubmissionsForStudent(studentId: string): DbAssignmentSubmission[] {
    if (!Array.isArray(this.db.assignmentSubmissions)) return [];
    return this.db.assignmentSubmissions.filter((s) => s.studentId === studentId);
  }

  /**
   * Save or update an assignment submission (autosave / submit)
   */
  public saveAssignmentSubmission(
    data: Partial<DbAssignmentSubmission> & { assignmentId: string; studentId: string }
  ): DbAssignmentSubmission {
    if (!Array.isArray(this.db.assignmentSubmissions)) {
      this.db.assignmentSubmissions = [];
    }

    const now = new Date().toISOString();
    const existingIdx = this.db.assignmentSubmissions.findIndex(
      (s) => s.assignmentId === data.assignmentId && s.studentId === data.studentId
    );

    if (existingIdx !== -1) {
      const existing = this.db.assignmentSubmissions[existingIdx];
      const updated: DbAssignmentSubmission = {
        ...existing,
        ...data,
        id: existing.id,
        assignmentId: existing.assignmentId,
        studentId: existing.studentId,
        startedAt: existing.startedAt || data.startedAt || now,
        submittedAt: data.submittedAt || existing.submittedAt,
        updatedAt: now,
        questionResponses: data.questionResponses || existing.questionResponses || {},
      };

      this.db.assignmentSubmissions[existingIdx] = updated;
      this.persist();
      return updated;
    } else {
      const id = `sub_${crypto.randomUUID().slice(0, 10)}`;
      const newSubmission: DbAssignmentSubmission = {
        id,
        assignmentId: data.assignmentId,
        studentId: data.studentId,
        schoolId: data.schoolId || '',
        classLevel: data.classLevel || 'Class 10',
        subjectId: data.subjectId || '',
        status: data.status || 'in_progress',
        startedAt: data.startedAt || now,
        submittedAt: data.submittedAt,
        updatedAt: now,
        mcqScore: data.mcqScore,
        mcqTotal: data.mcqTotal,
        writtenScore: data.writtenScore,
        writtenTotal: data.writtenTotal,
        totalScore: data.totalScore,
        totalPossibleMarks: data.totalPossibleMarks,
        percentage: data.percentage,
        questionResponses: data.questionResponses || {},
        evaluationData: data.evaluationData,
        teacherFeedback: data.teacherFeedback,
        teacherReviewedAt: data.teacherReviewedAt,
        teacherReviewedBy: data.teacherReviewedBy,
        isLate: Boolean(data.isLate),
        attemptNumber: data.attemptNumber || 1,
      };

      this.db.assignmentSubmissions.push(newSubmission);
      this.persist();
      return newSubmission;
    }
  }

  /**
   * Update teacher feedback or review status on a submission
   */
  public updateSubmissionTeacherFeedback(
    submissionId: string,
    teacherId: string,
    feedback: string
  ): DbAssignmentSubmission | null {
    if (!Array.isArray(this.db.assignmentSubmissions)) return null;

    const idx = this.db.assignmentSubmissions.findIndex((s) => s.id === submissionId);
    if (idx === -1) return null;

    const current = this.db.assignmentSubmissions[idx];
    const now = new Date().toISOString();

    const updated: DbAssignmentSubmission = {
      ...current,
      teacherFeedback: feedback,
      teacherReviewedAt: now,
      teacherReviewedBy: teacherId,
      updatedAt: now,
    };

    this.db.assignmentSubmissions[idx] = updated;
    this.persist();
    return updated;
  }

  /**
   * Verify whether a teacher is authorized to access / modify an assignment
   */
  public isTeacherAuthorizedForAssignment(teacherId: string, assignmentId: string): boolean {
    const assignment = this.findAssignmentById(assignmentId);
    if (!assignment) return false;

    const teacher = this.findUserById(teacherId);
    if (!teacher || teacher.status !== 'active') return false;

    // Company Admin has global access
    if (teacher.role === 'company_admin') return true;

    if (teacher.role !== 'teacher') return false;

    // Must be the teacher who created the assignment or matches school & subject assignment
    if (assignment.teacherId === teacherId) return true;

    // If same school and assigned to the same class and subject
    if (assignment.schoolId === teacher.schoolId) {
      const activeAssignments = this.getTeacherActiveAssignments(teacherId);
      return activeAssignments.some(
        (ta) =>
          ta.isActive &&
          ta.schoolId === assignment.schoolId &&
          ta.classLevel === assignment.classLevel &&
          ta.subjectId === assignment.subjectId
      );
    }

    return false;
  }

  /**
   * Verify whether a student is authorized to view / take an assignment
   */
  public isStudentAuthorizedForAssignment(
    studentId: string,
    assignmentId: string
  ): { authorized: boolean; reason?: string } {
    const assignment = this.findAssignmentById(assignmentId);
    if (!assignment) {
      return { authorized: false, reason: 'Assignment not found.' };
    }

    const student = this.findUserById(studentId);
    if (!student || student.status !== 'active') {
      return { authorized: false, reason: 'Student account is not active.' };
    }

    // Must be student role
    if (student.role !== 'student') {
      return { authorized: false, reason: 'User is not a student.' };
    }

    // Assignment must not be draft
    if (assignment.status === 'draft') {
      return { authorized: false, reason: 'This assignment is not yet published.' };
    }

    // Must belong to the same school
    if (assignment.schoolId !== student.schoolId) {
      return { authorized: false, reason: 'Assignment belongs to a different school.' };
    }

    // Must belong to the same class level
    if (assignment.classLevel !== student.classLevel) {
      return { authorized: false, reason: `Assignment is for ${assignment.classLevel}, but you are in ${student.classLevel}.` };
    }

    // If targeted to specific students
    if (
      assignment.studentTargetMode === 'selected_students' &&
      Array.isArray(assignment.targetStudentIds) &&
      !assignment.targetStudentIds.includes(studentId)
    ) {
      return { authorized: false, reason: 'You were not selected for this targeted assignment.' };
    }

    // Check if assignment is closed and late submissions not allowed
    if (assignment.status === 'closed' || assignment.status === 'archived') {
      const existingSubmission = this.findAssignmentSubmission(assignmentId, studentId);
      // If already submitted, student can view their results
      if (existingSubmission && (existingSubmission.status === 'submitted' || existingSubmission.status === 'evaluated')) {
        return { authorized: true };
      }
      return { authorized: false, reason: 'This assignment is closed and no longer accepting submissions.' };
    }

    return { authorized: true };
  }

  /**
   * Compute comprehensive completion and performance metrics for an assignment
   */
  public getAssignmentStats(assignmentId: string): {
    assignedCount: number;
    startedCount: number;
    submittedCount: number;
    averageScore: number;
    completionRate: number;
  } {
    const assignment = this.findAssignmentById(assignmentId);
    if (!assignment) {
      return { assignedCount: 0, startedCount: 0, submittedCount: 0, averageScore: 0, completionRate: 0 };
    }

    // Determine target students
    let assignedCount = 0;
    if (assignment.studentTargetMode === 'selected_students' && Array.isArray(assignment.targetStudentIds)) {
      assignedCount = assignment.targetStudentIds.length;
    } else {
      const students = this.getStudentsForClass(assignment.schoolId, assignment.classLevel);
      assignedCount = students.length;
    }

    const submissions = this.listSubmissionsForAssignment(assignmentId);
    const startedCount = submissions.filter((s) => s.status !== 'not_started').length;
    const completedSubs = submissions.filter(
      (s) => (s.status === 'submitted' || s.status === 'evaluated') && s.percentage !== undefined
    );
    const submittedCount = completedSubs.length;

    const totalPercentage = completedSubs.reduce((sum, s) => sum + (s.percentage || 0), 0);
    const averageScore = submittedCount > 0 ? Math.round(totalPercentage / submittedCount) : 0;
    const completionRate = assignedCount > 0 ? Math.round((submittedCount / assignedCount) * 100) : 0;

    return {
      assignedCount,
      startedCount,
      submittedCount,
      averageScore,
      completionRate,
    };
  }

  /**
   * Principal Assignment Analytics (Scoped strictly to principal's school)
   */
  public getPrincipalAssignmentAnalytics(schoolId: string) {
    const school = this.findSchoolById(schoolId);
    const schoolName = school?.name || 'School';

    const assignments = (this.db.assignments || []).filter((a) => a.schoolId === schoolId);
    const activeAssignments = assignments.filter((a) => a.status === 'published');
    const allSubmissions = (this.db.assignmentSubmissions || []).filter((s) => s.schoolId === schoolId);
    const completedSubmissions = allSubmissions.filter(
      (s) => (s.status === 'submitted' || s.status === 'evaluated') && s.percentage !== undefined
    );

    const now = new Date();
    let overdueCount = 0;
    for (const a of activeAssignments) {
      if (a.dueDate && new Date(a.dueDate) < now) {
        const stats = this.getAssignmentStats(a.id);
        if (stats.submittedCount < stats.assignedCount) {
          overdueCount += (stats.assignedCount - stats.submittedCount);
        }
      }
    }

    const totalScoreSum = completedSubmissions.reduce((sum, s) => sum + (s.percentage || 0), 0);
    const averageScore = completedSubmissions.length > 0 ? Math.round(totalScoreSum / completedSubmissions.length) : 0;

    // Total expected submissions across all published assignments
    let totalAssignedSum = 0;
    let totalSubmittedSum = 0;
    for (const a of activeAssignments) {
      const stats = this.getAssignmentStats(a.id);
      totalAssignedSum += stats.assignedCount;
      totalSubmittedSum += stats.submittedCount;
    }
    const averageCompletionRate = totalAssignedSum > 0 ? Math.round((totalSubmittedSum / totalAssignedSum) * 100) : 0;

    // Class breakdown
    const classMap: Record<string, { totalAssignments: number; totalAssigned: number; totalSubmitted: number; scoreSum: number; scoreCount: number }> = {};
    const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
    for (const cls of classes) {
      classMap[cls] = { totalAssignments: 0, totalAssigned: 0, totalSubmitted: 0, scoreSum: 0, scoreCount: 0 };
    }

    for (const a of assignments) {
      if (classMap[a.classLevel]) {
        classMap[a.classLevel].totalAssignments += 1;
        const stats = this.getAssignmentStats(a.id);
        classMap[a.classLevel].totalAssigned += stats.assignedCount;
        classMap[a.classLevel].totalSubmitted += stats.submittedCount;
      }
    }

    for (const s of completedSubmissions) {
      if (classMap[s.classLevel]) {
        classMap[s.classLevel].scoreSum += (s.percentage || 0);
        classMap[s.classLevel].scoreCount += 1;
      }
    }

    const classBreakdown = classes.map((cls) => {
      const data = classMap[cls];
      const rate = data.totalAssigned > 0 ? Math.round((data.totalSubmitted / data.totalAssigned) * 100) : 0;
      const avg = data.scoreCount > 0 ? Math.round(data.scoreSum / data.scoreCount) : 0;
      return {
        classLevel: cls,
        totalAssignments: data.totalAssignments,
        completionRate: rate,
        averageScore: avg,
      };
    });

    // Subject breakdown
    const subjectMap: Record<string, { subjectName: string; totalAssignments: number; totalAssigned: number; totalSubmitted: number; scoreSum: number; scoreCount: number }> = {};
    for (const a of assignments) {
      if (!subjectMap[a.subjectId]) {
        subjectMap[a.subjectId] = {
          subjectName: a.subjectId.charAt(0).toUpperCase() + a.subjectId.slice(1).replace(/_/g, ' '),
          totalAssignments: 0,
          totalAssigned: 0,
          totalSubmitted: 0,
          scoreSum: 0,
          scoreCount: 0,
        };
      }
      subjectMap[a.subjectId].totalAssignments += 1;
      const stats = this.getAssignmentStats(a.id);
      subjectMap[a.subjectId].totalAssigned += stats.assignedCount;
      subjectMap[a.subjectId].totalSubmitted += stats.submittedCount;
    }

    for (const s of completedSubmissions) {
      if (subjectMap[s.subjectId]) {
        subjectMap[s.subjectId].scoreSum += (s.percentage || 0);
        subjectMap[s.subjectId].scoreCount += 1;
      }
    }

    const subjectBreakdown = Object.entries(subjectMap).map(([subjectId, data]) => ({
      subjectId,
      subjectName: data.subjectName,
      totalAssignments: data.totalAssignments,
      completionRate: data.totalAssigned > 0 ? Math.round((data.totalSubmitted / data.totalAssigned) * 100) : 0,
      averageScore: data.scoreCount > 0 ? Math.round(data.scoreSum / data.scoreCount) : 0,
    }));

    // Low completion classes
    const lowCompletionClasses = classBreakdown
      .filter((c) => c.completionRate < 70 && c.totalAssignments > 0)
      .map((c) => ({
        classLevel: c.classLevel,
        completionRate: c.completionRate,
        pendingCount: classMap[c.classLevel].totalAssigned - classMap[c.classLevel].totalSubmitted,
      }));

    // Struggling topics (average score < 60%)
    const topicMap: Record<string, { topicTitle: string; subjectName: string; scoreSum: number; count: number }> = {};
    for (const a of assignments) {
      if (a.topicId) {
        const subs = this.listSubmissionsForAssignment(a.id).filter((s) => s.percentage !== undefined);
        if (subs.length > 0) {
          if (!topicMap[a.topicId]) {
            topicMap[a.topicId] = {
              topicTitle: a.topicTitle || a.title,
              subjectName: a.subjectId.charAt(0).toUpperCase() + a.subjectId.slice(1).replace(/_/g, ' '),
              scoreSum: 0,
              count: 0,
            };
          }
          for (const s of subs) {
            topicMap[a.topicId].scoreSum += (s.percentage || 0);
            topicMap[a.topicId].count += 1;
          }
        }
      }
    }

    const strugglingTopics = Object.entries(topicMap)
      .map(([topicId, data]) => ({
        topicId,
        topicTitle: data.topicTitle,
        subjectName: data.subjectName,
        averageScore: data.count > 0 ? Math.round(data.scoreSum / data.count) : 0,
        attemptsCount: data.count,
      }))
      .filter((t) => t.averageScore < 60)
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 5);

    return {
      schoolId,
      schoolName,
      totalAssignments: assignments.length,
      activeAssignments: activeAssignments.length,
      totalSubmissions: completedSubmissions.length,
      averageCompletionRate,
      averageScore,
      overdueCount,
      classBreakdown,
      subjectBreakdown,
      lowCompletionClasses,
      strugglingTopics,
    };
  }

  /**
   * Company Admin Platform-Wide Assignment Analytics
   */
  public getAdminAssignmentAnalytics() {
    const assignments = this.db.assignments || [];
    const activeAssignments = assignments.filter((a) => a.status === 'published');
    const allSubmissions = this.db.assignmentSubmissions || [];
    const completedSubmissions = allSubmissions.filter(
      (s) => (s.status === 'submitted' || s.status === 'evaluated') && s.percentage !== undefined
    );

    const totalScoreSum = completedSubmissions.reduce((sum, s) => sum + (s.percentage || 0), 0);
    const averageScore = completedSubmissions.length > 0 ? Math.round(totalScoreSum / completedSubmissions.length) : 0;

    let totalAssignedSum = 0;
    let totalSubmittedSum = 0;
    for (const a of activeAssignments) {
      const stats = this.getAssignmentStats(a.id);
      totalAssignedSum += stats.assignedCount;
      totalSubmittedSum += stats.submittedCount;
    }
    const averageCompletionRate = totalAssignedSum > 0 ? Math.round((totalSubmittedSum / totalAssignedSum) * 100) : 0;

    // School comparison
    const schools = this.listSchools();
    const schoolComparison = schools.map((sch) => {
      const schAssignments = assignments.filter((a) => a.schoolId === sch.id);
      const schSubmissions = completedSubmissions.filter((s) => s.schoolId === sch.id);
      const scoreSum = schSubmissions.reduce((sum, s) => sum + (s.percentage || 0), 0);
      const avg = schSubmissions.length > 0 ? Math.round(scoreSum / schSubmissions.length) : 0;

      let schAssigned = 0;
      let schSubmitted = 0;
      for (const a of schAssignments.filter((a) => a.status === 'published')) {
        const stats = this.getAssignmentStats(a.id);
        schAssigned += stats.assignedCount;
        schSubmitted += stats.submittedCount;
      }
      const completionRate = schAssigned > 0 ? Math.round((schSubmitted / schAssigned) * 100) : 0;

      return {
        schoolId: sch.id,
        schoolName: sch.name,
        totalAssignments: schAssignments.length,
        submissionsCount: schSubmissions.length,
        completionRate,
        averageScore: avg,
      };
    });

    const topActiveSchools = [...schoolComparison]
      .sort((a, b) => b.totalAssignments - a.totalAssignments)
      .slice(0, 5)
      .map((s) => ({
        schoolId: s.schoolId,
        schoolName: s.schoolName,
        assignmentsCount: s.totalAssignments,
      }));

    // Subject activity
    const subjectMap: Record<string, { subjectName: string; assignmentsCount: number; submissionsCount: number; scoreSum: number }> = {};
    for (const a of assignments) {
      if (!subjectMap[a.subjectId]) {
        subjectMap[a.subjectId] = {
          subjectName: a.subjectId.charAt(0).toUpperCase() + a.subjectId.slice(1).replace(/_/g, ' '),
          assignmentsCount: 0,
          submissionsCount: 0,
          scoreSum: 0,
        };
      }
      subjectMap[a.subjectId].assignmentsCount += 1;
    }

    for (const s of completedSubmissions) {
      if (subjectMap[s.subjectId]) {
        subjectMap[s.subjectId].submissionsCount += 1;
        subjectMap[s.subjectId].scoreSum += (s.percentage || 0);
      }
    }

    const subjectActivity = Object.entries(subjectMap).map(([subjectId, data]) => ({
      subjectId,
      subjectName: data.subjectName,
      assignmentsCount: data.assignmentsCount,
      submissionsCount: data.submissionsCount,
      averageScore: data.submissionsCount > 0 ? Math.round(data.scoreSum / data.submissionsCount) : 0,
    }));

    // Platform struggling topics
    const topicMap: Record<string, { topicTitle: string; subjectName: string; scoreSum: number; count: number }> = {};
    for (const a of assignments) {
      if (a.topicId) {
        const subs = this.listSubmissionsForAssignment(a.id).filter((s) => s.percentage !== undefined);
        if (subs.length > 0) {
          if (!topicMap[a.topicId]) {
            topicMap[a.topicId] = {
              topicTitle: a.topicTitle || a.title,
              subjectName: a.subjectId.charAt(0).toUpperCase() + a.subjectId.slice(1).replace(/_/g, ' '),
              scoreSum: 0,
              count: 0,
            };
          }
          for (const s of subs) {
            topicMap[a.topicId].scoreSum += (s.percentage || 0);
            topicMap[a.topicId].count += 1;
          }
        }
      }
    }

    const platformStrugglingTopics = Object.entries(topicMap)
      .map(([topicId, data]) => ({
        topicId,
        topicTitle: data.topicTitle,
        subjectName: data.subjectName,
        averageScore: data.count > 0 ? Math.round(data.scoreSum / data.count) : 0,
        submissionsCount: data.count,
      }))
      .filter((t) => t.averageScore < 60)
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 8);

    return {
      totalAssignments: assignments.length,
      activeAssignments: activeAssignments.length,
      totalSubmissions: completedSubmissions.length,
      averageCompletionRate,
      averageScore,
      schoolComparison,
      topActiveSchools,
      subjectActivity,
      platformStrugglingTopics,
    };
  }
}

export const cloudDb = new CloudDatabase();
