import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudentProvider, useStudent } from './context/StudentContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HeroSection } from './components/landing/HeroSection';
import { HowItWorksSection } from './components/landing/HowItWorksSection';
import { FeaturesSection } from './components/landing/FeaturesSection';
import { CtaSection } from './components/landing/CtaSection';
import { OnboardingForm } from './components/onboarding/OnboardingForm';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { ProgressPage } from './components/analytics/ProgressPage';
import { SubjectSelector } from './components/learning/SubjectSelector';
import { ChapterSelector } from './components/learning/ChapterSelector';
import { TopicSelector } from './components/learning/TopicSelector';
import { TopicActionScreen } from './components/learning/TopicActionScreen';
import { AskRdsAiScreen } from './components/learning/AskRdsAiScreen';
import { LearnWithAiScreen } from './components/learning/LearnWithAiScreen';
import { McqTestSetupScreen } from './screens/McqTestSetupScreen';
import { McqActiveTestScreen } from './screens/McqActiveTestScreen';
import { McqResultScreen } from './screens/McqResultScreen';
import { WrittenTestSetupScreen } from './screens/WrittenTestSetupScreen';
import { WrittenTestActiveScreen } from './screens/WrittenTestActiveScreen';
import { WrittenTestResultScreen } from './screens/WrittenTestResultScreen';
import { SignupScreen } from './screens/SignupScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AdminDashboard } from './screens/admin/AdminDashboard';
import { TeacherDashboard } from './screens/teacher/TeacherDashboard';
import { PrincipalDashboard } from './screens/principal/PrincipalDashboard';
import { StudentAssignmentsList } from './components/student/StudentAssignmentsList';
import { StudentAssignmentPlayerScreen } from './screens/StudentAssignmentPlayerScreen';
import { StudentAssignmentResultScreen } from './screens/StudentAssignmentResultScreen';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PublicLanding } from './components/auth/PublicLanding';
import { TeacherRequestScreen } from './screens/TeacherRequestScreen';
import { UserRole } from './types/auth';
import { MigrationBanner } from './components/auth/MigrationBanner';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { getSyllabusForClass } from './data/syllabusData';
import { ClassLevel, Subject, Chapter, Topic } from './types';

