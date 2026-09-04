import React from 'react';
import { GraduationCap, BookOpen, Layers, Sparkles, ArrowRight } from 'lucide-react';

interface HowItWorksSectionProps {
  onStartLearning: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onStartLearning }) => {
  const steps = [
    {
      stepNumber: '01',
      title: 'Select Your Class',
      description: 'Choose your standard from Class 6 to Class 10 customized specifically to the Telangana State Board curriculum.',
      icon: GraduationCap,
      color: 'from-cyan-500 to-blue-500',
      badge: 'Classes 6 - 10',
    },
    {
      stepNumber: '02',
      title: 'Choose Subject',
      description: 'Select from Mathematics, Physical Science, Biological Science, Social Studies, English, Telugu, and more.',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-500',
      badge: 'All Core Subjects',
    },
    {
      stepNumber: '03',
      title: 'Pick Chapter and Topic',
      description: 'Navigate through structured chapters and select the exact bite-sized sub-topic you want to master today.',
      icon: Layers,
      color: 'from-indigo-500 to-purple-500',
      badge: 'Topic-Based Flow',
    },
    {
      stepNumber: '04',
      title: 'Learn and Practice',
      description: 'Ask RDS AI questions, read step-by-step explanations, and prepare for exams through smart MCQs and written answer tests.',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      badge: 'AI-Powered Actions',
    },
  ];

  return (
    <section
      id="how-it-works-section"
      className="py-20 bg-[#070c1b] border-t border-b border-slate-800/80 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            Simple 4-Step Pathway
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How It Works
          </h2>
          <p className="text-base text-slate-400">
            A frictionless, structured learning journey built for Telangana students to study chapter-by-chapter and topic-by-topic.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.stepNumber}
                id={`how-it-works-step-${index + 1}`}
                className="group relative bg-gradient-to-b from-[#0e162d] to-[#0a1020] border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/40 flex flex-col justify-between"
              >
                {/* Step Top Bar */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-slate-700 group-hover:text-cyan-400 transition-colors font-mono">
                    {step.stepNumber}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {step.badge}
                  </span>
                </div>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} p-0.5 mb-4 shadow-md`}>
                  <div className="w-full h-full bg-[#090e1f] rounded-[10px] flex items-center justify-center">
                    <Icon className="w-6 h-6 text-cyan-300 group-hover:scale-110 transition-transform" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2 mb-4 flex-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-200 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Step connector on desktop */}
                {index < 3 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-6 h-6 rounded-full bg-[#0d1730] border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA within How It Works */}
        <div className="mt-12 text-center">
          <button
            onClick={onStartLearning}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0e172d] hover:bg-[#152345] text-cyan-300 border border-cyan-500/30 font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Ready to start? Select your class now</span>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>
    </section>
  );
};
