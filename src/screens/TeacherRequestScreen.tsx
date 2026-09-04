import React, { useState } from 'react';
import { TELANGANA_CLASSES, ALL_SUBJECT_NAMES } from '../data/syllabusData';
import {
  Users,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  BadgeCheck,
  GraduationCap,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Clock,
  Plus,
  X,
} from 'lucide-react';

interface TeacherRequestScreenProps {
  onNavigate: (path: string) => void;
}

export const TeacherRequestScreen: React.FC<TeacherRequestScreenProps> = ({ onNavigate }) => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    employeeId: '',
    qualification: '',
    password: '',
    confirmPassword: '',
  });
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [showOtherSubject, setShowOtherSubject] = useState(false);
  const [otherSubjectName, setOtherSubjectName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const setField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const toggleFrom = (list: string[], value: string): string[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  // Count of selected subjects (predefined + optional custom "Other")
  const totalSelectedSubjects = subjects.length + (showOtherSubject && otherSubjectName.trim() ? 1 : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.fullName.trim()) return setError('Please enter your full name.');
    if (!form.email.trim()) return setError('Please enter your email address.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return setError('Please enter a valid email address.');
    if (classes.length === 0) return setError('Please select at least one class you are requesting.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters long.');
    if (form.password !== form.confirmPassword)
      return setError('Password and Confirm Password do not match.');

    // --- Subject validation ---
    // If "Other Subject" is toggled on, the custom name is required
    if (showOtherSubject && !otherSubjectName.trim()) {
      return setError('Please enter the other subject name.');
    }

    const trimmedOther = showOtherSubject ? otherSubjectName.trim() : '';

    // Duplicate check: custom subject must not match an existing curriculum subject
    // (case-insensitive) nor a predefined subject the teacher already selected
    if (trimmedOther) {
      const allExisting = [...ALL_SUBJECT_NAMES, ...subjects];
      const isDuplicate = allExisting.some(
        (s) => s.trim().toLowerCase() === trimmedOther.toLowerCase()
      );
      if (isDuplicate) {
        return setError(
          'This subject is already available in the list. Please select it from the options above instead.'
        );
      }
      if (trimmedOther.length > 100) {
        return setError('Other subject name must be 100 characters or fewer.');
      }
    }

    // At least one subject (predefined or custom) must be selected
    if (totalSelectedSubjects === 0) {
      return setError('No subject selected. Please select at least one subject.');
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/teacher-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword,
          phone: form.phone.trim() || undefined,
          employeeId: form.employeeId.trim() || undefined,
          qualification: form.qualification.trim() || undefined,
          schoolName: 'Slate High School',
          requestedClasses: classes,
          requestedSubjects: subjects,
          otherSubject: trimmedOther || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit your request.');
      setSubmitted(true);
      window.scrollTo({ top: 0 });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- SUCCESS STATE ----------
  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-lg w-full bg-white border border-[#D9E2EC] rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5 text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold text-[#0A2342] mb-2">Request Submitted</h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold mb-4">
            <Clock className="w-3.5 h-3.5" />
            Status: Pending Super Admin Approval
          </div>
          <p className="text-sm leading-relaxed mb-6">
            Your teacher account request is pending approval. A Super Admin must approve your
            request before you can access the Teacher Portal.
          </p>
          <button
            id="teacher-request-back-home-btn"
            onClick={() => onNavigate('/')}
            className="px-5 py-2.5 bg-[#1565C0] hover:bg-[#0F4C9A] text-white font-bold rounded-xl text-sm transition-colors inline-flex items-center gap-2"
          >
            <span>Back to Home</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ---------- FORM ----------
  return (
    <div id="teacher-request-page" className="flex-1 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EAF3FF] border border-blue-200 rounded-full text-[#1565C0] text-xs font-bold mb-3 uppercase tracking-wide">
            <Users className="w-3.5 h-3.5" />
            Slate High School · Staff Access
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Request a Teacher Account</h1>
          <p className="text-sm text-[#627D98] mt-2">
            Submissions are reviewed by the Super Admin. You will receive teacher access only after
            approval.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#D9E2EC] rounded-2xl p-6 sm:p-8 shadow-sm space-y-5"
        >
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs font-bold text-[#0A2342] mb-1.5 uppercase tracking-wide">Full Name *</span>
              <input type="text" required value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} placeholder="e.g. Ananya Sharma" className="w-full px-3.5 py-2.5 bg-white border border-[#D9E2EC] rounded-xl text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]" />
            </label>
            <label className="block">
              <span className="flex items-center gap-1 text-xs font-bold text-[#0A2342] mb-1.5 uppercase tracking-wide"><Mail className="w-3 h-3" /> Email *</span>
              <input type="email" required value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="you@school.edu.in" className="w-full px-3.5 py-2.5 bg-white border border-[#D9E2EC] rounded-xl text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]" />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="flex items-center gap-1 text-xs font-bold text-[#0A2342] mb-1.5 uppercase tracking-wide"><Phone className="w-3 h-3" /> Phone</span>
              <input type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="e.g. +91 98765 43210" className="w-full px-3.5 py-2.5 bg-white border border-[#D9E2EC] rounded-xl text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]" />
            </label>
            <label className="block">
              <span className="flex items-center gap-1 text-xs font-bold text-[#0A2342] mb-1.5 uppercase tracking-wide"><BadgeCheck className="w-3 h-3" /> Employee ID</span>
              <input type="text" value={form.employeeId} onChange={(e) => setField('employeeId', e.target.value)} placeholder="e.g. TCH-2024-045" className="w-full px-3.5 py-2.5 bg-white border border-[#D9E2EC] rounded-xl text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]" />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="flex items-center gap-1 text-xs font-bold text-[#0A2342] mb-1.5 uppercase tracking-wide"><GraduationCap className="w-3 h-3" /> Qualification</span>
              <input type="text" value={form.qualification} onChange={(e) => setField('qualification', e.target.value)} placeholder="e.g. B.Ed, M.Sc. Mathematics" className="w-full px-3.5 py-2.5 bg-white border border-[#D9E2EC] rounded-xl text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]" />
            </label>
            <label className="block">
              <span className="flex items-center gap-1 text-xs font-bold text-[#0A2342] mb-1.5 uppercase tracking-wide"><GraduationCap className="w-3 h-3" /> Teaching Experience</span>
              <select className="w-full px-3.5 py-2.5 bg-white border border-[#D9E2EC] rounded-xl text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]" defaultValue="">
                <option value="" disabled>Choose your experience</option>
                <option>Less than 1 year</option>
                <option>1 – 3 years</option>
                <option>3 – 5 years</option>
                <option>5 – 10 years</option>
                <option>More than 10 years</option>
              </select>
            </label>
          </div>

          <fieldset>
            <legend className="text-xs font-bold text-[#0A2342] mb-2 uppercase tracking-wide">Class(es) You Teach *</legend>
            <div className="flex flex-wrap gap-2">
              {TELANGANA_CLASSES.map((cls) => {
                const active = classes.includes(cls);
                return (
                  <button key={cls} type="button" onClick={() => setClasses(toggleFrom(classes, cls))} className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${active ? 'bg-[#1565C0] text-white border-[#1565C0]' : 'bg-white text-[#102A43] border-[#D9E2EC] hover:border-[#1565C0]'}`}>
                    {cls}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xs font-bold text-[#0A2342] mb-2 uppercase tracking-wide">Subject(s) I Teach *</legend>
            <div className="flex flex-wrap gap-2">
              {ALL_SUBJECT_NAMES.map((sub) => {
                const active = subjects.includes(sub);
                return (
                  <button key={sub} type="button" onClick={() => setSubjects(toggleFrom(subjects, sub))} className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${active ? 'bg-[#1565C0] text-white border-[#1565C0]' : 'bg-white text-[#102A43] border-[#D9E2EC] hover:border-[#1565C0]'}`}>
                    {sub}
                  </button>
                );
              })}

              {/* Other Subject — visually distinct */}
              <button
                type="button"
                onClick={() => setShowOtherSubject(!showOtherSubject)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border border-dashed transition-colors flex items-center gap-1.5 ${
                  showOtherSubject
                    ? 'bg-[#1565C0] text-white border-[#1565C0]'
                    : 'bg-white text-[#102A43] border-[#D9E2EC] hover:border-[#1565C0] hover:bg-[#F0F7FF]'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Other Subject
              </button>
            </div>
          </fieldset>

          {/* Other Subject input field */}
          {showOtherSubject && (
            <div className="pt-2">
              <label className="block text-xs font-bold text-[#0A2342] mb-1.5 uppercase tracking-wide">
                Other Subject Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={otherSubjectName}
                  onChange={(e) => setOtherSubjectName(e.target.value)}
                  placeholder="e.g. Computer Science"
                  maxLength={101}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9E2EC] rounded-xl text-sm focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
                  aria-label="Other Subject Name"
                />
                {otherSubjectName && (
                  <button
                    type="button"
                    onClick={() => setOtherSubjectName('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#627D98] hover:text-[#0A2342]"
                    aria-label="Clear other subject name"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-[#627D98] mt-1.5">
                This will be reviewed by the Super Admin. Do not use HTML or special characters.
              </p>
            </div>
          )}

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="flex items-center gap-1 text-xs font-bold text-[#0A2342] mb-1.5 uppercase tracking-wide"><Lock className="w-3 h-3" /> Password *</span>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={(e) => setField('password', e.target.value)} placeholder="Min. 8 characters" className="w-full px-3.5 py-2.5 pr-10 bg-white border border-[#D9E2EC] rounded-xl text-sm focus:outline-none focus:border-[#1565C0]" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#627D98]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-[#0A2342] mb-1.5 uppercase tracking-wide">Confirm Password *</span>
              <input type={showPassword ? 'text' : 'password'} required value={form.confirmPassword} onChange={(e) => setField('confirmPassword', e.target.value)} className="w-full px-3.5 py-2.5 bg-white border border-[#D9E2EC] rounded-xl text-sm focus:outline-none focus:border-[#1565C0]" />
            </label>
          </div>

          <button
            id="teacher-request-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#1565C0] hover:bg-[#0F4C9A] disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Request…</span>
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                <span>Submit Teacher Account Request</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-[#627D98]">
            Already approved?{' '}
            <button type="button" onClick={() => onNavigate('/login/teacher')} className="font-bold text-[#1565C0] hover:underline">Sign in here</button>
            {' · '}
            <button type="button" onClick={() => onNavigate('/')} className="font-semibold text-[#627D98] hover:text-[#0A2342]">Back to home</button>
          </p>
        </form>
      </div>
    </div>
  );
};
