import React, { useState } from 'react';
import { ResumeVersionDiff as ResumeVersion } from '../types';
import { GitCommit, ArrowRight, PlusCircle, MinusCircle, CheckCircle2, TrendingUp, FileText, Sparkles } from 'lucide-react';

interface ResumeVersionDiffProps {
  versions: ResumeVersion[];
}

export const ResumeVersionDiff: React.FC<ResumeVersionDiffProps> = ({ versions }) => {
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    versions[0]?.versionId || ''
  );

  if (!versions || versions.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800">
        No prior resume version history recorded yet. Upload a new resume to track historical progression.
      </div>
    );
  }

  const currentVersion = versions.find(v => v.versionId === selectedVersionId) || versions[0];

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <GitCommit className="w-5 h-5 text-indigo-400" />
          Resume Version History & Career Evolution
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Track skill additions, quantified impact metrics, and compatibility score trajectory across uploaded drafts.
        </p>
      </div>

      {/* Version Selector Pills */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {versions.map(v => (
          <button
            key={v.versionId}
            onClick={() => setSelectedVersionId(v.versionId)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 shrink-0 ${
              v.versionId === currentVersion.versionId
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{v.versionName}</span>
            <span className="text-[10px] opacity-75 font-mono">({v.uploadDate})</span>
          </button>
        ))}
      </div>

      {/* Detailed Diff View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Changes Summary (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
              {currentVersion.versionName} Overview
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
                <span className="text-[11px] block opacity-80">Target Role Alignment</span>
                <span className="font-bold text-lg font-mono text-emerald-200">
                  {currentVersion.targetRoleAlignmentScore}%
                </span>
              </div>

              <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-indigo-300">
                <span className="text-[11px] block opacity-80">Clarity Improvement</span>
                <span className="font-bold text-lg font-mono text-indigo-200">
                  {currentVersion.clarityImprovementScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Added Skills */}
          {currentVersion.skillsAdded && currentVersion.skillsAdded.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                Newly Identified & Verified Skills:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentVersion.skillsAdded.map(skill => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 text-[11px] font-medium"
                  >
                    +{skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Removed Skills */}
          {currentVersion.skillsRemoved && currentVersion.skillsRemoved.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <MinusCircle className="w-3.5 h-3.5 text-rose-400" />
                Pruned Legacy Keywords:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentVersion.skillsRemoved.map(skill => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-700/50 text-[11px] font-medium"
                  >
                    -{skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Quantified Expansions (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Quantified Evidence Expansions in this Version
            </span>
            <ul className="space-y-2.5 text-slate-300">
              {currentVersion.evidenceExpansions.map((exp, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{exp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
