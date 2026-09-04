import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, 
  Trash2, 
  Type, 
  Clock, 
  Sparkles, 
  Maximize2, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface AnswerEditorProps {
  questionId: string;
  initialAnswer: string;
  maxMarks: number;
  onAnswerChange: (text: string) => void;
}

export const AnswerEditor: React.FC<AnswerEditorProps> = ({
  questionId,
  initialAnswer,
  maxMarks,
  onAnswerChange,
}) => {
  const [text, setText] = useState<string>(initialAnswer || '');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<any>(null);

  // Sync internal state if question changes
  useEffect(() => {
    setText(initialAnswer || '');
    setSaveStatus('saved');
  }, [questionId, initialAnswer]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setText(newVal);
    setSaveStatus('saving');

    // Debounce save update to parent/storage
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      onAnswerChange(newVal);
      setSaveStatus('saved');
    }, 300);
  };

  const handleClear = () => {
    if (!text.trim()) return;
    if (window.confirm('Are you sure you want to clear your written answer for this question?')) {
      setText('');
      onAnswerChange('');
      setSaveStatus('saved');
      textareaRef.current?.focus();
    }
  };

  // Stats calculation
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = text.length;

  const minSuggestedWords = maxMarks <= 4 ? 20 : 50;

  return (
    <div id={`answer-editor-${questionId}`} className="bg-[#090f23] border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-lg flex flex-col justify-between">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Your Written Answer</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Save Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs">
            {saveStatus === 'saving' ? (
              <span className="text-amber-400 flex items-center gap-1 font-mono text-[11px]">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></div>
                Saving...
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                <Check className="w-3.5 h-3.5" />
                ✓ Saved automatically
              </span>
            )}
          </div>

          {/* Clear button */}
          {text.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg bg-[#060a17] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors text-xs flex items-center gap-1"
              title="Clear Answer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative flex-1">
        <textarea
          id={`answer-textarea-${questionId}`}
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          placeholder="Write your answer here in your own words. Explain key definitions, steps, laws, or formulas clearly..."
          rows={10}
          className="w-full bg-[#050814] border border-slate-800 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-slate-100 placeholder-slate-500 outline-none resize-y transition-all leading-relaxed font-sans"
        />
      </div>

      {/* Footer Stats & Hints */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2 text-xs">
        {/* Word count & characters */}
        <div className="flex items-center gap-3 font-mono text-slate-400 text-[11px]">
          <span className="bg-[#060a17] px-2.5 py-1 rounded-lg border border-slate-800">
            Words: <strong className="text-slate-200">{wordCount}</strong>
          </span>
          <span className="bg-[#060a17] px-2.5 py-1 rounded-lg border border-slate-800">
            Characters: <strong className="text-slate-200">{charCount}</strong>
          </span>
        </div>

        {/* Word suggestions based on marks */}
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          {wordCount === 0 ? (
            <span className="text-slate-500">Unanswered</span>
          ) : wordCount < minSuggestedWords ? (
            <span className="text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Suggested ~{minSuggestedWords}+ words for {maxMarks} marks
            </span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Good answer length
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
