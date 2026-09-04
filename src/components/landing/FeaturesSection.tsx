import React from 'react';
import { 
  Bot, 
  BookOpen, 
  CheckSquare, 
  PenTool, 
  BarChart3, 
  Target,
  Sparkles,
  Zap,
  Clock
} from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      id: 'feature-rds-ai',
      title: 'Learn with RDS AI',
      emoji: '🤖',
      description: 'Ask any question from your Telangana syllabus chapter and get crystal-clear, step-by-step explanations in conversational language.',
      badge: 'Core Intelligence',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: Bot,
      iconGrad: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'feature-topic-learning',
      title: 'Topic-Based Learning',
      emoji: '📚',
      description: 'No overwhelming textbooks. Every chapter is broken down into structured, micro-topics that students can finish in 15–30 minutes.',
      badge: 'SCERT Aligned',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      icon: BookOpen,
      iconGrad: 'from-blue-500 to-indigo-500',
    },
    {
      id: 'feature-mcq-practice',
      title: 'Smart MCQ Practice',
      emoji: '📝',
      description: 'Test your understanding with instant, topic-wise multiple choice questions with detailed explanation for every option.',
      badge: 'Phase 2 Preview',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: CheckSquare,
      iconGrad: 'from-indigo-500 to-purple-500',
      isComingSoon: true,
    },
    {
      id: 'feature-written-practice',
      title: 'Written Answer Practice',
      emoji: '✍️',
      description: 'Practice 2-mark, 4-mark, and 8-mark board exam questions with AI rubric evaluation and formatting guidance.',
      badge: 'Phase 2 Preview',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: PenTool,
      iconGrad: 'from-purple-500 to-pink-500',
      isComingSoon: true,
    },
    {
      id: 'feature-track-progress',
      title: 'Track Your Progress',
      emoji: '📊',
      description: 'See your completed topics, time spent, mastery scores, and strengths across all subjects in your personalized dashboard.',
      badge: 'Analytics',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: BarChart3,
      iconGrad: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'feature-learn-mistakes',
      title: 'Learn From Mistakes',
      emoji: '🎯',
      description: 'Targeted revision loops that identify concepts where you struggle and generate tailored refresher explanations.',
      badge: 'Smart Revision',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: Target,
      iconGrad: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <section
      id="features-section"
      className="py-20 bg-[#060a17] relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0d162d] border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Empowering Every Student
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Key Features of RDS SMART LEARN
          </h2>
          <p className="text-base text-slate-400">
            A comprehensive, student-friendly platform combining the syllabus rigor of Telangana SCERT with modern AI learning workflows.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                id={feat.id}
                className="group relative bg-[#0a1022] hover:bg-[#0e162f] border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/50 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.iconGrad} p-0.5 shadow-md flex items-center justify-center text-xl`}>
                      <span className="group-hover:scale-110 transition-transform">
                        {feat.emoji}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${feat.badgeColor}`}>
                      {feat.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                {/* Footer status / meta */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  {feat.isComingSoon ? (
                    <span className="flex items-center gap-1.5 text-purple-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      Preview Mode in Phase 1
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      Foundation Active
                    </span>
                  )}
                  <span className="text-[11px] text-slate-500 font-mono">SCERT TS</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
