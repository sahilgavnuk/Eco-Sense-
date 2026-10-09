import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, RefreshCw, Copy, Check, User,
  Leaf, BatteryCharging, Trash2, HelpCircle,
  Sparkles, Key, ChevronDown, ChevronUp, ShieldCheck
} from 'lucide-react';
import type { CopilotMessage } from '../../types';
import { useEco } from '../../context/EcoContext';
import { sendCopilotQuery } from '../../services/copilotService';

// ─── Simple Markdown Renderer ─────────────────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Empty line → spacer
    if (line.trim() === '') {
      result.push(<div key={key++} className="h-1" />);
      continue;
    }

    // H3 heading: ### text
    if (line.startsWith('### ')) {
      result.push(
        <h3 key={key++} className="text-sm font-bold text-gray-900 mt-2 mb-0.5">
          {inlineMarkdown(line.slice(4))}
        </h3>
      );
      continue;
    }

    // H2 heading: ## text
    if (line.startsWith('## ')) {
      result.push(
        <h2 key={key++} className="text-sm font-extrabold text-gray-900 mt-2 mb-1">
          {inlineMarkdown(line.slice(3))}
        </h2>
      );
      continue;
    }

    // Bullet: - text or * text
    if (/^[-*✅❌💡🔵🟢🔴⚫♻️⚠️📦📱🍕🍶🥛🌱🩺🌴🏙️🪴💊🌊🔋] /.test(line)) {
      const dash = line.indexOf(' ');
      const bullet = line.slice(0, dash);
      const content = line.slice(dash + 1);
      result.push(
        <div key={key++} className="flex gap-1.5 items-start text-sm leading-relaxed">
          <span className="shrink-0 mt-px">{bullet}</span>
          <span>{inlineMarkdown(content)}</span>
        </div>
      );
      continue;
    }

    // Numbered list: 1. text
    if (/^\d+\. /.test(line)) {
      const dotIdx = line.indexOf('. ');
      const num = line.slice(0, dotIdx + 1);
      const content = line.slice(dotIdx + 2);
      result.push(
        <div key={key++} className="flex gap-1.5 items-start text-sm leading-relaxed">
          <span className="shrink-0 font-bold text-[#10B981]">{num}</span>
          <span>{inlineMarkdown(content)}</span>
        </div>
      );
      continue;
    }

    // Regular paragraph
    result.push(
      <p key={key++} className="text-sm leading-relaxed">
        {inlineMarkdown(line)}
      </p>
    );
  }

  return result;
}

