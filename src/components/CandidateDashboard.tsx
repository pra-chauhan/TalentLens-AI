import React, { useState, useEffect } from 'react';
import { CandidateProfile, JobRequisition } from '../types';
import { DEMO_CANDIDATES } from '../data/demoData';
import { SkillGraphView } from './SkillGraphView';
import { ResumeVersionDiff } from './ResumeVersionDiff';
import { GitHubEvidenceView } from './GitHubEvidenceView';
import {
  User,
  UploadCloud,
  Layers,
  GitCommit,
  Github,
  Briefcase,
  Compass,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const CandidateDashboard: React.FC = () => {
  const [candidateList, setCandidateList] = useState<CandidateProfile[]>(DEMO_CANDIDATES);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(DEMO_CANDIDATES[0].id);
  const [activeTab, setActiveTab] = useState<'matches' | 'skills' | 'versions' | 'github' | 'upload'>('matches');

  // Matched jobs for selected candidate
  const [matchedJobs, setMatchedJobs] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Resume Upload State
  const [uploadText, setUploadText] = useState('');
  const [uploadCandidateName, setUploadCandidateName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Versions state
  const [versions, setVersions] = useState<any[]>([]);

  const currentCandidate = candidateList.find(c => c.id === selectedCandidateId) || candidateList[0];

  // Fetch reverse matches when selected candidate changes
  useEffect(() => {
    async function loadMatches() {
      setLoadingMatches(true);
      try {
        const res = await fetch(`/api/matching/candidate/${currentCandidate.id}/jobs`);
        const data = await res.json();
        setMatchedJobs(data);
      } catch (err) {
        console.error('Failed to load matched jobs:', err);
      } finally {
        setLoadingMatches(false);
      }
    }

    async function loadVersions() {
      try {
        const res = await fetch(`/api/resumes/${currentCandidate.id}/versions`);
        const data = await res.json();
        setVersions(data);
      } catch (err) {
        console.error('Failed to load versions:', err);
      }
    }

    loadMatches();
    loadVersions();
  }, [currentCandidate.id]);

  const handleUploadResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadText.trim()) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const res = await fetch('/api/resumes/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'custom_candidate_resume.txt',
          rawText: uploadText,
          candidateName: uploadCandidateName.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Resume upload failed');
      }

      setUploadSuccess(`Successfully parsed ${data.candidate.skills.length} skills and extracted candidate profile!`);
      setCandidateList([data.candidate, ...candidateList]);
      setSelectedCandidateId(data.candidate.id);
      setActiveTab('skills');
      setUploadText('');
      setUploadCandidateName('');
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading resume');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Candidate Profile Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-cyan-900/30">
            {currentCandidate.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{currentCandidate.fullName}</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {currentCandidate.anonymousId}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentCandidate.title} • {currentCandidate.location} • {currentCandidate.yearsOfExperience} yrs experience
            </p>
          </div>
        </div>

        {/* Candidate Switcher Dropdown (for demo inspection) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Switch Candidate:</span>
          <select
            value={selectedCandidateId}
            onChange={e => setSelectedCandidateId(e.target.value)}
            className="text-xs font-medium bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          >
            {candidateList.map(cand => (
              <option key={cand.id} value={cand.id}>
                {cand.fullName} ({cand.title})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('matches')}
          className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'matches'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Reverse Job Matches ({matchedJobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'skills'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Skill Graph & Evidence</span>
        </button>

        <button
          onClick={() => setActiveTab('versions')}
          className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'versions'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span>Resume Versions</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'github'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Github className="w-4 h-4" />
          <span>GitHub Artifacts</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'upload'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New Resume</span>
        </button>
      </div>

      {/* TAB 1: REVERSE JOB MATCHES */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">
              Best-Fit Roles Across Current Openings
            </h3>
            <span className="text-xs text-slate-400">
              Ranked by explainable skill coverage and learning distance
            </span>
          </div>

          {loadingMatches ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Matching your verified profile against requisitions...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchedJobs.map(job => (
                <div
                  key={job.jobId}
                  className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-bold text-white">{job.jobTitle}</h4>
                        <p className="text-slate-400 text-xs mt-0.5">{job.department} • {job.location} ({job.workMode})</p>
                      </div>

                      <div className="text-right">
                        <span className="px-3 py-1 rounded-lg font-bold text-base bg-emerald-950/80 text-emerald-300 border border-emerald-600/40">
                          {job.overallScore}%
                        </span>
                      </div>
                    </div>

                    {/* Matched Skills */}
                    <div className="mt-3.5 space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 font-medium">Your Matched Skills:</span>
                        {job.matchedRequiredSkills.slice(0, 4).map((s: string) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/40 text-[11px] font-medium">
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Transferable Skills */}
                      {job.transferableHighlights.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] text-cyan-400 font-medium">Transferable:</span>
                          {job.transferableHighlights.map((t: any, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/40 text-[11px]" title={t.rationale}>
                              {t.targetSkill} (from your {t.sourceSkill})
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Missing Gaps */}
                      {job.missingRequiredSkills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] text-rose-400 font-medium">Skills to Learn:</span>
                          {job.missingRequiredSkills.map((s: string) => (
                            <span key={s} className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700/40 text-[11px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Learning Distance Footer */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-300">
                      Learning Curve: <strong className="text-cyan-400">{job.learningDistance}</strong>
                    </span>
                    <span className="text-slate-400 truncate max-w-[240px]" title={job.learningDistanceSummary}>
                      {job.learningDistanceSummary}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SKILL GRAPH & EVIDENCE */}
      {activeTab === 'skills' && (
        <SkillGraphView candidate={currentCandidate} />
      )}

      {/* TAB 3: RESUME VERSION DIFF */}
      {activeTab === 'versions' && (
        <ResumeVersionDiff versions={versions} />
      )}

      {/* TAB 4: GITHUB EVIDENCE */}
      {activeTab === 'github' && (
        <GitHubEvidenceView />
      )}

      {/* TAB 5: UPLOAD NEW RESUME */}
      {activeTab === 'upload' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-3xl mx-auto space-y-5 text-xs text-slate-100">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-cyan-400" />
              Upload & Extract Resume Evidence
            </h3>
            <p className="text-slate-400 mt-1 leading-relaxed">
              Paste your resume or CV text below. Our parser extracts verified technologies, aligns them with the canonical skill ontology, and neutralizes prompt injections automatically.
            </p>
          </div>

          {uploadSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {uploadError && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <form onSubmit={handleUploadResume} className="space-y-4">
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Candidate Name (Optional)</label>
              <input
                type="text"
                value={uploadCandidateName}
                onChange={e => setUploadCandidateName(e.target.value)}
                placeholder="e.g. Jordan Miller"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">Resume / Experience Text</label>
              <textarea
                value={uploadText}
                onChange={e => setUploadText(e.target.value)}
                rows={8}
                placeholder="Paste work experience, projects, and skills here... (e.g. Senior Software Engineer with 4 years using Python, FastAPI, Docker, and PostgreSQL...)"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Processed server-side with Gemini 3.8 Flash structured schema extraction
              </span>
              <button
                type="submit"
                disabled={uploading || !uploadText.trim()}
                className="py-2 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium flex items-center gap-2 transition shadow-lg shadow-cyan-900/30"
              >
                {uploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Extracting Evidence...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Parse & Ingest Resume</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
