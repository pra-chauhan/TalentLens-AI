import React from 'react';
import { CandidateMatchResult } from '../types';
import { CheckCircle2, XCircle, ArrowRightLeft, Clock, ShieldCheck, Sparkles, HelpCircle, ChevronRight } from 'lucide-react';

interface CandidateCardProps {
  match: CandidateMatchResult;
  rank: number;
  blindScreening: boolean;
  onInspectEvidence: (match: CandidateMatchResult) => void;
  onGenerateInterview: (match: CandidateMatchResult) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  match,
  rank,
  blindScreening,
  onInspectEvidence,
  onGenerateInterview
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-950/70 border-emerald-500/40';
    if (score >= 70) return 'text-cyan-400 bg-cyan-950/70 border-cyan-500/40';
    if (score >= 50) return 'text-amber-400 bg-amber-950/70 border-amber-500/40';
    return 'text-rose-400 bg-rose-950/70 border-rose-500/40';
  };

  const getDistanceBadge = (dist: 'LOW' | 'MEDIUM' | 'HIGH') => {
    if (dist === 'LOW') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/40">
          Learning Distance: LOW
        </span>
      );
    }
    if (dist === 'MEDIUM') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-600/40">
          Learning Distance: MEDIUM
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-600/40">
        Learning Distance: HIGH
      </span>
    );
  };

  const displayName = blindScreening ? match.anonymousId : match.candidateName;

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 hover:border-slate-700 p-5 transition-all shadow-md hover:shadow-lg hover:shadow-indigo-950/20 flex flex-col justify-between gap-4">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 font-bold text-sm flex items-center justify-center border border-slate-700">
              #{rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white tracking-tight">
                  {displayName}
                </h3>
                {blindScreening && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Blind ID
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{match.title} • {match.yearsExperience} yrs exp</p>
            </div>
          </div>

          {/* Compatibility Score */}
          <div className="text-right">
            <div className={`px-3 py-1 rounded-lg border font-bold text-lg flex items-center gap-1 ${getScoreColor(match.overallScore)}`}>
              <span>{match.overallScore}%</span>
              <span className="text-xs font-normal opacity-80">match</span>
            </div>
          </div>
        </div>

        {/* Compatibility Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
          <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-800">
            <div className="text-slate-400 text-[11px]">Required Coverage</div>
            <div className="font-semibold text-slate-200 mt-0.5 flex items-center justify-between">
              <span>{match.breakdown.requiredCoverage}%</span>
              <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${match.breakdown.requiredCoverage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-800">
            <div className="text-slate-400 text-[11px]">Evidence Strength</div>
            <div className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{match.evidenceStrength}</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-800">
            <div className="text-slate-400 text-[11px]">Experience Fit</div>
            <div className="font-semibold text-slate-200 mt-0.5">
              <span>{match.breakdown.experienceCompatibility}%</span>
            </div>
          </div>
        </div>

        {/* Skills Tag Line */}
        <div className="mt-3.5 space-y-2">
          {/* Matched Skills */}
          {match.matchedRequiredSkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Matched:</span>
              {match.matchedRequiredSkills.slice(0, 4).map(skill => (
                <span key={skill} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-700/40 text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {skill}
                </span>
              ))}
              {match.matchedRequiredSkills.length > 4 && (
                <span className="text-[11px] text-slate-500">+{match.matchedRequiredSkills.length - 4} more</span>
              )}
            </div>
          )}

          {/* Transferable Skills Highlights */}
          {match.transferableHighlights.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] text-cyan-400 font-medium mr-1">Transferable:</span>
              {match.transferableHighlights.map((t, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-700/40 text-[11px]" title={t.rationale}>
                  <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
                  <span>{t.targetSkill}</span>
                  <span className="text-[10px] text-slate-400">← {t.sourceSkill}</span>
                </span>
              ))}
            </div>
          )}

          {/* Missing Required Skills */}
          {match.missingRequiredSkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] text-rose-400 font-medium mr-1">Gaps:</span>
              {match.missingRequiredSkills.map(skill => (
                <span key={skill} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-700/40 text-[11px]">
                  <XCircle className="w-3 h-3 text-rose-400" />
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Learning Distance Summary */}
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
          {getDistanceBadge(match.learningDistance)}
          <span className="text-slate-400 text-[11px] truncate max-w-[200px]" title={match.learningDistanceSummary}>
            {match.learningDistanceSummary}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
        <button
          onClick={() => onInspectEvidence(match)}
          className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition shadow-sm shadow-indigo-900/40"
        >
          <span>Inspect Evidence</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onGenerateInterview(match)}
          className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1 transition"
          title="Generate evidence-targeted interview questions"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Interview Qs</span>
        </button>
      </div>
    </div>
  );
};
