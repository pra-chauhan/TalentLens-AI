import React, { useState, useEffect } from 'react';
import {
  ScreeningBatch,
  ScreeningCandidateRecord,
  CandidateMatchResult,
  JobRequisition
} from '../../types';
import { CandidateCard } from '../CandidateCard';
import { MatchEvidenceModal } from '../MatchEvidenceModal';
import { WhatIfSimulator } from '../WhatIfSimulator';
import { CopilotModal } from '../CopilotModal';
import { InterviewGeneratorModal } from '../InterviewGeneratorModal';
import { JobQualityAnalyzerModal } from '../JobQualityAnalyzerModal';
import {
  Briefcase,
  UploadCloud,
  FileText,
  Search,
  Filter,
  Sliders,
  Sparkles,
  FileSearch,
  ShieldCheck,
  TrendingUp,
  Users,
  Download,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  X,
  PlusCircle,
  History,
  Scale,
  Trash2,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface RecruiterPortalProps {
  blindScreening: boolean;
  setBlindScreening: (val: boolean) => void;
}

export const RecruiterPortal: React.FC<RecruiterPortalProps> = ({
  blindScreening,
  setBlindScreening
}) => {
  // Navigation tabs inside Recruiter Portal
  const [activeTab, setActiveTab] = useState<'screen' | 'results' | 'compare' | 'history' | 'tools'>('screen');

  // New Screening Batch Input State
  const [jobTitle, setJobTitle] = useState('Senior Backend Engineer');
  const [department, setDepartment] = useState('Core Infrastructure');
  const [jobDescription, setJobDescription] = useState(
`Senior Backend Engineer
Department: Core Infrastructure
Location: Remote (US)

About the Role:
We are looking for an experienced Senior Backend Engineer to architect, build, and maintain high-throughput distributed services and data storage pipelines.

Requirements:
- 3+ years of professional backend development with Python.
- Strong hands-on experience with FastAPI or Flask, REST APIs, and microservices architecture.
- Deep expertise in relational databases, particularly PostgreSQL (schema design, indexing, performance tuning).
- Practical experience with Docker and containerized deployment workflows.
- Familiarity with Redis caching and asynchronous queues.

Preferred:
- Experience with Kubernetes and AWS infrastructure.
- Familiarity with TypeScript and modern web frontend integration.`
  );

  // Uploaded Files State
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [duplicateWarnings, setDuplicateWarnings] = useState<string[]>([]);
  const [screeningError, setScreeningError] = useState<string | null>(null);

  // Bulk Processing State
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalToProcess, setTotalToProcess] = useState(0);

  // Active Batch & Candidates State
  const [currentBatch, setCurrentBatch] = useState<ScreeningBatch | null>(null);
  const [screeningHistory, setScreeningHistory] = useState<any[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [minExpFilter, setMinExpFilter] = useState(0);
  const [learningDistanceFilter, setLearningDistanceFilter] = useState('ALL');
  const [recommendationFilter, setRecommendationFilter] = useState('ALL');

  // Candidate Comparison State (selected candidate IDs)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [compareData, setCompareData] = useState<any[]>([]);

  // Existing Intelligence Modals State
  const [inspectMatch, setInspectMatch] = useState<CandidateMatchResult | null>(null);
  const [interviewMatch, setInterviewMatch] = useState<CandidateMatchResult | null>(null);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const [showJobAudit, setShowJobAudit] = useState(false);

  // Load screening history on mount
  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const res = await fetch('/api/recruiter/screening-batches');
      if (res.ok) {
        const data = await res.json();
        setScreeningHistory(data);
        if (data.length > 0 && !currentBatch) {
          // Open latest batch
          const detailRes = await fetch(`/api/recruiter/screening-batches/${data[0].id}`);
          if (detailRes.ok) {
            const batchDetail = await detailRes.json();
            setCurrentBatch(batchDetail);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load screening batches:', err);
    }
  };

  const handleFilesAdded = (newFiles: FileList | null) => {
    if (!newFiles) return;
    setScreeningError(null);

    const validFiles: File[] = [];
    const duplicates: string[] = [];

    const existingNames = new Set(uploadedFiles.map(f => `${f.name}_${f.size}`));

    Array.from(newFiles).forEach(file => {
      const key = `${file.name}_${file.size}`;
      if (existingNames.has(key)) {
        duplicates.push(file.name);
      } else {
        const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
        if (['.pdf', '.doc', '.docx', '.txt'].includes(ext)) {
          validFiles.push(file);
          existingNames.add(key);
        }
      }
    });

    if (duplicates.length > 0) {
      setDuplicateWarnings(prev => Array.from(new Set([...prev, ...duplicates])));
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartScreening = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadedFiles.length === 0) {
      setScreeningError('Please upload at least one candidate resume file (PDF, DOC, or DOCX).');
      return;
    }

    if (!jobDescription.trim() || jobDescription.trim().length < 25) {
      setScreeningError('Please provide a meaningful Job Description.');
      return;
    }

    setProcessing(true);
    setScreeningError(null);
    setTotalToProcess(uploadedFiles.length);
    setProcessedCount(0);

    try {
      // 1. Create screening batch
      const batchRes = await fetch('/api/recruiter/screening-batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          department,
          jobDescription
        })
      });

      const batch = await batchRes.json();
      if (!batchRes.ok) {
        throw new Error(batch.error?.message || 'Failed to create screening batch');
      }

      // 2. Upload and screen all resumes
      const formData = new FormData();
      uploadedFiles.forEach(file => {
        formData.append('resumes', file);
      });

      // Progress animation ticker
      const interval = setInterval(() => {
        setProcessedCount(prev => (prev < uploadedFiles.length ? prev + 1 : prev));
      }, 500);

      const processRes = await fetch(`/api/recruiter/screening-batches/${batch.id}/resumes`, {
        method: 'POST',
        body: formData
      });

      clearInterval(interval);
      const completedBatch = await processRes.json();

      if (!processRes.ok) {
        throw new Error(completedBatch.error?.message || 'Screening batch processing failed');
      }

      setCurrentBatch(completedBatch);
      setUploadedFiles([]);
      setDuplicateWarnings([]);
      setActiveTab('results');
      loadBatches();
    } catch (err: any) {
      setScreeningError(err.message || 'Error during candidate screening process.');
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenBatch = async (batchId: string) => {
    try {
      const res = await fetch(`/api/recruiter/screening-batches/${batchId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentBatch(data);
        setActiveTab('results');
      }
    } catch (err) {
      console.error('Failed to open batch:', err);
    }
  };

  const toggleSelectForCompare = (candidateId: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, candidateId];
    });
  };

  const handleRunComparison = async () => {
    if (!currentBatch || selectedForCompare.length < 2) return;
    try {
      const res = await fetch(`/api/recruiter/screening-batches/${currentBatch.id}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateIds: selectedForCompare })
      });
      if (res.ok) {
        const data = await res.json();
        setCompareData(data);
        setActiveTab('compare');
      }
    } catch (err) {
      console.error('Failed to run comparison:', err);
    }
  };

  // Convert current batch to a mock JobRequisition so existing modals work seamlessly!
  const currentJobReq: JobRequisition = currentBatch
    ? {
        id: currentBatch.id,
        title: currentBatch.jobTitle,
        department: currentBatch.department,
        location: 'Remote',
        workMode: 'Remote',
        seniority: 'Mid',
        minExperienceYears: 3,
        summary: currentBatch.jobDescription.slice(0, 300),
        requirements: currentBatch.candidates[0]?.matchResult.evidenceItems.map((e, idx) => ({
          id: `req-${idx}`,
          skill: e.skill,
          type: e.requirementType,
          importanceWeight: e.requirementType === 'REQUIRED' ? 4 : 2
        })) || [
          { id: 'req-1', skill: 'Python', type: 'REQUIRED', importanceWeight: 4 },
          { id: 'req-2', skill: 'FastAPI', type: 'REQUIRED', importanceWeight: 4 },
          { id: 'req-3', skill: 'PostgreSQL', type: 'REQUIRED', importanceWeight: 3 },
          { id: 'req-4', skill: 'Docker', type: 'PREFERRED', importanceWeight: 2 }
        ],
        responsibilities: ['Architect and scale backend microservices.', 'Collaborate in agile delivery.'],
        createdAt: currentBatch.createdAt.split('T')[0]
      }
    : {
        id: 'job-default',
        title: 'Senior Backend Engineer',
        department: 'Core Infrastructure',
        location: 'Remote',
        workMode: 'Remote',
        seniority: 'Senior',
        minExperienceYears: 3,
        summary: 'Backend Engineer requisition',
        requirements: [],
        responsibilities: [],
        createdAt: new Date().toISOString().split('T')[0]
      };

  // Filter candidates in current batch
  const filteredCandidates = (currentBatch?.candidates || []).filter(c => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = c.candidateName.toLowerCase().includes(q) || c.anonymousId.toLowerCase().includes(q);
      const skillMatch = c.matchResult.matchedRequiredSkills.some(s => s.toLowerCase().includes(q));
      if (!nameMatch && !skillMatch) return false;
    }
    if (minScoreFilter > 0 && c.matchResult.overallScore < minScoreFilter) {
      return false;
    }
    if (minExpFilter > 0 && c.candidateProfile.yearsOfExperience < minExpFilter) {
      return false;
    }
    if (learningDistanceFilter !== 'ALL' && c.matchResult.learningDistance !== learningDistanceFilter) {
      return false;
    }
    if (recommendationFilter !== 'ALL' && c.recommendation !== recommendationFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Recruiter Header & Sub-Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Recruiter Intelligence Workspace</h1>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/60">
              Bulk Screening & Ranking
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Screen real candidate resumes against custom requisitions with explainable evidence matching
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('screen')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'screen' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Screen Candidates</span>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            disabled={!currentBatch}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 disabled:opacity-40 ${
              activeTab === 'results' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Results {currentBatch && `(${currentBatch.candidates.length})`}</span>
          </button>

          <button
            onClick={() => {
              if (selectedForCompare.length >= 2) handleRunComparison();
              else setActiveTab('compare');
            }}
            disabled={!currentBatch}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 disabled:opacity-40 ${
              activeTab === 'compare' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Compare ({selectedForCompare.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'history' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Screening Sessions ({screeningHistory.length})</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 1. SCREEN CANDIDATES (BULK UPLOAD & REQUISITION CREATION) */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'screen' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Screen Candidate Resumes
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Define the requisition criteria, upload a batch of candidate resumes (PDF, DOCX, or DOC), and let TalentLens extract structured evidence and explainable compatibility scores.
            </p>
          </div>

          {screeningError && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-300 flex items-start gap-3 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">Validation Notice</p>
                <p className="mt-0.5 leading-relaxed">{screeningError}</p>
              </div>
            </div>
          )}

          {duplicateWarnings.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-600/50 text-amber-300 flex items-start gap-3 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-200">Duplicate Resume(s) Skipped</p>
                <p className="mt-0.5">
                  The following files were identified as exact duplicates and skipped: {duplicateWarnings.join(', ')}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleStartScreening} className="space-y-6">
            {/* Step 1: Requisition Definition */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
                Requisition Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1.5 font-medium">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1.5 font-medium">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="e.g. Core Infrastructure"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 text-xs font-medium">Job Description</label>
                  <button
                    type="button"
                    onClick={() => setShowJobAudit(true)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <FileSearch className="w-3 h-3" />
                    <span>Audit JD Quality</span>
                  </button>
                </div>
                <textarea
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  rows={8}
                  placeholder="Paste the complete job description here..."
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Step 2: Multi-File Resume Upload */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
                    Upload Candidate Resumes (Batch)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Drag and drop multiple resumes (PDF, DOCX, DOC, TXT). Up to 50 resumes per batch.
                  </p>
                </div>

                {uploadedFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setUploadedFiles([])}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear all ({uploadedFiles.length})</span>
                  </button>
                )}
              </div>

              {/* Drag & drop box */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  handleFilesAdded(e.dataTransfer.files);
                }}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center transition cursor-pointer bg-slate-800/40 hover:bg-slate-800/80 group"
                onClick={() => document.getElementById('recruiter-resumes-input')?.click()}
              >
                <input
                  id="recruiter-resumes-input"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={e => handleFilesAdded(e.target.files)}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center mx-auto text-indigo-400 group-hover:scale-110 transition shadow-lg shadow-indigo-950/40">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <p className="text-sm font-semibold text-white mt-4">
                  Drag and drop multiple candidate resumes, or <span className="text-indigo-400 underline underline-offset-2">browse files</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Automatic duplicate detection via SHA-256 content hashing
                </p>
              </div>

              {/* Uploaded File List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs text-slate-400 font-semibold block">
                    Queued for Ingestion ({uploadedFiles.length} files):
                  </span>
                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 text-xs">
                    {uploadedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span className="text-white font-medium truncate">{file.name}</span>
                          <span className="text-slate-500 text-[11px]">
                            ({(file.size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Screening Progress or CTA */}
            {processing ? (
              <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/50 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    Screening Candidate Resumes...
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {processedCount} of {totalToProcess} resumes processed
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round(((processedCount + 1) / totalToProcess) * 100))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>✓ Text extraction & skill normalization</span>
                  <span>✓ Deterministic ontology scoring</span>
                  <span>⏳ Generating evidence items</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={uploadedFiles.length === 0}
                  className="py-3 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-900/40 transition-all hover:scale-[1.01]"
                >
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>Screen {uploadedFiles.length > 0 ? `${uploadedFiles.length} Candidates` : 'Candidates'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. SCREENING RESULTS PAGE */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'results' && currentBatch && (
        <div className="space-y-6">
          {/* Active Job Requisition Strip */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  <Briefcase className="w-4 h-4" />
                  <span>Active Screening Requisition</span>
                </div>
                <h2 className="text-2xl font-extrabold text-white mt-1">
                  {currentBatch.jobTitle}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentBatch.department} • {currentBatch.candidates.length} Candidates Evaluated • Created on {new Date(currentBatch.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowWhatIf(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/60 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>What-If Simulator</span>
                </button>

                <button
                  onClick={() => setShowCopilot(true)}
                  className="px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/60 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>AI Copilot</span>
                </button>

                <a
                  href={`/api/recruiter/screening-batches/${currentBatch.id}/export`}
                  download
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  <span>Export CSV</span>
                </a>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Screened Pipeline</span>
                <span className="text-lg font-bold text-white mt-0.5 block">{currentBatch.candidates.length} Resumes</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Top Match Score</span>
                <span className="text-lg font-bold text-emerald-400 mt-0.5 block">
                  {currentBatch.candidates[0]?.matchResult.overallScore || 0}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Strong Matches</span>
                <span className="text-lg font-bold text-indigo-400 mt-0.5 block">
                  {currentBatch.candidates.filter(c => c.recommendation === 'Strong Match').length} Candidates
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Ready for Comparison</span>
                <span className="text-lg font-bold text-cyan-400 mt-0.5 block">
                  {selectedForCompare.length} Selected
                </span>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 w-full md:w-auto">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter by name, ID, or skill (e.g. Python, Docker, PostgreSQL)..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Min Score:</span>
                <select
                  value={minScoreFilter}
                  onChange={e => setMinScoreFilter(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
                >
                  <option value="0">All Scores</option>
                  <option value="70">70%+</option>
                  <option value="80">80%+</option>
                  <option value="90">90%+</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Recommendation:</span>
                <select
                  value={recommendationFilter}
                  onChange={e => setRecommendationFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Strong Match">Strong Match</option>
                  <option value="Potential Match">Potential Match</option>
                  <option value="Needs Review">Needs Review</option>
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
                  <option value="LOW">Low Curve</option>
                  <option value="MEDIUM">Medium Curve</option>
                  <option value="HIGH">High Curve</option>
                </select>
              </div>
            </div>
          </div>

          {/* Comparison CTA Bar (Floating if 2+ selected) */}
          {selectedForCompare.length >= 2 && (
            <div className="p-3.5 rounded-xl bg-indigo-950 border border-indigo-600/50 text-xs flex items-center justify-between shadow-xl">
              <span className="text-indigo-200 font-semibold flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-400" />
                <span>{selectedForCompare.length} candidates selected for side-by-side comparison</span>
              </span>
              <button
                onClick={handleRunComparison}
                className="py-1.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Launch Comparison Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Candidate Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Ranked Candidate Screening Pipeline ({filteredCandidates.length})
              </h3>
              <span className="text-xs text-slate-400">
                Select checkbox on card to include in candidate comparison
              </span>
            </div>

            {filteredCandidates.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800">
                No candidates match the specified filter criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCandidates.map((record, idx) => (
                  <div key={record.candidateId} className="relative group">
                    {/* Compare Selection Checkbox */}
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
                      <input
                        type="checkbox"
                        checked={selectedForCompare.includes(record.candidateId)}
                        onChange={() => toggleSelectForCompare(record.candidateId)}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-400 select-none">Compare</span>
                    </div>

                    <CandidateCard
                      match={record.matchResult}
                      rank={idx + 1}
                      blindScreening={blindScreening}
                      onInspectEvidence={m => setInspectMatch(m)}
                      onGenerateInterview={m => setInterviewMatch(m)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 3. CANDIDATE COMPARISON MATRIX */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-400" />
                Side-by-Side Candidate Comparison
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Objective comparison across verified technical depth, project artifacts, and learning curves.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('results')}
              className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
            >
              Back to Candidates
            </button>
          </div>

          {compareData.length < 2 ? (
            <div className="py-16 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <p>Please select at least 2 candidates from the screening results to compare.</p>
              <button
                onClick={() => setActiveTab('results')}
                className="py-1.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs mt-2"
              >
                Go to Candidates List
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400">
                    <th className="py-4 px-4 font-semibold w-48">Metric / Dimension</th>
                    {compareData.map(c => (
                      <th key={c.id} className="py-4 px-4 font-bold text-white min-w-[200px]">
                        <div>{blindScreening ? c.anonymousId : c.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{c.title}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {/* Overall Match */}
                  <tr className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-semibold text-slate-300">Overall Match</td>
                    {compareData.map(c => (
                      <td key={c.id} className="py-3 px-4">
                        <span className="text-base font-extrabold text-emerald-400">
                          {c.overallScore}%
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Recommendation */}
                  <tr className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-semibold text-slate-300">Advisory Fit</td>
                    {compareData.map(c => (
                      <td key={c.id} className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                          {c.recommendation}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Required Skill Coverage */}
                  <tr className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-semibold text-slate-300">Required Skills Coverage</td>
                    {compareData.map(c => (
                      <td key={c.id} className="py-3 px-4 font-bold text-white">
                        {c.requiredCoverage}%
                      </td>
                    ))}
                  </tr>

                  {/* Matched Skills */}
                  <tr className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-semibold text-slate-300">Matched Skills</td>
                    {compareData.map(c => (
                      <td key={c.id} className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {c.matchedSkills.map((s: string) => (
                            <span key={s} className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/40 text-[10px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Missing Skills */}
                  <tr className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-semibold text-slate-300">Skill Gaps</td>
                    {compareData.map(c => (
                      <td key={c.id} className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {c.missingSkills.length > 0 ? (
                            c.missingSkills.map((s: string) => (
                              <span key={s} className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700/40 text-[10px]">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 italic">None</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Transferable Skills */}
                  <tr className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-semibold text-slate-300">Transferable Skills</td>
                    {compareData.map(c => (
                      <td key={c.id} className="py-3 px-4 text-cyan-300 text-[11px]">
                        {c.transferable.join(', ') || 'None identified'}
                      </td>
                    ))}
                  </tr>

                  {/* Learning Distance */}
                  <tr className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-semibold text-slate-300">Learning Curve</td>
                    {compareData.map(c => (
                      <td key={c.id} className="py-3 px-4 font-bold">
                        <span className={c.learningDistance === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}>
                          {c.learningDistance} Distance
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Evidence Strength */}
                  <tr className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-semibold text-slate-300">Evidence Strength</td>
                    {compareData.map(c => (
                      <td key={c.id} className="py-3 px-4 text-slate-200">
                        {c.evidenceStrength}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. SCREENING SESSIONS HISTORY */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                Screening Sessions History
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Reopen previous candidate batches and review historical match scoring.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('screen')}
              className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>New Screening Batch</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {screeningHistory.map(batch => (
              <div
                key={batch.id}
                onClick={() => handleOpenBatch(batch.id)}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/60 transition cursor-pointer shadow-md hover:shadow-indigo-950/30 flex flex-col justify-between gap-4 text-xs group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-500">
                      {new Date(batch.createdAt).toLocaleDateString()}
                    </span>
                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                      Top: {batch.topScore}%
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">
                    {batch.jobTitle}
                  </h3>
                  <p className="text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>{batch.totalResumes} Candidates Screened ({batch.department})</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-indigo-400 font-medium">
                  <span>Status: {batch.status}</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition">
                    <span>Inspect Results</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 5. MODALS FOR CANDIDATE INTELLIGENCE & AUDITS */}
      {/* ------------------------------------------------------------------ */}
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

      {showWhatIf && currentBatch && (
        <WhatIfSimulator
          job={currentJobReq}
          currentMatches={currentBatch.candidates.map(c => c.matchResult)}
          blindScreening={blindScreening}
          onClose={() => setShowWhatIf(false)}
        />
      )}

      {showCopilot && currentBatch && (
        <CopilotModal
          job={currentJobReq}
          onClose={() => setShowCopilot(false)}
        />
      )}

      {showJobAudit && currentBatch && (
        <JobQualityAnalyzerModal
          job={currentJobReq}
          onClose={() => setShowJobAudit(false)}
        />
      )}
    </div>
  );
};
