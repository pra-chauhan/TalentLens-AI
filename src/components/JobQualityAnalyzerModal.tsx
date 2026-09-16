import React, { useState } from 'react';
import { JobQualityReport, JobRequisition } from '../types';
import { AlertTriangle, CheckCircle2, FileSearch, Sparkles, X, Lightbulb } from 'lucide-react';

interface JobQualityAnalyzerModalProps {
  job: JobRequisition;
  onClose: () => void;
}

export const JobQualityAnalyzerModal: React.FC<JobQualityAnalyzerModalProps> = ({ job, onClose }) => {
  const [report, setReport] = useState<JobQualityReport | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs/analyze-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: job.title,
          description: job.summary,
          requirements: job.requirements
        })
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error('Job analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    runAnalysis();
  }, [job.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/95 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-cyan-400 flex items-center gap-1">
                <FileSearch className="w-3.5 h-3.5" />
                Job Quality & Inclusivity Audit
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">{job.title}</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Requisition Clarity & Anti-Bloat Audit
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Evaluates requirement realism, removes duplicate canonical skills, and flags inflated non-negotiables.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Auditing requisition against canonical skill ontology...</p>
            </div>
          ) : report ? (
            <>
              {/* Score Meter */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Overall Requisition Health Score</span>
                  <div className="text-2xl font-bold text-white mt-0.5">
                    {report.overallScore} / 100
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {report.overallScore >= 80 ? 'Well-structured and realistic requirement scope.' : 'Requisition contains bloat or redundant requirements.'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                    {report.requiredCount} Required / {report.preferredCount} Preferred
                  </span>
                </div>
              </div>

              {/* Duplicate Canonical Skills */}
              {report.duplicatesFound.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 space-y-2 text-xs">
                  <span className="font-semibold text-rose-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Duplicate / Overlapping Skills Detected:
                  </span>
                  <div className="space-y-1 text-slate-300">
                    {report.duplicatesFound.map((dup, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-900/80 border border-slate-800">
                        <strong className="text-white">{dup.skillA}</strong> and <strong className="text-white">{dup.skillB}</strong> ({dup.reason}).
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ambiguity or Excessive Volume Warnings */}
              {report.ambiguousRequirements.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/50 space-y-2 text-xs">
                  <span className="font-semibold text-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Scope Realism Alerts:
                  </span>
                  <div className="space-y-1 text-slate-300">
                    {report.ambiguousRequirements.map((amb, idx) => (
                      <p key={idx} className="leading-relaxed">{amb}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800 space-y-2 text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  Actionable Recommendations:
                </span>
                <ul className="space-y-1.5 text-slate-300 list-disc pl-4">
                  {report.recommendations.map((rec, idx) => (
                    <li key={idx} className="leading-relaxed">{rec}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
