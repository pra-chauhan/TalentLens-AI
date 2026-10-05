import React, { useState } from 'react';
import { CandidateMatchResult, MatchEvidenceItem } from '../types';
import {
  X,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  ShieldCheck,
  Award,
  BookOpen,
  Calendar,
  FileCode,
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface MatchEvidenceModalProps {
  match: CandidateMatchResult | null;
  blindScreening: boolean;
  onClose: () => void;
  onGenerateInterview: (match: CandidateMatchResult) => void;
}

export const MatchEvidenceModal: React.FC<MatchEvidenceModalProps> = ({
  match,
  blindScreening,
  onClose,
  onGenerateInterview
}) => {
  if (!match) return null;

  const [activeTab, setActiveTab] = useState<'requirements' | 'transferable' | 'breakdown' | 'timeline'>('requirements');

  const displayName = blindScreening ? match.anonymousId : match.candidateName;

  const getMatchBadge = (type: string) => {
    switch (type) {
      case 'MATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-600/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            MATCH
          </span>
        );
      case 'TRANSFERABLE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-600/40">
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
            TRANSFERABLE
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-600/40">
            PARTIAL
          </span>
        );
      case 'MISSING':
      case 'MISSING / NOT DEMONSTRATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-600/40">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            MISSING / NOT DEMONSTRATED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/90 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-cyan-400">
                Evidence-First Match Audit
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">{match.jobTitle}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1 flex items-center gap-3">
              <span>{displayName}</span>
              <span className="text-base font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                {match.overallScore}% Overall Match
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {match.title} • {match.yearsExperience} years documented experience
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tab Controls */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 text-xs font-medium bg-slate-900/60">
          <button
            onClick={() => setActiveTab('requirements')}
            className={`pb-3 px-2 border-b-2 transition ${
              activeTab === 'requirements'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Requirements & Evidence Citations ({match.evidenceItems.length})
          </button>
          <button
            onClick={() => setActiveTab('transferable')}
            className={`pb-3 px-2 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'transferable'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Transferable Skills ({match.transferableHighlights.length})
          </button>
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`pb-3 px-2 border-b-2 transition ${
              activeTab === 'breakdown'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Component Weights & Formula
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 px-2 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Evidence Timeline
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Executive Summary Card */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <div className="text-slate-400">Required Skills Coverage</div>
              <div className="text-base font-bold text-slate-100 mt-0.5">
                {match.breakdown.requiredCoverage}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {match.matchedRequiredSkills.length} matched / {match.missingRequiredSkills.length} missing
              </div>
            </div>

            <div>
              <div className="text-slate-400">Skill Learning Distance</div>
              <div className="text-base font-bold text-slate-100 mt-0.5 flex items-center gap-1.5">
                <span>{match.learningDistance}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {match.learningDistanceSummary}
              </div>
            </div>

            <div>
              <div className="text-slate-400">Evidence Reliability</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>{match.evidenceStrength} Verification</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Direct resume & repository citations
              </div>
            </div>
          </div>

          {/* TAB 1: REQUIREMENTS TABLE */}
          {activeTab === 'requirements' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Requirement-by-Requirement Evidence Trace
              </h3>
              <div className="space-y-3">
                {match.evidenceItems.map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-100">{item.skill}</span>
                        <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold ${
                          item.requirementType === 'REQUIRED'
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/50'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {item.requirementType}
                        </span>
                      </div>
                      <div>{getMatchBadge(item.matchType)}</div>
                    </div>

                    {/* Evidence Quote / Rationale */}
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
                      <div className="text-slate-400 text-[11px] mb-1 font-medium flex items-center justify-between">
                        <span>Verified Evidence Citation:</span>
                        {item.evidenceSource !== 'none' && (
                          <span className="text-[10px] uppercase text-cyan-400">
                            Source: {item.evidenceSource} • {(item.confidence * 100).toFixed(0)}% confidence
                          </span>
                        )}
                      </div>
                      <blockquote className="text-slate-200 italic pl-2 border-l-2 border-indigo-500">
                        "{item.candidateEvidence}"
                      </blockquote>
                      {item.transferRationale && (
                        <div className="mt-2 text-[11px] text-cyan-300 bg-cyan-950/40 p-2 rounded border border-cyan-800/40">
                          <strong>Transferability Analysis:</strong> {item.transferRationale}
                        </div>
                      )}
                      {item.learningDistance && item.matchType === 'MISSING' && (
                        <div className="mt-2 text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-800/40">
                          <strong>Learning Distance ({item.learningDistance}):</strong> {item.learningDistanceRationale}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TRANSFERABLE SKILLS */}
          {activeTab === 'transferable' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200">
                <div className="font-semibold text-sm text-cyan-100 flex items-center gap-1.5 mb-1">
                  <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                  Why TalentLens Recognizes Transferable Skills
                </div>
                Rather than penalizing candidates who haven't worked with an exact vendor or brand name, our Skill Ontology evaluates equivalent architecture, concepts, and tooling (e.g. AWS vs Azure, PyTorch vs TensorFlow).
              </div>

              {match.transferableHighlights.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No indirect transferable skills required; candidate possesses direct exact matches.
                </div>
              ) : (
                <div className="space-y-3">
                  {match.transferableHighlights.map((t, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <span className="text-slate-100">{t.targetSkill}</span>
                          <span className="text-slate-500">←</span>
                          <span className="text-cyan-300">{t.sourceSkill}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-200 text-[10px] font-bold">
                          Transferable Capability
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                        {t.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BREAKDOWN & MATHEMATICS */}
          {activeTab === 'breakdown' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Deterministic Composite Score Calculation
              </h3>
              <p className="text-xs text-slate-400">
                TalentLens AI computes the overall compatibility score using a weighted sum of explainable engineering factors:
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">Required Skills Coverage (Weight: 35%)</span>
                    <p className="text-[11px] text-slate-400">Direct or transferable coverage of non-negotiable requirements</p>
                  </div>
                  <span className="font-bold text-sm text-slate-100">{match.breakdown.requiredCoverage}%</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">Semantic Vector Similarity (Weight: 20%)</span>
                    <p className="text-[11px] text-slate-400">Cosine similarity between career summary corpus and job context</p>
                  </div>
                  <span className="font-bold text-sm text-slate-100">{match.breakdown.semanticSimilarity}%</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">Preferred Skills Coverage (Weight: 15%)</span>
                    <p className="text-[11px] text-slate-400">Bonus technologies and secondary qualifications</p>
                  </div>
                  <span className="font-bold text-sm text-slate-100">{match.breakdown.preferredCoverage}%</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">Experience Compatibility (Weight: 15%)</span>
                    <p className="text-[11px] text-slate-400">Verified tenure vs minimum required years</p>
                  </div>
                  <span className="font-bold text-sm text-slate-100">{match.breakdown.experienceCompatibility}%</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">Project & Repository Evidence (Weight: 10%)</span>
                    <p className="text-[11px] text-slate-400">Open source code, production projects, and impact metrics</p>
                  </div>
                  <span className="font-bold text-sm text-slate-100">{match.breakdown.projectEvidenceScore}%</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">Domain Alignment (Weight: 5%)</span>
                    <p className="text-[11px] text-slate-400">Industry and architecture specialization alignment</p>
                  </div>
                  <span className="font-bold text-sm text-slate-100">{match.breakdown.domainAlignment}%</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EVIDENCE TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Skill Acquisition & Evidence Timeline
              </h3>
              <div className="relative pl-6 border-l-2 border-slate-700 space-y-6 text-xs">
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
                  <div className="text-[11px] text-emerald-400 font-mono">2024 - 2026 (Recent)</div>
                  <div className="font-semibold text-sm text-slate-100 mt-0.5">High-Throughput Model Serving & Cloud Architecture</div>
                  <p className="text-slate-300 mt-1 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                    Documented production work with FastAPI, Python 3.11, Docker, and Cloud infrastructure handling multi-million daily requests.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-2 border-slate-900" />
                  <div className="text-[11px] text-indigo-400 font-mono">2022 - 2024</div>
                  <div className="font-semibold text-sm text-slate-100 mt-0.5">Backend Database Optimization & Relational Querying</div>
                  <p className="text-slate-300 mt-1 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                    Engineered high-concurrency SQL schemas, indexing strategies, and automated CI/CD deployment pipelines.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-cyan-500 border-2 border-slate-900" />
                  <div className="text-[11px] text-cyan-400 font-mono">2021</div>
                  <div className="font-semibold text-sm text-slate-100 mt-0.5">Computer Science Academic Foundation</div>
                  <p className="text-slate-300 mt-1 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                    Bachelor of Science degree; foundational coursework in algorithms, operating systems, distributed architectures, and machine learning.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Audit ID: <span className="font-mono text-slate-300">AUD-EVID-{match.candidateId.slice(-6)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onGenerateInterview(match);
              }}
              className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Targeted Interview Questions
            </button>
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