// Inline: **bold**, *italic*, `code`
function inlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith('**')) {
      parts.push(<strong key={m.index} className="font-bold">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*')) {
      parts.push(<em key={m.index}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`')) {
      parts.push(<code key={m.index} className="bg-gray-100 text-emerald-700 px-1 rounded font-mono text-xs">{token.slice(1, -1)}</code>);
    }
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const EcoCopilotChat: React.FC = () => {
  const { language, t } = useEco();

  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ecosense_gemini_key') || '');
  const [showKeyPanel, setShowKeyPanel] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Build welcome message based on language
  const welcomeMsg = (): CopilotMessage => ({
    id: 'welcome',
    sender: 'assistant',
    text: language === 'mr'
      ? `👋 **नमस्कार! मी EcoSense AI Copilot आहे.**\n\nमी तुम्हाला कचरा वर्गीकरण, प्लास्टिक रिसायकलिंग, ई-कचरा सुरक्षितता आणि कंपोस्टिंगबद्दल मार्गदर्शन करतो — कोकण विभाग व NSP/विरार झोनसाठी.\n\n👇 **खाली दिलेल्या बटणांवर क्लिक करा किंवा थेट प्रश्न विचारा!**`
      : `👋 **Hello! I'm EcoSense AI Copilot.**\n\nI provide expert guidance on **waste segregation**, **plastic recycling**, **e-waste safety**, and **composting** — tailored for Zone 1 (Kokan) and Zone 2 (NSP/Virar).\n\n👇 **Tap a quick question below or ask anything!**`,
    timestamp: 'Just now',
    groundedSources: ['EcoSense 2-Zone Protocol', 'CPCB Waste Management Rules']
  });

  useEffect(() => {
    setMessages([welcomeMsg()]);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const query = (text ?? inputQuery).trim();
    if (!query || isTyping) return;

    const userMsg: CopilotMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const history = messages.slice(-8).map(m => ({ sender: m.sender, text: m.text }));
      const response = await sendCopilotQuery(query, history, language, apiKey || undefined);

      const botMsg: CopilotMessage = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundedSources: response.sources
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: language === 'mr'
          ? '🔵 सुका कचरा → निळा डबा\n🟢 ओला कचरा → हिरवा डबा\n🔴 घातक/ई-कचरा → लाल डबा\n⚫ इतर → काळा डबा'
          : '🔵 Dry recyclables → Blue Bin\n🟢 Wet organic → Green Bin\n🔴 Hazardous/E-waste → Red Bin\n⚫ Non-recyclable → Black Bin',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveKey = () => {
    const trimmed = apiKeyInput.trim();
    setApiKey(trimmed);
    localStorage.setItem('ecosense_gemini_key', trimmed);
    setApiKeyInput('');
    setShowKeyPanel(false);
  };

  const quickPills = language === 'mr' ? [
    { icon: Trash2, text: 'दुधाची पिशवी कशी टाकावी?' },
    { icon: BatteryCharging, text: 'जुनी बॅटरी कुठे टाकावी?' },
    { icon: Leaf, text: 'कोकणात कंपोस्टिंग कसे करावे?' },
    { icon: HelpCircle, text: 'नालासोपारा-विरार कचरा नियम' },
    { icon: Sparkles, text: 'पिझ्झा बॉक्स रिसायकल होतो का?' }
  ] : [
    { icon: Trash2, text: 'How to dispose of milk packets?' },
    { icon: BatteryCharging, text: 'Safe battery disposal guide' },
    { icon: Leaf, text: 'Composting tips for Kokan Zone 1' },
    { icon: HelpCircle, text: 'NSP & Virar (Zone 2) waste rules' },
    { icon: Sparkles, text: 'Can I recycle greasy pizza boxes?' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="bg-[#0F2E23] text-white px-5 py-4 rounded-2xl border border-[#154233] shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10B981] text-[#0F2E23] flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold tracking-tight">EcoSense AI Copilot</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#34D399] font-mono text-[10px] font-bold border border-[#10B981]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                  {apiKey ? 'Gemini AI' : 'Smart Mode'}
                </span>
              </div>
              <p className="text-xs text-emerald-100/60 mt-0.5 hidden sm:block">
                Waste segregation · Recycling · Composting · Zone guidance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyPanel(v => !v)}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Connect Gemini API Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">API Key</span>
              {showKeyPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setMessages([welcomeMsg()])}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Clear chat"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.copilotClear}</span>
            </button>
          </div>
        </div>

        {/* API Key Panel */}
        {showKeyPanel && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-emerald-100/70 mb-2">
              Add your{' '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline text-[#34D399]">
                Google AI Studio key
              </a>{' '}
              (starts with <code className="bg-white/10 px-1 rounded">AIza…</code>) to enable live Gemini AI responses:
            </p>
            {apiKey && (
              <div className="flex items-center gap-1.5 mb-2 text-[10px] text-emerald-300 font-mono bg-white/5 rounded-lg px-2 py-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Key saved: {apiKey.slice(0, 8)}…</span>
                <button onClick={() => { setApiKey(''); localStorage.removeItem('ecosense_gemini_key'); }} className="ml-auto text-red-400 hover:text-red-300 text-[10px] cursor-pointer">Remove</button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-[#10B981] transition-colors"
              />
              <button
                onClick={handleSaveKey}
                disabled={!apiKeyInput.trim()}
                className="px-3 py-2 bg-[#10B981] hover:bg-[#059669] disabled:opacity-40 text-[#0F2E23] text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Chat Window ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden flex flex-col h-[520px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-gray-50/30">
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-[#0F2E23] text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[88%] sm:max-w-2xl relative group rounded-2xl px-4 py-3 ${
                  isUser
                    ? 'bg-[#0F2E23] text-white rounded-tr-none'
                    : 'bg-white border border-gray-200 text-gray-900 rounded-tl-none shadow-sm'
                }`}>
                  {/* Copy button */}
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all cursor-pointer"
                    >
                      {copiedId === msg.id
                        ? <Check className="w-3 h-3 text-emerald-600" />
                        : <Copy className="w-3 h-3" />}
                    </button>
                  )}

                  {/* Content — Markdown rendered for assistant, plain for user */}
                  <div className="space-y-0.5 pr-4">
                    {isUser
                      ? <p className="text-sm leading-relaxed">{msg.text}</p>
                      : renderMarkdown(msg.text)
                    }
                  </div>

                  {/* Sources */}
                  {!isUser && msg.groundedSources && msg.groundedSources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1.5 flex-wrap">
                      <ShieldCheck className="w-3 h-3 text-[#10B981] shrink-0" />
                      <span className="text-[10px] text-gray-400 font-medium">
                        {msg.groundedSources[0]}
                      </span>
                    </div>
                  )}

                  <span className={`block text-[10px] font-mono mt-1 text-right ${
                    isUser ? 'text-emerald-200/60' : 'text-gray-400'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-[#10B981] text-[#0F2E23] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#0F2E23] text-[#10B981] flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-gray-400 ml-1">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Pills */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
          {quickPills.map((pill, i) => {
            const Icon = pill.icon;
            return (
              <button
                key={i}
                onClick={() => handleSend(pill.text)}
                disabled={isTyping}
                className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-gray-700 hover:text-[#0F2E23] text-xs rounded-xl border border-gray-200 hover:border-emerald-300 font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
              >
                <Icon className="w-3 h-3 text-[#10B981]" />
                {pill.text}
              </button>
            );
          })}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={e => { e.preventDefault(); handleSend(); }}
          className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            disabled={isTyping}
            placeholder={language === 'mr'
              ? 'कचरा, रिसायकलिंग किंवा विल्हेवाटीबद्दल विचारा...'
              : 'Ask about recycling, plastics, batteries, composting...'}
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#10B981]/40 focus:border-[#10B981] outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] disabled:opacity-40 text-white font-bold text-sm rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default EcoCopilotChat;
