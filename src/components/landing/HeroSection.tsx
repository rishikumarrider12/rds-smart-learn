import React from 'react';
import { Sparkles, ArrowRight, BookOpen, Layers, Bot, Award, CheckCircle2 } from 'lucide-react';
import { ClassLevel } from '../../types';
import { TELANGANA_CLASSES } from '../../data/syllabusData';

interface HeroSectionProps {
  onStartLearning: () => void;
  onExploreFeatures: () => void;
  onQuickSelectClass?: (cls: ClassLevel) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartLearning,
  onExploreFeatures,
  onQuickSelectClass,
}) => {
  return (
    <section
      id="rds-hero-section"
      className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-[#070b19] via-[#091124] to-[#070b19]"
    >
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/20 via-blue-600/15 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d162d] border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-cyan-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
              <span>Telangana State Syllabus &bull; Classes 6 to 10</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                RDS <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">SMART LEARN</span>
              </h1>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-200 tracking-tight">
                AI-Powered Smart Learning for Students
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Learn according to your <strong className="text-cyan-300 font-semibold">class, subject, chapter, and topic</strong> with the help of RDS AI. Designed for Telangana State board students to understand concepts deeply and practice with precision.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                id="hero-start-learning-btn"
                onClick={onStartLearning}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold text-base tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] active:scale-98"
              >
                <Sparkles className="w-5 h-5 text-cyan-200" />
                <span>Start Learning</span>
                <ArrowRight className="w-5 h-5 text-cyan-200" />
              </button>

              <button
                id="hero-explore-features-btn"
                onClick={onExploreFeatures}
                className="w-full sm:w-auto px-7 py-4 bg-[#0d162d] hover:bg-[#152345] text-slate-200 hover:text-white border border-slate-700 hover:border-cyan-500/50 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Explore Features</span>
              </button>
            </div>

            {/* Quick Class Selector Bar */}
            <div className="pt-4">
              <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Select Your Class to Explore:
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {TELANGANA_CLASSES.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => {
                      if (onQuickSelectClass) onQuickSelectClass(cls);
                      onStartLearning();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#0e172d]/80 hover:bg-cyan-950/60 border border-cyan-500/20 hover:border-cyan-400 text-xs font-bold text-slate-300 hover:text-cyan-300 transition-all shadow-sm"
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Key trust indicators */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Telangana SCERT Syllabus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Structured Topic-Wise Flow</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Rishi Digital Solutions</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Mockup / Feature Showcase */}
          <div className="lg:col-span-5 relative">
            {/* Interactive Preview Card */}
            <div className="relative mx-auto max-w-md rounded-2xl bg-gradient-to-b from-[#0e172d] to-[#080d1e] border border-cyan-500/30 p-6 shadow-2xl shadow-cyan-950/80">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">RDS Learning Engine</div>
                    <div className="text-[10px] text-cyan-400">Telangana State Syllabus</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  Class 10
                </span>
              </div>

              {/* Hierarchy Tree Visual */}
              <div className="py-4 space-y-3">
                {/* Subject Item */}
                <div className="p-2.5 rounded-lg bg-[#091024] border border-blue-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-xs font-bold text-slate-200">Subject: Mathematics</span>
                  </div>
                  <span className="text-[10px] text-slate-400">MATH-10</span>
                </div>

                {/* Chapter Item */}
                <div className="p-2.5 rounded-lg bg-[#091024] border border-cyan-500/20 flex items-center justify-between ml-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-xs font-bold text-slate-200">Ch 5: Quadratic Equations</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono">5 Topics</span>
                </div>

                {/* Topic Item */}
                <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-950/60 via-blue-950/60 to-purple-950/60 border border-cyan-400/40 ml-6 shadow-md">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                    <span className="text-xs font-extrabold text-cyan-200">Solving by Factorization</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    Splitting the middle term & finding roots
                  </p>
                </div>
              </div>

              {/* Action Buttons Teaser */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2 rounded-lg bg-[#0d1730] border border-cyan-500/20 text-center">
                  <span className="text-[11px] font-bold text-cyan-300">🤖 Ask RDS AI</span>
                </div>
                <div className="p-2 rounded-lg bg-[#0d1730] border border-blue-500/20 text-center">
                  <span className="text-[11px] font-bold text-blue-300">📚 Learn with AI</span>
                </div>
                <div className="p-2 rounded-lg bg-[#0d1730] border border-purple-500/20 text-center">
                  <span className="text-[11px] font-bold text-purple-300">📝 Smart MCQ</span>
                </div>
                <div className="p-2 rounded-lg bg-[#0d1730] border border-emerald-500/20 text-center">
                  <span className="text-[11px] font-bold text-emerald-300">✍️ Written Test</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
