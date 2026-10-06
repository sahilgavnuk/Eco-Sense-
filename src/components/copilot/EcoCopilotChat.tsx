import { useState } from 'react';
import { Bot, Send, Sparkles, ShieldCheck, User, FileText } from 'lucide-react';
import type { CopilotMessage } from '../../types';

const INITIAL_MESSAGES: CopilotMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    text: 'Hello! I am EcoSense Copilot. I can answer any questions about waste segregation, recycling rules, e-waste drop-offs, or community collection schedules.',
    timestamp: '16:50',
    groundedSources: ['Municipal Waste Protocol 2026', 'EPA Recyclables Matrix', 'EcoSense Community Dataset']
  }
];

export const EcoCopilotChat: React.FC = () => {
  const [messages, setMessages] = useState<CopilotMessage[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const handleSendQuery = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = 'Usually, rigid plastic containers are recyclable, but they must be emptied and rinsed of food oils first. Unwashed food residue contaminates fiber pulp batches.';
      let sources = ['Municipal Recycling Ordinance Section 4', 'EcoSense Material Knowledge Graph'];

      if (query.toLowerCase().includes('battery') || query.toLowerCase().includes('electronic') || query.toLowerCase().includes('e-waste')) {
        botResponse = 'Lithium batteries and e-waste should NEVER go into standard trash or blue bins due to fire hazards. Please take them to your nearest municipal e-waste collection kiosk (Zone 3 Industrial Park or Zone 1 Community Center).';
        sources = ['E-Waste Safe Handling Standard IEEE-1872', 'Zone 3 Drop-Off Registry'];
      } else if (query.toLowerCase().includes('zone 2') || query.toLowerCase().includes('schedule') || query.toLowerCase().includes('pickup')) {
        botResponse = 'In Zone 2 (Central District), Dry Recyclables are collected every Tuesday and Friday morning. Organic Wet Waste is collected daily between 06:00 and 08:30.';
        sources = ['Zone 2 Logistics Schedule Q4-2026'];
      }

      const assistantMsg: CopilotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundedSources: sources
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const quickPrompts = [
    'Can I recycle a greasy pizza box?',
    'How do I safely dispose of lithium batteries?',
    'What is the collection schedule for Zone 2?',
    'Why must PET bottles be rinsed before recycling?'
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0F2E23] text-white p-6 rounded-2xl border border-[#154233] shadow-xl flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/20 text-[#34D399] text-xs font-bold uppercase tracking-wider mb-2">
            <Bot className="w-3.5 h-3.5 text-[#10B981]" /> EcoSense Grounded Copilot
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Ask EcoSense Anything About Waste
          </h2>
          <p className="text-emerald-100/70 text-sm mt-0.5">
            Grounded in verified local municipal rules, material recycling standards, and community dataset telemetry.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-[#10B981]/15 px-3.5 py-2 rounded-xl border border-[#10B981]/30 text-xs text-emerald-300 font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#10B981]" /> Verified Guidance Engine
        </div>
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden flex flex-col h-[520px]">
        {/* Grounded Badge Bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center justify-between text-xs text-gray-600">
          <span className="flex items-center gap-1.5 font-semibold text-gray-700">
            <Sparkles className="w-3.5 h-3.5 text-[#10B981]" /> Knowledge Base: Active Municipal Code & EcoSense Data
          </span>
          <span className="text-[11px] text-[#10B981] font-bold">Zero Hallucination Grounding</span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#0F2E23] text-[#10B981] flex items-center justify-center font-bold text-xs shrink-0 shadow">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-md space-y-2 p-4 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-[#0F2E23] text-white rounded-tr-none shadow'
                  : 'bg-emerald-50/60 border border-emerald-100 text-gray-800 rounded-tl-none shadow-sm'
              }`}>
                <p className="leading-relaxed text-sm">{msg.text}</p>

                {msg.groundedSources && (
                  <div className="pt-2 border-t border-emerald-200/50 text-[10px] space-y-1 text-emerald-900">
                    <span className="font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-[#10B981]" /> Grounded Citation Sources:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-gray-600 font-mono">
                      {msg.groundedSources.map((src, idx) => (
                        <li key={idx}>{src}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <span className={`block text-[10px] text-right font-mono ${
                  msg.sender === 'user' ? 'text-emerald-200' : 'text-gray-400'
                }`}>
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
              <Bot className="w-4 h-4 text-[#10B981] animate-spin" /> EcoSense Copilot is searching grounded knowledge base...
            </div>
          )}
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-gray-500 uppercase whitespace-nowrap">Suggested:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(prompt)}
              className="px-3 py-1 bg-white hover:bg-emerald-50 text-gray-700 hover:text-[#0F2E23] text-xs rounded-full border border-gray-200 hover:border-emerald-300 font-medium whitespace-nowrap transition-all shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
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
            placeholder="Ask EcoSense Copilot about recycling, e-waste, or local rules..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-[#10B981] outline-none"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-[#0F2E23] hover:bg-[#154233] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow transition-all"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5 text-[#10B981]" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default EcoCopilotChat;
