import React from 'react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Award,
  AlertTriangle,
  FileText,
  BarChart3,
  Building,
  ShieldCheck,
  Bot,
  UserCheck,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  HelpCircle,
  FolderTree,
  PenTool,
  CheckSquare,
  Layers,
} from 'lucide-react';

interface AppSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  activeSection?: string;
  onSelectSection?: (sectionId: string) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentPath,
  onNavigate,
  isMobileOpen = false,
  onCloseMobile,
  activeSection = 'dashboard',
  onSelectSection,
}) => {
  const { user, role, logout } = useAuth();
  const { selectedClass } = useStudent();

  const handleLogout = async () => {
    if (onCloseMobile) onCloseMobile();
    await logout();
    onNavigate('/login');
  };

  const handleNavClick = (path: string, sectionId?: string) => {
    if (onCloseMobile) onCloseMobile();
    if (sectionId && onSelectSection) {
      onSelectSection(sectionId);
    }
    onNavigate(path);
  };

  // Define navigation by role
  const getNavItems = () => {
    if (role === 'teacher') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/teacher' },
        { id: 'classes', label: 'My Classes', icon: BookOpen, path: '/teacher/classes' },
        { id: 'students', label: 'Students', icon: Users, path: '/teacher/students' },
        { id: 'assessments', label: 'Assessments', icon: CheckSquare, path: '/teacher/assessments' },
        { id: 'assignments', label: 'Assignments', icon: FileText, path: '/teacher/assignments' },
        { id: 'learning-gaps', label: 'Learning Gaps', icon: AlertTriangle, path: '/teacher/learning-gaps' },
        { id: 'insights', label: 'Insights', icon: Sparkles, path: '/teacher/insights' },
      ];
    }

    if (role === 'principal') {
      return [
        { id: 'overview', label: 'School Overview', icon: Building, path: '/principal' },
        { id: 'classes', label: 'Classes', icon: Layers, path: '/principal' },
        { id: 'teachers', label: 'Teachers', icon: GraduationCap, path: '/principal' },
        { id: 'students', label: 'Students', icon: Users, path: '/principal' },
        { id: 'analytics', label: 'Performance Analytics', icon: BarChart3, path: '/principal' },
        { id: 'support', label: 'Learning Gaps', icon: AlertTriangle, path: '/principal' },
      ];
    }

    if (role === 'company_admin') {
      return [
        { id: 'overview', label: 'Platform Overview', icon: ShieldCheck, path: '/admin' },
        { id: 'schools', label: 'Schools', icon: Building, path: '/admin' },
        { id: 'users', label: 'Users', icon: Users, path: '/admin' },
        { id: 'assignments', label: 'Teacher Assignments', icon: GraduationCap, path: '/admin' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/admin' },
      ];
    }

    // Default: Student navigation
    return [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { id: 'learn', label: 'Learn', icon: BookOpen, path: '/subjects' },
      { id: 'practice', label: 'Practice', icon: PenTool, path: '/learn' },
      { id: 'assessments', label: 'Assessments', icon: CheckSquare, path: '/dashboard' },
      { id: 'assignments', label: 'Assignments', icon: FileText, path: '/assignments' },
      { id: 'progress', label: 'Progress & Analytics', icon: BarChart3, path: '/progress' },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#172033] border-r border-[#222e47] text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header - single consistent brand logo */}
        <div
          onClick={() =>
            handleNavClick(
              role === 'teacher'
                ? '/teacher'
                : role === 'principal'
                ? '/principal'
                : role === 'company_admin'
                ? '/admin'
                : '/dashboard'
            )
          }
          className="h-16 px-5 cursor-pointer flex items-center border-b border-[#222e47]"
        >
          <Logo size="sm" />
        </div>

        {/* Role & Context Indicator */}
        <div className="px-4 py-3 bg-[#131b2c] border-b border-[#222e47]/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              {role ? role.replace('_', ' ') : 'Student Portal'}
            </span>
          </div>
          {selectedClass && (
            <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              {selectedClass}
            </span>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isPathActive = currentPath === item.path;
            const isSectionActive = activeSection === item.id;
            const isActive =
              (currentPath === item.path && (!activeSection || isSectionActive)) ||
              (currentPath === '/teacher' && isSectionActive) ||
              (currentPath === '/principal' && isSectionActive) ||
              (currentPath === '/admin' && isSectionActive);

            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => handleNavClick(item.path, item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1c263d]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section: Profile, Settings, Logout */}
        <div className="p-3 border-t border-[#222e47] bg-[#131b2c]/90 space-y-2">
          <div className="grid grid-cols-2 gap-1 px-1">
            <button
              onClick={() => handleNavClick('/profile')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-[#1c263d] transition-colors ${
                currentPath === '/profile' ? 'bg-[#1c263d] text-blue-400' : ''
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => {
                if (role === 'teacher') handleNavClick('/teacher', 'classes');
                else if (role === 'principal') handleNavClick('/principal', 'classes');
                else if (role === 'company_admin') handleNavClick('/admin', 'settings');
                else handleNavClick('/profile');
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-[#1c263d] transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#172033] border border-[#243048]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 font-bold text-xs shrink-0">
                {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.fullName || 'Active Learner'}
                </p>
                <p className="text-[10px] text-slate-400 truncate leading-tight capitalize">
                  {role ? role.replace('_', ' ') : 'Student'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
