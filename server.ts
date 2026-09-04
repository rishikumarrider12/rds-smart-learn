import express from "express";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { cloudDb, DbUser, DbTeacherRequest, resolveCurriculumSubject } from "./server/db";
import { ALL_SUBJECT_NAMES } from "./src/data/syllabusData";
import { buildStudentAnalyticsOverview } from "./server/analyticsEngine";
import {
  buildTeacherDashboardData,
  buildTeacherAssignmentAnalytics,
  buildPrincipalDashboardData,
  buildCompanyAdminDashboardData,
} from "./server/orgAnalyticsEngine";
import {
  generateAssignmentQuestions,
  evaluateAssignmentSubmission,
  sanitizeAssignmentForStudent,
} from "./server/assignmentEngine";
import { 
  authenticateToken, 
  optionalAuthenticate,
  requireRole, 
  sanitizeUser, 
  AuthenticatedRequest, 
  extractTokenFromRequest 
} from "./server/authMiddleware";
import { 
  forgotPasswordRateLimiter, 
  loginRateLimiter, 
  trackFailedLogin, 
  clearFailedLogin, 
  aiBurstLimiter, 
  getClientIp 
} from "./server/rateLimiter";
import { sendPasswordResetEmail } from "./server/emailService";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Lazy initialize Gemini client to avoid crashes if key is missing initially
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Cookie session configuration helper
function setSessionCookie(res: express.Response, token: string) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("rds_session_token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
}

function clearSessionCookie(res: express.Response) {
  res.clearCookie("rds_session_token", { path: "/" });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    service: "RDS SMART LEARN API",
    authReady: true,
    persistence: "CloudDatabase-v2",
  });
});

// Helper sleep function for retry backoff
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Candidate models for graceful fallback
const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
];

// Per-model attempt timeout to prevent indefinite hanging (ms)
const AI_REQUEST_TIMEOUT_MS = 30000;

function isTransientError(error: any): boolean {
  if (!error) return false;
  const status = error.status || error.code || error.statusCode;
  const msg = String(error.message || error).toLowerCase();
  
  return (
    status === 503 ||
    status === 429 ||
    status === 500 ||
    status === "UNAVAILABLE" ||
    status === "RESOURCE_EXHAUSTED" ||
    msg.includes("503") ||
    msg.includes("high demand") ||
    msg.includes("unavailable") ||
    msg.includes("overloaded") ||
    msg.includes("rate limit") ||
    msg.includes("quota") ||
    msg.includes("try again")
  );
}

// Resilient execution with candidate model failover and exponential retry
async function generateContentWithFailover(
  ai: GoogleGenAI,
  contents: any,
  config: Record<string, any>
): Promise<{ text: string; modelUsed: string; candidates?: any[] }> {
  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      // Per-attempt timeout prevents indefinite hangs on an unresponsive model
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: { ...config, abortSignal: controller.signal },
        });

        const text = response.text || "";
        if (text) {
          return {
            text,
            modelUsed: modelName,
            candidates: response.candidates,
          };
        }
      } catch (err: any) {
        lastError = err;
        const isAbort = err?.name === 'AbortError';
        console.warn(`[RDS AI Failover] Model ${modelName} attempt ${attempt + 1} encountered error:`, err?.message || err);

        // Retry on transient errors or timeouts (when attempts remain)
        if ((isTransientError(err) || isAbort) && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 400 + Math.random() * 200;
          await sleep(delay);
          continue;
        }
        // Non-retryable or exhausted retries — move to next candidate model
        break;
      } finally {
        clearTimeout(timeoutId);
      }
    }
    // Brief pause before trying the next model candidate
    await sleep(300);
  }

  throw lastError || new Error("All AI model candidates failed to generate content.");
}

// ==========================================
// 🏫 PUBLIC INSTITUTIONS API (PHASE 7)
// ==========================================
app.get("/api/schools/public", (_req, res) => {
  try {
    const schools = cloudDb.listSchools({ status: "active", isActive: true });
    const publicList = schools.map((s) => ({
      id: s.id,
      name: s.name,
      schoolCode: s.schoolCode,
      city: s.city,
      district: s.district,
      state: s.state,
    }));
    return res.json({
      success: true,
      schools: publicList,
    });
  } catch (error: any) {
    console.error("Public schools list error:", error);
    return res.status(500).json({ error: "Failed to retrieve schools list." });
  }
});

// ==========================================
// 🔐 AUTHENTICATION & ACCESS CONTROL API
// ==========================================

// 1. Student Public Registration (/api/auth/signup)
app.post("/api/auth/signup", (req, res) => {
  try {
    const { fullName, email, password, mobileNumber, schoolId, schoolName, classLevel, referenceName } = req.body;

    if (!fullName || !email || !password || (!schoolName && !schoolId) || !classLevel) {
      return res.status(400).json({
        error: "Full name, email, password, school information, and class level are required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }

    // Check if user already exists
    const existing = cloudDb.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        error: "An account with this email address already exists. Please sign in or use forgot password.",
      });
    }

    // Resolve School Information
    let resolvedSchoolId: string | undefined = schoolId;
    let resolvedSchoolName: string = schoolName ? schoolName.trim() : "";

    if (schoolId) {
      const sch = cloudDb.findSchoolById(schoolId);
      if (sch) {
        resolvedSchoolId = sch.id;
        resolvedSchoolName = sch.name;
      }
    } else if (resolvedSchoolName) {
      const match = cloudDb.listSchools().find(
        (s) => s.name.trim().toLowerCase() === resolvedSchoolName.toLowerCase()
      );
      if (match) {
        resolvedSchoolId = match.id;
        resolvedSchoolName = match.name;
      }
    }

    const { hash, salt } = cloudDb.hashPassword(password);

    // Enforce role "student" for public signup to prevent unauthorized privilege escalation
    const newUser = cloudDb.createUser({
      role: "student",
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hash,
      salt,
      mobileNumber: mobileNumber ? mobileNumber.trim() : undefined,
      schoolId: resolvedSchoolId,
      schoolName: resolvedSchoolName,
      classLevel: classLevel.trim(),
      referenceName: referenceName ? referenceName.trim() : undefined,
      status: "active",
    });

    // Create session
    const session = cloudDb.createSession(newUser.id);
    setSessionCookie(res, session.token);

    return res.status(201).json({
      success: true,
      token: session.token,
      user: sanitizeUser(newUser),
      message: "Account created successfully. Welcome to RDS SMART LEARN!",
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Failed to create account. Please try again." });
  }
});

// 1b. Teacher Account Request (PUBLIC — permission-based signup)
// Creates a PENDING request only. No usable teacher account exists until a
// company_admin (Super Admin) approves it via /api/admin/teacher-requests/:id/approve.
app.post("/api/auth/teacher-request", loginRateLimiter, (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      phone,
      employeeId,
      qualification,
      schoolName,
      requestedClasses,
      requestedSubjects,
      otherSubject,
    } = req.body;

    if (!fullName || !email || !password || !confirmPassword || !schoolName) {
      return res.status(400).json({
        error: "Full name, email, school, password and confirm password are required.",
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Password and Confirm Password do not match." });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    // Cannot request an account that already exists as a real user
    const existingUser = cloudDb.findUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email address already exists. Please sign in instead.",
      });
    }

    const existingRequest = cloudDb.findTeacherRequestByEmail(cleanEmail);
    if (existingRequest && existingRequest.status === 'pending') {
      return res.status(409).json({
        error:
          'A teacher account request for this email is already awaiting Super Admin approval.',
        code: 'TEACHER_REQUEST_PENDING',
      });
    }
    if (existingRequest && existingRequest.status === 'rejected') {
      return res.status(409).json({
        error:
          'Your previous teacher account request was rejected. Please contact the Super Admin before submitting a new request.',
        code: 'TEACHER_REQUEST_REJECTED',
      });
    }

    const classes = Array.isArray(requestedClasses)
      ? Array.from(new Set(requestedClasses.map((c: string) => String(c).trim()).filter(Boolean)))
      : [];
    const rawSubjects = Array.isArray(requestedSubjects)
      ? Array.from(new Set(requestedSubjects.map((s: string) => String(s).trim()).filter(Boolean)))
      : [];

    // Validate "Other Subject" custom text (if provided)
    let normalizedOtherSubject: string | undefined;
    if (otherSubject !== undefined && otherSubject !== null) {
      const trimmed = String(otherSubject).trim();
      if (trimmed.length === 0) {
        return res.status(400).json({ error: "Please enter the other subject name." });
      }
      if (trimmed.length > 100) {
        return res.status(400).json({ error: "Other subject name must be 100 characters or fewer." });
      }
      // Custom subject must not duplicate an existing curriculum subject
      // (case-insensitive) — the teacher should select it from the list instead.
      const duplicatesCurriculum = ALL_SUBJECT_NAMES.some(
        (s) => s.trim().toLowerCase() === trimmed.toLowerCase()
      );
      if (duplicatesCurriculum) {
        return res.status(400).json({
          error:
            "This subject is already available in the list. Please select it from the subject options instead of entering it as an other subject.",
        });
      }
      normalizedOtherSubject = trimmed;
    }

    // Drop any selected subject that exactly duplicates the custom subject
    const subjects = normalizedOtherSubject
      ? rawSubjects.filter((s) => s.toLowerCase() !== normalizedOtherSubject!.toLowerCase())
      : rawSubjects;

    // At least one subject (predefined or the custom "Other Subject") is required
    if (classes.length === 0 || subjects.length + (normalizedOtherSubject ? 1 : 0) === 0) {
      return res
        .status(400)
        .json({ error: "Please select at least one requested class and one subject." });
    }

    // Resolve the real school record (Slate High School is the configured school)
    let resolvedSchoolId: string | undefined;
    let resolvedSchoolName = String(schoolName).trim();
    const match = cloudDb
      .listSchools()
      .find((s) => s.name.trim().toLowerCase() === resolvedSchoolName.toLowerCase());
    if (match) {
      resolvedSchoolId = match.id;
      resolvedSchoolName = match.name;
    }

    const { hash, salt } = cloudDb.hashPassword(password);
    const request = cloudDb.createTeacherRequest({
      fullName: String(fullName).trim(),
      email: cleanEmail,
      passwordHash: hash,
      salt,
      schoolId: resolvedSchoolId,
      schoolName: resolvedSchoolName,
      phone: phone ? String(phone).trim() : undefined,
      employeeId: employeeId ? String(employeeId).trim() : undefined,
      qualification: qualification ? String(qualification).trim() : undefined,
      requestedClasses: classes,
      requestedSubjects: subjects,
      otherSubject: normalizedOtherSubject,
    });

    return res.status(201).json({
      success: true,
      message:
        "Your teacher account request has been submitted and is now pending Super Admin approval.",
      requestId: request.id,
      status: request.status,
    });
  } catch (error: any) {
    console.error("Teacher request error:", error);
    return res.status(500).json({ error: "Failed to submit teacher account request." });
  }
});

