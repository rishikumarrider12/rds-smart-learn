import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, CornerDownLeft, Eraser } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  suggestedPromptChips?: string[];
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder = 'Ask RDS AI anything about this topic...',
  suggestedPromptChips = [],
  disabled = false,
}) => {
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isLoading || disabled) return;

    onSendMessage(trimmed);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChipClick = (chip: string) => {
    if (isLoading || disabled) return;
    onSendMessage(chip);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  return (
    <div className="space-y-2.5">
      {/* Quick Prompt Chips */}
      {suggestedPromptChips.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span className="text-[11px] font-semibold text-slate-400 flex-shrink-0">Quick prompts:</span>
          {suggestedPromptChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading || disabled}
              onClick={() => handleChipClick(chip)}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#0a1226] hover:bg-cyan-950/70 text-slate-300 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/40 transition-all flex-shrink-0 disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="relative bg-[#090f23] border border-cyan-500/30 rounded-2xl p-2 sm:p-2.5 shadow-xl shadow-cyan-950/20 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/30 transition-all">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            id="ai-chat-textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || disabled}
            placeholder={placeholder}
            rows={1}
            maxLength={1000}
            className="w-full bg-transparent text-white placeholder-slate-500 text-xs sm:text-sm px-3 py-1.5 focus:outline-none resize-none max-h-32 disabled:opacity-50 leading-relaxed"
          />

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {inputText.length > 0 && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                title="Clear input"
              >
                <Eraser className="w-4 h-4" />
              </button>
            )}

            <button
              id="ai-chat-send-btn"
              type="submit"
              disabled={!inputText.trim() || isLoading || disabled}
              className={`p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md ${
                !inputText.trim() || isLoading || disabled
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25 active:scale-95'
              }`}
            >
              <span className="hidden sm:inline">Ask AI</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Input Footer Helper */}
        <div className="flex items-center justify-between px-2 pt-1.5 text-[10px] text-slate-500 border-t border-slate-800/60 mt-1">
          <div className="flex items-center gap-1">
            <CornerDownLeft className="w-3 h-3 text-cyan-400" />
            <span>Press <strong>Enter</strong> to send &bull; <strong>Shift + Enter</strong> for new line</span>
          </div>
          <span>{inputText.length} / 1000</span>
        </div>
      </form>
    </div>
  );
};
