import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, RefreshCw, Copy, Check, User,
  Leaf, BatteryCharging, Trash2, HelpCircle,
  Sparkles, Key, ChevronDown, ChevronUp, ShieldCheck, X,
  ArrowRight
} from 'lucide-react';
import type { CopilotMessage } from '../../types';
import { useEco } from '../../context/EcoContext';
import { sendCopilotQuery } from '../../services/copilotService';

// ─── Markdown Renderer ────────────────────────────────────────────────────────
function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        // Empty line spacer
        if (!trimmed) return <div key={i} className="h-1" />;

        // Header lines
        if (/^\*\*[^*]+?\*\*$/.test(trimmed) || /^#{1,3} /.test(trimmed)) {
          return (
            <p key={i} className="font-bold text-gray-900 text-sm leading-snug mt-2 mb-1">
              <InlineText text={trimmed.replace(/^#{1,3} /, '')} />
            </p>
          );
        }

        // Bullet points (-, *, or emojis)
        const bulletMatch = trimmed.match(/^([-*•]|✅|❌|💡|🔵|🟢|🔴|⚫|♻️|⚠️|📦|📱|🍕|🍶|🥛|🌱|🩺|🌴|🏙️|🪴|💊|🌊|🔋|💬|📋|🌿|🎯|👉|→|🚨|🏡|🥥)\s(.+)/);
        if (bulletMatch) {
          return (
            <div key={i} className="flex gap-2 items-start leading-relaxed text-sm text-gray-800">
              <span className="shrink-0 mt-0.5 text-base">{bulletMatch[1]}</span>
              <span className="flex-1"><InlineText text={bulletMatch[2]} /></span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s(.+)/);
        if (numMatch) {
          return (
            <div key={i} className="flex gap-2 items-start leading-relaxed text-sm text-gray-800">
              <span className="shrink-0 font-bold text-[#10B981]">{numMatch[1]}.</span>
              <span className="flex-1"><InlineText text={numMatch[2]} /></span>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={i} className="text-sm text-gray-800 leading-relaxed">
            <InlineText text={trimmed} />
          </p>
        );
      })}
    </div>
  );
}

