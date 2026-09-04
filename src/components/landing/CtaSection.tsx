import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';
import { TELANGANA_CLASSES } from '../../data/syllabusData';
import { ClassLevel } from '../../types';

interface CtaSectionProps {
  onStartLearning: () => void;
  onQuickSelectClass?: (cls: ClassLevel) => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({
  onStartLearning,
  onQuickSelectClass,
}) => {
  return (
    <section
      id="rds-cta-section"
      className="py-20 bg-gradient-to-b from-[#060a17] via-[#0b1329] to-[#050814] relative overflow-hidden"
    >
      {/* Radiant Glow Behind CTA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-purple-600/20 blur-3xl pointer-events-none rounded-full" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-[#090f23]/90 border border-cyan-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-cyan-950/60 backdrop-blur-xl">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Learn Smarter &bull; Practice Better &bull; Improve Every Day
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Master Your Telangana Syllabus with <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">RDS AI</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Get personalized chapter breakdowns, interactive topic explanations, and targeted practice for Classes 6, 7, 8, 9, and 10.
          </p>

          {/* Big Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              id="cta-start-learning-btn"
              onClick={onStartLearning}
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-extrabold text-base tracking-wide flex items-center justify-center gap-3 transition-all shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] active:scale-98"
            >
              <GraduationCap className="w-5 h-5 text-cyan-200" />
              <span>Start Learning Now</span>
              <ArrowRight className="w-5 h-5 text-cyan-200" />
            </button>
          </div>

          {/* Direct Class Buttons */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="text-xs text-slate-400 font-semibold mb-3">
              Direct access for Telangana State students:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {TELANGANA_CLASSES.map((cls) => (
                <button
                  key={cls}
                  onClick={() => {
                    if (onQuickSelectClass) onQuickSelectClass(cls);
                    onStartLearning();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0e172f] hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-400 text-xs font-bold text-slate-300 hover:text-cyan-300 transition-all"
                >
                  {cls} Syllabus
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
