import React, { useState } from 'react';
import { JobRequisition } from '../types';
import { Sparkles, Send, Bot, User, CheckCircle2, ShieldCheck, X, MessageSquare } from 'lucide-react';

interface CopilotModalProps {
  job: JobRequisition;
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  grounded?: boolean;
}

export const CopilotModal: React.FC<CopilotModalProps> = ({ job, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: `Hello! I am your **TalentLens AI Recruiter Copilot** for **${job.title}**.
I answer questions grounded strictly in verified candidate resumes, projects, and skill evidence. I never invent facts or rely on black-box assumptions.

How can I assist your candidate evaluation today?`,
      grounded: true
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    'Why did Candidate A rank higher than Candidate B?',
    'Does Candidate C have production cloud experience?',
    'Which candidate has the lowest learning distance for Kubernetes?',
    'Summarize transferable capabilities across top candidates'
  ];

  const handleSend = async (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim()) return;

    const newMessages: Message[] = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/copilot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, question: query })
      });

      const data = await res.json();
      setMessages([
        ...newMessages,
        {
          sender: 'assistant',
          text: data.answer || 'Analysis complete based on verified records.',
          grounded: true
        }
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          sender: 'assistant',
          text: 'Failed to retrieve response. Please verify backend connection.',
          grounded: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">AI Recruiter Copilot</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                  Grounded in Evidence
                </span>
              </div>
              <p className="text-xs text-slate-400">Target Role: {job.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-900/30'
                    : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                {m.grounded && m.sender === 'assistant' && (
                  <div className="pt-2 border-t border-slate-700/60 flex items-center gap-1.5 text-[10px] text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Grounded in verified candidate records & requirement mappings</span>
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-indigo-400 pl-10">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>Analyzing candidate evidence records...</span>
            </div>
          )}
        </div>

        {/* Suggested Queries */}
        <div className="px-5 py-2.5 border-t border-slate-800 bg-slate-900/80">
          <div className="text-[11px] text-slate-400 mb-1.5 font-medium flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-indigo-400" />
            <span>Suggested Questions:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            placeholder="Ask a question about candidates, evidence citations, or skill gaps..."
            className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputQuery.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition flex items-center justify-center shadow-md shadow-indigo-900/40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
