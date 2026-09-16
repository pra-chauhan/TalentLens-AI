import React, { useState, useEffect } from 'react';
import { CandidateMatchResult, JobRequisition } from '../types';
import { CandidateCard } from './CandidateCard';
import { MatchEvidenceModal } from './MatchEvidenceModal';
import { WhatIfSimulator } from './WhatIfSimulator';
import { CopilotModal } from './CopilotModal';
import { InterviewGeneratorModal } from './InterviewGeneratorModal';
import { JobQualityAnalyzerModal } from './JobQualityAnalyzerModal';
import {
  Briefcase,
  Search,
  Filter,
  Sliders,
  Sparkles,
  FileSearch,
  PlusCircle,
  ShieldCheck,
  TrendingUp,
  Users,
  Building2,
  MapPin,
  Clock
} from 'lucide-react';

interface RecruiterDashboardProps {
  blindScreening: boolean;
  setBlindScreening: (val: boolean) => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  blindScreening
}) => {
  const [jobs, setJobs] = useState<JobRequisition[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [matches, setMatches] = useState<CandidateMatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [minExpFilter, setMinExpFilter] = useState<number>(0);
  const [learningDistanceFilter, setLearningDistanceFilter] = useState<string>('ALL');

  // Modals state
  const [inspectMatch, setInspectMatch] = useState<CandidateMatchResult | null>(null);
  const [interviewMatch, setInterviewMatch] = useState<CandidateMatchResult | null>(null);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const [showJobAudit, setShowJobAudit] = useState(false);
  const [showCreateJob, setShowCreateJob] = useState(false);

  // New Requisition Form state
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDept, setNewJobDept] = useState('Engineering');
  const [newJobSkills, setNewJobSkills] = useState('Python, FastAPI, Docker, PostgreSQL');

  // Fetch initial jobs
  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await fetch('/api/jobs');
        const data = await res.json();
        setJobs(data);
        if (data.length > 0) {
          setSelectedJobId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load jobs:', err);
      }
    }
    loadJobs();
  }, []);

  // Fetch matches when selected job changes
  useEffect(() => {
    if (!selectedJobId) return;

    async function loadMatches() {
      setLoading(true);
      try {
        const res = await fetch(`/api/matching/job/${selectedJobId}/candidates?blind=${blindScreening}`);
        const data = await res.json();
        setMatches(data);
      } catch (err) {
        console.error('Failed to load matches:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, [selectedJobId, blindScreening]);

  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const handleCreateJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) return;

    const skillList = newJobSkills.split(',').map((s, idx) => ({
      id: `req-${Date.now()}-${idx}`,
      skill: s.trim(),
      type: idx < 3 ? ('REQUIRED' as const) : ('PREFERRED' as const),
      minConfidence: 0.8
    }));

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newJobTitle,
          department: newJobDept,
          minExperienceYears: 3,
          requirements: skillList,
          summary: `Requisition for ${newJobTitle} focusing on high reliability and performance.`
        })
      });
      const created = await res.json();
      setJobs([created, ...jobs]);
      setSelectedJobId(created.id);
      setShowCreateJob(false);
      setNewJobTitle('');
    } catch (err) {
      console.error('Failed to create job:', err);
    }
  };

  // Filter candidates
  const filteredMatches = matches.filter(m => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = m.candidateName.toLowerCase().includes(q) || m.anonymousId.toLowerCase().includes(q);
      const skillMatch = m.matchedRequiredSkills.some(s => s.toLowerCase().includes(q));
      if (!nameMatch && !skillMatch) return false;
    }
    if (minExpFilter > 0 && m.yearsExperience < minExpFilter) {
      return false;
    }
    if (learningDistanceFilter !== 'ALL' && m.learningDistance !== learningDistanceFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Requisition Selector & Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <Briefcase className="w-4 h-4" />
              <span>Active Job Requisition</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <select
                value={selectedJobId}
                onChange={e => setSelectedJobId(e.target.value)}
                className="text-xl font-bold bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-1.5 text-white focus:outline-none focus:border-indigo-500"
              >
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title} ({job.department})
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowCreateJob(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <PlusCircle className="w-4 h-4 text-indigo-400" />
                <span>New Requisition</span>
              </button>
            </div>
          </div>

          {/* Quick Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowWhatIf(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/60 text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
              title="Hypothesis simulator to test criteria shifts"
            >
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>What-If Simulator</span>
            </button>

            <button
              onClick={() => setShowCopilot(true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/60 text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
              title="Ask AI questions grounded strictly in candidate records"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AI Copilot</span>
            </button>

            <button
              onClick={() => setShowJobAudit(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
              title="Audit job description for bloat and duplicate skills"
            >
              <FileSearch className="w-4 h-4 text-slate-400" />
              <span>Audit Requisition</span>
            </button>
          </div>
        </div>

        {/* Job Details Meta Strip */}
        {currentJob && (
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>{currentJob.department}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>{currentJob.location} ({currentJob.workMode})</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Min. {currentJob.minExperienceYears} Years Experience</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{currentJob.requirements.length} Verified Requirements</span>
            </div>
          </div>
        )}
      </div>

      {/* Pipeline Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 block">Total Pipeline</span>
          <div className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>{matches.length} Candidates</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Full evidence extraction</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 block">Top Match Score</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>{matches[0]?.overallScore || 0}%</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Explainable composite</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 block">Screening Protocol</span>
          <div className="text-2xl font-bold text-white mt-1">
            {blindScreening ? (
              <span className="text-emerald-400">Blind Mode Active</span>
            ) : (
              <span className="text-slate-300">Standard View</span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">PII & demographics masked</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 block">Low Learning Distance</span>
          <div className="text-2xl font-bold text-cyan-400 mt-1">
            {matches.filter(m => m.learningDistance === 'LOW').length} Ready
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Transferable skills identified</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter candidates by name, anonymous ID, or skill (e.g. Python, Docker, Azure)..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Experience:</span>
            <select
              value={minExpFilter}
              onChange={e => setMinExpFilter(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
            >
              <option value="0">All Years</option>
              <option value="2">2+ Years</option>
              <option value="4">4+ Years</option>
              <option value="6">6+ Years</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Learning Curve:</span>
            <select
              value={learningDistanceFilter}
              onChange={e => setLearningDistanceFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Levels</option>
              <option value="LOW">Low Distance Only</option>
              <option value="MEDIUM">Medium Distance</option>
              <option value="HIGH">High Distance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ranked Candidate Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Ranked Evidence-First Matches ({filteredMatches.length})
          </h2>
          <span className="text-xs text-slate-400">
            Advisory ranking based on verified resume & repository artifacts
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Evaluating candidate records against ontology rules...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800">
            No candidates found matching the selected search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMatches.map((m, idx) => (
              <CandidateCard
                key={m.candidateId}
                match={m}
                rank={idx + 1}
                blindScreening={blindScreening}
                onInspectEvidence={match => setInspectMatch(match)}
                onGenerateInterview={match => setInterviewMatch(match)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialogs */}
      {inspectMatch && (
        <MatchEvidenceModal
          match={inspectMatch}
          blindScreening={blindScreening}
          onClose={() => setInspectMatch(null)}
          onGenerateInterview={match => {
            setInspectMatch(null);
            setInterviewMatch(match);
          }}
        />
      )}

      {interviewMatch && (
        <InterviewGeneratorModal
          match={interviewMatch}
          blindScreening={blindScreening}
          onClose={() => setInterviewMatch(null)}
        />
      )}

      {showWhatIf && currentJob && (
        <WhatIfSimulator
          job={currentJob}
          currentMatches={matches}
          blindScreening={blindScreening}
          onClose={() => setShowWhatIf(false)}
        />
      )}

      {showCopilot && currentJob && (
        <CopilotModal
          job={currentJob}
          onClose={() => setShowCopilot(false)}
        />
      )}

      {showJobAudit && currentJob && (
        <JobQualityAnalyzerModal
          job={currentJob}
          onClose={() => setShowJobAudit(false)}
        />
      )}

      {/* Create Requisition Modal */}
      {showCreateJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold text-white">Create New Job Requisition</h3>
            <form onSubmit={handleCreateJobSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Job Title</label>
                <input
                  type="text"
                  value={newJobTitle}
                  onChange={e => setNewJobTitle(e.target.value)}
                  placeholder="e.g. Senior Distributed Systems Engineer"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Department</label>
                <input
                  type="text"
                  value={newJobDept}
                  onChange={e => setNewJobDept(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">
                  Required & Preferred Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={newJobSkills}
                  onChange={e => setNewJobSkills(e.target.value)}
                  placeholder="e.g. Python, FastAPI, Docker, Kubernetes, AWS"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  First 3 skills will be classified as REQUIRED; remainder will be PREFERRED.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateJob(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                >
                  Create Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
