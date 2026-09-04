import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudent } from '../context/StudentContext';
import { ClassLevel } from '../types';
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';

interface LoginScreenProps {
  onNavigate: (path: string) => void;
  /** Preselected portal context from the public landing page */
  initialRole?: 'student' | 'teacher' | 'principal' | 'super-admin';
}

const ROLE_COPY: Record<
  NonNullable<LoginScreenProps['initialRole']>,
  { badge: string; title: string; subtitle: string }
> = {
  student: {
    badge: 'Student Portal',
    title: 'Student Sign In',
    subtitle: 'Access your syllabus, RDS AI tutor, tests, and progress analytics.',
  },
  teacher: {
    badge: 'Teacher Portal',
    title: 'Teacher Sign In',
    subtitle: 'Approved teacher accounts only. Requests are reviewed by the Super Admin.',
  },
  principal: {
    badge: 'Principal Portal',
    title: 'Principal Sign In',
    subtitle: 'Principal accounts are created by the Super Admin.',
  },
  'super-admin': {
    badge: 'Super Admin',
    title: 'Super Admin Sign In',
    subtitle: 'Secure platform administration for Slate High School.',
  },
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate, initialRole = 'student' }) => {
  const { login } = useAuth();
  const { saveStudentProfile } = useStudent();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login({
        email: email.trim(),
        password,
      });

      // If student, sync local profile state
      if (user.role === 'student') {
        saveStudentProfile({
          name: user.fullName,
          schoolName: user.schoolName || 'Slate High School',
          selectedClass: (user.classLevel as ClassLevel) || 'Class 10',
          preferredLanguage: 'English',
        });
      }

      // Role-based destination routing
      switch (user.role) {
        case 'student':
          onNavigate('/dashboard');
          break;
        case 'teacher':
          onNavigate('/teacher');
          break;
        case 'principal':
          onNavigate('/principal');
          break;
        case 'company_admin':
          onNavigate('/admin');
          break;
        default:
          onNavigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login-page" className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F7FAFC]">
      <div className="max-w-md w-full">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EAF3FF] border border-blue-200 rounded-full text-[#1565C0] text-xs font-bold mb-3 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{ROLE_COPY[initialRole].badge} • Slate High School</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A2342] tracking-tight">
            {ROLE_COPY[initialRole].title}
          </h1>
          <p className="text-sm text-[#627D98] mt-2">
            {ROLE_COPY[initialRole].subtitle}
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white border border-[#D9E2EC] rounded-2xl p-6 sm:p-8 shadow-xs">
          {error && (
            <div
              id="login-error-box"
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm animate-in fade-in"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-[#627D98] mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email-input"
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full bg-[#F7FAFC] border border-[#D9E2EC] focus:border-[#1565C0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#0A2342] placeholder-[#829AB1] focus:outline-none focus:ring-1 focus:ring-blue-300 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#627D98] uppercase tracking-wider">
                  Password
                </label>
                <button
                  id="login-forgot-password-link"
                  type="button"
                  onClick={() => onNavigate('/forgot-password')}
                  className="text-xs text-[#1565C0] hover:text-blue-700 hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full bg-[#F7FAFC] border border-[#D9E2EC] focus:border-[#1565C0] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#0A2342] placeholder-[#829AB1] focus:outline-none focus:ring-1 focus:ring-blue-300 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <div className="pt-2">
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#1565C0] hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-6 border-t border-[#D9E2EC] text-center space-y-2">
            {initialRole === 'student' && (
              <p className="text-xs text-[#627D98]">
                Don't have a student account yet?{' '}
                <button
                  id="login-to-signup-btn"
                  type="button"
                  onClick={() => onNavigate('/signup/student')}
                  className="font-bold text-[#1565C0] hover:text-blue-700 hover:underline transition-colors"
                >
                  Create Student Account
                </button>
              </p>
            )}
            <p className="text-xs text-[#627D98]">
              <button
                id="login-back-to-landing-btn"
                type="button"
                onClick={() => onNavigate('/')}
                className="font-semibold text-[#627D98] hover:text-[#0A2342] transition-colors inline-flex items-center gap-1"
              >
                ← Back to RDS SMART LEARN home
              </button>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#627D98]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Role-protected secure portal by Rishi Digital Solutions</span>
        </div>
      </div>
    </div>
  );
};
