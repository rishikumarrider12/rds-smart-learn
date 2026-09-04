import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Trash2, 
  Sparkles, 
  RefreshCw, 
  MessageSquare, 
  BookOpen, 
  Languages, 
  HelpCircle,
  Download
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { Chapter, Subject, Topic } from '../../types';
import { getSubjectLanguage } from '../../data/syllabusData';
import { 
  AiLearningContext, 
  ChatMessage, 
  LearningLanguage 
} from '../../services/ai/aiTypes';
import { 
  getConversationHistory, 
  saveConversationHistory, 
  clearConversationHistory, 
  sendAiChatMessage 
} from '../../services/ai/aiService';
import { AiMessage } from './AiMessage';
import { ChatInput } from './ChatInput';
import { AiLoadingState } from './AiLoadingState';
import { AiErrorState } from './AiErrorState';
import { LanguageSelector } from './LanguageSelector';

interface RdsAiChatProps {
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  initialQuestion?: string;
  onNavigateToLearn?: () => void;
}

export const RdsAiChat: React.FC<RdsAiChatProps> = ({
  subject,
  chapter,
  topic,
  initialQuestion,
  onNavigateToLearn,
}) => {
  const { student, selectedClass, language: preferredLanguage } = useStudent();
  // Academic content language defaults from the SUBJECT (Telugu subject ->
  // Telugu answers, Hindi subject -> Hindi answers); other subjects follow the
  // student's saved preference. The language selector still allows override.
  const subjectLang = getSubjectLanguage(subject);
  const [effectiveLang, setEffectiveLang] = useState<LearningLanguage>(
    subjectLang !== 'English' ? subjectLang : preferredLanguage
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; isConfigError?: boolean } | null>(null);
  const [lastUserPrompt, setLastUserPrompt] = useState<string>('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompt chips based on current topic
  const initialChips = [
    `What is ${topic.title}?`,
    'Give a real-world example',
    'Explain key formulas or steps',
    'Why is this in our syllabus?',
    'What common mistakes do students make here?',
  ];

  // Load history on mount or topic change
  useEffect(() => {
    const saved = getConversationHistory(
      selectedClass,
      subject.id,
      chapter.id,
      topic.id
    );

    if (saved && saved.length > 0) {
      setMessages(saved);
    } else {
      // Create initial friendly welcome message from RDS AI
      const studentName = student?.name || 'Student';
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `👋 Hello **${studentName}**! I am **RDS AI**, your personal learning tutor for **${selectedClass} ${subject.name}**.\n\nWe are exploring **Chapter ${chapter.chapterNumber}: ${chapter.title}** &mdash; specifically **${topic.title}**.\n\nAsk me anything! Whether you want a simple explanation, formula clarification, or worked example, I am here to help you master it! 😊`,
        timestamp: Date.now(),
        suggestedChips: initialChips,
        learningContext: {
          classLevel: selectedClass,
          subjectName: subject.name,
          chapterTitle: chapter.title,
          topicTitle: topic.title,
          language: effectiveLang,
        },
      };
      setMessages([welcomeMessage]);
      saveConversationHistory(selectedClass, subject.id, chapter.id, topic.id, [welcomeMessage]);
    }
  }, [selectedClass, subject.id, chapter.id, topic.id]);

  // Handle auto-triggering initial question if provided
  useEffect(() => {
    if (initialQuestion && messages.length > 0 && !isLoading) {
      handleSendMessage(initialQuestion);
    }
  }, [initialQuestion]);

  // Scroll to bottom smoothly
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, error]);

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    setError(null);
    setLastUserPrompt(userText);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveConversationHistory(selectedClass, subject.id, chapter.id, topic.id, newMessages);
    setIsLoading(true);

    const context: AiLearningContext = {
      studentName: student?.name || 'Student',
      classLevel: selectedClass,
      subject,
      chapter,
      topic,
      language: effectiveLang,
      mode: 'ask_ai',
    };

    try {
      const response = await sendAiChatMessage(context, userText, newMessages);

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        suggestedChips: response.suggestedChips,
        learningContext: {
          classLevel: selectedClass,
          subjectName: subject.name,
          chapterTitle: chapter.title,
          topicTitle: topic.title,
          language: effectiveLang,
        },
      };

      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);
      saveConversationHistory(selectedClass, subject.id, chapter.id, topic.id, finalMessages);
    } catch (err: any) {
      console.error('Failed to get AI answer:', err);
      const isConfig = err.message?.includes('GEMINI_API_KEY') || err.message?.includes('503');
      setError({
        message: err.message || 'Unable to connect to RDS AI. Please try again.',
        isConfigError: isConfig,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastUserPrompt) {
      handleSendMessage(lastUserPrompt);
    }
  };

  const handleClearChat = () => {
    clearConversationHistory(selectedClass, subject.id, chapter.id, topic.id);
    const studentName = student?.name || 'Student';
    const freshWelcome: ChatMessage = {
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content: `👋 Chat cleared! Ready for your next question on **${topic.title}**, ${studentName}! 😊`,
      timestamp: Date.now(),
      suggestedChips: initialChips,
    };
    setMessages([freshWelcome]);
    saveConversationHistory(selectedClass, subject.id, chapter.id, topic.id, [freshWelcome]);
    setShowClearConfirm(false);
    setError(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[580px] max-w-5xl mx-auto bg-[#070b18] border border-cyan-500/20 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-950/40">
      {/* Chat Top Header */}
      <div className="bg-[#090f23] border-b border-slate-800/80 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-md shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#070b18] rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Ask RDS AI</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Tutor
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Topic: <span className="text-cyan-300 font-semibold">{topic.title}</span> ({subject.name})
            </p>
          </div>
        </div>

        {/* Language Switcher & Chat Controls */}
        <div className="flex items-center gap-3 self-end sm:self-auto flex-wrap">
          <LanguageSelector
            currentLanguage={effectiveLang}
            onSelectLanguage={(l) => setEffectiveLang(l)}
            variant="compact"
          />

          {onNavigateToLearn && (
            <button
              onClick={onNavigateToLearn}
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-colors flex items-center gap-1.5"
              title="Switch to structured step-by-step learning"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Learn Mode</span>
            </button>
          )}

          <div className="relative">
            {showClearConfirm ? (
              <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/40 rounded-xl p-1 text-xs">
                <span className="text-[11px] text-rose-200 px-1">Clear history?</span>
                <button
                  onClick={handleClearChat}
                  className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold hover:bg-rose-600"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition-all"
                title="Clear conversation history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.map((msg) => (
          <AiMessage
            key={msg.id}
            message={msg}
            onChipClick={handleSendMessage}
          />
        ))}

        {isLoading && (
          <AiLoadingState
            message="RDS AI is generating your explanation..."
            topicTitle={topic.title}
          />
        )}

        {error && (
          <AiErrorState
            errorMessage={error.message}
            isConfigError={error.isConfigError}
            onRetry={handleRetry}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="p-4 sm:p-5 bg-[#080d1f] border-t border-slate-800/80 flex-shrink-0">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder={`Ask RDS AI any doubt about ${topic.title}...`}
          suggestedPromptChips={messages.length <= 2 ? initialChips.slice(0, 3) : []}
        />
      </div>
    </div>
  );
};
