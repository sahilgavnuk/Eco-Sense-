import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, User, RotateCcw, AlertCircle, Trash2, Battery, Leaf, Package, Check, Copy
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
    <div className="space-y-1.5 text-sm sm:text-[15px] leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        // Header / bold title
        if (/^\*\*[^*]+?\*\*$/.test(trimmed) || /^#{1,3} /.test(trimmed)) {
          return (
            <p key={i} className="font-bold text-gray-900 text-sm sm:text-base mt-2 mb-1">
              <ParseInline text={trimmed.replace(/^#{1,3} /, '')} />
            </p>
          );
        }

        // Bullet point lines
        const bulletMatch = trimmed.match(/^([-*•]|✅|❌|💡|🔵|🟢|🔴|⚫|♻️|⚠️|📦|📱|🍕|🍶|🥛|🌱|🪴|💊|🔋|💬|📋|🌿)\s(.+)/);
        if (bulletMatch) {
          return (
            <div key={i} className="flex gap-2.5 items-start">
              <span className="shrink-0 text-base">{bulletMatch[1]}</span>
              <span className="flex-1"><ParseInline text={bulletMatch[2]} /></span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s(.+)/);
        if (numMatch) {
          return (
            <div key={i} className="flex gap-2.5 items-start">
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

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastErrorQuery, setLastErrorQuery] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
          ? `⚠️ **त्रुटी आली:** ${err.message || 'सर्व्हरशी संपर्क साधता आला नाही.'}\n\nकृपया खालील बटण दाबून पुन्हा प्रयत्न करा.`
          : `⚠️ **Connection Error:** ${err.message || 'Could not reach the AI service.'}\n\nPlease tap the **Retry** button below to try again.`,
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

  const quickPrompts = language === 'mr' ? [
    { icon: Trash2, title: 'प्लास्टिक रिसायकलिंग', query: 'प्लास्टिक बाटल्या आणि दुधाच्या पिशव्या कशा रिसायकल कराव्यात?' },
    { icon: Battery, title: 'बॅटरी विल्हेवाट', query: 'जुन्या किंवा खराब झालेल्या बॅटरीची सुरक्षित विल्हेवाट कशी लावावी?' },
    { icon: Package, title: 'पिझ्झा बॉक्स', query: 'पिझ्झा बॉक्स आणि खाद्यपदार्थांचे पुठ्ठे रिसायकल करता येतात का?' },
    { icon: Leaf, title: 'घरगुती खत', query: 'घरच्या घरी ओल्या कचऱ्यापासून खत कसे बनवावे?' }
  ] : [
    { icon: Trash2, title: 'Plastic Bottles', query: 'How do I clean and recycle plastic beverage bottles and milk pouches?' },
    { icon: Battery, title: 'Battery Disposal', query: 'What is the safe method to dispose of old or swollen batteries?' },
    { icon: Package, title: 'Pizza Boxes', query: 'Can greasy pizza boxes and food packaging go in the recycling bin?' },
    { icon: Leaf, title: 'Home Composting', query: 'How can I start composting kitchen organic waste at home?' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)] max-h-[800px] min-h-[520px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      
      {/* ── Top Header ── */}
      <div className="px-5 py-3.5 bg-[#0F2E23] text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#10B981] flex items-center justify-center text-[#0F2E23] font-bold shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm sm:text-base leading-tight">EcoSense AI Copilot</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live AI
              </span>
            </div>
            <p className="text-xs text-emerald-200/70">
              {language === 'mr' ? 'कचरा व्यवस्थापन आणि रिसायकलिंग सहाय्यक' : 'AI Waste & Recycling Specialist'}
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            title="Clear conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'नवीन चॅट' : 'New Chat'}</span>
          </button>
        )}
      </div>

      {/* ── Message Area ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gray-50/50">
        {messages.length === 0 ? (
          /* Empty state prompt cards */
          <div className="h-full flex flex-col justify-center items-center max-w-xl mx-auto text-center py-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-3">
              <Bot className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {language === 'mr' ? 'कचरा किंवा रिसायकलिंगबद्दल काहीही विचारा' : 'How can I assist your recycling today?'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 max-w-md">
              {language === 'mr'
                ? 'कचरा वर्गीकरण, प्लास्टिक पुनर्वापर, ई-कचरा सुरक्षा आणि इकोसेन्स प्लॅटफॉर्मबद्दल विचारा.'
                : 'Get instant, certified advice on 4-bin segregation, plastic recycling codes, hazardous waste, and EcoSense features.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
              {quickPrompts.map((p, i) => {
                const Icon = p.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(p.query)}
                    className="p-3.5 bg-white rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/30 text-left transition-all shadow-2xs group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-900 text-xs sm:text-sm mb-1">
                      <Icon className="w-4 h-4 text-emerald-600" />
                      <span>{p.title}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{p.query}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Message List */
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 items-start max-w-3xl mx-auto ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#0F2E23] text-[#10B981] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative group rounded-2xl px-4 py-3 max-w-[88%] sm:max-w-[80%] ${
                    isUser
                      ? 'bg-[#0F2E23] text-white rounded-br-xs shadow-xs'
                      : msg.isError
                      ? 'bg-red-50 border border-red-200 text-red-900 rounded-bl-xs'
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {/* Copy button */}
                  {!isUser && !msg.isError && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-all cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  {isUser ? (
                    <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <FormattedMessage text={msg.text} />
                  )}

                  <span
                    className={`block text-[10px] mt-1.5 ${
                      isUser ? 'text-right text-emerald-200/60' : 'text-left text-gray-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gray-200 text-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-2.5 sm:gap-3 items-start max-w-3xl mx-auto">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#0F2E23] text-[#10B981] flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {language === 'mr' ? 'उत्तर तयार करत आहे...' : 'Generating AI response...'}
              </span>
            </div>
          </div>
        )}

        {/* Retry Banner on Error */}
        {lastErrorQuery && !isLoading && (
          <div className="max-w-3xl mx-auto flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{language === 'mr' ? 'संदेश पाठवणे अयशस्वी.' : 'Could not complete request.'}</span>
            </div>
            <button
              onClick={() => handleSendMessage(lastErrorQuery)}
              className="flex items-center gap-1.5 px-3 py-1 bg-white border border-red-300 rounded-lg hover:bg-red-100 text-red-900 font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'पुन्हा प्रयत्न करा' : 'Retry'}</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Form ── */}
      <div className="p-3 sm:p-4 bg-white border-t border-gray-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="max-w-3xl mx-auto flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={
              language === 'mr'
                ? 'कचरा विल्हेवाट किंवा रिसायकलिंगबद्दल प्रश्न विचारा...'
                : 'Ask a question about waste, recycling, or EcoSense...'
            }
            className="flex-1 px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 sm:px-5 py-2.5 sm:py-3 bg-[#10B981] hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 text-[#0F2E23] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
            title="Send message"
          >
            <span className="hidden sm:inline text-sm">{language === 'mr' ? 'पाठवा' : 'Send'}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-gray-400 text-center mt-2">
          {language === 'mr'
            ? 'EcoSense AI कचरा व्यवस्थापनासाठी प्रमाणित मार्गदर्शन प्रदान करते.'
            : 'EcoSense AI provides certified environmental & recycling intelligence.'}
        </p>
      </div>

    </div>
  );
};

export default EcoCopilotChat;