// 2. User Sign In (/api/auth/login) with Brute-Force Rate Limiting
app.post("/api/auth/login", loginRateLimiter, (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = cloudDb.findUserByEmail(email);
    if (!user) {
      // Teacher approval workflow: give accurate, safe guidance for request-based accounts
      const teacherRequest = cloudDb.findTeacherRequestByEmail(email);
      if (teacherRequest) {
        if (teacherRequest.status === 'pending') {
          return res.status(403).json({
            error:
              'This teacher account is awaiting Super Admin approval. You will be able to sign in once your request has been approved.',
            code: 'TEACHER_REQUEST_PENDING',
          });
        }
        if (teacherRequest.status === 'rejected') {
          const reasonSuffix = teacherRequest.rejectionReason
            ? ` Reason: ${teacherRequest.rejectionReason}`
            : '';
          return res.status(403).json({
            error: `Your teacher account request was rejected by the Super Admin.${reasonSuffix}`,
            code: 'TEACHER_REQUEST_REJECTED',
          });
        }
      }
      trackFailedLogin(req, email);
      return res.status(401).json({ error: "Invalid email or password. Please check your credentials." });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        error: "This account is suspended. Please contact the RDS administration team.",
      });
    }

    if (user.status === "inactive") {
      return res.status(403).json({
        error: "This account is inactive. Please contact the RDS administration team.",
      });
    }

    const isValid = cloudDb.verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      trackFailedLogin(req, email);
      return res.status(401).json({ error: "Invalid email or password. Please check your credentials." });
    }

    // Clear failed login tracker on valid authentication
    clearFailedLogin(req, email);

    // Create session token
    const session = cloudDb.createSession(user.id);
    setSessionCookie(res, session.token);

    return res.json({
      success: true,
      token: session.token,
      user: sanitizeUser(user),
      message: `Welcome back, ${user.fullName}!`,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Failed to authenticate. Please try again." });
  }
});

// 3. User Sign Out (/api/auth/logout)
app.post("/api/auth/logout", (req, res) => {
  try {
    const token = extractTokenFromRequest(req);
    if (token) {
      cloudDb.deleteSession(token);
    }
    clearSessionCookie(res);
    return res.json({ success: true, message: "Logged out successfully." });
  } catch (error: any) {
    clearSessionCookie(res);
    return res.json({ success: true, message: "Logged out." });
  }
});

// 4. Current Authenticated User (/api/auth/me)
app.get("/api/auth/me", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return res.json({
    success: true,
    user: sanitizeUser(req.user),
  });
});

// 5. Update Profile (/api/auth/profile)
app.put("/api/auth/profile", authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { fullName, schoolName, classLevel, mobileNumber, referenceName } = req.body;

    const updated = cloudDb.updateUser(req.user.id, {
      fullName: fullName !== undefined ? fullName.trim() : req.user.fullName,
      schoolName: schoolName !== undefined ? schoolName.trim() : req.user.schoolName,
      classLevel: classLevel !== undefined ? classLevel.trim() : req.user.classLevel,
      mobileNumber: mobileNumber !== undefined ? mobileNumber.trim() : req.user.mobileNumber,
      referenceName: referenceName !== undefined ? referenceName.trim() : req.user.referenceName,
    });

    if (!updated) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json({
      success: true,
      user: sanitizeUser(updated),
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return res.status(500).json({ error: "Failed to update profile." });
  }
});

// 6. Forgot Password Request (/api/auth/forgot-password) - Rate Limited & Zero Token Leakage
app.post("/api/auth/forgot-password", forgotPasswordRateLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = cloudDb.findUserByEmail(cleanEmail);

    if (user && user.status === "active") {
      const resetToken = cloudDb.createPasswordReset(cleanEmail, getClientIp(req));
      
      // Out-of-band delivery: Email service or server terminal log (NEVER returned in HTTP response)
      await sendPasswordResetEmail({
        email: cleanEmail,
        fullName: user.fullName,
        resetToken,
        expiresInMinutes: 60,
      });
    }

    // Generic response regardless of whether email exists to prevent user enumeration
    return res.json({
      success: true,
      message: "If an account exists with this email address, password reset instructions and a verification code have been dispatched.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ error: "Failed to process forgot password request." });
  }
});

// 7. Reset Password with Token (/api/auth/reset-password)
app.post("/api/auth/reset-password", (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "Verification token and new passwords are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }

    const email = cloudDb.verifyPasswordReset(token.trim());
    if (!email) {
      return res.status(400).json({ error: "Invalid or expired reset code. Please request a new verification code." });
    }

    const user = cloudDb.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User account not found." });
    }

    cloudDb.updatePassword(user.id, newPassword);
    cloudDb.markPasswordResetUsed(token.trim());
    clearFailedLogin(req, email);

    return res.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return res.status(500).json({ error: "Failed to reset password." });
  }
});

// 8. Authenticated Change Password (/api/auth/change-password)
app.post("/api/auth/change-password", authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "Current password, new password, and confirmation are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New password and confirmation do not match." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters long." });
    }

    const isCurrentValid = cloudDb.verifyPassword(currentPassword, req.user.passwordHash, req.user.salt);
    if (!isCurrentValid) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    cloudDb.updatePassword(req.user.id, newPassword);

    return res.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return res.status(500).json({ error: "Failed to change password." });
  }
});

// =======================================================
// 👨‍🏫 TEACHER PORTAL & CLASS ANALYTICS API (PHASE 7)
// =======================================================

// 1. Teacher Dashboard Overview
app.get(
  "/api/teacher/dashboard",
  authenticateToken,
  requireRole(["teacher"]),
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const assignmentId = req.query.assignmentId as string | undefined;
      const data = buildTeacherDashboardData(req.user.id, assignmentId);

      if (!data) {
        return res.status(404).json({ error: "Teacher profile or assignments not found." });
      }

      return res.json({
        success: true,
        ...data,
      });
    } catch (error: any) {
      console.error("Teacher dashboard error:", error);
      return res.status(500).json({ error: "Failed to generate teacher dashboard data." });
    }
  }
);

// 2. Teacher Active Assignments List
app.get(
  "/api/teacher/assignments",
  authenticateToken,
  requireRole(["teacher"]),
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const assignments = cloudDb.getTeacherActiveAssignments(req.user.id);
      const enriched = assignments.map((a) => {
        const sch = cloudDb.findSchoolById(a.schoolId);
        return {
          ...a,
          teacherName: req.user?.fullName,
          teacherEmail: req.user?.email,
          schoolName: sch?.name || req.user?.schoolName,
        };
      });

      return res.json({
        success: true,
        assignments: enriched,
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to fetch teacher assignments." });
    }
  }
);

// 3. Teacher Assignment Specific Students Roster & Analytics
app.get(
  "/api/teacher/assignment/:assignmentId/analytics",
  authenticateToken,
  requireRole(["teacher"]),
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { assignmentId } = req.params;

      const assignment = cloudDb.findTeacherAssignmentById(assignmentId);
      if (!assignment || assignment.teacherId !== req.user.id || !assignment.isActive) {
        return res.status(403).json({ error: "Access denied to this assignment." });
      }

      const school = cloudDb.findSchoolById(assignment.schoolId);
      if (!school || school.status !== "active" || !school.isActive) {
        return res.status(403).json({ error: "Access denied. School is suspended or inactive." });
      }

      const details = buildTeacherAssignmentAnalytics(assignmentId);
      if (!details) {
        return res.status(404).json({ error: "Assignment analytics not found or inactive." });
      }

      return res.json({
        success: true,
        ...details,
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to fetch assignment analytics." });
    }
  }
);

// 4. Teacher Student Deep View (Strictly scoped to assigned students & authorized subjects)
app.get(
  "/api/teacher/students/:studentId",
  authenticateToken,
  requireRole(["teacher"]),
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { studentId } = req.params;
      const requestedSubject = req.query.subjectId as string | undefined;

      const student = cloudDb.findUserById(studentId);
      if (!student || student.role !== "student") {
        return res.status(404).json({ error: "Student not found." });
      }

      // Strict Backend Verification: Is teacher assigned to this student's school and class?
      const isAuthorized = cloudDb.isTeacherAuthorizedForStudent(
        req.user.id,
        studentId,
        requestedSubject
      );
      if (!isAuthorized) {
        return res.status(403).json({
          error: "Access denied. You can only view analytics for students in your assigned schools, classes, and subjects.",
        });
      }

      // Determine all subjects the teacher is authorized to teach for this student
      const teacherAsgns = cloudDb.getTeacherActiveAssignments(req.user.id).filter((a) => {
        const sch = cloudDb.findSchoolById(a.schoolId);
        if (!sch || sch.status !== "active" || !sch.isActive) return false;
        const matchClass = a.classLevel === student.classLevel;
        const matchSchool =
          student.schoolId === a.schoolId ||
          (student.schoolName && student.schoolName.trim().toLowerCase() === sch.name.trim().toLowerCase());
        return matchClass && matchSchool;
      });

      const authorizedSubjectIds = new Set(teacherAsgns.map((a) => a.subjectId.toLowerCase().replace(/\s+/g, "_")));

      const fullAnalytics = buildStudentAnalyticsOverview(student.id, student.classLevel || "Class 10");

      // Scope subject metrics to authorized subjects only
      let scopedSubjects = fullAnalytics.subjects.filter((s) =>
        authorizedSubjectIds.has(s.subjectId.toLowerCase().replace(/\s+/g, "_"))
      );

      if (requestedSubject) {
        const cleanRequested = requestedSubject.toLowerCase().replace(/\s+/g, "_");
        scopedSubjects = scopedSubjects.filter(
          (s) => s.subjectId.toLowerCase().replace(/\s+/g, "_") === cleanRequested
        );
      }

      const scopedAnalytics = {
        ...fullAnalytics,
        subjects: scopedSubjects,
      };

      return res.json({
        success: true,
        student: sanitizeUser(student),
        analytics: scopedAnalytics,
      });
    } catch (error: any) {
      console.error("Teacher student view error:", error);
      return res.status(500).json({ error: "Failed to retrieve student analytics." });
    }
  }
);