function MainAppContent() {
  const {
    student,
    selectedClass,
    selectedSubject,
    selectedChapter,
    selectedTopic,
    isOnboarded,
    updateClass,
    selectSubject,
    selectChapter,
    selectTopic,
    setFullContext,
  } = useStudent();

  const { isAuthenticated, user, role, isLoading: isAuthLoading } = useAuth();

  // Role-based home resolution
  const getRoleDashboard = (r: UserRole | null): string => {
    switch (r) {
      case 'teacher':
        return '/teacher';
      case 'principal':
        return '/principal';
      case 'company_admin':
        return '/admin';
      default:
        return '/dashboard';
    }
  };

  // Current path routing state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname && pathname !== '/') {
        return pathname;
      }
    }
    return '/';
  });

  // State to hold pending AI query when transitioning from test results to Ask RDS AI
  const [pendingAiQuestion, setPendingAiQuestion] = useState<string | undefined>(undefined);

  // Authenticated users never see the public landing — send them to their portal
  React.useEffect(() => {
    if (!isAuthLoading && isAuthenticated && (currentPath === '/' || currentPath === '')) {
      navigateTo(getRoleDashboard(role));
    }
  }, [isAuthLoading, isAuthenticated, role, currentPath]);

  // Sync route with browser history
  const navigateTo = (path: string, updateUrl = true) => {
    setCurrentPath(path);
    if (updateUrl && typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Parse path for deep links like /subjects/:subjectId/chapters or /subjects/:subjectId/chapters/:chapterId/topics
  useEffect(() => {
    if (currentPath.startsWith('/subjects/')) {
      const parts = currentPath.split('/').filter(Boolean);
      if (parts.length >= 2) {
        const subId = parts[1];
        const chapId = parts.length >= 4 ? parts[3] : undefined;
        setFullContext(subId, chapId);
      }
    }
  }, [currentPath, setFullContext]);

  // Ensure fallback selection if visiting /chapters, /topics, or /learn without state
  const syllabus = getSyllabusForClass(selectedClass);
  const activeSubject: Subject = selectedSubject || syllabus.subjects[0];
  const activeChapter: Chapter = selectedChapter || activeSubject.chapters[0];
  const activeTopic: Topic = selectedTopic || activeChapter.topics[0];

  // Flow Navigation handlers
  const handleSelectSubject = (subject: Subject) => {
    selectSubject(subject);
    navigateTo(`/subjects/${subject.id}/chapters`);
  };

  const handleSelectChapter = (chapter: Chapter) => {
    selectChapter(chapter);
    navigateTo(`/subjects/${activeSubject.id}/chapters/${chapter.id}/topics`);
  };

  const handleSelectTopic = (topic: Topic) => {
    selectTopic(topic);
    navigateTo('/learn');
  };

  const handleBreadcrumbNavigate = (target: 'dashboard' | 'subjects' | 'chapters' | 'topics' | 'learn') => {
    switch (target) {
      case 'dashboard':
        navigateTo(isAuthenticated || isOnboarded ? '/dashboard' : '/');
        break;
      case 'subjects':
        navigateTo('/subjects');
        break;
      case 'chapters':
        navigateTo(`/subjects/${activeSubject.id}/chapters`);
        break;
      case 'topics':
        navigateTo(`/subjects/${activeSubject.id}/chapters/${activeChapter.id}/topics`);
        break;
      case 'learn':
        navigateTo('/learn');
        break;
    }
  };

  const scrollToFeatures = () => {
    const el = document.getElementById('features-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigateTo('/');
      setTimeout(() => {
        document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Route Rendering
  const renderRoute = () => {
    // 0. Authentication session restore gate
    if (isAuthLoading) {
      return (
        <div className="flex-1 flex items-center justify-center py-24 bg-[#F7FAFC]">
          <div className="w-9 h-9 rounded-full border-2 border-[#1565C0] border-t-transparent animate-spin" />
        </div>
      );
    }

    // 1. PUBLIC LANDING (/) — guests only; authenticated users are auto-redirected by effect
    if (currentPath === '/' || currentPath === '') {
      if (isAuthenticated) {
        return (
          <div className="flex-1 flex items-center justify-center py-24 text-sm text-[#627D98]">
            Redirecting to your portal…
          </div>
        );
      }
      return <PublicLanding onNavigate={navigateTo} />;
    }

    // Guard helper: every protected application page requires an authenticated session
    const guard = (node: React.ReactNode) => (
      <ProtectedRoute onNavigate={navigateTo}>{node}</ProtectedRoute>
    );

    // Auth Routes
    if (currentPath === '/signup' || currentPath === '/signup/student') {
      return <SignupScreen onNavigate={navigateTo} />;
    }

    if (currentPath === '/login' || currentPath.startsWith('/login/')) {
      const roleParam = currentPath.split('/')[2];
      const initialRole =
        roleParam === 'teacher' || roleParam === 'principal' || roleParam === 'super-admin'
          ? roleParam
          : 'student';
      return <LoginScreen key={initialRole} onNavigate={navigateTo} initialRole={initialRole} />;
    }

    // Teacher account request (public, permission-based — approval required)
    if (currentPath === '/request-teacher') {
      return <TeacherRequestScreen onNavigate={navigateTo} />;
    }

    if (currentPath === '/forgot-password') {
      return <ForgotPasswordScreen onNavigate={navigateTo} />;
    }

    if (currentPath === '/profile') {
      return (
        <ProtectedRoute onNavigate={navigateTo}>
          <ProfileScreen onNavigate={navigateTo} />
        </ProtectedRoute>
      );
    }

    // Role-specific Dashboards
    if (currentPath === '/admin') {
      return (
        <ProtectedRoute allowedRoles={['company_admin']} onNavigate={navigateTo}>
          <AdminDashboard onNavigate={navigateTo} />
        </ProtectedRoute>
      );
    }

    if (currentPath === '/teacher' || currentPath.startsWith('/teacher/')) {
      // Teacher portal is section-based: /teacher/:section (dashboard | classes |
      // students | assessments | assignments | learning-gaps | insights)
      const teacherSectionId = currentPath.split('/')[2] || 'dashboard';
      const teacherSections = ['dashboard', 'classes', 'students', 'assessments', 'assignments', 'learning-gaps', 'insights'];
      const teacherSection = teacherSections.includes(teacherSectionId) ? teacherSectionId : 'dashboard';
      return (
        <ProtectedRoute allowedRoles={['teacher', 'company_admin']} onNavigate={navigateTo}>
          <TeacherDashboard onNavigate={navigateTo} activeSection={teacherSection} />
        </ProtectedRoute>
      );
    }

    if (currentPath === '/principal') {
      return (
        <ProtectedRoute allowedRoles={['principal', 'company_admin']} onNavigate={navigateTo}>
          <PrincipalDashboard onNavigate={navigateTo} />
        </ProtectedRoute>
      );
    }

    // 2. Student Onboarding (/onboarding)
    if (currentPath === '/onboarding') {
      return guard(
        <div id="page-onboarding" className="flex-1">
          <OnboardingForm
            onSuccess={() => navigateTo('/dashboard')}
            onCancel={() => navigateTo('/')}
          />
        </div>
      );
    }

    // 3. Student Dashboard (/dashboard) — authentication-gated with explicit loading state
    if (currentPath === '/dashboard') {
      return (
        <ProtectedRoute
          allowedRoles={['student', 'teacher', 'principal', 'company_admin']}
          onNavigate={navigateTo}
        >
        <DashboardLayout
          currentPath="/dashboard"
          onNavigate={navigateTo}
          title="Student Portal"
          subtitle={`${student?.schoolName || user?.schoolName || 'Slate High School'} • Class ${selectedClass}`}
        >
          <MigrationBanner />
          <StudentDashboard
            onSelectSubject={handleSelectSubject}
            onContinueLearning={() => {
              if (selectedTopic && selectedChapter && selectedSubject) {
                navigateTo('/learn');
              } else {
                navigateTo('/subjects');
              }
            }}
            onExploreSubjects={() => navigateTo('/subjects')}
            onEditProfile={() => navigateTo('/profile')}
            onNavigateToProgress={() => navigateTo('/progress')}
            onSelectTopicForAction={(subId, chapId, topId, actionType) => {
              setFullContext(subId, chapId, topId);
              if (actionType === 'mcq') {
                navigateTo('/mcq-test');
              } else if (actionType === 'written') {
                navigateTo('/written-test');
              } else {
                navigateTo('/learn-with-ai');
              }
            }}
            onViewTestResult={(testId) => {
              if (testId.startsWith('wtest_')) {
                navigateTo(`/written-test/result/${testId}`);
              } else {
                navigateTo(`/mcq-test/result/${testId}`);
              }
            }}
          />
        </DashboardLayout>
        </ProtectedRoute>
      );
    }

    // 3.1 Student Progress & Analytics (/progress or /analytics)
    if (currentPath === '/progress' || currentPath === '/analytics') {
      return guard(
        <DashboardLayout
          currentPath="/progress"
          onNavigate={navigateTo}
          title="Progress & Analytics"
          subtitle={`Detailed Academic Mastery Records • Class ${selectedClass}`}
        >
          <MigrationBanner />
          <ProgressPage
            onNavigate={handleBreadcrumbNavigate}
            onSelectTopicForAction={(subId, chapId, topId, actionType) => {
              setFullContext(subId, chapId, topId);
              if (actionType === 'mcq') {
                navigateTo('/mcq-test');
              } else if (actionType === 'written') {
                navigateTo('/written-test');
              } else {
                navigateTo('/learn-with-ai');
              }
            }}
          />
        </DashboardLayout>
      );
    }

    // 4. Subject Selection (/subjects)
    if (currentPath === '/subjects') {
      return guard(
        <div id="page-subjects" className="flex-1">
          <MigrationBanner />
          <SubjectSelector
            onSelectSubject={handleSelectSubject}
            onBack={() => navigateTo(isAuthenticated || isOnboarded ? '/dashboard' : '/')}
            onNavigate={handleBreadcrumbNavigate}
          />
        </div>
      );
    }

    // 5. Chapter Selection (/subjects/:subjectId/chapters or /chapters)
    if (currentPath.includes('/chapters') && !currentPath.includes('/topics')) {
      return guard(
        <div id="page-chapters" className="flex-1">
          <ChapterSelector
            subject={activeSubject}
            onSelectChapter={handleSelectChapter}
            onBackToSubjects={() => navigateTo('/subjects')}
            onNavigate={handleBreadcrumbNavigate}
          />
        </div>
      );
    }

    // 6. Topic Selection (/subjects/:subjectId/chapters/:chapterId/topics or /topics)
    if (currentPath.includes('/topics')) {
      return guard(
        <div id="page-topics" className="flex-1">
          <TopicSelector
            subject={activeSubject}
            chapter={activeChapter}
            onSelectTopic={handleSelectTopic}
            onBackToChapters={() => navigateTo(`/subjects/${activeSubject.id}/chapters`)}
            onNavigate={handleBreadcrumbNavigate}
          />
        </div>
      );
    }

    // 7. Topic Action Screen (/learn)
    if (currentPath === '/learn') {
      return guard(
        <div id="page-learn" className="flex-1">
          <TopicActionScreen
            subject={activeSubject}
            chapter={activeChapter}
            topic={activeTopic}
            onBackToTopics={() => navigateTo(`/subjects/${activeSubject.id}/chapters/${activeChapter.id}/topics`)}
            onNavigateToAskAi={() => navigateTo('/ask-ai')}
            onNavigateToLearnWithAi={() => navigateTo('/learn-with-ai')}
            onNavigateToMcqTest={() => navigateTo('/mcq-test')}
            onNavigateToWrittenTest={() => navigateTo('/written-test')}
            onNavigate={handleBreadcrumbNavigate}
          />
        </div>
      );
    }

    // 8. Ask RDS AI Screen (/ask-ai)
    if (currentPath === '/ask-ai') {
      return guard(
        <div id="page-ask-ai" className="flex-1">
          <AskRdsAiScreen
            subject={activeSubject}
            chapter={activeChapter}
            topic={activeTopic}
            initialQuestion={pendingAiQuestion}
            onBackToTopicActions={() => {
              setPendingAiQuestion(undefined);
              navigateTo('/learn');
            }}
            onNavigateToLearnWithAi={() => {
              setPendingAiQuestion(undefined);
              navigateTo('/learn-with-ai');
            }}
            onNavigate={(target) => {
              setPendingAiQuestion(undefined);
              handleBreadcrumbNavigate(target);
            }}
          />
        </div>
      );
    }

    // 9. Learn with AI Screen (/learn-with-ai)
    if (currentPath === '/learn-with-ai') {
      return guard(
        <div id="page-learn-with-ai" className="flex-1">
          <LearnWithAiScreen
            subject={activeSubject}
            chapter={activeChapter}
            topic={activeTopic}
            onBackToTopicActions={() => navigateTo('/learn')}
            onNavigateToAskAi={(initialQ) => {
              setPendingAiQuestion(initialQ);
              navigateTo('/ask-ai');
            }}
            onNavigate={handleBreadcrumbNavigate}
          />
        </div>
      );
    }

    // 10. MCQ Test Setup Screen (/mcq-test)
    if (currentPath === '/mcq-test') {
      return guard(
        <div id="page-mcq-setup" className="flex-1">
          <McqTestSetupScreen
            subject={activeSubject}
            chapter={activeChapter}
            topic={activeTopic}
            onBackToTopicActions={() => navigateTo('/learn')}
            onNavigateToSession={(testId) => navigateTo(`/mcq-test/session/${testId}`)}
            onNavigateToResult={(testId) => navigateTo(`/mcq-test/result/${testId}`)}
            onNavigate={handleBreadcrumbNavigate}
          />
        </div>
      );
    }

    // 11. MCQ Active Test Session (/mcq-test/session/:testId)
    if (currentPath.startsWith('/mcq-test/session/')) {
      const testId = currentPath.replace('/mcq-test/session/', '').split('/')[0];
      return guard(
        <div id="page-mcq-session" className="flex-1">
          <McqActiveTestScreen
            testId={testId}
            subject={activeSubject}
            chapter={activeChapter}
            topic={activeTopic}
            onExitTest={() => navigateTo('/learn')}
            onTestCompleted={(completedTestId) => navigateTo(`/mcq-test/result/${completedTestId}`)}
          />
        </div>
      );
    }

    // 12. MCQ Test Result Screen (/mcq-test/result/:testId)
    if (currentPath.startsWith('/mcq-test/result/')) {
      const testId = currentPath.replace('/mcq-test/result/', '').split('/')[0];
      return guard(
        <div id="page-mcq-result" className="flex-1">
          <McqResultScreen
            testId={testId}
            subject={activeSubject}
            chapter={activeChapter}
            topic={activeTopic}
            onNavigateToAskAiWithMistakes={(mistakesSummary) => {
              setPendingAiQuestion(mistakesSummary);
              navigateTo('/ask-ai');
            }}
            onNavigateToLearnWithAi={() => navigateTo('/learn-with-ai')}
            onRetakeTest={() => navigateTo('/mcq-test')}
            onNavigateToDashboard={() => navigateTo('/dashboard')}
            onNavigate={handleBreadcrumbNavigate}
          />
        </div>
      );
    }

    // 13. Written Test Setup Screen (/written-test)
    if (currentPath === '/written-test') {
      return guard(
        <div id="page-written-setup" className="flex-1">
          <WrittenTestSetupScreen
            classLevel={selectedClass}
            subject={activeSubject}
            chapter={activeChapter}
            topic={activeTopic}
            studentId={user?.id || 'student'}
            studentName={user?.fullName || student?.name || 'Student'}
            onTestStarted={(testId) => navigateTo(`/written-test/session/${testId}`)}
            onBackToTopic={() => navigateTo('/learn')}
            onNavigate={handleBreadcrumbNavigate}
          />
        </div>
      );
    }

    // 14. Written Test Active Session (/written-test/session/:testId)
    if (currentPath.startsWith('/written-test/session/')) {
      const testId = currentPath.replace('/written-test/session/', '').split('/')[0];
      return guard(
        <div id="page-written-session" className="flex-1">
          <WrittenTestActiveScreen
            testId={testId}
            subject={activeSubject}
            chapter={activeChapter}
            topic={activeTopic}
            onExitTest={() => navigateTo('/learn')}
            onFinishTest={(completedTestId) => navigateTo(`/written-test/result/${completedTestId}`)}
          />
        </div>
      );
    }

    // 15. Written Test Result Screen (/written-test/result/:testId)
    if (currentPath.startsWith('/written-test/result/')) {
      const testId = currentPath.replace('/written-test/result/', '').split('/')[0];
      return (
        <div id="page-written-result" className="flex-1">
          <WrittenTestResultScreen
            testId={testId}
            subject={activeSubject}
            chapter={activeChapter}
            topic={activeTopic}
            onRetakeTest={() => navigateTo('/written-test')}
            onDiscussWithAi={(discussionPrompt) => {
              setPendingAiQuestion(discussionPrompt);
              navigateTo('/ask-ai');
            }}
            onLearnWeakTopic={() => {
              navigateTo('/learn-with-ai');
            }}
            onBackToTopic={() => navigateTo('/learn')}
            onNavigate={handleBreadcrumbNavigate}
          />
        </div>
      );
    }

    // 16. Student Assignments List (/assignments)
    if (currentPath === '/assignments') {
      return (
        <ProtectedRoute allowedRoles={['student', 'company_admin']} onNavigate={navigateTo}>
          <DashboardLayout
            currentPath="/assignments"
            onNavigate={navigateTo}
            title="My Assignments"
            subtitle="Homework, Quizzes, and Practice Tasks from Teachers"
          >
            <StudentAssignmentsList
              onStartAssignment={(asgnId) => navigateTo(`/assignments/play/${asgnId}`)}
              onViewResult={(asgnId) => navigateTo(`/assignments/result/${asgnId}`)}
            />
          </DashboardLayout>
        </ProtectedRoute>
      );
    }

    // 17. Student Assignment Player (/assignments/play/:id)
    if (currentPath.startsWith('/assignments/play/')) {
      const assignmentId = currentPath.replace('/assignments/play/', '').split('/')[0];
      return (
        <ProtectedRoute allowedRoles={['student', 'company_admin']} onNavigate={navigateTo}>
          <StudentAssignmentPlayerScreen
            assignmentId={assignmentId}
            onExit={() => navigateTo('/assignments')}
            onSubmitted={(asgnId) => navigateTo(`/assignments/result/${asgnId}`)}
          />
        </ProtectedRoute>
      );
    }

    // 18. Student Assignment Result Screen (/assignments/result/:id)
    if (currentPath.startsWith('/assignments/result/')) {
      const assignmentId = currentPath.replace('/assignments/result/', '').split('/')[0];
      return (
        <ProtectedRoute allowedRoles={['student', 'company_admin']} onNavigate={navigateTo}>
          <StudentAssignmentResultScreen
            assignmentId={assignmentId}
            onBackToAssignments={() => navigateTo('/assignments')}
            onPracticeTopic={(topicId, chapterId, subjectId) => {
              setFullContext(subjectId, chapterId, topicId);
              navigateTo('/learn');
            }}
            onAskAiWithQuestions={(discussionPrompt) => {
              setPendingAiQuestion(discussionPrompt);
              navigateTo('/ask-ai');
            }}
          />
        </ProtectedRoute>
      );
    }

    // Fallback: unknown paths behave like the home route
    if (!isAuthenticated) {
      return <PublicLanding onNavigate={navigateTo} />;
    }
    return (
      <div className="flex-1 flex items-center justify-center py-24 text-sm text-[#627D98]">
        Redirecting to your portal…
      </div>
    );
  };

  const isDashboardView =
    currentPath === '/dashboard' ||
    currentPath === '/progress' ||
    currentPath === '/analytics' ||
    currentPath === '/assignments' ||
    currentPath === '/teacher' ||
    currentPath.startsWith('/teacher/') ||
    currentPath === '/principal' ||
    currentPath === '/admin';

  if (isDashboardView) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] text-slate-900 font-sans antialiased">
        {renderRoute()}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070b19] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentPath={currentPath}
        onNavigate={navigateTo}
      />

      {/* Main Page Content */}
      <main className="flex-1 flex flex-col">
        {renderRoute()}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StudentProvider>
        <ErrorBoundary>
          <MainAppContent />
        </ErrorBoundary>
      </StudentProvider>
    </AuthProvider>
  );
}
