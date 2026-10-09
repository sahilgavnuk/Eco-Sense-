import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  AlertCircle,
  Copy,
  Check,
  Bot,
  Sparkles,
  Trash2,
  Battery,
  Leaf,
  Layers
} from 'lucide-react';
import { useEco } from '../../context/EcoContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isError?: boolean;
}

// Simple text & markdown parser for bullet lists, bold text, and numbered items
function FormattedMessage({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        // Header / bold title
        if (/^\*\*[^*]+?\*\*$/.test(trimmed) || /^#{1,3} /.test(trimmed)) {
          return (
            <p key={i} className="font-bold text-gray-900 mt-2 mb-1">
              <ParseInline text={trimmed.replace(/^#{1,3} /, '')} />
            </p>
          );
        }

        // Bullet point lines
        const bulletMatch = trimmed.match(/^([-*•]|✅|❌|💡|🔵|🟢|🔴|⚫|♻️|⚠️|📦|📱|🌱|🪴|💊|🔋|🌿)\s(.+)/);
        if (bulletMatch) {
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="shrink-0 text-sm">{bulletMatch[1]}</span>
              <span className="flex-1"><ParseInline text={bulletMatch[2]} /></span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s(.+)/);
        if (numMatch) {
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="shrink-0 font-bold text-emerald-600">{numMatch[1]}.</span>
              <span className="flex-1"><ParseInline text={numMatch[2]} /></span>
            </div>
          );
        }

        return (
          <p key={i}>
            <ParseInline text={trimmed} />
          </p>
        );
      })}
    </div>
  );
}