// =======================================================
// 🏫 PRINCIPAL PORTAL & INSTITUTION ANALYTICS (PHASE 7)
// =======================================================

// 1. Principal School Dashboard
app.get(
  "/api/principal/dashboard",
  authenticateToken,
  requireRole(["principal"]),
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      let schoolId = req.user.schoolId;
      let school = schoolId ? cloudDb.findSchoolById(schoolId) : null;

      if (!school && req.user.schoolName) {
        school =
          cloudDb.listSchools().find(
            (s) => s.name.trim().toLowerCase() === req.user?.schoolName?.trim().toLowerCase()
          ) || null;
        if (school) schoolId = school.id;
      }

      if (!school && req.user.id) {
        school =
          cloudDb.listSchools().find((s) => s.principalId === req.user?.id) || null;
        if (school) schoolId = school.id;
      }

      if (!school || !schoolId) {
        return res.status(403).json({
          error: "Access denied. No authorized school is linked to this Principal account.",
        });
      }

      if (school.status !== "active" || !school.isActive) {
        return res.status(403).json({
          error: "Access denied. Your assigned school is currently suspended or inactive.",
        });
      }

      const data = buildPrincipalDashboardData(schoolId);
      if (!data) {
        return res.status(404).json({ error: "School analytics data could not be generated." });
      }

      return res.json({
        success: true,
        ...data,
      });
    } catch (error: any) {
      console.error("Principal dashboard error:", error);
      return res.status(500).json({ error: "Failed to generate principal dashboard." });
    }
  }
);

// 2. Principal Student Deep View (Strictly scoped to principal's school)
app.get(
  "/api/principal/students/:studentId",
  authenticateToken,
  requireRole(["principal"]),
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { studentId } = req.params;

      const student = cloudDb.findUserById(studentId);
      if (!student || student.role !== "student") {
        return res.status(404).json({ error: "Student not found." });
      }

      // Strict Backend Verification: Is student enrolled in principal's school?
      const isAuthorized = cloudDb.isPrincipalAuthorizedForStudent(req.user.id, studentId);
      if (!isAuthorized) {
        return res.status(403).json({
          error: "Access denied. You can only view analytics for students enrolled in your school.",
        });
      }

      const analytics = buildStudentAnalyticsOverview(student.id, student.classLevel || "Class 10");

      return res.json({
        success: true,
        student: sanitizeUser(student),
        analytics,
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to retrieve student analytics." });
    }
  }
);

// =======================================================
// 🛡️ COMPANY ADMIN & SCHOOL MANAGEMENT API (PHASE 7)
// =======================================================

// 1. Company Admin Platform Dashboard Overview
app.get(
  "/api/admin/dashboard",
  authenticateToken,
  requireRole(["company_admin"]),
  (_req: AuthenticatedRequest, res) => {
    try {
      const data = buildCompanyAdminDashboardData();
      return res.json({
        success: true,
        ...data,
      });
    } catch (error: any) {
      console.error("Company admin dashboard error:", error);
      return res.status(500).json({ error: "Failed to generate admin dashboard." });
    }
  }
);

