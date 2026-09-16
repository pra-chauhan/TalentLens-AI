import React, { useState } from 'react';
import { CandidateMatchResult, JobRequisition, WhatIfWeights } from '../types';
import { DEFAULT_WEIGHTS, evaluateCandidateMatch } from '../utils/matchingEngine';
import { DEMO_CANDIDATES } from '../data/demoData';
import { Sliders, RefreshCw, ArrowUp, ArrowDown, Minus, CheckCircle, Sparkles, X } from 'lucide-react';

interface WhatIfSimulatorProps {
  job: JobRequisition;
  currentMatches: CandidateMatchResult[];
  blindScreening: boolean;
  onClose: () => void;
  onApplyWeights?: (weights: WhatIfWeights) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  job,
  currentMatches,
  blindScreening,
  onClose
}) => {
  const [weights, setWeights] = useState<WhatIfWeights>({ ...DEFAULT_WEIGHTS });
  const [demoteDocker, setDemoteDocker] = useState(false);
  const [minExpOverride, setMinExpOverride] = useState<number>(job.minExperienceYears);

  // Recalculate candidate matches with modified what-if parameters
  const simulatedMatches = DEMO_CANDIDATES.map(c => {
    return evaluateCandidateMatch(c, job, {
      ...weights,
      minExperienceOverride: minExpOverride,
      demoteSkillToPreferred: demoteDocker ? 'Docker' : undefined
    });
  });

  simulatedMatches.sort((a, b) => b.overallScore - a.overallScore);

  // Map candidate IDs to previous rank
  const originalRankMap: Record<string, number> = {};
  currentMatches.forEach((m, idx) => {
    originalRankMap[m.candidateId] = idx + 1;
  });

  const handlePreset = (preset: 'balanced' | 'growth' | 'senior' | 'projects') => {
    if (preset === 'balanced') {
      setWeights({ ...DEFAULT_WEIGHTS });
      setDemoteDocker(false);
      setMinExpOverride(job.minExperienceYears);
    } else if (preset === 'growth') {
      // High semantic & transferable, lower strict required & experience
      setWeights({
        requiredWeight: 20,
        preferredWeight: 15,
        semanticWeight: 35,
        experienceWeight: 5,
        projectWeight: 20,
        domainWeight: 5
      });
      setDemoteDocker(true);
      setMinExpOverride(2);
    } else if (preset === 'senior') {
      // Strict required & experience
      setWeights({
        requiredWeight: 45,
        preferredWeight: 10,
        semanticWeight: 10,
        experienceWeight: 25,
        projectWeight: 5,
        domainWeight: 5
      });
      setDemoteDocker(false);
      setMinExpOverride(5);
    } else if (preset === 'projects') {
      // Prioritize documented projects & code
      setWeights({
        requiredWeight: 25,
        preferredWeight: 15,
        semanticWeight: 15,
        experienceWeight: 10,
        projectWeight: 30,
        domainWeight: 5
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/95 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-cyan-400 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" />
                What-If Re-Ranking Engine
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">{job.title}</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Hypothesis-Driven Match Simulator
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Simulate how candidate rankings change when requirements, seniority thresholds, and criteria weights shift.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left Controls, Right Results */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Quick Presets */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Scenario Presets:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handlePreset('balanced')}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition font-medium"
                >
                  Balanced Standard
                  <span className="block text-[10px] text-slate-400 font-normal">Default ATS weights</span>
                </button>
                <button
                  onClick={() => handlePreset('growth')}
                  className="p-2 rounded-lg bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-700/60 text-left transition font-medium text-indigo-300"
                >
                  Growth & Transferable
                  <span className="block text-[10px] text-indigo-400/80 font-normal">Credits potential & adjacent tools</span>
                </button>
                <button
                  onClick={() => handlePreset('senior')}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition font-medium"
                >
                  Strict Senior Scale
                  <span className="block text-[10px] text-slate-400 font-normal">Strict years & exact tech</span>
                </button>
                <button
                  onClick={() => handlePreset('projects')}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition font-medium"
                >
                  Portfolio & GitHub
                  <span className="block text-[10px] text-slate-400 font-normal">High project evidence weight</span>
                </button>
              </div>
            </div>

            {/* Slider Slates */}
            <div className="space-y-3.5 bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between font-medium">
                <span>Criteria Weights:</span>
                <button
                  onClick={() => handlePreset('balanced')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* Required Skills */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300 font-medium">Required Skill Coverage</span>
                  <span className="text-indigo-400 font-mono font-bold">{weights.requiredWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={weights.requiredWeight}
                  onChange={e => setWeights({ ...weights, requiredWeight: Number(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Semantic Similarity */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300 font-medium">Semantic Vector Similarity</span>
                  <span className="text-indigo-400 font-mono font-bold">{weights.semanticWeight}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={weights.semanticWeight}
                  onChange={e => setWeights({ ...weights, semanticWeight: Number(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Experience Weight */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300 font-medium">Experience Fit Weight</span>
                  <span className="text-indigo-400 font-mono font-bold">{weights.experienceWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={weights.experienceWeight}
                  onChange={e => setWeights({ ...weights, experienceWeight: Number(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Project Evidence Weight */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300 font-medium">Project & GitHub Evidence</span>
                  <span className="text-indigo-400 font-mono font-bold">{weights.projectWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={weights.projectWeight}
                  onChange={e => setWeights({ ...weights, projectWeight: Number(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Requisition Modifiers */}
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <span className="font-medium text-slate-300 block">Requirement Modifiers:</span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={demoteDocker}
                  onChange={e => setDemoteDocker(e.target.checked)}
                  className="rounded border-slate-700 accent-indigo-600"
                />
                <span className="text-slate-300">
                  Demote <strong>Docker</strong> from Required to Preferred
                </span>
              </label>

              <div className="pt-2 border-t border-slate-700/60">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300">Minimum Experience Threshold:</span>
                  <span className="font-mono text-cyan-400 font-bold">{minExpOverride} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={minExpOverride}
                  onChange={e => setMinExpOverride(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Results Column: Before vs After Rankings (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Simulated Ranking Impact (Top 6)
              </h3>
              <span className="text-xs text-slate-400">
                Computed via Deterministic Hybrid Engine
              </span>
            </div>

            <div className="space-y-2.5">
              {simulatedMatches.slice(0, 6).map((simMatch, newIndex) => {
                const newRank = newIndex + 1;
                const oldRank = originalRankMap[simMatch.candidateId] || newRank;
                const delta = oldRank - newRank; // positive means moved up

                const candidateDisplayName = blindScreening ? simMatch.anonymousId : simMatch.candidateName;

                return (
                  <div
                    key={simMatch.candidateId}
                    className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/70 hover:border-indigo-500/50 transition flex items-center justify-between gap-4 text-xs"
                  >
                    {/* Rank & Movement Badge */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-sm text-slate-200">
                        #{newRank}
                      </div>

                      {/* Delta Indicator */}
                      <div className="w-12 text-center">
                        {delta > 0 && (
                          <span className="inline-flex items-center text-emerald-400 font-bold text-xs">
                            <ArrowUp className="w-3.5 h-3.5 mr-0.5" /> +{delta}
                          </span>
                        )}
                        {delta < 0 && (
                          <span className="inline-flex items-center text-rose-400 font-bold text-xs">
                            <ArrowDown className="w-3.5 h-3.5 mr-0.5" /> {delta}
                          </span>
                        )}
                        {delta === 0 && (
                          <span className="inline-flex items-center text-slate-500 text-xs">
                            <Minus className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      {/* Candidate info */}
                      <div>
                        <div className="font-semibold text-sm text-white flex items-center gap-2">
                          <span>{candidateDisplayName}</span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            ({simMatch.yearsExperience} yrs)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[240px]">
                          {simMatch.title}
                        </div>
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="text-right">
                      <div className="font-bold text-sm text-indigo-300">
                        {simMatch.overallScore}%
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Req: {simMatch.breakdown.requiredCoverage}% • Sem: {simMatch.breakdown.semanticSimilarity}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Simulation Insight:</strong> Notice how candidates with strong projects or transferable capabilities (like Candidate #C3905 with Azure) move up when semantic and project weights increase.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
