import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Sparkles, ShieldCheck, User, RefreshCw, Copy, Check,
  Leaf, BatteryCharging, Trash2, HelpCircle
} from 'lucide-react';
import type { CopilotMessage } from '../../types';
import { useEco } from '../../context/EcoContext';
import { sendCopilotQuery } from '../../services/copilotService';

export const EcoCopilotChat: React.FC = () => {
  const { language, t } = useEco();

  const getInitialMessage = (): CopilotMessage => ({
    id: 'welcome-msg',
    sender: 'assistant',
    text: language === 'mr'
      ? `👋 **नमस्कार! मी इकोसेन्स एआय कोपायलट आहे.**\n\nमी आपल्याला कचरा वर्गीकरण, पुनर्वापर, ई-कचरा व खतनिर्मितीबद्दल सोप्या भाषेत माहिती देतो.\n\n👇 **खालील पर्यायांवर क्लिक करा किंवा आपला प्रश्न थेट विचारा!**`
      : `👋 **Hello! I am EcoSense AI Copilot.**\n\nI provide simple, practical advice on **waste segregation**, **plastic recycling**, **e-waste safety**, and **composting** for Kokan & NSP/Virar.\n\n👇 **Tap any quick question below or ask anything!**`,
    timestamp: 'Just now',
    groundedSources: ['EcoSense 2-Zone Standards', 'CPCB Waste Rules']
  });

  const [messages, setMessages] = useState<CopilotMessage[]>([getInitialMessage()]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync initial message when language changes
  useEffect(() => {
    setMessages([getInitialMessage()]);
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendQuery = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isTyping) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const history = messages.slice(-4).map((m) => ({ sender: m.sender, text: m.text }));
      const response = await sendCopilotQuery(query, history, language);

      const assistantMsg: CopilotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundedSources: response.sources
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: CopilotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: language === 'mr'
          ? 'कचरा वर्गीकरणाचे नियम: 🔵 सुका कचरा (स्वच्छ प्लॅस्टिक/कागद), 🟢 ओला कचरा (अन्न/भाजीपाला), 🔴 घातक कचरा (बॅटरी/ई-कचरा).'
          : 'Simple Segregation: 🔵 Blue Bin for clean dry recyclables, 🟢 Green Bin for organic food scraps, 🔴 Red Box for batteries & e-waste.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([getInitialMessage()]);
  };

  const quickPills = language === 'mr' ? [
    { icon: Trash2, text: 'दुधाची पिशवी कशी टाकावी?' },
    { icon: BatteryCharging, text: 'जुनी बॅटरी कुठे टाकावी?' },
    { icon: Leaf, text: 'कोकणात ओला कचरा खत कसा करावा?' },
    { icon: HelpCircle, text: 'नालासोपारा व विरार कचरा नियम' },
    { icon: Sparkles, text: 'प्लॅस्टिक बाटली रिसायकल कशी करावी?' }
  ] : [
    { icon: Trash2, text: 'How to recycle milk packets?' },
    { icon: BatteryCharging, text: 'How to safely dispose of batteries?' },
    { icon: Leaf, text: 'How to compost organic waste in Kokan?' },
    { icon: HelpCircle, text: 'Zone 2 (NSP & Virar) waste rules' },
    { icon: Sparkles, text: 'Can I recycle greasy pizza boxes?' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Sleek Minimal Header */}
      <div className="bg-[#0F2E23] text-white p-5 sm:p-6 rounded-2xl border border-[#154233] shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#10B981] text-[#0F2E23] flex items-center justify-center font-black shadow-md shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">EcoSense AI Copilot</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#34D399] font-mono text-[10px] font-bold border border-[#10B981]/30">
                Online & Ready
              </span>
            </div>
            <p className="text-xs text-emerald-100/70 mt-0.5">
              Instant answers for waste segregation, recycling rules & zone standards.
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          title="Reset conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.copilotClear}</span>
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden flex flex-col h-[540px]">
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-gray-50/40">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#0F2E23] text-[#10B981] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-xl space-y-2 p-4 rounded-2xl relative group ${
                    isUser
                      ? 'bg-[#0F2E23] text-white rounded-tr-none shadow-md'
                      : 'bg-white border border-gray-200/90 text-gray-900 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Copy Button on hover */}
                  {!isUser && (
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all cursor-pointer"
                      title="Copy message"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  {/* Text Content */}
                  <div className="leading-relaxed text-sm whitespace-pre-line break-words">
                    {msg.text}
                  </div>

                  {/* Grounded Citation Badges */}
                  {msg.groundedSources && msg.groundedSources.length > 0 && (
                    <div className="pt-2 border-t border-gray-100 text-[10px] flex flex-wrap items-center gap-1 text-gray-500">
                      <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                      <span className="font-semibold">Verified Source:</span>
                      <span>{msg.groundedSources[0]}</span>
                    </div>
                  )}

                  <span
                    className={`block text-[10px] text-right font-mono ${
                      isUser ? 'text-emerald-200/70' : 'text-gray-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#10B981] text-[#0F2E23] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-gray-600 bg-white p-3 rounded-2xl border border-gray-200 w-fit shadow-xs animate-pulse">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce [animation-delay:0.4s]" />
              <span className="font-medium text-[11px] text-gray-500 ml-1">EcoSense Copilot is typing…</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills Bar */}
        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {quickPills.map((pill, idx) => {
            const Icon = pill.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendQuery(pill.text)}
                disabled={isTyping}
                className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-gray-800 hover:text-[#0F2E23] text-xs rounded-xl border border-gray-200 hover:border-emerald-300 font-semibold whitespace-nowrap transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Icon className="w-3.5 h-3.5 text-[#10B981]" />
                <span>{pill.text}</span>
              </button>
            );
          })}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isTyping}
            placeholder={language === 'mr' ? 'कचरा, रिसायकलिंग किंवा विल्हेवाटीबद्दल काहीही विचारा...' : 'Ask anything about recycling, plastics, batteries, or composting...'}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="px-5 py-3 bg-[#10B981] hover:bg-[#059669] disabled:opacity-40 text-[#0F2E23] font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
          >
            <span>{language === 'mr' ? 'पाठवा' : 'Send'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default EcoCopilotChat;
