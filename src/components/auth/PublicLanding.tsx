import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  LogIn,
  UserPlus,
  Users,
  Building2,
  Lock,
  ArrowRight,
  BookOpenCheck,
  Sparkles,
} from 'lucide-react';

interface PublicLandingProps {
  onNavigate: (path: string) => void;
}

/**
 * Public authentication landing page.
 * Two clear entry paths: STUDENT (learn) and ADMIN & STAFF (manage).
 * White + navy professional school-platform design system.
 */
export const PublicLanding: React.FC<PublicLandingProps> = ({ onNavigate }) => {
  return (
    <div id="public-landing" className="min-h-screen bg-[#F7FAFC] flex flex-col text-[#102A43]">
      {/* Header */}
      <header className="bg-white border-b border-[#D9E2EC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A2342] text-white flex items-center justify-center shadow-sm">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold tracking-tight leading-none">RDS SMART LEARN</p>
              <p className="text-xs text-[#627D98] font-medium mt-0.5">Slate High School</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#1565C0] bg-[#EAF3FF] border border-blue-100 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Learning Platform
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A2342]">
            Welcome to RDS SMART LEARN
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#627D98] max-w-2xl mx-auto">
            The official learning and school-management platform for{' '}
            <span className="font-semibold text-[#0A2342]">Slate High School</span>. Choose how you
            would like to continue below.
          </p>
        </div>

        <div id="landing-options-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* OPTION 1 — STUDENT */}
          <section
            id="landing-student-card"
            className="bg-white rounded-2xl border border-[#D9E2EC] shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8 flex flex-col"
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#0A2342] text-white flex items-center justify-center shrink-0">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-[#1565C0]">Option 1</p>
                <h2 className="text-2xl font-extrabold text-[#0A2342]">Student</h2>
              </div>
            </div>
            <p className="text-sm text-[#627D98] mb-2 font-semibold">Learn. Practice. Improve.</p>
            <p className="text-sm text-[#627D98] leading-relaxed mb-6">
              Access your Telangana SCERT syllabus, learn with RDS AI, take MCQ and written tests,
              and track your progress and mastery.
            </p>

            <div className="mt-auto space-y-3">
              <button
                id="landing-student-login-btn"
                onClick={() => onNavigate('/login/student')}
                className="w-full py-3 bg-[#1565C0] hover:bg-[#0F4C9A] text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Student Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                id="landing-student-signup-btn"
                onClick={() => onNavigate('/signup/student')}
                className="w-full py-3 bg-white hover:bg-[#EAF3FF] text-[#0A2342] border border-[#D9E2EC] hover:border-[#1565C0] font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Student Signup</span>
              </button>
            </div>
          </section>

          {/* OPTION 2 — ADMIN & STAFF */}
          <section
            id="landing-staff-card"
            className="bg-white rounded-2xl border border-[#D9E2EC] shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8 flex flex-col"
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#1565C0] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-[#1565C0]">Option 2</p>
                <h2 className="text-2xl font-extrabold text-[#0A2342]">Admin &amp; Staff</h2>
              </div>
            </div>
            <p className="text-sm text-[#627D98] mb-2 font-semibold">
              Manage the school and learning platform
            </p>
            <p className="text-sm text-[#627D98] leading-relaxed mb-6">
              Teacher accounts require Super Admin approval. Principals and Super Admins are
              provisioned securely — there is no public signup for staff roles.
            </p>

            <div className="mt-auto space-y-3">
              {/* Teacher */}
              <div className="p-4 rounded-xl border border-[#D9E2EC] bg-[#F7FAFC]">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-[#1565C0]" />
                  <p className="text-sm font-bold text-[#0A2342]">Teacher</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="landing-teacher-login-btn"
                    onClick={() => onNavigate('/login/teacher')}
                    className="py-2.5 bg-[#1565C0] hover:bg-[#0F4C9A] text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Login</span>
                  </button>
                  <button
                    id="landing-teacher-request-btn"
                    onClick={() => onNavigate('/request-teacher')}
                    className="py-2.5 bg-white hover:bg-[#EAF3FF] text-[#0A2342] border border-[#D9E2EC] hover:border-[#1565C0] font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Request Account</span>
                  </button>
                </div>
              </div>

              {/* Principal */}
              <div className="p-4 rounded-xl border border-[#D9E2EC] bg-[#F7FAFC]">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-[#1565C0]" />
                  <p className="text-sm font-bold text-[#0A2342]">Principal</p>
                </div>
                <button
                  id="landing-principal-login-btn"
                  onClick={() => onNavigate('/login/principal')}
                  className="w-full py-2.5 bg-[#1565C0] hover:bg-[#0F4C9A] text-white font-bold rounded-lg text-xs transition-colors"
                >
                  Login Only — accounts are created by the Super Admin
                </button>
              </div>

              {/* Super Admin */}
              <div className="p-4 rounded-xl border border-[#D9E2EC] bg-[#F7FAFC]">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-[#0A2342]" />
                  <p className="text-sm font-bold text-[#0A2342]">Super Admin</p>
                </div>
                <button
                  id="landing-superadmin-login-btn"
                  onClick={() => onNavigate('/login/super-admin')}
                  className="w-full py-2.5 bg-[#0A2342] hover:bg-[#06182E] text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Secure Login Only</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#D9E2EC] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-[#627D98]">
          RDS SMART LEARN · Slate High School · Secured role-based access by Rishi Digital Solutions
        </div>
      </footer>
    </div>
  );
};