import React, { useState } from 'react';
import { Logo } from './Logo';
import { useStudent } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import { TELANGANA_CLASSES } from '../../data/syllabusData';
import { ClassLevel } from '../../types';
import { 
  GraduationCap, 
  Sparkles, 
  Menu, 
  X, 
  Layers, 
  UserCheck,
  ChevronDown,
  LogIn,
  UserPlus,
  User,
  ShieldCheck,
  LogOut,
  UserCog,
  Building,
  Lock
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { student, selectedClass, updateClass } = useStudent();
  const { user, isAuthenticated, role, logout } = useAuth();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleClassSelect = (cls: ClassLevel) => {
    updateClass(cls);
    setIsClassDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
    onNavigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    ...(isAuthenticated ? [
      { label: 'Syllabus', path: '/dashboard' },
      { label: 'Analytics', path: '/progress' },
      { label: 'Subjects', path: '/subjects' },
      ...(role === 'company_admin' ? [{ label: 'Admin', path: '/admin' }] : []),
      ...(role === 'teacher' ? [{ label: 'Teacher Portal', path: '/teacher' }] : []),
      ...(role === 'principal' ? [{ label: 'Principal Portal', path: '/principal' }] : []),
    ] : []),
  ];

  return (
    <header
      id="rds-app-header"
      className="sticky top-0 z-50 w-full bg-[#070b19]/90 backdrop-blur-md border-b border-cyan-500/20 transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Logo
          size="md"
          onClick={() => onNavigate('/')}
        />

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0d1527]/80 border border-slate-800 rounded-full px-3 py-1.5 shadow-inner">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onNavigate(link.path)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Class Switcher & Auth Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Class Switcher Dropdown */}
          <div className="relative">
            <button
              id="class-selector-btn"
              onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#0e172d] hover:bg-[#152244] border border-cyan-500/30 hover:border-cyan-400 rounded-lg text-xs font-semibold text-cyan-200 transition-all shadow-sm"
              title="Switch Telangana State Class Level"
            >
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>{selectedClass}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isClassDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isClassDropdownOpen && (
              <div
                id="class-selector-dropdown"
                className="absolute right-0 mt-2 w-44 bg-[#090f20] border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-950/80 py-1.5 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Select Telangana Class
                </div>
                {TELANGANA_CLASSES.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => handleClassSelect(cls)}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between transition-colors ${
                      selectedClass === cls
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border-l-2 border-cyan-400'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <span>{cls}</span>
                    {selectedClass === cls && (
                      <span className="text-[10px] bg-cyan-500/30 text-cyan-200 px-1.5 py-0.5 rounded font-bold">Active</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Authenticated User Menu or Sign In / Sign Up CTAs */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2.5 bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-500/30 hover:border-cyan-400/60 rounded-xl px-3 py-1.5 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight max-w-[100px] truncate">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] text-cyan-400 capitalize font-medium leading-tight">
                    {role ? role.replace('_', ' ') : 'Student'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white" />
              </button>

              {isUserDropdownOpen && (
                <div
                  id="user-profile-dropdown"
                  className="absolute right-0 mt-2 w-56 bg-[#090f20] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/90 py-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-4 py-2.5 border-b border-slate-800">
                    <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {role ? role.replace('_', ' ') : 'Student'}
                      </span>
                      <span className="text-[10px] text-slate-400">{user.schoolName || 'TS Board'}</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onNavigate('/dashboard');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2"
                    >
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span>Syllabus Dashboard</span>
                    </button>

                    {role === 'company_admin' && (
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          onNavigate('/admin');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-amber-300 hover:text-white hover:bg-amber-950/40 flex items-center gap-2"
                      >
                        <UserCog className="w-4 h-4 text-amber-400" />
                        <span>Admin Management Panel</span>
                      </button>
                    )}

                    {role === 'teacher' && (
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          onNavigate('/teacher');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-indigo-300 hover:text-white hover:bg-indigo-950/40 flex items-center gap-2"
                      >
                        <GraduationCap className="w-4 h-4 text-indigo-400" />
                        <span>Teacher Portal</span>
                      </button>
                    )}

                    {role === 'principal' && (
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          onNavigate('/principal');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-emerald-300 hover:text-white hover:bg-emerald-950/40 flex items-center gap-2"
                      >
                        <Building className="w-4 h-4 text-emerald-400" />
                        <span>Principal Portal</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onNavigate('/profile');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-cyan-400" />
                      <span>Profile & Security</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      id="navbar-logout-btn"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="nav-login-btn"
                onClick={() => onNavigate('/login')}
                className="px-3.5 py-1.5 bg-[#0e172d] hover:bg-[#152244] border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                id="nav-signup-btn"
                onClick={() => onNavigate('/signup')}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-xs font-bold tracking-wide transition-all shadow-md shadow-cyan-900/40 active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            id="mobile-class-btn"
            onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
            className="px-2.5 py-1 bg-[#0e172d] border border-cyan-500/30 rounded-md text-[11px] font-bold text-cyan-300"
          >
            {selectedClass}
          </button>
          <button
            id="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="md:hidden bg-[#090f20]/95 border-b border-cyan-500/20 px-4 pt-3 pb-6 space-y-3 backdrop-blur-xl animate-in slide-in-from-top-3 duration-200"
        >
          {/* User Status on Mobile */}
          {isAuthenticated && user ? (
            <div className="p-3 bg-[#0d162d] rounded-xl border border-cyan-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{user.fullName}</div>
                  <div className="text-xs text-cyan-300 capitalize">{role ? role.replace('_', ' ') : 'Student'} • {user.schoolName || selectedClass}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-rose-400 hover:bg-rose-950/50 rounded-lg text-xs"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('/login');
                }}
                className="py-2.5 bg-[#0e172d] border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('/signup');
                }}
                className="py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {/* Navigation Items */}
          <div className="space-y-1 pt-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate(link.path);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
                  currentPath === link.path
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>{link.label}</span>
              </button>
            ))}

            {isAuthenticated && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('/profile');
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-800/60 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-cyan-400" />
                <span>My Profile & Settings</span>
              </button>
            )}
          </div>

          {/* Class Selection section in Mobile */}
          <div className="pt-2 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-400 mb-2 px-1">Switch Telangana Class:</div>
            <div className="grid grid-cols-3 gap-1.5">
              {TELANGANA_CLASSES.map((cls) => (
                <button
                  key={cls}
                  onClick={() => handleClassSelect(cls)}
                  className={`py-1.5 px-2 rounded text-xs font-medium text-center border transition-all ${
                    selectedClass === cls
                      ? 'bg-cyan-500 text-white border-cyan-400 font-bold shadow-md shadow-cyan-900/50'
                      : 'bg-[#0d1428] text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
