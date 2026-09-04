import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudent } from '../context/StudentContext';
import { ClassLevel } from '../types';
import { TELANGANA_CLASSES } from '../data/syllabusData';
import { fetchPublicSchools } from '../services/organizationService';
import { 
  GraduationCap, 
  User, 
  School, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  Sparkles, 
  ArrowRight, 
  AlertCircle,
  Loader2,
  ShieldCheck,
  Building
} from 'lucide-react';

interface SignupScreenProps {
  onNavigate: (path: string) => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ onNavigate }) => {
  const { signup } = useAuth();
  const { saveStudentProfile } = useStudent();

  const [publicSchools, setPublicSchools] = useState<Array<{ id: string; name: string; schoolCode: string; city?: string }>>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [customSchoolName, setCustomSchoolName] = useState<string>('');

  const [formData, setFormData] = useState({
    fullName: '',
    classLevel: 'Class 10' as ClassLevel,
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    referenceName: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicSchools()
      .then((list) => {
        setPublicSchools(list);
        if (list.length > 0) {
          setSelectedSchoolId(list[0].id);
        }
      })
      .catch((err) => console.error('Failed to load public schools:', err));
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validation
    if (!formData.fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const effectiveSchoolName = selectedSchoolId === 'other' || !selectedSchoolId
      ? customSchoolName.trim()
      : publicSchools.find((s) => s.id === selectedSchoolId)?.name || customSchoolName.trim();

    if (!effectiveSchoolName) {
      setError('Please select or specify your school name.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formData.mobileNumber.trim()) {
      setError('Please enter your 10-digit mobile number.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await signup({
        fullName: formData.fullName.trim(),
        schoolName: effectiveSchoolName,
        classLevel: formData.classLevel,
        email: formData.email.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        referenceName: formData.referenceName.trim() || undefined,
      });

      // Synchronize with student context
      saveStudentProfile({
        name: user.fullName,
        schoolName: user.schoolName || effectiveSchoolName,
        selectedClass: (user.classLevel as ClassLevel) || 'Class 10',
        preferredLanguage: 'English',
      });

      // Redirect to student dashboard
      onNavigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create student account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="student-signup-page" className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-300 text-xs font-bold mb-3 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Telangana State Board (SCERT)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create Your Student Account
          </h1>
          <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
            Join RDS SMART LEARN for AI-powered chapter tutoring, MCQ practice tests, and written answer evaluation.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#0b1329] border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 backdrop-blur-xl">
          {error && (
            <div
              id="signup-error-box"
              className="mb-6 p-4 bg-rose-950/50 border border-rose-500/40 rounded-xl flex items-start gap-3 text-rose-200 text-sm animate-in fade-in"
            >
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Full Name <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-fullname-input"
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full bg-[#060c1c] border border-slate-700 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>
            </div>

            {/* School Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Select Your School <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  id="signup-school-select"
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="w-full bg-[#060c1c] border border-slate-700 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all cursor-pointer"
                >
                  {publicSchools.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#0b1329] text-white">
                      {s.name} ({s.schoolCode})
                    </option>
                  ))}
                  <option value="other" className="bg-[#0b1329] text-cyan-300 font-bold">
                    + Other / Custom School
                  </option>
                </select>
              </div>

              {(selectedSchoolId === 'other' || publicSchools.length === 0) && (
                <div className="relative mt-2">
                  <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-custom-school-input"
                    type="text"
                    required
                    placeholder="Enter your school name and city..."
                    value={customSchoolName}
                    onChange={(e) => setCustomSchoolName(e.target.value)}
                    className="w-full bg-[#060c1c] border border-slate-700 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Class Selection & Mobile Number (2 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Class Level */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Class / Grade <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    id="signup-class-select"
                    value={formData.classLevel}
                    onChange={(e) => handleChange('classLevel', e.target.value)}
                    className="w-full bg-[#060c1c] border border-slate-700 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all cursor-pointer"
                  >
                    {TELANGANA_CLASSES.map((cls) => (
                      <option key={cls} value={cls} className="bg-[#0b1329] text-white">
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Mobile Number <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-mobile-input"
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={formData.mobileNumber}
                    onChange={(e) => handleChange('mobileNumber', e.target.value)}
                    className="w-full bg-[#060c1c] border border-slate-700 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-email-input"
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full bg-[#060c1c] border border-slate-700 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>
            </div>

            {/* Password & Confirm Password (2 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Password <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="w-full bg-[#060c1c] border border-slate-700 focus:border-cyan-400 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Confirm Password <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-confirm-password-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="w-full bg-[#060c1c] border border-slate-700 focus:border-cyan-400 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Optional Reference Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span>Reference Name</span>
                <span className="text-[10px] text-slate-400 lowercase font-normal">(optional teacher or friend name)</span>
              </label>
              <input
                id="signup-reference-input"
                type="text"
                placeholder="e.g. Mr. Srinivas (Maths Teacher)"
                value={formData.referenceName}
                onChange={(e) => handleChange('referenceName', e.target.value)}
                className="w-full bg-[#060c1c] border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                id="signup-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-900/40 hover:shadow-cyan-900/60 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Your Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Free Student Account</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-300">
              Already have an account?{' '}
              <button
                id="signup-to-login-btn"
                type="button"
                onClick={() => onNavigate('/login')}
                className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
              >
                Sign In here
              </button>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted passwords & secure student privacy by Rishi Digital Solutions</span>
        </div>
      </div>
    </div>
  );
};