// 2. List Schools with stats
app.get(
  "/api/admin/schools",
  authenticateToken,
  requireRole(["company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      const status = req.query.status as any;
      const search = req.query.search as string;

      const schools = cloudDb.listSchools({ status, search });
      const enriched = schools.map((s) => {
        const principal = s.principalId ? cloudDb.findUserById(s.principalId) : cloudDb.findPrincipalBySchool(s.id);
        const studentCount = cloudDb.listStudentsBySchool(s.id).length;
        const teacherCount = cloudDb.listTeachersBySchool(s.id).length;
        return {
          ...s,
          principalName: principal?.fullName,
          principalEmail: principal?.email,
          totalStudents: studentCount,
          totalTeachers: teacherCount,
        };
      });

      return res.json({
        success: true,
        schools: enriched,
        count: enriched.length,
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to list schools." });
    }
  }
);

// 3. Create New School
app.post(
  "/api/admin/schools",
  authenticateToken,
  requireRole(["company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      const { name, schoolCode, address, city, district, state, country, contactEmail, contactPhone, principalId } = req.body;

      if (!name || !schoolCode) {
        return res.status(400).json({ error: "School name and unique school code are required." });
      }

      const existingCode = cloudDb.findSchoolByCode(schoolCode);
      if (existingCode) {
        return res.status(409).json({ error: `A school with code '${schoolCode}' already exists.` });
      }

      const created = cloudDb.createSchool({
        name: name.trim(),
        schoolCode: schoolCode.trim().toUpperCase(),
        address: address?.trim(),
        city: city?.trim() || "Hyderabad",
        district: district?.trim() || "Hyderabad",
        state: state?.trim() || "Telangana",
        country: country?.trim() || "India",
        contactEmail: contactEmail?.trim(),
        contactPhone: contactPhone?.trim(),
        principalId: principalId || undefined,
        isActive: true,
        status: "active",
      });

      if (principalId) {
        cloudDb.assignPrincipalToSchool(created.id, principalId);
      }

      return res.status(201).json({
        success: true,
        school: created,
        message: `School '${created.name}' (${created.schoolCode}) created successfully.`,
      });
    } catch (error: any) {
      console.error("Create school error:", error);
      return res.status(500).json({ error: "Failed to create school." });
    }
  }
);

// 4. Update School Details
app.put(
  "/api/admin/schools/:schoolId",
  authenticateToken,
  requireRole(["company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      const { schoolId } = req.params;
      const { name, schoolCode, address, city, district, state, country, contactEmail, contactPhone, principalId, status } = req.body;

      const school = cloudDb.findSchoolById(schoolId);
      if (!school) {
        return res.status(404).json({ error: "School not found." });
      }

      if (schoolCode && schoolCode.trim().toUpperCase() !== school.schoolCode) {
        const existingCode = cloudDb.findSchoolByCode(schoolCode);
        if (existingCode && existingCode.id !== schoolId) {
          return res.status(409).json({ error: `School code '${schoolCode}' is already taken.` });
        }
      }

      const updated = cloudDb.updateSchool(schoolId, {
        ...(name && { name: name.trim() }),
        ...(schoolCode && { schoolCode: schoolCode.trim().toUpperCase() }),
        address: address !== undefined ? address : school.address,
        city: city !== undefined ? city : school.city,
        district: district !== undefined ? district : school.district,
        state: state !== undefined ? state : school.state,
        country: country !== undefined ? country : school.country,
        contactEmail: contactEmail !== undefined ? contactEmail : school.contactEmail,
        contactPhone: contactPhone !== undefined ? contactPhone : school.contactPhone,
        principalId: principalId !== undefined ? principalId : school.principalId,
        ...(status && { status }),
      });

      if (principalId && principalId !== school.principalId) {
        cloudDb.assignPrincipalToSchool(schoolId, principalId);
      }

      return res.json({
        success: true,
        school: updated,
        message: "School details updated successfully.",
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to update school." });
    }
  }
);

// 5. Toggle School Status (active | inactive | suspended)
app.post(
  "/api/admin/schools/:schoolId/status",
  authenticateToken,
  requireRole(["company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      const { schoolId } = req.params;
      const { status } = req.body;

      if (!status || !["active", "inactive", "suspended"].includes(status)) {
        return res.status(400).json({ error: "Valid status ('active'|'inactive'|'suspended') is required." });
      }

      const updated = cloudDb.setSchoolStatus(schoolId, status);
      if (!updated) {
        return res.status(404).json({ error: "School not found." });
      }

      return res.json({
        success: true,
        school: updated,
        message: `School status updated to '${status}'.`,
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to update school status." });
    }
  }
);

// 6. Assign Principal to School
app.post(
  "/api/admin/schools/:schoolId/principal",
  authenticateToken,
  requireRole(["company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      const { schoolId } = req.params;
      const { principalId } = req.body;

      if (!principalId) {
        return res.status(400).json({ error: "principalId is required." });
      }

      const result = cloudDb.assignPrincipalToSchool(schoolId, principalId);
      if (!result) {
        return res.status(400).json({ error: "School or Principal account not found (or user is not a principal)." });
      }

      return res.json({
        success: true,
        school: result.school,
        principal: sanitizeUser(result.principal),
        message: `Assigned ${result.principal.fullName} as Principal for ${result.school.name}.`,
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to assign principal." });
    }
  }
);

// 7. Teacher Assignments Management
app.get(
  "/api/admin/teacher-assignments",
  authenticateToken,
  requireRole(["company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      const teacherId = req.query.teacherId as string;
      const schoolId = req.query.schoolId as string;
      const classLevel = req.query.classLevel as string;

      const assignments = cloudDb.listTeacherAssignments({ teacherId, schoolId, classLevel });
      const enriched = assignments.map((a) => {
        const teacher = cloudDb.findUserById(a.teacherId);
        const school = cloudDb.findSchoolById(a.schoolId);
        return {
          ...a,
          teacherName: teacher?.fullName,
          teacherEmail: teacher?.email,
          schoolName: school?.name,
        };
      });

      return res.json({
        success: true,
        assignments: enriched,
        count: enriched.length,
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to list teacher assignments." });
    }
  }
);

app.post(
  "/api/admin/teacher-assignments",
  authenticateToken,
  requireRole(["company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      const { teacherId, schoolId, classLevel, subjectId, isActive } = req.body;

      if (!teacherId || !schoolId || !classLevel || !subjectId) {
        return res.status(400).json({ error: "teacherId, schoolId, classLevel, and subjectId are required." });
      }

      const teacher = cloudDb.findUserById(teacherId);
      if (!teacher || teacher.role !== "teacher") {
        return res.status(400).json({ error: "Valid teacher account not found." });
      }

      const resolvedSubject = resolveCurriculumSubject(classLevel, subjectId);

      const school = cloudDb.findSchoolById(schoolId);
      if (!school) {
        return res.status(400).json({ error: "Valid school not found." });
      }

      const created = cloudDb.createTeacherAssignment({
        teacherId,
        schoolId,
        classLevel,
        subjectId: resolvedSubject.subjectId,
        subjectName: resolvedSubject.subjectName,
        isActive: isActive !== undefined ? isActive : true,
      });

      return res.status(201).json({
        success: true,
        assignment: {
          ...created,
          teacherName: teacher.fullName,
          teacherEmail: teacher.email,
          schoolName: school.name,
        },
        message: `Assigned ${teacher.fullName} to ${classLevel} - ${resolvedSubject.subjectName} at ${school.name}.`,
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to create teacher assignment." });
    }
  }
);

app.put(
  "/api/admin/teacher-assignments/:assignmentId",
  authenticateToken,
  requireRole(["company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      const { assignmentId } = req.params;
      const { classLevel, subjectId, isActive, schoolId } = req.body;

      const updated = cloudDb.updateTeacherAssignment(assignmentId, {
        ...(classLevel && { classLevel }),
        ...(subjectId && { subjectId: subjectId.toLowerCase().replace(/\s+/g, "_") }),
        ...(schoolId && { schoolId }),
        ...(isActive !== undefined && { isActive }),
      });

      if (!updated) {
        return res.status(404).json({ error: "Teacher assignment not found." });
      }

      return res.json({
        success: true,
        assignment: updated,
        message: "Teacher assignment updated successfully.",
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to update teacher assignment." });
    }
  }
);

app.delete(
  "/api/admin/teacher-assignments/:assignmentId",
  authenticateToken,
  requireRole(["company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      const { assignmentId } = req.params;
      const deleted = cloudDb.deleteTeacherAssignment(assignmentId);

      if (!deleted) {
        return res.status(404).json({ error: "Teacher assignment not found." });
      }

      return res.json({
        success: true,
        message: "Teacher assignment removed successfully.",
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to delete teacher assignment." });
    }
  }
);

// 8. User Management (All Accounts)
app.get(
  "/api/admin/accounts",
  authenticateToken,
  requireRole(["company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      const role = req.query.role as any;
      const schoolId = req.query.schoolId as string;
      const schoolName = req.query.schoolName as string;
      const status = req.query.status as any;
      const search = req.query.search as string;

      const users = cloudDb.listUsers({ role, schoolId, schoolName, status, search });
      return res.json({
        success: true,
        users: users.map(sanitizeUser),
        count: users.length,
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to retrieve accounts." });
    }
  }
);

app.get(
  "/api/admin/users",
  authenticateToken,
  requireRole(["company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      const role = req.query.role as any;
      const schoolId = req.query.schoolId as string;
      const search = req.query.search as string;

      const users = cloudDb.listUsers({ role, schoolId, search });
      return res.json({
        success: true,
        users: users.map(sanitizeUser),
        count: users.length,
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to retrieve users." });
    }
  }
);

// Create User (Teacher, Principal, Company Admin, Student)
app.post(
  "/api/admin/create-account",
  authenticateToken,
  requireRole(["company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      const {
        role,
        fullName,
        email,
        mobileNumber,
        schoolId,
        schoolName,
        classLevel,
        assignedClasses,
        assignedSubjects,
        password,
      } = req.body;

      if (!role || !fullName || !email || !password) {
        return res.status(400).json({ error: "Role, full name, email, and initial password are required." });
      }

      if (!["student", "teacher", "principal", "company_admin"].includes(role)) {
        return res.status(400).json({ error: "Invalid role specified." });
      }

      const existing = cloudDb.findUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: "An account with this email already exists." });
      }

      let resolvedSchoolId = schoolId;
      let resolvedSchoolName = schoolName;
      if (schoolId) {
        const sch = cloudDb.findSchoolById(schoolId);
        if (sch) resolvedSchoolName = sch.name;
      }

      const { hash, salt } = cloudDb.hashPassword(password);

      const created = cloudDb.createUser({
        role,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: hash,
        salt,
        mobileNumber: mobileNumber ? mobileNumber.trim() : undefined,
        schoolId: resolvedSchoolId,
        schoolName: resolvedSchoolName ? resolvedSchoolName.trim() : undefined,
        classLevel: classLevel ? classLevel.trim() : undefined,
        assignedClasses: Array.isArray(assignedClasses) ? assignedClasses : undefined,
        assignedSubjects: Array.isArray(assignedSubjects) ? assignedSubjects : undefined,
        status: "active",
      });

      // If principal, link to school
      if (role === "principal" && resolvedSchoolId) {
        cloudDb.assignPrincipalToSchool(resolvedSchoolId, created.id);
      }

      // If teacher with initial assignments
      if (role === "teacher" && resolvedSchoolId && Array.isArray(assignedClasses) && Array.isArray(assignedSubjects)) {
        for (const cls of assignedClasses) {
          for (const sub of assignedSubjects) {
            const resolvedSubject = resolveCurriculumSubject(cls, sub);
            cloudDb.createTeacherAssignment({
              teacherId: created.id,
              schoolId: resolvedSchoolId,
              classLevel: cls,
              subjectId: resolvedSubject.subjectId,
              subjectName: resolvedSubject.subjectName,
              isActive: true,
            });
          }
        }
      }

      return res.status(201).json({
        success: true,
        user: sanitizeUser(created),
        message: `Successfully created ${role} account for ${fullName}.`,
      });
    } catch (error: any) {
      console.error("Create account error:", error);
      return res.status(500).json({ error: "Failed to create account." });
    }
  }
);

// Toggle Account Status
app.patch(
  "/api/admin/account-status",
  authenticateToken,
  requireRole(["company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      const { userId, status } = req.body;

      if (!userId || !["active", "inactive", "suspended"].includes(status)) {
        return res.status(400).json({ error: "Valid userId and status ('active'|'inactive'|'suspended') are required." });
      }

      const user = cloudDb.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      // Do not allow suspending the last admin
      if (user.role === "company_admin" && status !== "active") {
        const admins = cloudDb.listUsers({ role: "company_admin" });
        if (admins.length <= 1) {
          return res.status(400).json({ error: "Cannot deactivate or suspend the only Company Admin account." });
        }
      }

      const updated = cloudDb.updateUser(userId, { status });
      return res.json({
        success: true,
        user: sanitizeUser(updated!),
        message: `Account status updated to ${status}.`,
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to update account status." });
    }
  }
);

// =======================================================
// 👩‍🏫 TEACHER APPROVAL REQUESTS (SUPER ADMIN WORKFLOW)
// =======================================================

// Strip credential material (password hash / salt) before sending teacher
// request records to any client, including the Super Admin dashboard.
function publicTeacherRequest(r: DbTeacherRequest) {
  return {
    id: r.id,
    fullName: r.fullName,
    email: r.email,
    phone: r.phone,
    employeeId: r.employeeId,
    qualification: r.qualification,
    schoolId: r.schoolId,
    schoolName: r.schoolName,
    requestedClasses: r.requestedClasses,
    requestedSubjects: r.requestedSubjects,
    otherSubject: r.otherSubject,
    status: r.status,
    createdAt: r.createdAt,
    reviewedAt: r.reviewedAt,
    reviewedBy: r.reviewedBy,
    rejectionReason: r.rejectionReason,
  };
}

// List teacher account requests (optionally filtered by ?status=pending|approved|rejected)
app.get(
  "/api/admin/teacher-requests",
  authenticateToken,
  requireRole(["company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      const status = req.query.status as 'pending' | 'approved' | 'rejected' | undefined;
      const requests = cloudDb.listTeacherRequests(status).map(publicTeacherRequest);
      return res.json({
        success: true,
        requests,
        count: requests.length,
      });
    } catch (error: any) {
      console.error("List teacher requests error:", error);
      return res.status(500).json({ error: "Failed to list teacher requests." });
    }
  }
);

// Approve a pending request → provisions the real, active teacher account
app.post(
  "/api/admin/teacher-requests/:requestId/approve",
  authenticateToken,
  requireRole(["company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { requestId } = req.params;
      const { schoolId, assignedClasses, assignedSubjects, accountStatus } = req.body;

      const result = cloudDb.approveTeacherRequest(requestId, req.user.id, {
        schoolId,
        assignedClasses: Array.isArray(assignedClasses) ? assignedClasses : undefined,
        assignedSubjects: Array.isArray(assignedSubjects) ? assignedSubjects : undefined,
        accountStatus: accountStatus === 'inactive' ? 'inactive' : 'active',
      });

      if (!result) {
        const existing = cloudDb.findTeacherRequestById(requestId);
        if (!existing) return res.status(404).json({ error: "Teacher request not found." });
        if (existing.status !== 'pending') {
          return res.status(400).json({ error: `This request has already been ${existing.status}.` });
        }
        return res.status(409).json({
          error: "Cannot approve: an account with this email already exists.",
        });
      }

      return res.json({
        success: true,
        user: sanitizeUser(result.user),
        assignmentsCreated: result.assignments.length,
        message: `Approved ${result.user.fullName}. Teacher account is now active with ${result.assignments.length} class/subject assignments.`,
      });
    } catch (error: any) {
      console.error("Approve teacher request error:", error);
      return res.status(500).json({ error: "Failed to approve teacher request." });
    }
  }
);

// Reject a pending request with a reason
app.post(
  "/api/admin/teacher-requests/:requestId/reject",
  authenticateToken,
  requireRole(["company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { requestId } = req.params;
      const { reason } = req.body;

      if (!reason || !String(reason).trim()) {
        return res.status(400).json({ error: "A rejection reason is required." });
      }

      const rejected = cloudDb.rejectTeacherRequest(requestId, req.user.id, String(reason));
      if (!rejected) {
        const existing = cloudDb.findTeacherRequestById(requestId);
        if (!existing) return res.status(404).json({ error: "Teacher request not found." });
        return res.status(400).json({ error: `This request has already been ${existing.status}.` });
      }

      return res.json({
        success: true,
        request: publicTeacherRequest(rejected),
        message: `Rejected ${rejected.fullName}'s teacher request.`,
      });
    } catch (error: any) {
      console.error("Reject teacher request error:", error);
      return res.status(500).json({ error: "Failed to reject teacher request." });
    }
  }
);

// =======================================================
// 📚 SMART ASSIGNMENT & HOMEWORK ENGINE (PHASE 8A)
// =======================================================

// --- TEACHER ASSIGNMENT WORKFLOWS ---

// 1. Create New Assignment (Teacher / Admin)
app.post(
  "/api/teacher/assignments",
  authenticateToken,
  requireRole(["teacher", "company_admin"]),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const {
        schoolId: reqSchoolId,
        classLevel,
        subjectId,
        subjectName,
        chapterId,
        chapterNumber,
        chapterTitle,
        topicId,
        topicTitle,
        title,
        description,
        assignmentType = "mixed",
        difficulty = "medium",
        questionCount = 5,
        dueDate,
        allowLateSubmission = true,
        studentTargetMode = "class",
        targetStudentIds,
        questions: providedQuestions,
        status = "published",
      } = req.body;

      // School identification: teachers use their assigned schoolId, admin can provide schoolId
      let schoolId = req.user.role === "teacher" ? req.user.schoolId : (reqSchoolId || req.user.schoolId);

      if (!schoolId && req.user.schoolName) {
        const sch = cloudDb.listSchools().find(
          (s) => s.name.trim().toLowerCase() === req.user?.schoolName?.trim().toLowerCase()
        );
        if (sch) schoolId = sch.id;
      }

      if (!schoolId) {
        return res.status(400).json({ error: "A valid, active school must be associated with the assignment." });
      }

      if (!classLevel || !subjectId || !chapterId || !topicId || !title) {
        return res.status(400).json({
          error: "classLevel, subjectId, chapterId, topicId, and assignment title are required.",
        });
      }

      // Strict Teacher Authorization check
      if (req.user.role === "teacher") {
        const activeAsgns = cloudDb.getTeacherActiveAssignments(req.user.id);
        const hasPermission = activeAsgns.some(
          (ta) =>
            ta.schoolId === schoolId &&
            ta.classLevel === classLevel &&
            ta.subjectId.toLowerCase().replace(/\s+/g, "_") === subjectId.toLowerCase().replace(/\s+/g, "_")
        );
        if (!hasPermission) {
          return res.status(403).json({
            error: `Access denied. You are not authorized to create assignments for ${classLevel} ${subjectId} at this school.`,
          });
        }
      }

      // Generate or validate questions
      let questions: any[] = providedQuestions;
      if (!Array.isArray(questions) || questions.length === 0) {
        questions = await generateAssignmentQuestions({
          classLevel,
          subjectName: subjectName || subjectId,
          chapterNumber: chapterNumber || 1,
          chapterTitle: chapterTitle || `Chapter ${chapterNumber || 1}`,
          topicTitle: topicTitle || topicId,
          assignmentType,
          difficulty,
          questionCount: Math.min(Math.max(Number(questionCount) || 5, 2), 20),
        });
      }

      const assignment = cloudDb.createAssignment({
        teacherId: req.user.id,
        schoolId,
        classLevel,
        subjectId: subjectId.toLowerCase().replace(/\s+/g, "_"),
        chapterId,
        chapterNumber,
        chapterTitle,
        topicId,
        topicTitle,
        title: title.trim(),
        description: description?.trim(),
        assignmentType,
        difficulty,
        questionCount: questions.length,
        status: status === "draft" ? "draft" : "published",
        dueDate: dueDate || undefined,
        allowLateSubmission: Boolean(allowLateSubmission),
        studentTargetMode: studentTargetMode === "selected_students" ? "selected_students" : "class",
        targetStudentIds: Array.isArray(targetStudentIds) ? targetStudentIds : undefined,
        questions,
        totalPossibleMarks: questions.reduce((sum, q) => sum + (q.marks || 1), 0),
      });

      return res.status(201).json({
        success: true,
        assignment,
        message: `Assignment '${assignment.title}' created and ${assignment.status === "published" ? "published" : "saved as draft"} successfully.`,
      });
    } catch (error: any) {
      console.error("Create assignment error:", error);
      return res.status(500).json({ error: "Failed to create assignment." });
    }
  }
);

// 2. List Teacher Assignments
app.get(
  "/api/teacher/assignments",
  authenticateToken,
  requireRole(["teacher", "company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const schoolId = req.query.schoolId as string;
      const classLevel = req.query.classLevel as string;
      const subjectId = req.query.subjectId as string;
      const status = req.query.status as string;

      let assignments = cloudDb.listAssignments({
        teacherId: req.user.role === "teacher" ? req.user.id : undefined,
        schoolId: req.user.role === "teacher" ? req.user.schoolId : schoolId,
        classLevel,
        subjectId,
        status,
      });

      // Enrich with stats
      const enriched = assignments.map((a) => {
        const stats = cloudDb.getAssignmentStats(a.id);
        const school = cloudDb.findSchoolById(a.schoolId);
        return {
          ...a,
          schoolName: school?.name,
          ...stats,
        };
      });

      return res.json({
        success: true,
        assignments: enriched,
        count: enriched.length,
      });
    } catch (error: any) {
      console.error("List assignments error:", error);
      return res.status(500).json({ error: "Failed to list assignments." });
    }
  }
);

// 3. Get Single Assignment for Teacher
app.get(
  "/api/teacher/assignments/:assignmentId",
  authenticateToken,
  requireRole(["teacher", "company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { assignmentId } = req.params;

      const assignment = cloudDb.findAssignmentById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found." });
      }

      if (!cloudDb.isTeacherAuthorizedForAssignment(req.user.id, assignmentId)) {
        return res.status(403).json({ error: "Access denied. You are not authorized to view this assignment." });
      }

      const stats = cloudDb.getAssignmentStats(assignmentId);
      const school = cloudDb.findSchoolById(assignment.schoolId);

      return res.json({
        success: true,
        assignment: {
          ...assignment,
          schoolName: school?.name,
          ...stats,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to fetch assignment details." });
    }
  }
);

// 4. Update Assignment (Teacher / Admin)
app.put(
  "/api/teacher/assignments/:assignmentId",
  authenticateToken,
  requireRole(["teacher", "company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { assignmentId } = req.params;

      const assignment = cloudDb.findAssignmentById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found." });
      }

      if (!cloudDb.isTeacherAuthorizedForAssignment(req.user.id, assignmentId)) {
        return res.status(403).json({ error: "Access denied. You cannot edit this assignment." });
      }

      const submissions = cloudDb.listSubmissionsForAssignment(assignmentId);
      const hasSubmissions = submissions.length > 0;

      const {
        title,
        description,
        dueDate,
        allowLateSubmission,
        status,
        questions,
        studentTargetMode,
        targetStudentIds,
      } = req.body;

      const updates: any = {};
      if (title) updates.title = title.trim();
      if (description !== undefined) updates.description = description.trim();
      if (dueDate !== undefined) updates.dueDate = dueDate;
      if (allowLateSubmission !== undefined) updates.allowLateSubmission = Boolean(allowLateSubmission);
      if (status) updates.status = status;

      // Question modification is only allowed if no student has submitted yet
      if (Array.isArray(questions)) {
        if (hasSubmissions) {
          return res.status(400).json({
            error: "Questions cannot be modified after students have begun submitting responses.",
          });
        }
        updates.questions = questions;
        updates.questionCount = questions.length;
      }

      if (studentTargetMode && !hasSubmissions) {
        updates.studentTargetMode = studentTargetMode;
        updates.targetStudentIds = targetStudentIds;
      }

      const updated = cloudDb.updateAssignment(assignmentId, updates);
      return res.json({
        success: true,
        assignment: updated,
        message: "Assignment updated successfully.",
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to update assignment." });
    }
  }
);

// 5. Publish / Close / Archive Assignment Status Transitions
app.post(
  "/api/teacher/assignments/:assignmentId/publish",
  authenticateToken,
  requireRole(["teacher", "company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { assignmentId } = req.params;

      if (!cloudDb.isTeacherAuthorizedForAssignment(req.user.id, assignmentId)) {
        return res.status(403).json({ error: "Access denied." });
      }

      const updated = cloudDb.updateAssignment(assignmentId, { status: "published" });
      return res.json({ success: true, assignment: updated, message: "Assignment published successfully." });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to publish assignment." });
    }
  }
);

app.post(
  "/api/teacher/assignments/:assignmentId/close",
  authenticateToken,
  requireRole(["teacher", "company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { assignmentId } = req.params;

      if (!cloudDb.isTeacherAuthorizedForAssignment(req.user.id, assignmentId)) {
        return res.status(403).json({ error: "Access denied." });
      }

      const updated = cloudDb.updateAssignment(assignmentId, { status: "closed" });
      return res.json({ success: true, assignment: updated, message: "Assignment closed to new submissions." });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to close assignment." });
    }
  }
);

app.post(
  "/api/teacher/assignments/:assignmentId/archive",
  authenticateToken,
  requireRole(["teacher", "company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { assignmentId } = req.params;

      if (!cloudDb.isTeacherAuthorizedForAssignment(req.user.id, assignmentId)) {
        return res.status(403).json({ error: "Access denied." });
      }

      const updated = cloudDb.updateAssignment(assignmentId, { status: "archived" });
      return res.json({ success: true, assignment: updated, message: "Assignment archived." });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to archive assignment." });
    }
  }
);

// 6. Delete Draft Assignment
app.delete(
  "/api/teacher/assignments/:assignmentId",
  authenticateToken,
  requireRole(["teacher", "company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { assignmentId } = req.params;

      const assignment = cloudDb.findAssignmentById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found." });
      }

      if (!cloudDb.isTeacherAuthorizedForAssignment(req.user.id, assignmentId)) {
        return res.status(403).json({ error: "Access denied." });
      }

      const deleted = cloudDb.deleteAssignment(assignmentId);
      if (!deleted) {
        return res.status(400).json({ error: "Cannot delete assignment that has active student submissions." });
      }

      return res.json({ success: true, message: "Draft assignment deleted." });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to delete assignment." });
    }
  }
);

// 7. Teacher Question Generation Assistant (AI)
app.post(
  "/api/teacher/assignments/generate-questions",
  authenticateToken,
  requireRole(["teacher", "company_admin"]),
  async (req: AuthenticatedRequest, res) => {
    try {
      const {
        classLevel = "Class 10",
        subjectName = "Mathematics",
        chapterNumber = 1,
        chapterTitle = "Chapter 1",
        topicTitle = "Topic",
        assignmentType = "mixed",
        difficulty = "medium",
        questionCount = 5,
        language = "English",
      } = req.body;

      const questions = await generateAssignmentQuestions({
        classLevel,
        subjectName,
        chapterNumber,
        chapterTitle,
        topicTitle,
        assignmentType,
        difficulty,
        questionCount: Math.min(Math.max(Number(questionCount) || 5, 2), 20),
        language,
      });

      return res.json({
        success: true,
        questions,
      });
    } catch (error: any) {
      console.error("AI question generation error:", error);
      return res.status(500).json({ error: "Failed to generate questions." });
    }
  }
);

// 8. List Student Submissions for an Assignment (Teacher view)
app.get(
  "/api/teacher/assignments/:assignmentId/submissions",
  authenticateToken,
  requireRole(["teacher", "company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { assignmentId } = req.params;

      const assignment = cloudDb.findAssignmentById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found." });
      }

      if (!cloudDb.isTeacherAuthorizedForAssignment(req.user.id, assignmentId)) {
        return res.status(403).json({ error: "Access denied." });
      }

      // Get target students
      let eligibleStudents = cloudDb.getStudentsForClass(assignment.schoolId, assignment.classLevel);
      if (assignment.studentTargetMode === "selected_students" && Array.isArray(assignment.targetStudentIds)) {
        eligibleStudents = eligibleStudents.filter((s) => assignment.targetStudentIds!.includes(s.id));
      }

      const submissions = cloudDb.listSubmissionsForAssignment(assignmentId);
      const subMap = new Map(submissions.map((s) => [s.studentId, s]));

      const studentRoster = eligibleStudents.map((st) => {
        const sub = subMap.get(st.id);
        return {
          studentId: st.id,
          studentName: st.fullName,
          studentEmail: st.email,
          classLevel: st.classLevel,
          status: sub ? sub.status : "not_started",
          submissionId: sub?.id,
          startedAt: sub?.startedAt,
          submittedAt: sub?.submittedAt,
          totalScore: sub?.totalScore,
          totalPossibleMarks: sub?.totalPossibleMarks || assignment.totalPossibleMarks,
          percentage: sub?.percentage,
          mcqScore: sub?.mcqScore,
          writtenScore: sub?.writtenScore,
          isLate: Boolean(sub?.isLate),
          teacherFeedback: sub?.teacherFeedback,
          teacherReviewedAt: sub?.teacherReviewedAt,
        };
      });

      const stats = cloudDb.getAssignmentStats(assignmentId);

      return res.json({
        success: true,
        assignment: {
          id: assignment.id,
          title: assignment.title,
          classLevel: assignment.classLevel,
          subjectId: assignment.subjectId,
          dueDate: assignment.dueDate,
          status: assignment.status,
          totalPossibleMarks: assignment.totalPossibleMarks,
          ...stats,
        },
        roster: studentRoster,
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to fetch submissions roster." });
    }
  }
);

// 9. View Single Student Submission Details
app.get(
  "/api/teacher/assignments/:assignmentId/submissions/:studentId",
  authenticateToken,
  requireRole(["teacher", "company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { assignmentId, studentId } = req.params;

      const assignment = cloudDb.findAssignmentById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found." });
      }

      if (!cloudDb.isTeacherAuthorizedForAssignment(req.user.id, assignmentId)) {
        return res.status(403).json({ error: "Access denied." });
      }

      const student = cloudDb.findUserById(studentId);
      if (!student) {
        return res.status(404).json({ error: "Student not found." });
      }

      const submission = cloudDb.findAssignmentSubmission(assignmentId, studentId);

      return res.json({
        success: true,
        assignment,
        student: sanitizeUser(student),
        submission,
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to retrieve student submission." });
    }
  }
);

// 10. Teacher Provide Feedback on Submission
app.post(
  "/api/teacher/assignments/:assignmentId/submissions/:studentId/feedback",
  authenticateToken,
  requireRole(["teacher", "company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { assignmentId, studentId } = req.params;
      const { feedback } = req.body;

      if (!feedback || !feedback.trim()) {
        return res.status(400).json({ error: "Feedback text is required." });
      }

      if (!cloudDb.isTeacherAuthorizedForAssignment(req.user.id, assignmentId)) {
        return res.status(403).json({ error: "Access denied." });
      }

      const submission = cloudDb.findAssignmentSubmission(assignmentId, studentId);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found." });
      }

      const updated = cloudDb.updateSubmissionTeacherFeedback(submission.id, req.user.id, feedback.trim());
      return res.json({
        success: true,
        submission: updated,
        message: "Teacher feedback saved successfully.",
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to save feedback." });
    }
  }
);

// --- STUDENT ASSIGNMENT WORKFLOWS ---

// 1. List Available Assignments for Authenticated Student
app.get("/api/student/assignments", authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(401).json({ error: "Student authorization required." });
    }

    const studentId = req.user.id;
    const student = cloudDb.findUserById(studentId);
    if (!student || student.status !== "active") {
      return res.status(403).json({ error: "Student account is inactive." });
    }

    // Match student school
    let schoolId = student.schoolId;
    if (!schoolId && student.schoolName) {
      const sch = cloudDb.listSchools().find(
        (s) => s.name.trim().toLowerCase() === student.schoolName?.trim().toLowerCase()
      );
      if (sch) schoolId = sch.id;
    }

    const assignments = cloudDb.listAssignments({
      studentId,
      classLevel: student.classLevel,
    });

    const now = new Date();

    const studentAssignments = assignments.map((a) => {
      const sub = cloudDb.findAssignmentSubmission(a.id, studentId);
      const teacher = cloudDb.findUserById(a.teacherId);
      const school = cloudDb.findSchoolById(a.schoolId);

      const isSubmitted = sub?.status === "submitted" || sub?.status === "evaluated";
      const isPastDue = a.dueDate ? new Date(a.dueDate) < now : false;
      const isDueSoon = a.dueDate ? !isPastDue && new Date(a.dueDate).getTime() - now.getTime() < 48 * 3600 * 1000 : false;

      let studentStatus: "due_soon" | "active" | "in_progress" | "submitted" | "overdue" = "active";
      if (isSubmitted) {
        studentStatus = "submitted";
      } else if (sub?.status === "in_progress") {
        studentStatus = isPastDue ? "overdue" : "in_progress";
      } else if (isPastDue) {
        studentStatus = "overdue";
      } else if (isDueSoon) {
        studentStatus = "due_soon";
      }

      return {
        id: a.id,
        title: a.title,
        description: a.description,
        assignmentType: a.assignmentType,
        difficulty: a.difficulty,
        questionCount: a.questionCount,
        totalPossibleMarks: a.totalPossibleMarks,
        classLevel: a.classLevel,
        subjectId: a.subjectId,
        chapterTitle: a.chapterTitle,
        chapterNumber: a.chapterNumber,
        topicTitle: a.topicTitle,
        teacherName: teacher?.fullName || "Teacher",
        schoolName: school?.name,
        status: a.status,
        dueDate: a.dueDate,
        allowLateSubmission: a.allowLateSubmission,
        studentStatus,
        mySubmission: sub
          ? {
              id: sub.id,
              status: sub.status,
              startedAt: sub.startedAt,
              submittedAt: sub.submittedAt,
              totalScore: sub.totalScore,
              percentage: sub.percentage,
              isLate: sub.isLate,
              teacherFeedback: sub.teacherFeedback,
            }
          : null,
      };
    });

    return res.json({
      success: true,
      assignments: studentAssignments,
    });
  } catch (error: any) {
    console.error("Student list assignments error:", error);
    return res.status(500).json({ error: "Failed to fetch student assignments." });
  }
});

// 2. Get Single Assignment for Student (Sanitized if unsubmitted)
app.get("/api/student/assignments/:assignmentId", authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(401).json({ error: "Student authorization required." });
    }

    const { assignmentId } = req.params;
    const authCheck = cloudDb.isStudentAuthorizedForAssignment(req.user.id, assignmentId);
    if (!authCheck.authorized) {
      return res.status(403).json({ error: authCheck.reason || "Access denied." });
    }

    const assignment = cloudDb.findAssignmentById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found." });
    }

    const sub = cloudDb.findAssignmentSubmission(assignmentId, req.user.id);
    const hasSubmitted = sub?.status === "submitted" || sub?.status === "evaluated";

    const sanitized = sanitizeAssignmentForStudent(assignment, hasSubmitted);
    const teacher = cloudDb.findUserById(assignment.teacherId);
    const school = cloudDb.findSchoolById(assignment.schoolId);

    return res.json({
      success: true,
      assignment: {
        ...sanitized,
        teacherName: teacher?.fullName,
        schoolName: school?.name,
      },
      submission: sub || null,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load assignment." });
  }
});

// 3. Start or Resume Assignment
app.post("/api/student/assignments/:assignmentId/start", authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(401).json({ error: "Student authorization required." });
    }

    const { assignmentId } = req.params;
    const authCheck = cloudDb.isStudentAuthorizedForAssignment(req.user.id, assignmentId);
    if (!authCheck.authorized) {
      return res.status(403).json({ error: authCheck.reason || "Access denied." });
    }

    const assignment = cloudDb.findAssignmentById(assignmentId)!;
    let sub = cloudDb.findAssignmentSubmission(assignmentId, req.user.id);

    if (!sub) {
      sub = cloudDb.saveAssignmentSubmission({
        assignmentId,
        studentId: req.user.id,
        schoolId: assignment.schoolId,
        classLevel: assignment.classLevel,
        subjectId: assignment.subjectId,
        status: "in_progress",
        startedAt: new Date().toISOString(),
        questionResponses: {},
      });

      // Record event
      cloudDb.recordLearningEvent(req.user.id, {
        type: "test_started",
        classLevel: assignment.classLevel,
        subjectId: assignment.subjectId,
        chapterId: assignment.chapterId,
        topicId: assignment.topicId,
        metadata: {
          assignmentId: assignment.id,
          assignmentTitle: assignment.title,
          assignmentType: assignment.assignmentType,
        },
      });
    }

    const hasSubmitted = sub.status === "submitted" || sub.status === "evaluated";
    const sanitized = sanitizeAssignmentForStudent(assignment, hasSubmitted);

    return res.json({
      success: true,
      assignment: sanitized,
      submission: sub,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to start assignment." });
  }
});

// 4. Autosave Student Answers
app.post("/api/student/assignments/:assignmentId/autosave", authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(401).json({ error: "Student authorization required." });
    }

    const { assignmentId } = req.params;
    const { questionResponses } = req.body;

    const authCheck = cloudDb.isStudentAuthorizedForAssignment(req.user.id, assignmentId);
    if (!authCheck.authorized) {
      return res.status(403).json({ error: authCheck.reason || "Access denied." });
    }

    const sub = cloudDb.findAssignmentSubmission(assignmentId, req.user.id);
    if (sub && (sub.status === "submitted" || sub.status === "evaluated")) {
      return res.status(400).json({ error: "Cannot autosave answers for an already submitted assignment." });
    }

    const assignment = cloudDb.findAssignmentById(assignmentId)!;

    const saved = cloudDb.saveAssignmentSubmission({
      assignmentId,
      studentId: req.user.id,
      schoolId: assignment.schoolId,
      classLevel: assignment.classLevel,
      subjectId: assignment.subjectId,
      questionResponses: questionResponses || {},
      status: "in_progress",
    });

    return res.json({
      success: true,
      savedAt: saved.updatedAt,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Autosave failed." });
  }
});

// 5. Submit Assignment for Full AI Evaluation
app.post("/api/student/assignments/:assignmentId/submit", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(401).json({ error: "Student authorization required." });
    }

    const { assignmentId } = req.params;
    const { questionResponses } = req.body;

    const authCheck = cloudDb.isStudentAuthorizedForAssignment(req.user.id, assignmentId);
    if (!authCheck.authorized) {
      return res.status(403).json({ error: authCheck.reason || "Access denied." });
    }

    const assignment = cloudDb.findAssignmentById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found." });
    }

    // Check due date & late rules
    const now = new Date();
    const isPastDue = assignment.dueDate ? new Date(assignment.dueDate) < now : false;
    if (isPastDue && !assignment.allowLateSubmission && assignment.status === "closed") {
      return res.status(403).json({ error: "This assignment is closed and late submissions are not allowed." });
    }

    const sub = cloudDb.findAssignmentSubmission(assignmentId, req.user.id);
    if (sub && (sub.status === "submitted" || sub.status === "evaluated")) {
      return res.status(400).json({ error: "You have already submitted this assignment." });
    }

    // Merge latest responses
    const finalResponses = questionResponses || sub?.questionResponses || {};

    // Evaluate
    const evaluation = await evaluateAssignmentSubmission({
      assignment,
      submission: { questionResponses: finalResponses },
      studentName: req.user.fullName,
    });

    // Save final submission
    const submitted = cloudDb.saveAssignmentSubmission({
      assignmentId,
      studentId: req.user.id,
      schoolId: assignment.schoolId,
      classLevel: assignment.classLevel,
      subjectId: assignment.subjectId,
      status: "submitted",
      submittedAt: now.toISOString(),
      questionResponses: finalResponses,
      mcqScore: evaluation.mcqScore,
      mcqTotal: evaluation.mcqTotal,
      writtenScore: evaluation.writtenScore,
      writtenTotal: evaluation.writtenTotal,
      totalScore: evaluation.totalScore,
      totalPossibleMarks: evaluation.totalPossibleMarks,
      percentage: evaluation.percentage,
      evaluationData: evaluation.evaluationData,
      isLate: isPastDue,
    });

    // Record learning event
    cloudDb.recordLearningEvent(req.user.id, {
      type: "test_completed",
      classLevel: assignment.classLevel,
      subjectId: assignment.subjectId,
      chapterId: assignment.chapterId,
      topicId: assignment.topicId,
      metadata: {
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        percentage: evaluation.percentage,
        isLate: isPastDue,
      },
    });

    // Update topic progress & streak
    if (assignment.topicId && assignment.chapterId) {
      cloudDb.saveTopicProgress(req.user.id, {
        classLevel: assignment.classLevel,
        subjectId: assignment.subjectId,
        chapterId: assignment.chapterId,
        topicId: assignment.topicId,
        lessonCompleted: true,
        lastActivityAt: now.toISOString(),
      });
      cloudDb.recordActiveDay(req.user.id, now.toISOString().split("T")[0]);
    }

    return res.json({
      success: true,
      submission: submitted,
      assignment,
      message: `Assignment submitted successfully! You scored ${evaluation.totalScore}/${evaluation.totalPossibleMarks} (${evaluation.percentage}%).`,
    });
  } catch (error: any) {
    console.error("Submit assignment error:", error);
    return res.status(500).json({ error: "Failed to submit assignment." });
  }
});

// 6. Get Student Result & Review
app.get("/api/student/assignments/:assignmentId/result", authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { assignmentId } = req.params;

    const assignment = cloudDb.findAssignmentById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found." });
    }

    const sub = cloudDb.findAssignmentSubmission(assignmentId, req.user.id);
    if (!sub || (sub.status !== "submitted" && sub.status !== "evaluated")) {
      return res.status(404).json({ error: "No completed submission found for this assignment." });
    }

    const teacher = cloudDb.findUserById(assignment.teacherId);
    const school = cloudDb.findSchoolById(assignment.schoolId);

    return res.json({
      success: true,
      assignment: {
        ...assignment,
        teacherName: teacher?.fullName,
        schoolName: school?.name,
      },
      submission: sub,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to retrieve assignment result." });
  }
});

// --- PRINCIPAL & ADMIN ASSIGNMENT ANALYTICS ---

// Principal School Assignment Analytics
app.get(
  "/api/principal/assignments/analytics",
  authenticateToken,
  requireRole(["principal", "company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      let schoolId = req.user.schoolId;
      if (!schoolId && req.user.schoolName) {
        const sch = cloudDb.listSchools().find(
          (s) => s.name.trim().toLowerCase() === req.user?.schoolName?.trim().toLowerCase()
        );
        if (sch) schoolId = sch.id;
      }

      if (!schoolId && req.user.id) {
        const sch = cloudDb.listSchools().find((s) => s.principalId === req.user?.id);
        if (sch) schoolId = sch.id;
      }

      if (!schoolId) {
        return res.status(403).json({ error: "No school associated with Principal account." });
      }

      const analytics = cloudDb.getPrincipalAssignmentAnalytics(schoolId);
      return res.json({
        success: true,
        analytics,
      });
    } catch (error: any) {
      console.error("Principal assignment analytics error:", error);
      return res.status(500).json({ error: "Failed to generate principal assignment analytics." });
    }
  }
);

// Principal School Assignments List
app.get(
  "/api/principal/assignments",
  authenticateToken,
  requireRole(["principal", "company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      let schoolId = req.user.schoolId;
      if (!schoolId && req.user.schoolName) {
        const sch = cloudDb.listSchools().find(
          (s) => s.name.trim().toLowerCase() === req.user?.schoolName?.trim().toLowerCase()
        );
        if (sch) schoolId = sch.id;
      }

      if (!schoolId) {
        return res.status(403).json({ error: "No school associated with Principal account." });
      }

      const classLevel = req.query.classLevel as string;
      const subjectId = req.query.subjectId as string;

      const assignments = cloudDb.listAssignments({ schoolId, classLevel, subjectId });
      const enriched = assignments.map((a) => {
        const stats = cloudDb.getAssignmentStats(a.id);
        const teacher = cloudDb.findUserById(a.teacherId);
        return {
          ...a,
          teacherName: teacher?.fullName,
          ...stats,
        };
      });

      return res.json({
        success: true,
        assignments: enriched,
        count: enriched.length,
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to list principal assignments." });
    }
  }
);

// Admin Platform Assignment Analytics
app.get(
  "/api/admin/assignments/analytics",
  authenticateToken,
  requireRole(["company_admin"]),
  (_req: AuthenticatedRequest, res) => {
    try {
      const analytics = cloudDb.getAdminAssignmentAnalytics();
      return res.json({
        success: true,
        analytics,
      });
    } catch (error: any) {
      console.error("Admin assignment analytics error:", error);
      return res.status(500).json({ error: "Failed to generate platform assignment analytics." });
    }
  }
);

// Admin Platform Assignments List
app.get(
  "/api/admin/assignments",
  authenticateToken,
  requireRole(["company_admin"]),
  (req: AuthenticatedRequest, res) => {
    try {
      const schoolId = req.query.schoolId as string;
      const classLevel = req.query.classLevel as string;
      const subjectId = req.query.subjectId as string;
      const status = req.query.status as string;

      const assignments = cloudDb.listAssignments({ schoolId, classLevel, subjectId, status });
      const enriched = assignments.map((a) => {
        const stats = cloudDb.getAssignmentStats(a.id);
        const teacher = cloudDb.findUserById(a.teacherId);
        const school = cloudDb.findSchoolById(a.schoolId);
        return {
          ...a,
          teacherName: teacher?.fullName,
          schoolName: school?.name,
          ...stats,
        };
      });

      return res.json({
        success: true,
        assignments: enriched,
        count: enriched.length,
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to list admin assignments." });
    }
  }
);

// ==========================================
// 🔄 CLOUD DATA SYNC & LOCALSTORAGE MIGRATION
// ==========================================

// Safe import of legacy localStorage data for the authenticated student
app.post("/api/migrate/import-progress", authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const userId = req.user.id;
    const { mcqAttempts, writtenAttempts, aiConversations } = req.body;

    let mcqCount = 0;
    let writtenCount = 0;
    let aiCount = 0;

    // Migrate MCQ attempts
    if (Array.isArray(mcqAttempts)) {
      for (const attempt of mcqAttempts) {
        if (attempt && attempt.id) {
          cloudDb.saveMcqAttempt(userId, attempt);
          mcqCount++;
        }
      }
    }

    // Migrate Written attempts
    if (Array.isArray(writtenAttempts)) {
      for (const attempt of writtenAttempts) {
        if (attempt && attempt.id) {
          cloudDb.saveWrittenAttempt(userId, attempt);
          writtenCount++;
        }
      }
    }

    // Migrate AI conversations
    if (Array.isArray(aiConversations)) {
      for (const conv of aiConversations) {
        if (conv && conv.classLevel && conv.subjectId && conv.chapterId && conv.topicId) {
          cloudDb.saveAiConversation(userId, conv);
          aiCount++;
        }
      }
    }

    return res.json({
      success: true,
      message: `Successfully migrated ${mcqCount} MCQ tests, ${writtenCount} Written tests, and ${aiCount} AI discussions to your cloud account.`,
      migrated: { mcqCount, writtenCount, aiCount },
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return res.status(500).json({ error: "Failed to import progress." });
  }
});

// AI Conversations Cloud Endpoints (Scoped to req.user.id)
app.get("/api/user/ai-conversations", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const conversations = cloudDb.getAiConversations(req.user.id);
  return res.json({ success: true, conversations });
});

app.post("/api/user/ai-conversations", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const saved = cloudDb.saveAiConversation(req.user.id, req.body);
  return res.json({ success: true, conversation: saved });
});

// MCQ Tests Cloud Endpoints (Scoped to req.user.id)
app.get("/api/user/mcq-tests", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const attempts = cloudDb.getMcqAttempts(req.user.id);
  return res.json({ success: true, attempts: attempts.map((a) => a.data) });
});

app.post("/api/user/mcq-tests", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const saved = cloudDb.saveMcqAttempt(req.user.id, req.body);
  return res.json({ success: true, attempt: saved.data });
});

// Written Tests Cloud Endpoints (Scoped to req.user.id)
app.get("/api/user/written-tests", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const attempts = cloudDb.getWrittenAttempts(req.user.id);
  return res.json({ success: true, attempts: attempts.map((a) => a.data) });
});

app.post("/api/user/written-tests", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const saved = cloudDb.saveWrittenAttempt(req.user.id, req.body);
  return res.json({ success: true, attempt: saved.data });
});

// =======================================================
// 📊 PHASE 6: STUDENT PROGRESS INTELLIGENCE & ANALYTICS
// =======================================================

// 1. Get Dashboard Analytics Summary (Scoped strictly to authenticated student)
app.get("/api/analytics/dashboard", authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const userId = req.user.id;
    const classLevel = (req.query.classLevel as string) || req.user.classLevel || "Class 10";

    // Auto-backfill on first fetch if needed
    const existingProgress = cloudDb.getAllTopicProgress(userId, classLevel);
    if (existingProgress.length === 0) {
      cloudDb.backfillStudentAnalytics(userId);
    }

    const analytics = buildStudentAnalyticsOverview(userId, classLevel);
    return res.json({
      success: true,
      analytics,
    });
  } catch (error: any) {
    console.error("Analytics dashboard error:", error);
    return res.status(500).json({ error: "Failed to generate analytics dashboard." });
  }
});

// 2. Get Deep Progress Overview for /progress screen
app.get("/api/analytics/progress", authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const userId = req.user.id;
    const classLevel = (req.query.classLevel as string) || req.user.classLevel || "Class 10";

    const analytics = buildStudentAnalyticsOverview(userId, classLevel);
    return res.json({
      success: true,
      analytics,
    });
  } catch (error: any) {
    console.error("Analytics progress screen error:", error);
    return res.status(500).json({ error: "Failed to retrieve student progress details." });
  }
});

// 3. Get Subject Detailed Analytics
app.get("/api/analytics/subject/:subjectId", authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const userId = req.user.id;
    const { subjectId } = req.params;
    const classLevel = (req.query.classLevel as string) || req.user.classLevel || "Class 10";

    const analytics = buildStudentAnalyticsOverview(userId, classLevel);
    const subjectProgress = analytics.subjects.find((s) => s.subjectId === subjectId);

    if (!subjectProgress) {
      return res.status(404).json({ error: "Subject analytics not found." });
    }

    return res.json({
      success: true,
      subject: subjectProgress,
    });
  } catch (error: any) {
    console.error("Subject analytics error:", error);
    return res.status(500).json({ error: "Failed to retrieve subject analytics." });
  }
});

// 4. Record a Learning Event
app.post("/api/analytics/events", authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { type, classLevel, subjectId, chapterId, topicId, metadata } = req.body;

    if (!type) {
      return res.status(400).json({ error: "Event 'type' is required." });
    }

    const event = cloudDb.recordLearningEvent(req.user.id, {
      type,
      classLevel: classLevel || req.user.classLevel || "Class 10",
      subjectId,
      chapterId,
      topicId,
      metadata,
    });

    return res.status(201).json({
      success: true,
      event,
    });
  } catch (error: any) {
    console.error("Record event error:", error);
    return res.status(500).json({ error: "Failed to record learning event." });
  }
});

