import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import { TELANGANA_CLASSES } from '../../data/syllabusData';
import { ClassLevel } from '../../types';
import {
  Menu,
  GraduationCap,
  ChevronDown,
  LogOut,
  User,
  ShieldCheck,
  Building,
  Sparkles,
  Layers,
  BookOpen,
  CheckCircle2,
  Bell,
} from 'lucide-react';

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
  onNavigate: (path: string) => void;
  title?: string;
  subtitle?: string;
  isDemoData?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onToggleSidebar,
  onNavigate,
  title,
  subtitle,
  isDemoData = false,
}) => {
  const { user, role, logout } = useAuth();
  const { selectedClass, updateClass } = useStudent();
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);

  const handleClassSelect = (cls: ClassLevel) => {
    updateClass(cls);
    setIsClassDropdownOpen(false);
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
    onNavigate('/');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile Toggle & Page Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title && (
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {title}
              </h1>
              {user?.schoolName && (
                <span className="hidden xl:inline-flex text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {user.schoolName}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right: Demo Badge, Notifications, Class Switcher & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Visible Demo Environment Badge */}
        {isDemoData && (
          <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/90 text-amber-800 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Demonstration Environment — Sample Academic Records</span>
          </div>
        )}

        {/* Notifications Icon */}
        <button
          onClick={() => setHasNotifications(false)}
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {hasNotifications && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          )}
        </button>

        {/* Telangana Class Selector */}
        <div className="relative">
          <button
            onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors shadow-2xs"
            title="Select Telangana Class"
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span>{selectedClass}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isClassDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                SCERT Class
              </div>
              {TELANGANA_CLASSES.map((cls) => (
                <button
                  key={cls}
                  onClick={() => handleClassSelect(cls)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between hover:bg-slate-50 ${
                    selectedClass === cls ? 'text-blue-600 bg-blue-50/60 font-bold' : 'text-slate-700'
                  }`}
                >
                  <span>{cls}</span>
                  {selectedClass === cls && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
                  {user.fullName}
                </p>
                <p className="text-[10px] text-slate-500 font-medium leading-none capitalize mt-0.5">
                  {role ? role.replace('_', ' ') : 'Student'}
                </p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  {user.schoolName && (
                    <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                      {user.schoolName}
                    </p>
                  )}
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-100 uppercase">
                    {role ? role.replace('_', ' ') : 'Student'}
                  </span>
                </div>

                <div className="py-1 text-xs">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('/dashboard');
                    }}
                    className="w-full text-left px-3.5 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Student Portal</span>
                  </button>

                  {role === 'teacher' && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('/teacher');
                      }}
                      className="w-full text-left px-3.5 py-1.5 text-blue-700 hover:bg-blue-50 font-semibold flex items-center gap-2"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                      <span>Teacher Dashboard</span>
                    </button>
                  )}

                  {role === 'principal' && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('/principal');
                      }}
                      className="w-full text-left px-3.5 py-1.5 text-emerald-700 hover:bg-emerald-50 font-semibold flex items-center gap-2"
                    >
                      <Building className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Principal Portal</span>
                    </button>
                  )}

                  {role === 'company_admin' && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('/admin');
                      }}
                      className="w-full text-left px-3.5 py-1.5 text-amber-700 hover:bg-amber-50 font-semibold flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Admin Portal</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('/profile');
                    }}
                    className="w-full text-left px-3.5 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>My Profile</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3.5 py-1.5 text-rose-600 hover:bg-rose-50 font-semibold text-xs flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => onNavigate('/login')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