// Inline parser for bold, italics, code
function InlineText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(<span key={last}>{text.slice(last, m.index)}</span>);
    }
    if (m[2] !== undefined) {
      parts.push(<strong key={m.index} className="font-bold text-gray-900">{m[2]}</strong>);
    } else if (m[3] !== undefined) {
      parts.push(<em key={m.index} className="italic text-gray-700">{m[3]}</em>);
    } else if (m[4] !== undefined) {
      parts.push(
        <code key={m.index} className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded text-xs font-mono font-medium">
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
      ? `👋 **नमस्कार! मी EcoSense AI Copilot आहे.**\n\nमी **कचरा वर्गीकरण, प्लास्टिक पुनर्वापर, ई-कचरा सुरक्षितता आणि खतनिर्मिती** यावर अचूक मार्गदर्शन करतो — **कोकण विभाग (Zone 1)** व **नालासोपारा/विरार (Zone 2)** साठी.\n\n👇 **खाली दिलेल्या कोणत्याही प्रश्नावर टॅप करा किंवा स्वतःचा प्रश्न विचारा!**`
      : `👋 **Hello! I'm EcoSense AI Copilot.**\n\nI provide certified guidance on **waste segregation**, **plastic recycling**, **e-waste safety**, and **composting** — tailored for **Zone 1 (Kokan Region)** and **Zone 2 (NSP East/West & Virar)**.\n\n👇 **Tap a quick question or type your query below!**`,
    timestamp: 'Now',
    groundedSources: ['EcoSense 2-Zone Protocol', 'CPCB Waste Rules 2016'],
    suggestedActions: language === 'mr'
      ? ['दुधाची पिशवी विल्हेवाट', 'बॅटरी कुठे टाकावी?', 'कोकणात खतनिर्मिती कशी करावी?']
      : ['How to recycle milk packets?', 'Safe battery disposal steps', 'Composting in Kokan']
  });

  const [messages, setMessages] = useState<CopilotMessage[]>([buildWelcome()]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showKeyPanel, setShowKeyPanel] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('ecosense_gemini_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  });
  const [apiKeyInput, setApiKeyInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Sync welcome on language switch
  useEffect(() => {
    setMessages([buildWelcome()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Scroll to bottom on updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query || isTyping) return;

    const userMsg: CopilotMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text }));
      const result = await sendCopilotQuery(query, history, language, apiKey || undefined);

      const botMsg: CopilotMessage = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundedSources: result.sources,
        suggestedActions: result.suggestedFollowups
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'assistant',
          text: language === 'mr'
            ? '🔵 **सुका कचरा** → निळा डबा\n🟢 **ओला कचरा** → हिरवा डबा\n🔴 **घातक/ई-कचरा** → लाल डबा\n⚫ **इतर कचरा** → काळा डबा'
            : '🔵 **Dry Recyclables** → Blue Bin\n🟢 **Wet Organic** → Green Bin\n🔴 **Hazardous & E-Waste** → Red Bin\n⚫ **Non-Recyclable Reject** → Black Bin',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          groundedSources: ['EcoSense Standards']
        }
      ]);
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
    { icon: Leaf,            label: 'कोकणात खतनिर्मिती कशी करावी?' },
    { icon: HelpCircle,      label: 'नालासोपारा-विरार कचरा नियम' },
    { icon: Sparkles,        label: 'पिझ्झा बॉक्स रिसायकल होतो का?' }
  ] : [
    { icon: Trash2,          label: 'How to recycle milk packets?' },
    { icon: BatteryCharging, label: 'Safe battery disposal steps' },
    { icon: Leaf,            label: 'Composting tips for Kokan Zone 1' },
    { icon: HelpCircle,      label: 'NSP & Virar Zone 2 waste rules' },
    { icon: Sparkles,        label: 'Can I recycle greasy pizza boxes?' }
  ];

  const hasConfiguredKey = Boolean(apiKey && apiKey.trim().length > 6);

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-[#0F2E23] rounded-full text-xs font-semibold border border-emerald-200">
          <Bot className="w-3.5 h-3.5 text-[#10B981]" />
          {t.copilotBadge}
        </span>
        <h1 className="text-3xl font-extrabold text-[#0F2E23]">{t.copilotTitle}</h1>
        <p className="text-sm text-gray-600 max-w-xl mx-auto">{t.copilotDesc}</p>
      </div>

      {/* ── Copilot Main Card ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden flex flex-col">
        {/* Card Header */}
        <div className="bg-[#0F2E23] px-5 py-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981] text-[#0F2E23] flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-bold text-sm sm:text-base">EcoSense AI Copilot</span>
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border bg-[#10B981]/20 text-[#34D399] border-[#10B981]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                    {hasConfiguredKey ? 'Live AI Active' : 'Smart Knowledge Engine'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/60 mt-0.5">
                  Waste Segregation · 2-Zone Compliance (Kokan & NSP/Virar) · 24/7 AI Guidance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowKeyPanel((v) => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                title="Configure Google Gemini API Key"
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

          {/* Collapsible API Key Drawer */}
          {showKeyPanel && (
            <div className="mt-3.5 pt-3.5 border-t border-white/10 space-y-2">
              {hasConfiguredKey ? (
                <div className="flex items-center justify-between bg-[#10B981]/15 border border-[#10B981]/30 rounded-xl px-3.5 py-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#34D399]" />
                    <span className="text-xs text-emerald-200 font-mono">
                      Active API Key: {apiKey.slice(0, 10)}…{apiKey.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={removeApiKey}
                    className="text-red-300 hover:text-red-200 text-xs flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-emerald-100/70">
                    Paste your{' '}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-[#34D399] font-medium"
                    >
                      Google AI Studio API Key
                    </a>{' '}
                    to enable direct generative model responses:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && apiKeyInput.trim() && saveApiKey()}
                      placeholder="Paste Gemini API Key here..."
                      className="flex-1 bg-white/10 border border-white/20 focus:border-[#10B981] rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/40 outline-none transition-colors"
                    />
                    <button
                      onClick={saveApiKey}
                      disabled={!apiKeyInput.trim()}
                      className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] disabled:opacity-40 text-[#0F2E23] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Save Key
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Messages Stream ────────────────────────────────────── */}
        <div className="h-[490px] overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex gap-2.5 items-end ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-[#0F2E23] text-[#10B981] flex items-center justify-center shrink-0 mb-0.5 shadow-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`relative group max-w-[88%] sm:max-w-2xl rounded-2xl px-4 py-3.5 ${
                    isUser
                      ? 'bg-[#0F2E23] text-white rounded-br-none shadow-sm'
                      : 'bg-white border border-gray-200/90 text-gray-900 rounded-bl-none shadow-sm'
                  }`}
                >
                  {/* Hover Copy Button */}
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="absolute -top-2.5 -right-2.5 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  {/* Body Content */}
                  {isUser ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <MarkdownText text={msg.text} />
                  )}

                  {/* Source citations */}
                  {!isUser && msg.groundedSources && msg.groundedSources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center gap-1.5 flex-wrap">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                      <span className="text-[10px] text-gray-400 font-medium">
                        Standard: {msg.groundedSources[0]}
                      </span>
                    </div>
                  )}

                  {/* Suggested Followups */}
                  {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((f, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(f)}
                          disabled={isTyping}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-medium rounded-lg border border-emerald-200 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <span>{f}</span>
                          <ArrowRight className="w-2.5 h-2.5 text-emerald-600" />
                        </button>
                      ))}
                    </div>
                  )}

                  <span
                    className={`block text-[10px] font-mono mt-1.5 ${
                      isUser ? 'text-right text-emerald-200/60' : 'text-left text-gray-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-[#10B981] text-[#0F2E23] flex items-center justify-center shrink-0 mb-0.5 shadow-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-end gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#0F2E23] text-[#10B981] flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[11px] text-gray-500 font-medium ml-1">
                    {language === 'mr' ? 'उत्तर तयार होत आहे…' : 'Analyzing disposal protocols…'}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Quick Suggestion Pills Bar ────────────────────────── */}
        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
          {quickPills.map((pill, i) => {
            const Icon = pill.icon;
            return (
              <button
                key={i}
                onClick={() => sendMessage(pill.label)}
                disabled={isTyping}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 hover:text-[#0F2E23] text-xs font-medium rounded-xl whitespace-nowrap transition-all shadow-2xs cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Icon className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* ── User Input Form ────────────────────────────────────── */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder={
              language === 'mr'
                ? 'कचरा, रिसायकलिंग किंवा विल्हेवाटीबद्दल काहीही विचारा...'
                : 'Ask about any waste item, recycling rules, composting, or zone protocol...'
            }
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] disabled:opacity-40 text-[#0F2E23] font-bold text-sm rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
          >
            <span>{t.copilotSend}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default EcoCopilotChat;
