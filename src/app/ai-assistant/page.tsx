'use client';

import React, { useState } from 'react';
import { useDemoContext } from '@/lib/state/demo-context';
import { Bot, Send, User, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Message {
  role: 'assistant' | 'user';
  text: string;
}

export default function AiAssistantPage() {
  const { records } = useDemoContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "Namaste! I am your SwasthyaSetu Health Dossier Assistant. I can help summarize your lab reports, explain conflicting dates, or prepare a concise list of questions for Dr. Ananya Iyer. How may I assist you today?",
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);

    setTimeout(() => {
      let reply = "Based on your verified records in SwasthyaSetu:";
      const lower = userText.toLowerCase();

      if (lower.includes('hba1c') || lower.includes('sugar') || lower.includes('diabetes')) {
        reply = "Your latest HbA1c test from Dr. Lal PathLabs (2026-03-01) was 6.4%, with a fasting plasma glucose of 112 mg/dL. This indicates borderline prediabetes requiring ongoing dietary control and regular monitoring.";
      } else if (lower.includes('lipid') || lower.includes('cholesterol')) {
        reply = "Your fasting lipid profile from AIIMS (2026-01-15) shows Total Cholesterol at 194 mg/dL (< 200 normal) and Triglycerides at 168 mg/dL (borderline elevated). HDL is healthy at 44 mg/dL.";
      } else if (lower.includes('duplicate') || lower.includes('conflict')) {
        reply = "Our reconciliation engine currently has 1 exact hash duplicate and 2 near-duplicate records awaiting review. Additionally, your February Liver Function report has a 16-day date discrepancy between blood draw and release stamp.";
      } else {
        reply = `I analyzed your ${records.length} health records. Your blood pressure (128/82 mmHg) and HbA1c (6.4%) remain stable. Remember that AI summaries are educational and do not replace professional advice from your doctor.`;
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0a1f38]">SwasthyaSetu AI Health Assistant</h1>
            <span className="text-[10px] bg-blue-50 text-[#0d5ca8] font-semibold px-2 py-0.5 rounded border border-blue-200">
              ABDM Private Context
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Privacy-preserving clinical query assistant answering questions directly from your verified dossier.
          </p>
        </div>
      </div>

      {/* Chat Messages Frame */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col h-[520px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex items-start gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="h-7 w-7 rounded-full bg-[#0d5ca8] text-white flex items-center justify-center flex-shrink-0 text-xs mt-1">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`p-3.5 rounded-xl max-w-lg text-xs leading-relaxed ${
                  m.role === 'user' ? 'bg-[#0d5ca8] text-white' : 'bg-slate-100 text-slate-800'
                }`}
              >
                {m.text}
              </div>
              {m.role === 'user' && (
                <div className="h-7 w-7 rounded-full bg-slate-700 text-white flex items-center justify-center flex-shrink-0 text-xs mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex items-center gap-2 bg-slate-50">
          <input
            type="text"
            placeholder="Ask about your cholesterol, HbA1c, or doctor visits..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-[#0d5ca8] focus:outline-none"
          />
          <Button type="submit" variant="gov-orange" size="sm">
            <Send className="h-4 w-4 mr-1" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
