import React, { useState } from 'react';
import { useStudent } from '../../context/StudentContext';
import { TELANGANA_CLASSES } from '../../data/syllabusData';
import { ClassLevel, StudentProfile } from '../../types';
import { 
  GraduationCap, 
  User, 
  School, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Logo } from '../common/Logo';

interface OnboardingFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ onSuccess, onCancel }) => {
  const { student, saveStudentProfile } = useStudent();

  const [name, setName] = useState(student?.name || '');
  const [schoolName, setSchoolName] = useState(student?.schoolName || '');
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(student?.selectedClass || 'Class 10');

  const [errors, setErrors] = useState<{ name?: string; schoolName?: string; class?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: { name?: string; schoolName?: string; class?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Please enter your full name.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long.';
    }

    if (!schoolName.trim()) {
      newErrors.schoolName = 'Please enter your school or institute name.';
    } else if (schoolName.trim().length < 3) {
      newErrors.schoolName = 'School name must be at least 3 characters.';
    }

    if (!selectedClass) {
      newErrors.class = 'Please select your class standard.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const profileData: StudentProfile = {
      name: name.trim(),
      schoolName: schoolName.trim(),
      selectedClass: selectedClass,
    };

    // Save profile to context (persisted via localStorage, ready for DB hookup in later phase)
    saveStudentProfile(profileData);

    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 400);
  };

  return (
    <div
      id="student-onboarding-container"
      className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-[#070b19] via-[#0a1126] to-[#070b19]"
    >
      <div className="w-full max-w-xl">
        {/* Main Card */}
        <div className="bg-[#090f22]/95 border border-cyan-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-cyan-950/80 backdrop-blur-xl relative overflow-hidden">
          {/* Top Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <Logo size="md" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <span>Welcome to RDS SMART LEARN</span>
              <span className="text-2xl">👋</span>
            </h1>
            <p className="text-sm text-slate-300 mt-2 font-medium">
              Let's personalize your learning experience.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Student Name */}
            <div className="space-y-2">
              <label
                htmlFor="student-name-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Student Name <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4 text-cyan-400" />
                </div>
                <input
                  id="student-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full pl-10 pr-4 py-3 bg-[#060a17] border rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none transition-all ${
                    errors.name
                      ? 'border-rose-500/80 focus:ring-2 focus:ring-rose-500/30'
                      : 'border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20'
                  }`}
                />
              </div>
              {errors.name && (
                <p id="student-name-error" className="flex items-center gap-1.5 text-xs text-rose-400 font-medium mt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* School Name */}
            <div className="space-y-2">
              <label
                htmlFor="school-name-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                School Name <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <School className="w-4 h-4 text-blue-400" />
                </div>
                <input
                  id="school-name-input"
                  type="text"
                  value={schoolName}
                  onChange={(e) => {
                    setSchoolName(e.target.value);
                    if (errors.schoolName) setErrors((prev) => ({ ...prev, schoolName: undefined }));
                  }}
                  placeholder="e.g. Telangana Model School / ZPHS Hyderabad"
                  className={`w-full pl-10 pr-4 py-3 bg-[#060a17] border rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none transition-all ${
                    errors.schoolName
                      ? 'border-rose-500/80 focus:ring-2 focus:ring-rose-500/30'
                      : 'border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20'
                  }`}
                />
              </div>
              {errors.schoolName && (
                <p id="school-name-error" className="flex items-center gap-1.5 text-xs text-rose-400 font-medium mt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.schoolName}</span>
                </p>
              )}
            </div>

            {/* Class Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Select Class <span className="text-cyan-400">*</span>
                </label>
                <span className="text-[11px] text-cyan-400 font-medium">
                  Telangana SCERT Syllabus
                </span>
              </div>

              <div id="class-options-grid" className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {TELANGANA_CLASSES.map((cls) => {
                  const isSelected = selectedClass === cls;
                  return (
                    <button
                      key={cls}
                      id={`class-option-${cls.toLowerCase().replace(' ', '-')}`}
                      type="button"
                      onClick={() => {
                        setSelectedClass(cls);
                        if (errors.class) setErrors((prev) => ({ ...prev, class: undefined }));
                      }}
                      className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all border ${
                        isSelected
                          ? 'bg-gradient-to-b from-cyan-500 to-blue-600 border-cyan-300 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-102'
                          : 'bg-[#060a17] hover:bg-[#0f1730] border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      <GraduationCap className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-cyan-400'}`} />
                      <span>{cls}</span>
                    </button>
                  );
                })}
              </div>
              {errors.class && (
                <p className="flex items-center gap-1.5 text-xs text-rose-400 font-medium mt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.class}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="submit-onboarding-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] active:scale-98 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Setting Up Learning Profile...</span>
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-200" />
                    <span>Enter Student Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-cyan-200" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Profile stored locally for Phase 1. Ready for real-time cloud synchronization.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