// 5. Update Topic Completion Status
app.post("/api/analytics/topic-status", authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { classLevel, subjectId, chapterId, topicId, lessonCompleted, status } = req.body;

    if (!subjectId || !chapterId || !topicId) {
      return res.status(400).json({ error: "subjectId, chapterId, and topicId are required." });
    }

    const updated = cloudDb.markTopicStatus(
      req.user.id,
      classLevel || req.user.classLevel || "Class 10",
      subjectId,
      chapterId,
      topicId,
      { lessonCompleted, status }
    );

    return res.json({
      success: true,
      topicProgress: updated,
    });
  } catch (error: any) {
    console.error("Update topic status error:", error);
    return res.status(500).json({ error: "Failed to update topic status." });
  }
});

// 6. Optional Personalized AI Coach Commentary
app.post("/api/analytics/ai-insight", optionalAuthenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user ? req.user.id : `guest_${getClientIp(req)}`;
    const classLevel = (req.body.classLevel as string) || req.user?.classLevel || "Class 10";
    const analytics = buildStudentAnalyticsOverview(userId, classLevel);

    const ai = getGeminiClient();
    if (!ai) {
      // Deterministic fallback coaching insight
      const strongName = analytics.insights.strongTopics[0]?.topicTitle || "Foundation Topics";
      const weakName = analytics.insights.needsPracticeTopics[0]?.topicTitle || "upcoming chapters";
      return res.json({
        success: true,
        insight: `You are making steady progress with a ${analytics.streak.currentStreak}-day learning streak! You've shown solid confidence in ${strongName}. Keep up the good work and give a little extra practice to ${weakName} to boost overall mastery!`,
        isAiGenerated: false,
      });
    }

    const studentName = req.user?.fullName || req.body.studentName || "Student";
    const summaryContext = {
      studentName,
      classLevel,
      currentStreak: analytics.streak.currentStreak,
      overallCompletion: `${analytics.overallCompletionPct}%`,
      averageMastery: `${analytics.averageMastery}%`,
      trend: analytics.trend.label,
      strongTopics: analytics.insights.strongTopics.map((t) => t.topicTitle),
      needsPractice: analytics.insights.needsPracticeTopics.map((t) => t.topicTitle),
      recentMcqAccuracy: `${analytics.averageMcqAccuracy}%`,
    };

    const prompt = `You are RDS AI, an encouraging and inspiring personal learning tutor for a Telangana State Board (SCERT) student.
Here is the student's real progress data:
${JSON.stringify(summaryContext, null, 2)}

Provide a concise (2-3 sentences), warm, highly encouraging, and actionable personalized insight directly addressed to ${studentName}.
Highlight their strengths, acknowledge their streak/trend, and give 1 friendly tip on where to focus next. No emojis spam. Speak like an expert coach.`;

    const result = await generateContentWithFailover(ai, prompt, {
      systemInstruction: "You are a warm, motivating academic mentor for Telangana SCERT students.",
      temperature: 0.7,
    });

    return res.json({
      success: true,
      insight: result.text.trim(),
      isAiGenerated: true,
    });
  } catch (error: any) {
    console.warn("AI insight error, using fallback:", error);
    return res.json({
      success: true,
      insight: "Keep up the continuous learning! Daily practice and regular self-testing on Telangana SCERT topics are key to building lasting mastery.",
      isAiGenerated: false,
    });
  }
});

