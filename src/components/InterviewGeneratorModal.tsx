import React, { useState, useEffect } from 'react';
import { CandidateMatchResult } from '../types';
import { Sparkles, Copy, Check, X, BookOpen, Layers, ShieldCheck, HelpCircle } from 'lucide-react';

interface InterviewGeneratorModalProps {
  match: CandidateMatchResult;
  blindScreening: boolean;
  onClose: () => void;
}

interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  targetedSkillOrGap: string;
  rationale: string;
  expectedEvidenceSignals: string[];
}

export const InterviewGeneratorModal: React.FC<InterviewGeneratorModalProps> = ({
  match,
  blindScreening,
  onClose
}) => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch('/api/interviews/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId: match.candidateId, jobId: match.jobId })
        });
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (err) {
        console.error('Failed to load interview questions:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [match.candidateId, match.jobId]);

  const displayName = blindScreening ? match.anonymousId : match.candidateName;

  const handleCopyAll = () => {
    const text = questions
      .map(
        (q, i) =>
          `[Question ${i + 1}: ${q.category}]\nTarget: ${q.targetedSkillOrGap}\n${q.question}\nRationale: ${q.rationale}\nWhat to look for:\n- ${q.expectedEvidenceSignals.join('\n- ')}\n`
      )
      .join('\n---\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('Technical')) return <BookOpen className="w-4 h-4 text-indigo-400" />;
    if (category.includes('Project')) return <Layers className="w-4 h-4 text-cyan-400" />;
    if (category.includes('Evidence')) return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    return <HelpCircle className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/95 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Evidence-Grounded Interview Prep
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">{match.jobTitle}</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Targeted Interview Questions for {displayName}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Constructed dynamically to verify documented claims and evaluate learning agility on missing skills.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Synthesizing tailored questions based on candidate evidence...</p>
            </div>
          ) : (
            questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(q.category)}
                    <span className="font-semibold text-slate-200">{q.category}</span>
                    <span className="text-[11px] text-slate-500">•</span>
                    <span className="text-indigo-400 font-mono text-[11px]">
                      Target: {q.targetedSkillOrGap}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Q{idx + 1}</span>
                </div>

                <p className="text-white text-sm font-medium leading-relaxed bg-slate-900/80 p-3.5 rounded-lg border border-slate-800/80">
                  "{q.question}"
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                    <span className="text-slate-400 text-[10px] font-semibold block uppercase mb-1">
                      Why This Question:
                    </span>
                    <p className="text-slate-300 text-[11px] leading-normal">{q.rationale}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                    <span className="text-emerald-400 text-[10px] font-semibold block uppercase mb-1">
                      Evidence Signals to Look For:
                    </span>
                    <ul className="text-slate-300 text-[11px] space-y-0.5 list-disc pl-3">
                      {q.expectedEvidenceSignals.map((sig, i) => (
                        <li key={i}>{sig}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between">
          <button
            onClick={handleCopyAll}
            disabled={loading}
            className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy All Questions'}</span>
          </button>

          <button
            onClick={onClose}
            className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
