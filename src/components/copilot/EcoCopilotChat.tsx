import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, RefreshCw, Copy, Check, User,
  Leaf, BatteryCharging, Trash2, HelpCircle,
  Sparkles, Key, ChevronDown, ChevronUp, ShieldCheck, X
} from 'lucide-react';
import type { CopilotMessage } from '../../types';
import { useEco } from '../../context/EcoContext';
import { sendCopilotQuery } from '../../services/copilotService';

// ─── Markdown Renderer ────────────────────────────────────────────────────────
// Converts **bold**, bullet lists, numbered lists, headings → JSX
function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) return <div key={i} className="h-1.5" />;

        // Heading line (starts with emoji + space + **text**)
        if (/^\*\*[^*]/.test(trimmed) || /^#{1,3} /.test(trimmed)) {
          return (
            <p key={i} className="font-bold text-gray-900 text-sm leading-snug mt-1.5 mb-0.5">
              <InlineText text={trimmed.replace(/^#{1,3} /, '')} />
            </p>
          );
        }

        // Bullet point lines (-, *, or common emojis used as bullets)
        const bulletMatch = trimmed.match(/^([-*•]|✅|❌|💡|🔵|🟢|🔴|⚫|♻️|⚠️|📦|📱|🍕|🍶|🥛|🌱|🩺|🌴|🏙️|🪴|💊|🌊|🔋|💬|📋|🌿|🎯|👉|→)\s(.+)/);
        if (bulletMatch) {
          return (
            <div key={i} className="flex gap-2 items-start leading-relaxed">
              <span className="shrink-0 mt-0.5 text-base">{bulletMatch[1]}</span>
              <span className="text-sm text-gray-800"><InlineText text={bulletMatch[2]} /></span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s(.+)/);
        if (numMatch) {
          return (
            <div key={i} className="flex gap-2 items-start leading-relaxed">
              <span className="shrink-0 font-bold text-[#10B981] text-sm mt-0.5">{numMatch[1]}.</span>
              <span className="text-sm text-gray-800"><InlineText text={numMatch[2]} /></span>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={i} className="text-sm text-gray-800 leading-relaxed">
            <InlineText text={trimmed} />
          </p>
        );
      })}
    </div>
  );
}

// Inline parser for **bold**, *italic*, `code`
function InlineText({ text }: { text: string }) {
  // Split by **bold**, *italic*, `code`
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(<span key={last}>{text.slice(last, m.index)}</span>);
    }
    if (m[2] !== undefined) {
      // **bold**
      parts.push(<strong key={m.index} className="font-bold text-gray-900">{m[2]}</strong>);
    } else if (m[3] !== undefined) {
      // *italic*
      parts.push(<em key={m.index} className="italic">{m[3]}</em>);
    } else if (m[4] !== undefined) {
      // `code`
      parts.push(
        <code key={m.index} className="bg-gray-100 text-emerald-700 px-1.5 py-0.5 rounded text-xs font-mono">
          {m[4]}
        </code>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    parts.push(<span key={last}>{text.slice(last)}</span>);
  }

  return <>{parts}</>;
}