// =======================================================
// 🤖 SERVER-SIDE RDS AI GENERATION ENDPOINT (AUTHENTICATED & GUEST SMART ACCESS)
// =======================================================
app.post(
  "/api/ai/generate",
  optionalAuthenticate,
  aiBurstLimiter,
  async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user && req.user.status !== "active") {
        return res.status(403).json({
          error: "Your account is not active. Please contact the administrator to enable AI features.",
        });
      }

      // Check and track per-user daily AI quota (default 100 queries/day)
      const usageIdentifier = req.user ? req.user.id : `guest_${getClientIp(req)}`;
      const dailyQuota = parseInt(process.env.AI_DAILY_QUOTA_PER_STUDENT || "100", 10);
      const quotaStatus = cloudDb.trackAiUsage(usageIdentifier, dailyQuota);

      if (!quotaStatus.allowed) {
        return res.status(429).json({
          error: `Daily AI request limit reached (${dailyQuota} queries). Your quota will refresh tomorrow at midnight.`,
          isQuotaExceeded: true,
          limit: quotaStatus.limit,
          currentCount: quotaStatus.currentCount,
        });
      }

      const { systemInstruction, contents, responseType } = req.body;

      if (!contents) {
        return res.status(400).json({ error: "Missing 'contents' in request body." });
      }

      const ai = getGeminiClient();

      if (!ai) {
        return res.status(503).json({
          error: "AI assistance is temporarily unavailable. Please try again in a moment.",
          isConfigError: true,
        });
      }

      const config: Record<string, any> = {
        systemInstruction: systemInstruction || "You are RDS AI, a friendly learning tutor for Telangana State Board students.",
        temperature: 0.7,
      };

      if (responseType === "json") {
        config.responseMimeType = "application/json";
      }

      const result = await generateContentWithFailover(ai, contents, config);

      return res.json({
        text: result.text,
        candidates: result.candidates,
        modelUsed: result.modelUsed,
        quota: {
          remaining: quotaStatus.remaining,
          limit: quotaStatus.limit,
        },
        success: true,
      });
    } catch (error: any) {
      console.error("Error in /api/ai/generate:", error);
      const isOverloaded = isTransientError(error);

      return res.status(isOverloaded ? 503 : 500).json({
        error: isOverloaded
          ? "AI models are currently experiencing temporary high demand. Please tap 'Try Again' in a few seconds."
          : "AI assistance is temporarily unavailable. Please try again in a moment.",
        isTransient: isOverloaded,
        success: false,
      });
    }
  }
);

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: ['**/.rds_cloud_data/**'],
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RDS SMART LEARN server listening on port ${PORT}`);
  });
}

startServer();



