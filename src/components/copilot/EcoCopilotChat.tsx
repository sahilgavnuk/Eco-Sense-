import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, RefreshCw, Copy, Check, User,
  Trash2, Battery, Leaf
} from 'lucide-react';
import type { CopilotMessage } from '../../types';
import { useEco } from '../../context/EcoContext';
import { sendCopilotQuery } from '../../services/copilotService';

// Simple Markdown & Text Formatter
function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        // Header
        if (/^\*\*[^*]+?\*\*$/.test(trimmed) || /^#{1,3} /.test(trimmed)) {
          return (
            <p key={i} className="font-semibold text-gray-900 mt-2 mb-1">
              <InlineText text={trimmed.replace(/^#{1,3} /, '')} />
            </p>
          );
        }

        // Bullet points
        const bulletMatch = trimmed.match(/^([-*•]|✅|❌|💡|🔵|🟢|🔴|⚫|♻️|⚠️|📦|📱|🍕|🍶|🥛|🌱|🪴|💊|🔋|💬|📋|🌿)\s(.+)/);
        if (bulletMatch) {
          return (
            <div key={i} className="flex gap-2 items-start text-gray-800">
              <span className="shrink-0 text-base">{bulletMatch[1]}</span>
              <span className="flex-1"><InlineText text={bulletMatch[2]} /></span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s(.+)/);
        if (numMatch) {
          return (
            <div key={i} className="flex gap-2 items-start text-gray-800">
              <span className="shrink-0 font-bold text-emerald-600">{numMatch[1]}.</span>
              <span className="flex-1"><InlineText text={numMatch[2]} /></span>
            </div>
          );
        }

        return (
          <p key={i} className="text-gray-800">
            <InlineText text={trimmed} />
          </p>
        );
      })}
    </div>
  );
}

function InlineText({ text }: { text: string }) {
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
        <code key={m.index} className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded text-xs font-mono">
          {m[4]}
        </code>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key={last}>{text.slice(last)}</span>);
  return <>{parts}</>;
}

export const EcoCopilotChat: React.FC = () => {
  const { language } = useEco();

  const getWelcomeMessage = (): CopilotMessage => ({
    id: 'welcome',
    sender: 'assistant',
    text: language === 'mr'
      ? '👋 **नमस्कार! मी EcoSense Chatbot आहे.**\n\nकचरा वर्गीकरण, प्लास्टिक पुनर्वापर, बॅटरी किंवा ई-कचरा विल्हेवाट याबद्दल कोणताही प्रश्न विचारा!'
      : "👋 **Hi there! I'm your EcoSense Assistant.**\n\nAsk me anything about waste sorting, recyclability, batteries, composting, or municipal disposal rules!",
    timestamp: 'Now'
  });

  const [messages, setMessages] = useState<CopilotMessage[]>([getWelcomeMessage()]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Sync welcome on language change
  useEffect(() => {
    setMessages([getWelcomeMessage()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query || isTyping) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text }));
      const result = await sendCopilotQuery(query, history, language);

      const botMsg: CopilotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: language === 'mr'
            ? '🔵 **सुका कचरा** → निळा डबा\n🟢 **ओला कचरा** → हिरवा डबा\n🔴 **घातक/ई-कचरा** → लाल डबा'
            : '🔵 **Dry Recyclables** → Blue Bin\n🟢 **Wet Organic** → Green Bin\n🔴 **Hazardous & E-Waste** → Red Bin',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sampleQuestions = language === 'mr' ? [
    { icon: Trash2, text: 'प्लास्टिक बाटल्या कशा रिसायकल कराव्यात?' },
    { icon: Battery, text: 'बॅटरीची सुरक्षित विल्हेवाट कशी करावी?' },
    { icon: Leaf, text: 'घरी खत (compost) कसे बनवावे?' }
  ] : [
    { icon: Trash2, text: 'How to recycle plastic bottles?' },
    { icon: Battery, text: 'Where to dispose old batteries?' },
    { icon: Leaf, text: 'How to start composting at home?' }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto p-2 sm:p-4">
      {/* ── Chat Container ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden flex flex-col h-[650px] max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base flex items-center gap-2">
                EcoSense AI Chatbot
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              </h2>
              <p className="text-xs text-emerald-200/80">
                {language === 'mr' ? 'पर्यावरण व कचरा व्यवस्थापन सहाय्यक' : 'AI Waste & Recycling Assistant'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setMessages([getWelcomeMessage()])}
            className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
            title={language === 'mr' ? 'चॅट साफ करा' : 'Clear chat'}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/60">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex gap-2.5 items-end ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mb-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative group max-w-[85%] rounded-2xl px-4 py-3 ${
                    isUser
                      ? 'bg-emerald-700 text-white rounded-br-xs shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {!isUser && (
                    <button
                      onClick={() => copyText(msg.id, msg.text)}
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all cursor-pointer"
                      title="Copy"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}

                  {isUser ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <MarkdownText text={msg.text} />
                  )}

                  <span
                    className={`block text-[10px] mt-1.5 ${
                      isUser ? 'text-right text-emerald-200' : 'text-left text-gray-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 mb-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-end gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-gray-400 ml-1">
                  {language === 'mr' ? 'उत्तर तयार करत आहे...' : 'Thinking...'}
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick Sample Questions */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex gap-2 overflow-x-auto scrollbar-none">
            {sampleQuestions.map((q, i) => {
              const Icon = q.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSend(q.text)}
                  disabled={isTyping}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 text-gray-700 text-xs rounded-xl whitespace-nowrap transition-all cursor-pointer disabled:opacity-50"
                >
                  <Icon className="w-3.5 h-3.5 text-emerald-600" />
                  {q.text}
                </button>
              );
            })}
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-gray-200 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder={language === 'mr' ? 'कचरा किंवा रिसायकलिंगबद्दल काहीही विचारा...' : 'Ask anything about waste, recycling, or disposal...'}
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};

export default EcoCopilotChat;