function ParseInline({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={last}>{text.slice(last, m.index)}</span>);
    if (m[2] !== undefined) {
      parts.push(<strong key={m.index} className="font-semibold text-gray-900">{m[2]}</strong>);
    } else if (m[3] !== undefined) {
      parts.push(<em key={m.index} className="italic text-gray-700">{m[3]}</em>);
    } else if (m[4] !== undefined) {
      parts.push(
        <code key={m.index} className="bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded text-[11px] font-mono">
          {m[4]}
        </code>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key={last}>{text.slice(last)}</span>);
  return <>{parts}</>;
}

export const FloatingChatbot: React.FC = () => {
  const { language } = useEco();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastErrorQuery, setLastErrorQuery] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    setLastErrorQuery(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'Failed to receive AI response from server.');
      }

      const botMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      setLastErrorQuery(textToSend);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: language === 'mr'
          ? `⚠️ **त्रुटी आली:** ${err.message || 'सर्व्हरशी संपर्क साधता आला नाही.'}\n\nकृपया **पुन्हा प्रयत्न करा** बटण दाबा.`
          : `⚠️ **Service Notice:** ${err.message || 'Could not connect to the AI model.'}\n\nPlease click **Retry** below to try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestedQuestions = language === 'mr' ? [
    { icon: Trash2, title: 'दुधाची पिशवी व प्लास्टिक', query: 'दुधाची पिशवी आणि प्लास्टिक बाटल्या कशा रिसायकल कराव्यात?' },
    { icon: Battery, title: 'बॅटरी विल्हेवाट', query: 'जुन्या बॅटऱ्या कोणत्या डब्यात टाकाव्यात?' },
    { icon: Leaf, title: 'घरगुती खतनिर्मिती', query: 'ओल्या कचऱ्यापासून घरात खत कसे बनवावे?' },
    { icon: Layers, title: 'इकोसेन्स एआय काय आहे?', query: 'EcoSense AI प्लॅटफॉर्मची वैशिष्ट्ये काय आहेत?' }
  ] : [
    { icon: Trash2, title: 'Plastic & Milk Pouches', query: 'How should plastic milk pouches and drink bottles be recycled?' },
    { icon: Battery, title: 'Battery Disposal', query: 'Which bin do used AA batteries and electronics go in?' },
    { icon: Leaf, title: 'Home Composting', query: 'How can I start composting food waste at home?' },
    { icon: Layers, title: 'EcoSense AI Features', query: 'How does EcoSense AI help with waste scanning and reporting?' }
  ];

  return (
    <>
      {/* ── Floating Launcher Button ── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 bg-[#0F2E23] hover:bg-[#154233] text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl flex items-center gap-2.5 border border-emerald-500/40 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
        aria-label={isOpen ? 'Close EcoSense Chatbot' : 'Open EcoSense Chatbot'}
        title="EcoSense AI Assistant"
      >
        <div className="w-8 h-8 rounded-full bg-[#10B981] text-[#0F2E23] flex items-center justify-center font-bold shrink-0">
          {isOpen ? <X className="w-4 h-4 text-[#0F2E23]" /> : <MessageSquare className="w-4 h-4 text-[#0F2E23]" />}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold leading-tight flex items-center gap-1.5">
            EcoSense AI
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </span>
          <span className="text-[10px] text-emerald-300">
            {language === 'mr' ? 'एआय सहाय्यक' : 'AI Waste Assistant'}
          </span>
        </div>
      </button>

      {/* ── Chat Window Modal / Popup ── */}
      {isOpen && (
        <div
          className="fixed inset-x-3 bottom-20 top-20 sm:inset-x-auto sm:top-auto sm:bottom-24 sm:right-6 sm:w-[420px] sm:h-[620px] z-50 bg-white rounded-2xl border border-gray-200/90 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
          role="dialog"
          aria-label="EcoSense AI Chat"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-[#0F2E23] text-white flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#10B981] text-[#0F2E23] flex items-center justify-center font-bold shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs sm:text-sm leading-tight">EcoSense AI Assistant</h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-emerald-200/70">
                  {language === 'mr' ? 'कचरा वर्गीकरण आणि रिसायकलिंग तज्ज्ञ' : 'Waste & Recycling Intelligence'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition-colors cursor-pointer"
                  title={language === 'mr' ? 'नवीन चॅट' : 'Clear conversation'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-gray-50/70">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-2">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2.5">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="font-extrabold text-gray-900 text-sm sm:text-base mb-1">
                  {language === 'mr' ? 'नमस्कार! मी EcoSense AI आहे.' : 'Hi! How can I help you today?'}
                </h4>
                <p className="text-xs text-gray-500 mb-4 max-w-xs">
                  {language === 'mr'
                    ? 'कचरा वर्गीकरण, पुनर्वापर, खतनिर्मिती आणि इकोसेन्स प्लॅटफॉर्मबद्दल विचारा.'
                    : 'Ask any question about waste segregation, recycling rules, composting, or EcoSense features.'}
                </p>

                {/* Suggested Question Chips */}
                <div className="w-full space-y-1.5 text-left">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                    {language === 'mr' ? 'सुचवलेले प्रश्न:' : 'Suggested questions:'}
                  </p>
                  {suggestedQuestions.map((sq, i) => {
                    const Icon = sq.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(sq.query)}
                        className="w-full p-2.5 bg-white hover:bg-emerald-50/50 hover:border-emerald-300 rounded-xl border border-gray-200 text-left transition-all text-xs flex items-center gap-2 group cursor-pointer shadow-2xs"
                      >
                        <Icon className="w-3.5 h-3.5 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-gray-800 flex-1 truncate">{sq.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 items-start ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-6 h-6 rounded-lg bg-[#0F2E23] text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`relative group rounded-2xl px-3.5 py-2.5 max-w-[85%] ${
                        isUser
                          ? 'bg-[#0F2E23] text-white rounded-br-xs shadow-xs'
                          : msg.isError
                          ? 'bg-red-50 border border-red-200 text-red-900 rounded-bl-xs'
                          : 'bg-white border border-gray-200/90 text-gray-900 rounded-bl-xs shadow-xs'
                      }`}
                    >
                      {!isUser && !msg.isError && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-all cursor-pointer"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}

                      {isUser ? (
                        <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <FormattedMessage text={msg.text} />
                      )}

                      <span
                        className={`block text-[9px] mt-1 ${
                          isUser ? 'text-right text-emerald-200/60' : 'text-left text-gray-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2 items-start">
                <div className="w-6 h-6 rounded-lg bg-[#0F2E23] text-[#10B981] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-xs px-3 py-2 shadow-xs flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {language === 'mr' ? 'एआय विचार करत आहे...' : 'EcoSense AI is thinking...'}
                  </span>
                </div>
              </div>
            )}

            {/* Retry Banner on Error */}
            {lastErrorQuery && !isLoading && (
              <div className="flex items-center justify-between p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span className="text-[11px]">{language === 'mr' ? 'उत्तर मिळू शकले नाही.' : 'Request failed.'}</span>
                </div>
                <button
                  onClick={() => handleSendMessage(lastErrorQuery)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white border border-red-300 rounded-lg hover:bg-red-100 text-red-900 font-bold text-[11px] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{language === 'mr' ? 'पुन्हा प्रयत्न' : 'Retry'}</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-gray-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder={
                  language === 'mr'
                    ? 'कचरा, रिसायकलिंग किंवा खताबद्दल विचारा...'
                    : 'Ask about waste, recycling, composting...'
                }
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-3.5 py-2 bg-[#10B981] hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 text-[#0F2E23] font-bold rounded-xl flex items-center justify-center transition-colors cursor-pointer shadow-xs shrink-0"
                title="Send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <p className="text-[9px] text-gray-400 text-center mt-1.5">
              {language === 'mr'
                ? 'इकोसेन्स एआय प्रमाणित पर्यावरणीय मार्गदर्शन'
                : 'EcoSense AI provides certified environmental guidance'}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;
