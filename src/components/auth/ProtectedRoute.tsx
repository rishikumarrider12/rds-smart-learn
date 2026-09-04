import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { ShieldAlert, LogIn, Lock, ArrowRight, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  onNavigate: (path: string) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  onNavigate,
}) => {
  const { user, isAuthenticated, isLoading, role, status } = useAuth();

  // Not authenticated → cleanly redirect to the public authentication page
  React.useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      onNavigate('/login');
    }
  }, [isLoading, isAuthenticated, user, onNavigate]);

  if (isLoading) {
    return (
      <div id="auth-loading-state" className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-slate-300">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-400">Verifying authenticated session...</p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div id="auth-required-screen" className="flex-1 flex items-center justify-center p-6 min-h-[70vh]">
        <div className="max-w-md w-full bg-[#0d152a] border border-cyan-500/20 rounded-2xl p-8 text-center shadow-2xl shadow-cyan-950/40">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-5 text-cyan-400">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Account Sign In Required</h2>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            Please sign in to your RDS SMART LEARN account to access your syllabus, test engine, and AI learning tools.
          </p>
          <div className="space-y-3">
            <button
              id="auth-go-to-login-btn"
              onClick={() => onNavigate('/login')}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Your Account</span>
            </button>
            <button
              id="auth-go-to-signup-btn"
              onClick={() => onNavigate('/signup')}
              className="w-full py-2.5 bg-[#131d36] hover:bg-[#1a284c] text-cyan-300 border border-cyan-500/30 font-semibold rounded-xl text-xs transition-all"
            >
              New student? Create an Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Suspended or Inactive Account Check
  if (status === 'suspended' || status === 'inactive') {
    return (
      <div id="account-blocked-screen" className="flex-1 flex items-center justify-center p-6 min-h-[70vh]">
        <div className="max-w-md w-full bg-[#18111e] border border-amber-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5 text-amber-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {status === 'suspended' ? 'Account Suspended' : 'Account Inactive'}
          </h2>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            {status === 'suspended'
              ? 'Your account has been temporarily suspended. Please contact the RDS SMART LEARN administrator.'
              : 'Your account is currently inactive. Please contact your school administrator or teacher.'}
          </p>
          <button
            onClick={() => onNavigate('/')}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Role verification check
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const getDashboardPath = () => {
      if (role === 'teacher') return '/teacher';
      if (role === 'principal') return '/principal';
      if (role === 'company_admin') return '/admin';
      return '/dashboard';
    };

    return (
      <div id="access-denied-screen" className="flex-1 flex items-center justify-center p-6 min-h-[70vh]">
        <div className="max-w-md w-full bg-[#161226] border border-rose-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-5 text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            You do not have permission to access this page. Your account role is <span className="font-semibold text-rose-300 capitalize">{role.replace('_', ' ')}</span>.
          </p>
          <button
            id="access-denied-go-dashboard-btn"
            onClick={() => onNavigate(getDashboardPath())}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Go to My Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
