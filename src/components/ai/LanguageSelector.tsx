import React from 'react';
import { Languages, Check } from 'lucide-react';
import { LearningLanguage } from '../../services/ai/aiTypes';

interface LanguageSelectorProps {
  currentLanguage: LearningLanguage;
  onSelectLanguage: (lang: LearningLanguage) => void;
  variant?: 'pills' | 'compact';
}

const LANGUAGES: { id: LearningLanguage; label: string; native: string; badge?: string }[] = [
  { id: 'English', label: 'English', native: 'English' },
  { id: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { id: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onSelectLanguage,
  variant = 'pills',
}) => {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1.5 bg-[#0a1226] border border-slate-700/80 rounded-xl p-1">
        <Languages className="w-4 h-4 text-cyan-400 ml-1.5 mr-0.5" />
        <div className="flex items-center gap-1">
          {LANGUAGES.map((lang) => {
            const isActive = currentLanguage === lang.id;
            return (
              <button
                key={lang.id}
                id={`lang-btn-${lang.id.toLowerCase()}`}
                type="button"
                onClick={() => onSelectLanguage(lang.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={`Learn in ${lang.label} (${lang.native})`}
              >
                <span>{lang.native}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <Languages className="w-4 h-4 text-cyan-400" />
        <span>Explanation Language:</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {LANGUAGES.map((lang) => {
          const isActive = currentLanguage === lang.id;
          return (
            <button
              key={lang.id}
              id={`lang-pill-${lang.id.toLowerCase()}`}
              type="button"
              onClick={() => onSelectLanguage(lang.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-400 shadow-sm shadow-cyan-950/40'
                  : 'bg-[#0a1226] text-slate-400 hover:text-slate-200 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <span>{lang.label}</span>
              <span className="text-[10px] opacity-75 font-normal">({lang.native})</span>
              {isActive && <Check className="w-3 h-3 text-cyan-400 ml-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
