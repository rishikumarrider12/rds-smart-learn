import { cloudDb, DbSchool, DbTeacherAssignment, DbUser, resolveSubjectDisplayName } from './db.js';
import { buildStudentAnalyticsOverview } from './analyticsEngine.js';
import { SYLLABUS_DATA, getSyllabusForClass } from '../src/data/syllabusData.js';
import {
  StudentNeedingSupport,
  TeacherAssignmentStudentItem,
  TeacherAssignmentAnalytics,
  TeacherDashboardData,
  PrincipalClassMetric,
  PrincipalSubjectMetric,
  PrincipalTeacherItem,
  PrincipalDashboardData,
  CompanyAdminDashboardData,
} from '../src/types/organization.js';

// Centralized Configurable Thresholds for Academic Support
export const SUPPORT_THRESHOLDS = {
  LOW_MASTERY: 50, // Average mastery below 50%
  WEAK_TEST_SCORE: 45, // MCQ or written accuracy below 45%
  INACTIVITY_DAYS: 7, // 7 days of inactivity
  ACTIVE_DAYS_WINDOW: 14, // Consider active if logged activity in 14 days
};

/**
 * Calculates days elapsed between an ISO date string and now
 */
function getDaysElapsed(dateIso?: string): number {
  if (!dateIso) return 999;
  const diffMs = Date.now() - new Date(dateIso).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Evaluates whether a student needs additional academic support in a given subject context
 */
function evaluateStudentSupport(
  student: DbUser,
  subjectId: string | undefined,
  subjectMastery: number,
  overallMastery: number,
  mcqAccuracy: number,
  writtenAccuracy: number,
  totalAttempts: number,
  lastActivityAt: string,
  subjectName?: string
): StudentNeedingSupport | null {
  const daysInactive = getDaysElapsed(lastActivityAt);

  let flagType: StudentNeedingSupport['flagType'] | null = null;
  let supportReason = '';
  let recommendation = '';

  if (subjectMastery < SUPPORT_THRESHOLDS.LOW_MASTERY && totalAttempts > 0) {
    flagType = 'low_mastery';
    supportReason = `Current mastery in ${subjectName || 'this subject'} is ${subjectMastery}%, below the 50% target.`;
    recommendation = 'Learning support suggested to build conceptual foundation through step-by-step topic review.';
  } else if ((mcqAccuracy < SUPPORT_THRESHOLDS.WEAK_TEST_SCORE || writtenAccuracy < SUPPORT_THRESHOLDS.WEAK_TEST_SCORE) && totalAttempts >= 2) {
    flagType = 'weak_tests';
    const lowest = Math.min(mcqAccuracy || 100, writtenAccuracy || 100);
    supportReason = `Assessment accuracy is ${lowest}%, indicating gaps in test application.`;
    recommendation = 'Revision recommended with targeted practice tests and mistake analysis review.';
  } else if (daysInactive >= SUPPORT_THRESHOLDS.INACTIVITY_DAYS && totalAttempts > 0) {
    flagType = 'inactivity';
    supportReason = `No learning activity recorded in the last ${daysInactive} days.`;
    recommendation = 'Encourage consistent daily practice to maintain learning momentum and streak.';
  } else if (subjectMastery < SUPPORT_THRESHOLDS.LOW_MASTERY && totalAttempts === 0) {
    flagType = 'needs_practice';
    supportReason = 'Has not yet attempted self-assessment tests for this subject.';
    recommendation = 'Needs additional practice: suggest starting with initial lesson interactive walkthroughs and basic MCQs.';
  }

  if (!flagType) return null;

  return {
    studentId: student.id,
    studentName: student.fullName,
    email: student.email,
    classLevel: student.classLevel || 'Class 10',
    schoolId: student.schoolId,
    schoolName: student.schoolName,
    subjectId,
    subjectName,
    subjectMastery,
    overallMastery,
    mcqAccuracy,
    writtenAccuracy,
    totalAttempts,
    lastActivityAt: lastActivityAt || student.createdAt,
    daysInactive,
    supportReason,
    flagType,
    recommendation,
  };
}

/**
 * Builds Teacher Assignment Analytics and Student Roster
 */
export function buildTeacherAssignmentAnalytics(assignmentId: string): {
  assignment: DbTeacherAssignment;
  school: DbSchool | null;
  teacher: DbUser | null;
  students: TeacherAssignmentStudentItem[];
  analytics: TeacherAssignmentAnalytics;
} | null {
  const assignment = cloudDb.findTeacherAssignmentById(assignmentId);
  if (!assignment || !assignment.isActive) return null;

  const school = cloudDb.findSchoolById(assignment.schoolId);
  if (!school || school.status !== 'active' || !school.isActive) {
    return null;
  }

  const teacher = cloudDb.findUserById(assignment.teacherId);
  if (!teacher || teacher.status !== 'active') {
    return null;
  }

  const rawStudents = cloudDb.listStudentsBySchool(assignment.schoolId, assignment.classLevel);

  // Get syllabus data for subject & class (resolves legacy mangled subject ids)
  const classSyllabus = getSyllabusForClass(assignment.classLevel as any);
  const resolvedSubject = resolveSubjectDisplayName(
    assignment.classLevel,
    assignment.subjectId,
    assignment.subjectName
  );
  const targetSubject = classSyllabus.subjects.find(
    (s) => s.id === resolvedSubject.subjectId
  );
  const subjectName = targetSubject?.name || resolvedSubject.subjectName;
  const totalSubjectTopics = targetSubject
    ? targetSubject.chapters.reduce((acc, c) => acc + c.topics.length, 0)
    : 0;

  const studentsList: TeacherAssignmentStudentItem[] = [];
  const studentsNeedingSupport: StudentNeedingSupport[] = [];

  let totalMasterySum = 0;
  let totalCompletionSum = 0;
  let totalMcqAccSum = 0;
  let totalWrittenAccSum = 0;
  let mcqCount = 0;
  let writtenCount = 0;
  let activeLearnersCount = 0;

  // Topic-level aggregation map for strongest & weakest topics
  const topicStatsMap: Record<
    string,
    { topicId: string; topicTitle: string; chapterTitle: string; scores: number[]; issueCount: number }
  > = {};

  if (targetSubject) {
    for (const ch of targetSubject.chapters) {
      for (const top of ch.topics) {
        topicStatsMap[top.id] = {
          topicId: top.id,
          topicTitle: top.title,
          chapterTitle: ch.title,
          scores: [],
          issueCount: 0,
        };
      }
    }
  }

  for (const stu of rawStudents) {
    const overview = buildStudentAnalyticsOverview(stu.id, assignment.classLevel);
    const subProgress = overview.subjects.find(
      (s) => s.subjectId.toLowerCase() === assignment.subjectId.toLowerCase()
    );

    const subMastery = subProgress?.masteryScore || 0;
    const subCompleted = subProgress?.completedTopics || 0;
    const subTotal = subProgress?.totalTopics || totalSubjectTopics || 1;
    const subMcqAcc = subProgress?.averageMcqScore !== undefined ? subProgress.averageMcqScore : 0;
    const subWrittenAcc = subProgress?.averageWrittenScore !== undefined ? subProgress.averageWrittenScore : 0;
    const subAttempts = subProgress?.totalAttempts || 0;

    const daysSince = getDaysElapsed(stu.updatedAt || stu.createdAt);
    const isRecentlyActive = daysSince <= SUPPORT_THRESHOLDS.ACTIVE_DAYS_WINDOW || subAttempts > 0;
    if (isRecentlyActive) activeLearnersCount++;

    totalMasterySum += subMastery;
    totalCompletionSum += (subCompleted / (subTotal || 1)) * 100;

    if (subProgress && subProgress.averageMcqScore > 0) {
      totalMcqAccSum += subMcqAcc;
      mcqCount++;
    }
    if (subProgress && subProgress.averageWrittenScore > 0) {
      totalWrittenAccSum += subWrittenAcc;
      writtenCount++;
    }

    let learningStatus: TeacherAssignmentStudentItem['learningStatus'] = 'steady';
    if (subMastery >= 75) learningStatus = 'active';
    else if (subMastery < 50 || daysSince > 14) learningStatus = 'needs_practice';
    else if (daysSince > 30) learningStatus = 'inactive';

    studentsList.push({
      id: stu.id,
      fullName: stu.fullName,
      email: stu.email,
      classLevel: stu.classLevel || assignment.classLevel,
      schoolId: stu.schoolId,
      schoolName: stu.schoolName || school?.name,
      overallMastery: overview.averageMastery,
      subjectMastery: subMastery,
      topicsCompleted: subCompleted,
      totalTopics: subTotal,
      mcqAccuracy: subMcqAcc,
      writtenAccuracy: subWrittenAcc,
      totalAttempts: subAttempts,
      learningStreak: overview.streak.currentStreak,
      lastActivityAt: overview.streak.lastActiveDate || stu.updatedAt || stu.createdAt,
      learningStatus,
    });

    // Check for academic support
    const supportFlag = evaluateStudentSupport(
      stu,
      assignment.subjectId,
      subMastery,
      overview.averageMastery,
      subMcqAcc,
      subWrittenAcc,
      subAttempts,
      overview.streak.lastActiveDate || stu.updatedAt || stu.createdAt,
      subjectName
    );
    if (supportFlag) {
      studentsNeedingSupport.push(supportFlag);
    }

    // Populate topic-level scores
    if (subProgress) {
      for (const ch of subProgress.chapters) {
        for (const top of ch.topics) {
          if (topicStatsMap[top.topicId]) {
            const tProg = top.progress;
            const topMastery = tProg ? tProg.masteryScore : 0;
            const topStatus = tProg ? tProg.status : 'not_started';
            const mcqAtt = tProg ? tProg.mcqAttempts : 0;
            const writAtt = tProg ? tProg.writtenAttempts : 0;

            if (topMastery > 0 || topStatus === 'completed') {
              topicStatsMap[top.topicId].scores.push(topMastery);
            }
            if (topMastery < 50 && (mcqAtt > 0 || writAtt > 0)) {
              topicStatsMap[top.topicId].issueCount++;
            }
          }
        }
      }
    }
  }

  // Calculate averages
  const totalStudents = rawStudents.length;
  const averageMastery = totalStudents > 0 ? Math.round(totalMasterySum / totalStudents) : 0;
  const averageSyllabusCompletion = totalStudents > 0 ? Math.round(totalCompletionSum / totalStudents) : 0;
  const averageMcqAccuracy = mcqCount > 0 ? Math.round(totalMcqAccSum / mcqCount) : 0;
  const averageWrittenAccuracy = writtenCount > 0 ? Math.round(totalWrittenAccSum / writtenCount) : 0;

  // Topic rankings
  const topicStatsList = Object.values(topicStatsMap).map((t) => {
    const avgScore = t.scores.length > 0 ? Math.round(t.scores.reduce((a, b) => a + b, 0) / t.scores.length) : 0;
    return {
      topicId: t.topicId,
      topicTitle: t.topicTitle,
      chapterTitle: t.chapterTitle,
      averageScore: avgScore,
      issueCount: t.issueCount,
    };
  });

  const strongestTopics = [...topicStatsList]
    .filter((t) => t.averageScore > 0)
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 5);

  const attentionTopics = [...topicStatsList]
    .filter((t) => t.issueCount > 0 || (t.averageScore > 0 && t.averageScore < 55))
    .sort((a, b) => b.issueCount - a.issueCount || a.averageScore - b.averageScore)
    .slice(0, 5);

  // Recent activity for students in this school & class
  const studentIds = new Set(rawStudents.map((s) => s.id));
  const recentEvents = cloudDb
    .listUsers()
    .flatMap(() => []) // events retrieved below
    ;

  // Pull recent MCQ and Written attempts for these students
  const recentActivity: TeacherAssignmentAnalytics['recentActivity'] = [];
  for (const stu of rawStudents.slice(0, 20)) {
    const mcqs = cloudDb.getMcqAttempts(stu.id).filter((m) => m.subjectId === assignment.subjectId);
    for (const m of mcqs.slice(0, 2)) {
      recentActivity.push({
        studentId: stu.id,
        studentName: stu.fullName,
        type: 'mcq_test',
        topicTitle: m.data?.topicTitle || m.topicId,
        score: m.data?.result?.percentage,
        timestamp: m.createdAt,
      });
    }

    const written = cloudDb.getWrittenAttempts(stu.id).filter((w) => w.subjectId === assignment.subjectId);
    for (const w of written.slice(0, 2)) {
      recentActivity.push({
        studentId: stu.id,
        studentName: stu.fullName,
        type: 'written_test',
        topicTitle: w.data?.topicTitle || w.topicId,
        score: w.data?.result?.percentage,
        timestamp: w.createdAt,
      });
    }
  }

  recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const isDemo = assignment.schoolId.includes('demo') || (school?.name?.includes('Demo') ?? false);

  const analytics: TeacherAssignmentAnalytics = {
    assignment: {
      ...assignment,
      teacherName: teacher?.fullName,
      teacherEmail: teacher?.email,
      schoolName: school?.name,
      subjectName,
    },
    totalStudents,
    activeStudents: activeLearnersCount,
    averageMastery,
    averageSyllabusCompletion,
    averageMcqAccuracy,
    averageWrittenAccuracy,
    strongestTopics,
    attentionTopics,
    studentsNeedingSupport,
    recentActivity: recentActivity.slice(0, 10),
    isDemoData: isDemo,
    demoDataNotice: isDemo ? 'Demonstration Environment — Sample Academic Records' : undefined,
  };

  return {
    assignment,
    school,
    teacher,
    students: studentsList,
    analytics,
  };
}

