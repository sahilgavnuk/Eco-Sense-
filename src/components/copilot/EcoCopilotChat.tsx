import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, User, Copy, Check, Plus, ArrowUp,
  Trash2, Battery, Leaf, Package
} from 'lucide-react';
import type { CopilotMessage } from '../../types';
import { useEco } from '../../context/EcoContext';
import { sendCopilotQuery } from '../../services/copilotService';

// Markdown and text formatting
function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-[15px] leading-relaxed text-gray-800">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        // Header / Bold title
        if (/^\*\*[^*]+?\*\*$/.test(trimmed) || /^#{1,3} /.test(trimmed)) {
          return (
            <p key={i} className="font-semibold text-gray-900 text-base mt-2 mb-1">
              <InlineText text={trimmed.replace(/^#{1,3} /, '')} />
            </p>
          );
        }

        // Bullet points
        const bulletMatch = trimmed.match(/^([-*•]|✅|❌|💡|🔵|🟢|🔴|⚫|♻️|⚠️|📦|📱|🍕|🍶|🥛|🌱|🪴|💊|🔋|💬|📋|🌿)\s(.+)/);
        if (bulletMatch) {
          return (
            <div key={i} className="flex gap-2.5 items-start">
              <span className="shrink-0 text-base">{bulletMatch[1]}</span>
              <span className="flex-1"><InlineText text={bulletMatch[2]} /></span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s(.+)/);
        if (numMatch) {
          return (
            <div key={i} className="flex gap-2.5 items-start">
              <span className="shrink-0 font-bold text-emerald-600">{numMatch[1]}.</span>
              <span className="flex-1"><InlineText text={numMatch[2]} /></span>
            </div>
          );
        }

        return (
          <p key={i}>
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
        <code key={m.index} className="bg-gray-100 text-emerald-800 px-1.5 py-0.5 rounded text-xs font-mono">
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
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

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

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const history = messages.slice(-8).map((m) => ({ sender: m.sender, text: m.text }));
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
            ? '🔵 **सुका कचरा** → निळा डबा (प्लास्टिक, कागद, काच)\n🟢 **ओला कचरा** → हिरवा डबा (अन्न, जैविक)\n🔴 **घातक/ई-कचरा** → लाल डबा (बॅटरी, औषधे)'
            : '🔵 **Dry Recyclables** → Blue Bin (clean plastic, cardboard, glass)\n🟢 **Wet Organic** → Green Bin (food waste, garden clippings)\n🔴 **Hazardous / E-Waste** → Red Bin (batteries, chemicals, e-waste)',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const starterCards = language === 'mr' ? [
    {
      icon: Trash2,
      title: 'प्लास्टिक रिसायकलिंग',
      desc: 'प्लास्टिक बाटल्या व पॅकेट्स कशा वेगळ्या कराव्यात?',
      prompt: 'प्लास्टिक बाटल्या आणि दुधाच्या पिशव्या कशा रिसायकल कराव्यात?'
    },
    {
      icon: Battery,
      title: 'बॅटरी व ई-कचरा',
      desc: 'जुन्या बॅटरीची सुरक्षित विल्हेवाट कशी लावावी?',
      prompt: 'जुन्या किंवा खराब झालेल्या बॅटरीची सुरक्षित विल्हेवाट कशी करावी?'
    },
    {
      icon: Package,
      title: 'पिझ्झा व फूड बॉक्सेस',
      desc: 'तेलाचे डाग असलेले बॉक्स रिसायकल होतात का?',
      prompt: 'पिझ्झा बॉक्स आणि अन्न लागलेले पुठ्ठे रिसायकल करता येतात का?'
    },
    {
      icon: Leaf,
      title: 'घरगुती खतनिर्मिती',
      desc: 'ओल्या कचऱ्यापासून घरच्या घरी खत कसे बनवावे?',
      prompt: 'घरच्या घरी ओल्या कचऱ्यापासून खत (compost) कसे बनवावे?'
    }
  ] : [
    {
      icon: Trash2,
      title: 'Plastic Recycling',
      desc: 'How to clean & recycle milk packets and plastic bottles',
      prompt: 'How do I properly clean and recycle plastic bottles and milk pouches?'
    },
    {
      icon: Battery,
      title: 'Battery & E-Waste',
      desc: 'Safe steps for old batteries and electronic gadgets',
      prompt: 'What are the safe steps to dispose of old or swollen batteries?'
    },
    {
      icon: Package,
      title: 'Food Packaging',
      desc: 'Can greasy pizza boxes & take-out cartons be recycled?',
      prompt: 'Can greasy pizza boxes and take-out packaging go in recycling?'
    },
    {
      icon: Leaf,
      title: 'Home Composting',
      desc: 'Simple steps to start composting kitchen waste',
      prompt: 'What are simple steps to start composting organic kitchen waste at home?'
    }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[850px] min-h-[500px] w-full max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
      
      {/* ── Top Bar ── */}
      <div className="h-14 px-4 sm:px-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-sm sm:text-base text-gray-900 leading-tight">
              EcoSense Copilot
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-gray-500 font-medium">
                {language === 'mr' ? 'ऑनलाइन' : 'Online & Ready'}
              </span>
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'नवीन चॅट' : 'New Chat'}</span>
          </button>
        )}
      </div>

      {/* ── Chat Messages / Empty State ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          /* Empty State (ChatGPT-like hero & starter prompts) */
          <div className="h-full flex flex-col justify-center items-center max-w-xl mx-auto text-center py-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-xs">
              <Bot className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {language === 'mr' ? 'आज मी तुम्हाला काय मदत करू?' : 'What would you like to recycle today?'}
            </h3>
            <p className="text-sm text-gray-500 mb-8 max-w-md">
              {language === 'mr'
                ? 'कचरा वर्गीकरण, पुनर्वापर, ई-कचरा व पर्यावरण नियमांबद्दल कोणताही प्रश्न विचारा.'
                : 'Ask anything about waste segregation, recycling rules, safe disposal, or composting.'}
            </p>

            {/* Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
              {starterCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSend(card.prompt)}
                    className="p-3.5 rounded-xl border border-gray-200 hover:border-emerald-500/50 hover:bg-emerald-50/40 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-gray-900 font-medium text-sm mb-1">
                      <Icon className="w-4 h-4 text-emerald-600" />
                      <span>{card.title}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {card.desc}
                    </p>
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
                className={`flex gap-3 max-w-3xl mx-auto ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative group rounded-2xl px-4 py-3 max-w-[85%] sm:max-w-[78%] ${
                    isUser
                      ? 'bg-gray-900 text-white rounded-br-xs'
                      : 'bg-gray-50 border border-gray-200/80 text-gray-900 rounded-bl-xs'
                  }`}
                >
                  {/* Copy Button */}
                  {!isUser && (
                    <button
                      onClick={() => copyText(msg.id, msg.text)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white border border-gray-200 shadow-xs text-gray-500 hover:text-gray-900 transition-all cursor-pointer"
                      title="Copy"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  {isUser ? (
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <MarkdownText text={msg.text} />
                  )}

                  <span
                    className={`block text-[10px] mt-1.5 ${
                      isUser ? 'text-right text-gray-400' : 'text-left text-gray-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 max-w-3xl mx-auto items-start">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-bl-xs px-4 py-3 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Bottom Input Area (ChatGPT Style Capsule) ── */}
      <div className="p-3 sm:p-4 bg-white border-t border-gray-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-3xl mx-auto relative flex items-end bg-gray-50 hover:bg-gray-100/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 border border-gray-200 rounded-2xl transition-all shadow-xs p-1.5 sm:p-2"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            placeholder={
              language === 'mr'
                ? 'कचरा विल्हेवाट किंवा रिसायकलिंगबद्दल विचारा...'
                : 'Message EcoSense Copilot...'
            }
            className="flex-1 max-h-40 min-h-[40px] py-2 px-3 bg-transparent text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none resize-none disabled:opacity-50 leading-relaxed"
          />

          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs"
            title="Send"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        <p className="text-[11px] text-gray-400 text-center mt-2">
          {language === 'mr'
            ? 'EcoSense AI पर्यावरण व कचरा मार्गदर्शनासाठी आहे. स्थानिक नियमांचे पालन करा.'
            : 'EcoSense AI provides waste & recycling guidance. Always verify local municipal protocols.'}
        </p>
      </div>

    </div>
  );
};

export default EcoCopilotChat;
