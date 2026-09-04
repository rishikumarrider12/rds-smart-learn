import React, { useState } from 'react';
import { Bot, User, Copy, Check, Sparkles, Clock } from 'lucide-react';
import { ChatMessage } from '../../services/ai/aiTypes';

interface AiMessageProps {
  message: ChatMessage;
  onChipClick?: (chipText: string) => void;
}

/**
 * Format markdown-like text nicely (bold, lists, code, line breaks)
 */
const FormattedContent: React.FC<{ content: string }> = ({ content }) => {
  // Simple clean formatting parser for bold text, bullet points, headers, and code
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-200">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Heading level 3 / bold title: ### or **Title:**
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          const text = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 key={idx} className="text-sm sm:text-base font-black text-cyan-300 pt-2 pb-1 border-b border-cyan-500/10">
              {text}
            </h4>
          );
        }

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
          const bulletText = trimmed.replace(/^[-*•]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5">
              <span className="text-cyan-400 font-bold mt-1 text-xs">•</span>
              <span className="flex-1">{renderInlineStyles(bulletText)}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5">
              <span className="text-cyan-400 font-bold text-xs mt-0.5">{numMatch[1]}.</span>
              <span className="flex-1">{renderInlineStyles(numMatch[2])}</span>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="text-slate-200">
            {renderInlineStyles(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

function renderInlineStyles(text: string): React.ReactNode {
  // Parse **bold** and `code`
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-bold text-white text-cyan-200">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-[#060a17] text-cyan-300 border border-cyan-500/30 font-mono text-[11px]">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export const AiMessage: React.FC<AiMessageProps> = ({ message, onChipClick }) => {
  const isUser = message.role === 'user';
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl transition-all ${
        isUser
          ? 'bg-[#0e1730]/90 border border-cyan-500/30 ml-auto max-w-[85%] sm:max-w-[75%]'
          : 'bg-[#090f23]/95 border border-slate-800 hover:border-slate-700 w-full shadow-lg shadow-black/30'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <User className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 p-0.5 flex items-center justify-center shadow-md shadow-cyan-500/30">
            <div className="w-full h-full bg-[#070b18] rounded-[10px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header with Name & Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${isUser ? 'text-cyan-300' : 'text-white flex items-center gap-1.5'}`}>
              {isUser ? 'You (Student)' : 'RDS AI'}
              {!isUser && (
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Tutor
                </span>
              )}
            </span>
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formattedTime}
            </span>
          </div>

          {!isUser && (
            <button
              onClick={handleCopy}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
              title="Copy explanation"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Content */}
        <FormattedContent content={message.content} />

        {/* Context metadata badge if available */}
        {message.learningContext && (
          <div className="pt-2 text-[10px] text-slate-500 flex items-center gap-2 border-t border-slate-800/80">
            <span>Context: {message.learningContext.topicTitle}</span>
            <span>&bull;</span>
            <span>{message.learningContext.language}</span>
          </div>
        )}

        {/* Suggested Quick Question Chips */}
        {!isUser && message.suggestedChips && message.suggestedChips.length > 0 && onChipClick && (
          <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Suggested Next Questions:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {message.suggestedChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => onChipClick(chip)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#0a132b] hover:bg-cyan-950/80 text-cyan-300 hover:text-cyan-200 border border-cyan-500/20 hover:border-cyan-400/50 transition-all text-left"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