/**
 * Builds Full Teacher Dashboard Response
 */
export function buildTeacherDashboardData(
  teacherId: string,
  preferredAssignmentId?: string
): TeacherDashboardData | null {
  const teacher = cloudDb.findUserById(teacherId);
  if (!teacher || teacher.role !== 'teacher' || teacher.status !== 'active') return null;

  // Only consider active assignments in active schools
  const allActiveAsgns = cloudDb.getTeacherActiveAssignments(teacherId);
  const rawAssignments = allActiveAsgns.filter((a) => {
    const sch = cloudDb.findSchoolById(a.schoolId);
    return sch && sch.status === 'active' && sch.isActive;
  });

  if (rawAssignments.length === 0) {
    return {
      teacher: {
        id: teacher.id,
        fullName: teacher.fullName,
        email: teacher.email,
        assignedSchools: [],
        assignedClasses: [],
        assignedSubjects: [],
      },
      assignments: [],
      students: [],
      analytics: {
        assignment: {
          id: '',
          teacherId: teacher.id,
          schoolId: '',
          classLevel: '',
          subjectId: '',
          isActive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        totalStudents: 0,
        activeStudents: 0,
        averageMastery: 0,
        averageSyllabusCompletion: 0,
        averageMcqAccuracy: 0,
        averageWrittenAccuracy: 0,
        strongestTopics: [],
        attentionTopics: [],
        studentsNeedingSupport: [],
        recentActivity: [],
      },
    };
  }

  // Populate schoolName and subjectName on assignments
  const populatedAssignments = rawAssignments.map((a) => {
    const sch = cloudDb.findSchoolById(a.schoolId);
    const resolvedSubject = resolveSubjectDisplayName(a.classLevel, a.subjectId, a.subjectName);
    return {
      ...a,
      subjectId: resolvedSubject.subjectId,
      teacherName: teacher.fullName,
      teacherEmail: teacher.email,
      schoolName: sch?.name || teacher.schoolName || 'Telangana Institution',
      subjectName: resolvedSubject.subjectName,
    };
  });

  const selectedAssignment =
    populatedAssignments.find((a) => a.id === preferredAssignmentId) || populatedAssignments[0];

  const assignmentDetails = selectedAssignment ? buildTeacherAssignmentAnalytics(selectedAssignment.id) : null;

  const assignedSchools = Array.from(
    new Map(
      populatedAssignments.map((a) => [a.schoolId, { id: a.schoolId, name: a.schoolName || 'Telangana School' }])
    ).values()
  );

  const assignedClasses = Array.from(new Set(populatedAssignments.map((a) => a.classLevel)));
  const assignedSubjects = Array.from(
    new Map(
      populatedAssignments.map((a) => [a.subjectId, { id: a.subjectId, name: a.subjectName || a.subjectId }])
    ).values()
  );

  return {
    teacher: {
      id: teacher.id,
      fullName: teacher.fullName,
      email: teacher.email,
      assignedSchools,
      assignedClasses,
      assignedSubjects,
    },
    assignments: populatedAssignments,
    currentAssignment: selectedAssignment,
    students: assignmentDetails?.students || [],
    analytics: assignmentDetails?.analytics || {
      assignment: selectedAssignment,
      totalStudents: 0,
      activeStudents: 0,
      averageMastery: 0,
      averageSyllabusCompletion: 0,
      averageMcqAccuracy: 0,
      averageWrittenAccuracy: 0,
      strongestTopics: [],
      attentionTopics: [],
      studentsNeedingSupport: [],
      recentActivity: [],
    },
    isDemoData: assignmentDetails?.analytics?.isDemoData,
    demoDataNotice: assignmentDetails?.analytics?.demoDataNotice,
  };
}

/**
 * Builds Principal Dashboard Data for a specific School
 */
export function buildPrincipalDashboardData(schoolId: string): PrincipalDashboardData | null {
  const school = cloudDb.findSchoolById(schoolId);
  if (!school || school.status !== 'active' || !school.isActive) return null;

  const principal = cloudDb.findPrincipalBySchool(schoolId);
  const students = cloudDb.listStudentsBySchool(schoolId);
  const teachers = cloudDb.listTeachersBySchool(schoolId);
  const teacherAssignments = cloudDb.listTeacherAssignments({ schoolId, isActive: true });

  const classesList = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

  const classMetrics: PrincipalClassMetric[] = [];
  const allStudentsNeedingSupport: StudentNeedingSupport[] = [];

  let overallMasterySum = 0;
  let overallCompletionSum = 0;
  let totalTestsCompleted = 0;
  let activeStudentsCount = 0;

  for (const cls of classesList) {
    const classStudents = students.filter((s) => (s.classLevel || 'Class 10') === cls);
    let classMasterySum = 0;
    let classCompSum = 0;
    let classMcqAccSum = 0;
    let classWrittenAccSum = 0;
    let mcqCount = 0;
    let writtenCount = 0;
    let activeInClass = 0;
    let supportInClass = 0;

    for (const stu of classStudents) {
      const overview = buildStudentAnalyticsOverview(stu.id, cls);
      const isRecentlyActive =
        getDaysElapsed(stu.updatedAt || stu.createdAt) <= SUPPORT_THRESHOLDS.ACTIVE_DAYS_WINDOW ||
        overview.totalTestsTaken > 0;

      if (isRecentlyActive) {
        activeInClass++;
        activeStudentsCount++;
      }

      classMasterySum += overview.averageMastery;
      classCompSum += overview.overallCompletionPct;
      overallMasterySum += overview.averageMastery;
      overallCompletionSum += overview.overallCompletionPct;
      totalTestsCompleted += overview.totalTestsTaken;

      if (overview.averageMcqAccuracy > 0) {
        classMcqAccSum += overview.averageMcqAccuracy;
        mcqCount++;
      }
      if (overview.averageWrittenAccuracy > 0) {
        classWrittenAccSum += overview.averageWrittenAccuracy;
        writtenCount++;
      }

      // Check if student needs support
      const support = evaluateStudentSupport(
        stu,
        undefined,
        overview.averageMastery,
        overview.averageMastery,
        overview.averageMcqAccuracy,
        overview.averageWrittenAccuracy,
        overview.totalTestsTaken,
        overview.streak.lastActiveDate || stu.updatedAt || stu.createdAt,
        'Curriculum Overall'
      );
      if (support) {
        supportInClass++;
        allStudentsNeedingSupport.push(support);
      }
    }

    const cCount = classStudents.length;
    classMetrics.push({
      classLevel: cls,
      studentCount: cCount,
      activeStudents: activeInClass,
      averageMastery: cCount > 0 ? Math.round(classMasterySum / cCount) : 0,
      averageCompletionPct: cCount > 0 ? Math.round(classCompSum / cCount) : 0,
      averageMcqAccuracy: mcqCount > 0 ? Math.round(classMcqAccSum / mcqCount) : 0,
      averageWrittenAccuracy: writtenCount > 0 ? Math.round(classWrittenAccSum / writtenCount) : 0,
      studentsNeedingSupportCount: supportInClass,
    });
  }

  // School-wide Subject Metrics across TS SCERT subjects
  const subjectMap: Record<
    string,
    {
      id: string;
      name: string;
      classes: Set<string>;
      learnerIds: Set<string>;
      masterySum: number;
      completionSum: number;
      studentCount: number;
      topicScores: Record<string, { title: string; scores: number[] }>;
    }
  > = {};

  // Standard subjects in Telangana SCERT curriculum
  const standardSubjects = [
    { id: 'mathematics', name: 'Mathematics' },
    { id: 'physical_science', name: 'Physical Science' },
    { id: 'biological_science', name: 'Biological Science' },
    { id: 'social_studies', name: 'Social Studies' },
    { id: 'english', name: 'English' },
    { id: 'telugu', name: 'Telugu' },
  ];

  for (const sub of standardSubjects) {
    subjectMap[sub.id] = {
      id: sub.id,
      name: sub.name,
      classes: new Set(),
      learnerIds: new Set(),
      masterySum: 0,
      completionSum: 0,
      studentCount: 0,
      topicScores: {},
    };
  }

  for (const stu of students) {
    const cls = stu.classLevel || 'Class 10';
    const overview = buildStudentAnalyticsOverview(stu.id, cls);

    for (const sp of overview.subjects) {
      const subKey = sp.subjectId.toLowerCase();
      if (!subjectMap[subKey]) {
        subjectMap[subKey] = {
          id: sp.subjectId,
          name: sp.subjectName,
          classes: new Set(),
          learnerIds: new Set(),
          masterySum: 0,
          completionSum: 0,
          studentCount: 0,
          topicScores: {},
        };
      }

      const rec = subjectMap[subKey];
      rec.classes.add(cls);
      rec.learnerIds.add(stu.id);
      rec.masterySum += sp.masteryScore;
      rec.completionSum += sp.completionPercentage;
      rec.studentCount++;

      for (const ch of sp.chapters) {
        for (const tp of ch.topics) {
          if (!rec.topicScores[tp.topicId]) {
            rec.topicScores[tp.topicId] = { title: tp.title, scores: [] };
          }
          const tProg = tp.progress;
          const topMastery = tProg ? tProg.masteryScore : 0;
          const topStatus = tProg ? tProg.status : 'not_started';
          if (topMastery > 0 || topStatus === 'completed') {
            rec.topicScores[tp.topicId].scores.push(topMastery);
          }
        }
      }
    }
  }

  const subjectMetrics: PrincipalSubjectMetric[] = Object.values(subjectMap).map((sub) => {
    const avgMastery = sub.studentCount > 0 ? Math.round(sub.masterySum / sub.studentCount) : 0;
    const avgComp = sub.studentCount > 0 ? Math.round(sub.completionSum / sub.studentCount) : 0;

    const topicRankings = Object.entries(sub.topicScores).map(([topId, data]) => ({
      topicId: topId,
      topicTitle: data.title,
      averageScore:
        data.scores.length > 0 ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) : 0,
    }));

    const strongest = [...topicRankings]
      .filter((t) => t.averageScore > 0)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 3);

    const weakest = [...topicRankings]
      .filter((t) => t.averageScore > 0 && t.averageScore < 60)
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 3);

    return {
      subjectId: sub.id,
      subjectName: sub.name,
      classesTaught: Array.from(sub.classes).sort(),
      activeLearners: sub.learnerIds.size,
      averageMastery: avgMastery,
      completionPercentage: avgComp,
      strongestTopics: strongest,
      weakestTopics: weakest,
    };
  });

  // Principal's Teachers list
  const teachersList: PrincipalTeacherItem[] = teachers.map((t) => {
    const asgns = teacherAssignments.filter((a) => a.teacherId === t.id);
    const assignedClasses = Array.from(new Set(asgns.map((a) => a.classLevel)));
    const assignedSubjects = Array.from(new Set(asgns.map((a) => a.subjectId)));
    const studentCount = students.filter((s) => assignedClasses.includes(s.classLevel || 'Class 10')).length;

    return {
      id: t.id,
      fullName: t.fullName,
      email: t.email,
      status: t.status,
      assignments: asgns.map((a) => ({
        ...a,
        teacherName: t.fullName,
        schoolName: school.name,
      })),
      assignedClasses,
      assignedSubjects,
      totalAssignedStudents: studentCount,
    };
  });

  // Recent School Activity
  const recentActivity: PrincipalDashboardData['recentActivity'] = [];
  for (const stu of students.slice(0, 15)) {
    const mcqs = cloudDb.getMcqAttempts(stu.id);
    for (const m of mcqs.slice(0, 1)) {
      recentActivity.push({
        id: m.id,
        studentId: stu.id,
        studentName: stu.fullName,
        classLevel: m.classLevel,
        type: 'MCQ Assessment',
        subjectName: m.subjectId,
        topicTitle: m.data?.topicTitle,
        timestamp: m.createdAt,
      });
    }
  }

  recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const totalStudents = students.length;
  const overallSyllabusCompletion = totalStudents > 0 ? Math.round(overallCompletionSum / totalStudents) : 0;
  const overallAverageMastery = totalStudents > 0 ? Math.round(overallMasterySum / totalStudents) : 0;

  // Real alongside count of AI learning conversations across the school's students
  let totalAiInteractions = 0;
  for (const stu of students) {
    totalAiInteractions += cloudDb.getAiConversations(stu.id).length;
  }

  return {
    school: {
      ...school,
      principalName: principal?.fullName,
    },
    overview: {
      totalStudents,
      activeStudents: activeStudentsCount,
      totalTeachers: teachers.length,
      totalClassesRepresented: classesList.filter((cls) => students.some((s) => s.classLevel === cls)).length,
      overallSyllabusCompletion,
      overallAverageMastery,
      totalTestsCompleted,
      totalAiInteractions,
    },
    classes: classMetrics,
    subjects: subjectMetrics,
    studentsNeedingSupport: allStudentsNeedingSupport.slice(0, 20),
    teachers: teachersList,
    recentActivity: recentActivity.slice(0, 12),
  };
}