// ─── Main Copilot Component ───────────────────────────────────────────────────
export const EcoCopilotChat: React.FC = () => {
  const { language, t } = useEco();

  const buildWelcome = (): CopilotMessage => ({
    id: 'welcome',
    sender: 'assistant',
    text: language === 'mr'
      ? `👋 **नमस्कार! मी EcoSense AI Copilot आहे.**\n\nमी तुम्हाला कचरा वर्गीकरण, प्लास्टिक रिसायकलिंग, ई-कचरा विल्हेवाट आणि कंपोस्टिंगबद्दल मदत करतो — कोकण (Zone 1) व नालासोपारा/विरार (Zone 2) साठी.\n\n👇 **खाली दिलेल्या प्रश्नांवर क्लिक करा किंवा स्वतःचा प्रश्न विचारा!**`
      : `👋 **Hello! I'm EcoSense AI Copilot.**\n\nI give clear, expert guidance on **waste segregation**, **plastic recycling**, **e-waste safety**, and **composting** — tailored for Zone 1 (Kokan Region) and Zone 2 (NSP East/West & Virar).\n\n👇 **Tap a quick question or type your own below!**`,
    timestamp: 'Now',
    groundedSources: ['EcoSense 2-Zone Protocol', 'CPCB Waste Management Rules 2016']
  });

  const [messages, setMessages] = useState<CopilotMessage[]>([buildWelcome()]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showKeyPanel, setShowKeyPanel] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ecosense_gemini_key') || '');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Reset welcome message on language change
  useEffect(() => {
    setMessages([buildWelcome()]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const query = (text ?? input).trim();
    if (!query || isTyping) return;

    const userMsg: CopilotMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.slice(-8).map(m => ({ sender: m.sender, text: m.text }));
      const result = await sendCopilotQuery(query, history, language, apiKey || undefined);

      setMessages(prev => [...prev, {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundedSources: result.sources
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: language === 'mr'
          ? '🔵 सुका कचरा → निळा डबा\n🟢 ओला कचरा → हिरवा डबा\n🔴 घातक/ई-कचरा → लाल डबा\n⚫ इतर → काळा डबा\n\n💬 **अधिक माहितीसाठी पुन्हा विचारा.**'
          : '🔵 Dry recyclables → **Blue Bin**\n🟢 Wet/organic → **Green Bin**\n🔴 Hazardous & e-waste → **Red Bin**\n⚫ Non-recyclable → **Black Bin**\n\n💬 **Ask me about any specific item for detailed guidance!**',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundedSources: ['EcoSense Standard Protocol']
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const saveApiKey = () => {
    const k = apiKeyInput.trim();
    setApiKey(k);
    localStorage.setItem('ecosense_gemini_key', k);
    setApiKeyInput('');
    setShowKeyPanel(false);
  };

  const removeApiKey = () => {
    setApiKey('');
    localStorage.removeItem('ecosense_gemini_key');
  };

  const quickPills = language === 'mr' ? [
    { icon: Trash2,          label: 'दुधाची पिशवी विल्हेवाट' },
    { icon: BatteryCharging, label: 'बॅटरी कुठे टाकावी?' },
    { icon: Leaf,            label: 'कोकणात कंपोस्टिंग कसे करावे?' },
    { icon: HelpCircle,      label: 'नालासोपारा-विरार कचरा नियम' },
    { icon: Sparkles,        label: 'पिझ्झा बॉक्स रिसायकल होतो का?' }
  ] : [
    { icon: Trash2,          label: 'How to dispose of milk packets?' },
    { icon: BatteryCharging, label: 'Safe battery disposal steps' },
    { icon: Leaf,            label: 'Composting tips for Kokan Zone 1' },
    { icon: HelpCircle,      label: 'NSP & Virar Zone 2 waste rules' },
    { icon: Sparkles,        label: 'Can I recycle greasy pizza boxes?' }
  ];

  const hasValidKey = apiKey.startsWith('AIza');

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-[#0F2E23] rounded-full text-xs font-semibold border border-emerald-200">
          <Bot className="w-3.5 h-3.5 text-[#10B981]" />
          {t.copilotBadge}
        </span>
        <h1 className="text-3xl font-extrabold text-[#0F2E23]">{t.copilotTitle}</h1>
        <p className="text-sm text-gray-500 max-w-xl mx-auto">{t.copilotDesc}</p>
      </div>

      {/* Copilot Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        {/* ── Chat Header ─────────────────────────────────────────── */}
        <div className="bg-[#0F2E23] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#10B981] text-[#0F2E23] flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-bold text-sm">EcoSense AI Copilot</span>
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                    hasValidKey
                      ? 'bg-[#10B981]/20 text-[#34D399] border-[#10B981]/30'
                      : 'bg-white/10 text-emerald-200 border-white/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${hasValidKey ? 'bg-[#34D399] animate-pulse' : 'bg-amber-400'}`} />
                    {hasValidKey ? 'Gemini AI' : 'Smart Mode'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/50 mt-0.5 hidden sm:block">
                  Waste · Recycling · Composting · Zone 1 & 2 Guidance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowKeyPanel(v => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                title="Connect Gemini API Key for live AI responses"
              >
                <Key className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">API Key</span>
                {showKeyPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              <button
                onClick={() => setMessages([buildWelcome()])}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                title="Reset conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.copilotClear}</span>
              </button>
            </div>
          </div>

          {/* API Key Panel */}
          {showKeyPanel && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
              {hasValidKey ? (
                <div className="flex items-center justify-between bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
                    <span className="text-xs text-emerald-300 font-mono">Key saved: {apiKey.slice(0, 12)}…</span>
                  </div>
                  <button onClick={removeApiKey} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 cursor-pointer">
                    <X className="w-3 h-3" /> Remove
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-emerald-100/60">
                    Paste your{' '}
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline text-[#34D399]">
                      Google AI Studio key
                    </a>{' '}
                    (starts with <code className="bg-white/10 px-1 rounded font-mono">AIza…</code>) to enable live Gemini AI:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKeyInput}
                      onChange={e => setApiKeyInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && apiKeyInput.trim() && saveApiKey()}
                      placeholder="AIzaSy..."
                      className="flex-1 bg-white/10 border border-white/20 focus:border-[#10B981] rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 outline-none transition-colors"
                    />
                    <button
                      onClick={saveApiKey}
                      disabled={!apiKeyInput.trim()}
                      className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] disabled:opacity-40 text-[#0F2E23] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Messages ────────────────────────────────────────────── */}
        <div className="h-[480px] overflow-y-auto p-4 sm:p-5 space-y-4 bg-gray-50/40">
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex gap-2.5 items-end ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-[#0F2E23] text-[#10B981] flex items-center justify-center shrink-0 mb-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`relative group max-w-[88%] sm:max-w-2xl rounded-2xl px-4 py-3 ${
                  isUser
                    ? 'bg-[#0F2E23] text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm shadow-sm'
                }`}>
                  {/* Copy button — appears on hover for bot messages */}
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-400 hover:text-gray-700 transition-all cursor-pointer"
                      title="Copy message"
                    >
                      {copiedId === msg.id
                        ? <Check className="w-3 h-3 text-emerald-600" />
                        : <Copy className="w-3 h-3" />
                      }
                    </button>
                  )}

                  {/* Message content */}
                  {isUser
                    ? <p className="text-sm leading-relaxed">{msg.text}</p>
                    : <MarkdownText text={msg.text} />
                  }

                  {/* Verified source tag */}
                  {!isUser && msg.groundedSources && msg.groundedSources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-[#10B981] shrink-0" />
                      <span className="text-[10px] text-gray-400">{msg.groundedSources[0]}</span>
                    </div>
                  )}

                  <span className={`block text-[10px] font-mono mt-1 ${
                    isUser ? 'text-right text-emerald-200/50' : 'text-left text-gray-400'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-[#10B981] text-[#0F2E23] flex items-center justify-center shrink-0 mb-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-end gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#0F2E23] text-[#10B981] flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[11px] text-gray-400 ml-1">
                    {language === 'mr' ? 'उत्तर तयार होत आहे…' : 'Thinking…'}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Quick Pills ─────────────────────────────────────────── */}
        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex gap-2 overflow-x-auto scrollbar-none">
          {quickPills.map((pill, i) => {
            const Icon = pill.icon;
            return (
              <button
                key={i}
                onClick={() => sendMessage(pill.label)}
                disabled={isTyping}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 hover:text-[#0F2E23] text-xs font-medium rounded-xl whitespace-nowrap transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Icon className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* ── Input Bar ───────────────────────────────────────────── */}
        <form
          onSubmit={e => { e.preventDefault(); sendMessage(); }}
          className="px-3 py-3 bg-white border-t border-gray-100 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isTyping}
            placeholder={
              language === 'mr'
                ? 'कचरा, रिसायकलिंग किंवा विल्हेवाटीबद्दल काहीही विचारा...'
                : 'Ask about any waste item, recycling rules, or composting tips...'
            }
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] disabled:opacity-40 text-white font-bold rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">{t.copilotSend}</span>
          </button>
        </form>
      </div>

      {/* Info note for Smart Mode */}
      {!hasValidKey && (
        <p className="text-center text-xs text-gray-400">
          💡 Running in <strong>Smart Mode</strong> — instant answers from EcoSense knowledge base.{' '}
          Add a{' '}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[#10B981] underline font-medium">
            free Gemini API key
          </a>{' '}
          above to enable live AI responses.
        </p>
      )}
    </div>
  );
};

export default EcoCopilotChat;
