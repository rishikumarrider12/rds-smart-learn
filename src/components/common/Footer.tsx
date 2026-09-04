import React from 'react';
import { Logo } from './Logo';
import { 
  Code2, 
  Palette, 
  Video, 
  TrendingUp, 
  Bot, 
  BookOpen, 
  ShieldCheck, 
  Sparkles,
  Heart
} from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const parentServices = [
    { name: 'Web Development', icon: Code2 },
    { name: 'Design', icon: Palette },
    { name: 'Video & Editing', icon: Video },
    { name: 'Digital Marketing', icon: TrendingUp },
    { name: 'AI Solutions', icon: Bot },
  ];

  return (
    <footer
      id="rds-app-footer"
      className="w-full bg-[#050814] border-t border-slate-800/80 text-slate-400 text-sm mt-auto"
    >
      {/* Top Banner: Parent Brand Rishi Digital Solutions */}
      <div className="border-b border-slate-800/50 bg-[#070b19]/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">
                Parent Company
              </div>
              <div className="text-lg font-black text-white tracking-wide flex items-center justify-center md:justify-start gap-2">
                <span>RISHI DIGITAL SOLUTIONS</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                  INNOVATION
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-1 tracking-wider">
                WE CREATE &bull; WE DESIGN &bull; WE DELIVER
              </div>
            </div>

            {/* Parent services pill icons */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {parentServices.map((service) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.name}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0c1326] border border-slate-800 text-[11px] font-medium text-slate-300 hover:border-cyan-500/40 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{service.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" onClick={() => onNavigate('/')} />
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              <strong className="text-slate-200">RDS SMART LEARN</strong> is an AI-powered smart learning ecosystem meticulously engineered for school students studying <strong className="text-cyan-300">Classes 6 to 10 under the Telangana State (SCERT) syllabus</strong>.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="inline-flex items-center gap-1 text-cyan-400">
                <Sparkles className="w-3.5 h-3.5" />
                Learn Smarter
              </span>
              <span>&bull;</span>
              <span className="inline-flex items-center gap-1 text-blue-400">
                <BookOpen className="w-3.5 h-3.5" />
                Practice Better
              </span>
              <span>&bull;</span>
              <span className="inline-flex items-center gap-1 text-purple-400">
                <TrendingUp className="w-3.5 h-3.5" />
                Improve Every Day
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Application Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  className="hover:text-cyan-300 transition-colors"
                >
                  Landing Page
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/onboarding')}
                  className="hover:text-cyan-300 transition-colors"
                >
                  Student Onboarding
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/dashboard')}
                  className="hover:text-cyan-300 transition-colors"
                >
                  Student Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/subjects')}
                  className="hover:text-cyan-300 transition-colors"
                >
                  Telangana State Subjects
                </button>
              </li>
            </ul>
          </div>

          {/* Telangana Board Syllabus Scope */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Telangana State Board
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Designed according to the SCERT Telangana syllabus structure across Mathematics, Physical & Biological Sciences, Social Studies, English, and First Languages.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map((cls) => (
                <span
                  key={cls}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                >
                  {cls}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>&copy; {currentYear} RDS SMART LEARN. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>A Product by</span>
            <strong className="text-slate-200">Rishi Digital Solutions</strong>
            <span className="text-cyan-400 mx-1">&bull;</span>
            <span className="text-slate-400">Phase 1 Foundation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