/**
 * Builds Platform-Wide Overview for Company Administrator
 */
export function buildCompanyAdminDashboardData(): CompanyAdminDashboardData {
  const schools = cloudDb.listSchools();
  const allUsers = cloudDb.listUsers();

  const students = allUsers.filter((u) => u.role === 'student');
  const teachers = allUsers.filter((u) => u.role === 'teacher');
  const principals = allUsers.filter((u) => u.role === 'principal');
  const admins = allUsers.filter((u) => u.role === 'company_admin');

  const activeSchools = schools.filter((s) => s.status === 'active').length;
  const suspendedSchools = schools.filter((s) => s.status === 'suspended').length;
  const activeUsers = allUsers.filter((u) => sIsActive(u.status)).length;

  function sIsActive(status?: string) {
    return status === 'active' || !status;
  }

  // Calculate total tests completed across all students
  let totalTestsCompleted = 0;
  for (const stu of students) {
    totalTestsCompleted += cloudDb.getMcqAttempts(stu.id).length + cloudDb.getWrittenAttempts(stu.id).length;
  }

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentRegistrationsCount = allUsers.filter((u) => new Date(u.createdAt).getTime() >= sevenDaysAgo).length;

  const populatedSchools = schools.map((s) => {
    const p = s.principalId ? cloudDb.findUserById(s.principalId) : cloudDb.findPrincipalBySchool(s.id);
    return {
      ...s,
      principalName: p?.fullName,
    };
  });

  const recentUsers = [...allUsers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 15)
    .map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      schoolName: u.schoolName,
      classLevel: u.classLevel,
      status: u.status,
      createdAt: u.createdAt,
    }));

  return {
    overview: {
      totalSchools: schools.length,
      activeSchools,
      suspendedSchools,
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalPrincipals: principals.length,
      totalCompanyAdmins: admins.length,
      activeUsers,
      totalLearningEvents: cloudDb.getLearningEventCount(),
      totalTestsCompleted,
      recentRegistrationsCount,
    },
    schools: populatedSchools,
    recentUsers,
  };
}
