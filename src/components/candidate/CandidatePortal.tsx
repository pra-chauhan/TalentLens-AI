import React, { useState, useEffect } from 'react';
import {
  CandidateAnalysisResult,
  ScoreComparisonDiff,
  RewriteMode,
  ResumeOptimizationSuggestion
} from '../../types';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Sliders,
  History,
  RotateCcw,
  Download,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  Info,
  Clock,
  Layers,
  Award,
  Zap,
  Briefcase,
  X,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';

const SUGGESTED_ROLES = [
  'Software Engineer',
  'Software Developer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'AI Engineer',
  'Machine Learning Engineer',
  'Data Scientist',
  'Data Analyst',
  'DevOps Engineer',
  'Cloud Engineer',
  'Site Reliability Engineer (SRE)',
  'Mobile Developer',
  'Cybersecurity Engineer',
  'Product Engineer',
  'Other'
];

const ANALYSIS_STEPS = [
  'Uploading resume document...',
  'Extracting resume text and layout signals...',
  'Understanding document structure and section hierarchy...',
  'Extracting technical skills and competencies...',
  'Analyzing work experience and documented duration...',
  'Understanding target job requirements and seniority...',
  'Comparing resume evidence against job description...',
  'Evaluating ATS compatibility and parsing risks...',
  'Generating prioritized improvement recommendations...',
  'Finalizing personalized talent intelligence report...'
];

export const CandidatePortal: React.FC = () => {
  // Navigation inside candidate portal
  const [candidateSubTab, setCandidateSubTab] = useState<'analyze' | 'results' | 'optimizer' | 'history' | 'versions'>('analyze');

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [customRole, setCustomRole] = useState('');
  const [jobDescription, setJobDescription] = useState(
`Full Stack Developer
Department: Product Engineering
Location: Remote (US)

We are seeking a Full Stack Developer to build performant, customer-facing web applications and distributed APIs.

Key Requirements:
- 3+ years of professional development experience with React and TypeScript.
- Strong proficiency in Node.js, Express, or Python (FastAPI/Django).
- Hands-on experience with PostgreSQL or MySQL (schema design, indexing).
- Practical familiarity with Docker and cloud deployments (AWS or GCP).
- Experience designing and consuming RESTful APIs.

Preferred:
- Experience with Tailwind CSS and Next.js.
- Understanding of automated testing and CI/CD workflows.`
  );

  // Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentAnalysis, setCurrentAnalysis] = useState<CandidateAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Re-analysis & Optimizer State
  const [editorText, setEditorText] = useState('');
  const [activeRewriteMode, setActiveRewriteMode] = useState<RewriteMode>('ats_optimized');
  const [scoreComparison, setScoreComparison] = useState<ScoreComparisonDiff | null>(null);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [copiedSuggestionId, setCopiedSuggestionId] = useState<string | null>(null);

  // History State
  const [pastAnalyses, setPastAnalyses] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load previous analyses on mount
  useEffect(() => {
    loadAnalysesHistory();
  }, []);

  const loadAnalysesHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/candidate/analyses');
      if (res.ok) {
        const data = await res.json();
        setPastAnalyses(data);
        // If there is an existing seed or analysis and currentAnalysis is empty, load the first one
        if (data.length > 0 && !currentAnalysis) {
          const firstDetailRes = await fetch(`/api/candidate/analyses/${data[0].id}`);
          if (firstDetailRes.ok) {
            const firstDetail = await firstDetailRes.json();
            setCurrentAnalysis(firstDetail);
            setEditorText(firstDetail.rawResumeText);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load past analyses:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setAnalysisError(null);
    const validExts = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExts.includes(ext)) {
      setAnalysisError(`Unsupported file format (${ext}). Please upload a PDF, DOC, or DOCX resume document.`);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setAnalysisError('File size exceeds the 25MB limit. Please upload a smaller document.');
      return;
    }

    if (file.size < 50) {
      setAnalysisError('The uploaded file appears to be empty.');
      return;
    }

    setSelectedFile(file);
  };

  const handleAnalyzeResume = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile && !currentAnalysis) {
      setAnalysisError('Please upload a resume file (PDF, DOC, or DOCX) to begin analysis.');
      return;
    }

    if (!jobDescription.trim() || jobDescription.trim().length < 30) {
      setAnalysisError('Please paste a meaningful job description (minimum 30 characters).');
      return;
    }

    const effectiveRole = targetRole === 'Other' ? customRole.trim() || 'Software Engineer' : targetRole;

    setAnalyzing(true);
    setAnalysisError(null);
    setCurrentStepIndex(0);

    // Realistic step progression
    const stepInterval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('resume', selectedFile);
      } else if (currentAnalysis) {
        // Fallback: create blob from existing resume text if user is re-testing
        const blob = new Blob([currentAnalysis.rawResumeText], { type: 'text/plain' });
        formData.append('resume', blob, currentAnalysis.resumeFilename);
      }
      formData.append('targetRole', effectiveRole);
      formData.append('jobDescription', jobDescription);

      const res = await fetch('/api/candidate/upload-and-analyze', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      clearInterval(stepInterval);

      if (!res.ok) {
        throw new Error(data.error?.message || 'Resume analysis failed. Please verify your document.');
      }

      setCurrentAnalysis(data);
      setEditorText(data.rawResumeText);
      setScoreComparison(null);
      setCandidateSubTab('results');
      loadAnalysesHistory();
    } catch (err: any) {
      clearInterval(stepInterval);
      setAnalysisError(err.message || 'Error processing resume document.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReanalyzeFromEditor = async () => {
    if (!editorText.trim() || !currentAnalysis) return;

    setReanalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/candidate/reanalyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          previousAnalysisId: currentAnalysis.id,
          updatedResumeText: editorText,
          targetRole: currentAnalysis.targetRole,
          jobDescription: currentAnalysis.jobDescription
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Re-analysis failed');
      }

      setCurrentAnalysis(data.analysis);
      setScoreComparison(data.scoreComparison);
      loadAnalysesHistory();
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to re-analyze resume');
    } finally {
      setReanalyzing(false);
    }
  };

  const handleModeChange = async (mode: RewriteMode) => {
    setActiveRewriteMode(mode);
    if (!currentAnalysis) return;

    try {
      const res = await fetch('/api/candidate/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: currentAnalysis.id,
          mode
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentAnalysis({
          ...currentAnalysis,
          optimizationSuggestions: data.suggestions
        });
      }
    } catch (err) {
      console.error('Failed to change mode suggestions:', err);
    }
  };

  const applySuggestionToEditor = (sug: ResumeOptimizationSuggestion) => {
    if (editorText.includes(sug.original)) {
      setEditorText(editorText.replace(sug.original, sug.suggested));
    } else {
      setEditorText(prev => `${prev}\n\n// Added ${sug.section} improvement:\n${sug.suggested}`);
    }
    setCopiedSuggestionId(sug.id);
    setTimeout(() => setCopiedSuggestionId(null), 2000);
  };

  const handleOpenPreviousAnalysis = async (id: string) => {
    try {
      const res = await fetch(`/api/candidate/analyses/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentAnalysis(data);
        setEditorText(data.rawResumeText);
        setCandidateSubTab('results');
      }
    } catch (err) {
      console.error('Failed to open previous analysis:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Candidate Sub-Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-900/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">AI Resume Analyzer & ATS Optimizer</h1>
            <p className="text-xs text-slate-400">Self-service real resume parsing, job match scoring, and evidence-first refinement</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setCandidateSubTab('analyze')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              candidateSubTab === 'analyze'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Analyze Resume</span>
          </button>

          <button
            onClick={() => setCandidateSubTab('results')}
            disabled={!currentAnalysis}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 disabled:opacity-40 ${
              candidateSubTab === 'results'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Resume Analysis {currentAnalysis && `(${currentAnalysis.overallScore}/100)`}</span>
          </button>

          <button
            onClick={() => setCandidateSubTab('optimizer')}
            disabled={!currentAnalysis}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 disabled:opacity-40 ${
              candidateSubTab === 'optimizer'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Optimizer & Editor</span>
          </button>

          <button
            onClick={() => setCandidateSubTab('history')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              candidateSubTab === 'history'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Analysis History ({pastAnalyses.length})</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 1. ANALYZE RESUME SCREEN */}
      {/* ------------------------------------------------------------------ */}
      {candidateSubTab === 'analyze' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Analyze Your Resume
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Upload your resume and compare it against your target job to understand exactly where you stand and how to improve.
            </p>
          </div>

          {analysisError && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-300 flex items-start gap-3 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">Validation Notice</p>
                <p className="mt-0.5 leading-relaxed">{analysisError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleAnalyzeResume} className="space-y-6">
            {/* Step 1: Upload Resume File */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs">1</span>
                    Upload Real Resume File
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Accepted formats: <strong className="text-slate-200">PDF, DOC, DOCX, TXT</strong> (Max 25MB)
                  </p>
                </div>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove file</span>
                  </button>
                )}
              </div>

              {!selectedFile ? (
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-8 text-center transition cursor-pointer bg-slate-800/40 hover:bg-slate-800/80 group"
                  onClick={() => document.getElementById('resume-file-input')?.click()}
                >
                  <input
                    id="resume-file-input"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center mx-auto text-cyan-400 group-hover:scale-110 transition shadow-lg shadow-cyan-950/40">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-semibold text-white mt-4">
                    Drag and drop your resume here, or <span className="text-cyan-400 underline underline-offset-2">browse files</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct server-side text extraction with OCR fallback for scanned documents
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-700/50 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white truncate max-w-sm">{selectedFile.name}</p>
                      <p className="text-xs text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Document'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-600/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Ready to Analyze
                    </span>
                    <button
                      type="button"
                      onClick={() => document.getElementById('resume-file-input')?.click()}
                      className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 transition"
                    >
                      Replace
                    </button>
                    <input
                      id="resume-file-input"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Target Job Role */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs">2</span>
                Target Job Role
              </h3>
              <p className="text-xs text-slate-400">
                Select your intended role or specify a custom job title to calibrate industry keyword expectations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1.5 font-medium">Suggested Roles</label>
                  <select
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-cyan-500"
                  >
                    {SUGGESTED_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {targetRole === 'Other' && (
                  <div>
                    <label className="text-slate-300 block mb-1.5 font-medium">Custom Job Role</label>
                    <input
                      type="text"
                      value={customRole}
                      onChange={e => setCustomRole(e.target.value)}
                      placeholder="e.g. Distributed Database Reliability Engineer"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Job Description Input */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs">3</span>
                  Paste Target Job Description
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {jobDescription.length} characters
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Paste the complete job description here. Our engine extracts required vs. preferred criteria and runs deterministic ontology matching.
              </p>

              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                rows={9}
                placeholder="Paste the complete job description here..."
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>

            {/* Analyze CTA or Progress Modal */}
            {analyzing ? (
              <div className="p-6 rounded-2xl bg-slate-900 border border-cyan-500/50 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    Deep Analysis in Progress...
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Stage {currentStepIndex + 1} of {ANALYSIS_STEPS.length}
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStepIndex + 1) / ANALYSIS_STEPS.length) * 100}%` }}
                  />
                </div>

                <p className="text-xs font-medium text-slate-200">
                  {ANALYSIS_STEPS[currentStepIndex]}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!selectedFile && !currentAnalysis}
                  className="py-3 px-8 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-900/30 transition-all hover:scale-[1.01]"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Analyze My Resume</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. COMPLETE RESUME ANALYSIS SCREEN */}
      {/* ------------------------------------------------------------------ */}
      {candidateSubTab === 'results' && currentAnalysis && (
        <div className="space-y-6">
          {/* Header Summary Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Analysis Report
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">{currentAnalysis.resumeFilename}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                Target Role: {currentAnalysis.targetRole}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Evaluated on {new Date(currentAnalysis.createdAt).toLocaleDateString()} with TalentLens Evidence-First Intelligence Engine
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCandidateSubTab('optimizer')}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm shadow-indigo-900/40"
              >
                <Sliders className="w-4 h-4" />
                <span>Improve My Resume</span>
              </button>
              <button
                onClick={() => setCandidateSubTab('analyze')}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
              >
                Upload Another
              </button>
            </div>
          </div>

          {/* Top Score Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Resume Score</span>
              <div className="text-2xl font-extrabold text-white mt-1 flex items-baseline gap-1">
                <span className={currentAnalysis.overallScore >= 75 ? 'text-emerald-400' : 'text-cyan-400'}>
                  {currentAnalysis.overallScore}
                </span>
                <span className="text-xs text-slate-500 font-normal">/100</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Composite index</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">ATS Compatibility</span>
              <div className="text-2xl font-extrabold text-indigo-400 mt-1 flex items-baseline gap-1">
                <span>{currentAnalysis.atsScore.overallScore}</span>
                <span className="text-xs text-slate-500 font-normal">/100</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Estimated parsing fit</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Job Match</span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {currentAnalysis.matchResult.overallScore}%
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Ontology alignment</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Skill Match</span>
              <div className="text-2xl font-extrabold text-cyan-400 mt-1">
                {currentAnalysis.matchResult.breakdown.requiredCoverage}%
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Required skills</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Experience Fit</span>
              <div className="text-2xl font-extrabold text-white mt-1">
                {currentAnalysis.experienceAnalysis.experienceAlignmentPercentage}%
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Years & domain</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Content Quality</span>
              <div className="text-2xl font-extrabold text-purple-400 mt-1">
                {currentAnalysis.qualityScore.contentQuality}%
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Clarity & impact</span>
            </div>
          </div>

          {/* Overall Verdict Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-indigo-700/40 text-xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Overall Verdict</span>
            </div>
            <p className="text-slate-200 text-sm leading-relaxed">
              {currentAnalysis.overallVerdict}
            </p>
          </div>

          {/* ATS COMPATIBILITY SCORE BREAKDOWN */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  TalentLens ATS Compatibility Score: {currentAnalysis.atsScore.overallScore}/100
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Granular breakdown across the 6 core dimensions evaluated by modern applicant tracking systems
                </p>
              </div>
            </div>

            {/* Category breakdown bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-300 font-medium">
                  <span>ATS Parsing Compatibility</span>
                  <span className="font-bold text-indigo-400">{currentAnalysis.atsScore.parsingCompatibility}/20</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(currentAnalysis.atsScore.parsingCompatibility / 20) * 100}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-300 font-medium">
                  <span>Keyword Alignment</span>
                  <span className="font-bold text-cyan-400">{currentAnalysis.atsScore.keywordAlignment}/25</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(currentAnalysis.atsScore.keywordAlignment / 25) * 100}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-300 font-medium">
                  <span>Skills Alignment</span>
                  <span className="font-bold text-emerald-400">{currentAnalysis.atsScore.skillsAlignment}/20</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(currentAnalysis.atsScore.skillsAlignment / 20) * 100}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-300 font-medium">
                  <span>Experience Alignment</span>
                  <span className="font-bold text-amber-400">{currentAnalysis.atsScore.experienceAlignment}/15</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(currentAnalysis.atsScore.experienceAlignment / 15) * 100}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-300 font-medium">
                  <span>Resume Structure</span>
                  <span className="font-bold text-purple-400">{currentAnalysis.atsScore.resumeStructure}/10</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(currentAnalysis.atsScore.resumeStructure / 10) * 100}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-300 font-medium">
                  <span>Job Relevance</span>
                  <span className="font-bold text-blue-400">{currentAnalysis.atsScore.jobRelevance}/10</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(currentAnalysis.atsScore.jobRelevance / 10) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Subtle Disclaimer */}
            <p className="text-[11px] text-slate-500 italic">
              {currentAnalysis.atsScore.disclaimer}
            </p>
          </div>

          {/* TWO COLUMN GRID: STRENGTHS vs WEAKNESSES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Your Strongest Areas
              </h3>
              <p className="text-xs text-slate-400">Every strength is backed by verified evidence in your resume.</p>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {currentAnalysis.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                Where You're Losing Points
              </h3>
              <p className="text-xs text-slate-400">Critical gaps and structural flags impacting your score.</p>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {currentAnalysis.weaknesses.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-rose-400 font-bold shrink-0">{idx + 1}.</span>
                    <span className="leading-relaxed">{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ATS FORMATTING WARNING SYSTEM */}
          {currentAnalysis.atsScore.formatWarnings.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                ATS Formatting Warnings & Recommended Alternatives
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {currentAnalysis.atsScore.formatWarnings.map((warn, i) => (
                  <div key={i} className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-semibold">
                      <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-amber-900/60 border border-amber-600/40">
                        {warn.type}
                      </span>
                      <span>Warning</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{warn.warning}</p>
                    <div className="pt-2 border-t border-amber-700/30 text-amber-200">
                      <strong>Recommended Alternative:</strong> {warn.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESUME STRUCTURE ANALYSIS */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Resume Section Structure Analysis
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
              {currentAnalysis.atsScore.sectionAnalysis.map(sec => (
                <div key={sec.sectionName} className="p-3 rounded-xl bg-slate-800/60 border border-slate-800 text-center space-y-1.5">
                  <div className="font-semibold text-slate-200 truncate" title={sec.sectionName}>
                    {sec.sectionName}
                  </div>
                  <div>
                    {sec.status === 'strong' && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                        ✓ Strong
                      </span>
                    )}
                    {sec.status === 'present' && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-600/40">
                        ✓ Present
                      </span>
                    )}
                    {sec.status === 'weak' && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-600/40">
                        △ Weak
                      </span>
                    )}
                    {sec.status === 'missing' && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-600/40">
                        ✗ Missing
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SKILL GAP ANALYSIS TABLE */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                Skill Gap Analysis
              </h3>
              <span className="text-xs text-slate-400">
                Ethical note: "Missing" means not demonstrated in the uploaded resume.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2.5 px-3">Skill</th>
                    <th className="py-2.5 px-3">JD Requirement</th>
                    <th className="py-2.5 px-3">Resume Evidence</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {currentAnalysis.skillGaps.map((gap, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-3 font-semibold text-white">{gap.skill}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          gap.jdRequirement === 'Required' ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/50' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {gap.jdRequirement}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 max-w-xs truncate" title={gap.evidenceQuote || gap.transferRationale}>
                        {gap.resumeEvidence}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          gap.status === 'MATCH' ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40' :
                          gap.status === 'TRANSFERABLE' ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/40' :
                          gap.status === 'PARTIAL' ? 'bg-amber-950 text-amber-300 border border-amber-600/40' :
                          'bg-rose-950 text-rose-300 border border-rose-600/40'
                        }`}>
                          {gap.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium">
                        <span className={gap.priority === 'High' ? 'text-rose-400' : gap.priority === 'Medium' ? 'text-amber-400' : 'text-slate-400'}>
                          {gap.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ATS KEYWORD RECOMMENDATIONS (ETHICAL RULES) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              ATS Keyword Recommendations
            </h3>
            <p className="text-xs text-slate-400">
              Classified by demonstrated evidence. <strong className="text-rose-400">Never fabricate skills.</strong> Only add keywords you have actually utilized.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {currentAnalysis.missingKeywords.map((item, i) => (
                <div key={i} className={`p-4 rounded-xl border space-y-2 ${
                  item.category === 'Already demonstrated'
                    ? 'bg-emerald-950/30 border-emerald-700/40 text-emerald-200'
                    : item.category === 'Demonstrated indirectly'
                    ? 'bg-cyan-950/30 border-cyan-700/40 text-cyan-200'
                    : 'bg-rose-950/30 border-rose-700/40 text-rose-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{item.keyword}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium border border-current">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{item.recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PRIORITIZED IMPROVEMENT ROADMAP */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              How to Improve Your Resume (Prioritized Action Roadmap)
            </h3>
            <div className="space-y-3 text-xs">
              {currentAnalysis.improvementRoadmap.map(item => (
                <div key={item.priority} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                        Priority {item.priority}
                      </span>
                      <span className={`text-[11px] font-semibold ${
                        item.impact === 'High Impact' ? 'text-rose-400' : item.impact === 'Medium Impact' ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        • {item.impact}
                      </span>
                      <h4 className="font-bold text-white text-sm">{item.title}</h4>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{item.description}</p>
                    <p className="text-cyan-300 pt-1">
                      <strong>Action:</strong> {item.actionableStep}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 3. RESUME OPTIMIZER & IN-BROWSER EDITOR */}
      {/* ------------------------------------------------------------------ */}
      {candidateSubTab === 'optimizer' && currentAnalysis && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                Resume Optimizer & Score Simulator
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Refine wording, apply verified suggestions, and re-analyze to see real BEFORE vs AFTER score changes.
              </p>
            </div>

            {/* Rewrite Modes Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl text-xs">
              <span className="text-slate-400 px-2 font-medium">Mode:</span>
              <button
                onClick={() => handleModeChange('ats_optimized')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  activeRewriteMode === 'ats_optimized' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ATS Optimized
              </button>
              <button
                onClick={() => handleModeChange('stronger')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  activeRewriteMode === 'stronger' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Stronger Impact
              </button>
              <button
                onClick={() => handleModeChange('conservative')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  activeRewriteMode === 'conservative' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Conservative
              </button>
              <button
                onClick={() => handleModeChange('recruiter_friendly')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  activeRewriteMode === 'recruiter_friendly' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Recruiter Friendly
              </button>
            </div>
          </div>

          {/* AI-Generated Content Disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-600/40 text-amber-300 text-xs flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Review disclaimer:</strong> Review suggested changes carefully and only retain information that accurately represents your actual experience. Never fabricate metrics, companies, or skills. If a metric is missing, do not invent one. Instead suggest: <em>"Add a measurable result here if you have one."</em>
            </span>
          </div>

          {/* Score Simulator Difference Banner (if re-analyzed) */}
          {scoreComparison && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-600/50 shadow-xl space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-900/50">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span>Re-Analysis Score Comparison: BEFORE vs AFTER</span>
                </div>
                <div className="flex items-center gap-3 bg-emerald-950/90 border border-emerald-700/50 px-3 py-1.5 rounded-xl">
                  <span className="text-slate-300 font-medium">Previous Score: <strong className="text-slate-100">{scoreComparison.beforeOverall}</strong></span>
                  <span className="text-slate-600">→</span>
                  <span className="text-slate-300 font-medium">New Score: <strong className="text-emerald-400">{scoreComparison.afterOverall}</strong></span>
                  <span className="text-emerald-400 font-extrabold px-2 py-0.5 rounded bg-emerald-900/80 border border-emerald-600/60">
                    Improvement: {scoreComparison.afterOverall - scoreComparison.beforeOverall >= 0 ? `+${scoreComparison.afterOverall - scoreComparison.beforeOverall}` : scoreComparison.afterOverall - scoreComparison.beforeOverall}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Overall Job Match</span>
                  <div className="text-lg font-extrabold text-white mt-0.5">
                    <span className="text-slate-400 line-through text-xs mr-1">{scoreComparison.beforeOverall}</span>
                    <span className="text-emerald-400">{scoreComparison.afterOverall}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400">
                    {scoreComparison.afterOverall >= scoreComparison.beforeOverall ? `+${scoreComparison.afterOverall - scoreComparison.beforeOverall}` : scoreComparison.afterOverall - scoreComparison.beforeOverall} pts
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">ATS Compatibility Score</span>
                  <div className="text-lg font-extrabold text-indigo-300 mt-0.5">
                    <span className="text-slate-400 line-through text-xs mr-1">{scoreComparison.beforeAts}</span>
                    <span className="text-emerald-400">{scoreComparison.afterAts}</span>
                  </div>
                  <span className="text-[10px] text-indigo-400">
                    {scoreComparison.afterAts >= scoreComparison.beforeAts ? `+${scoreComparison.afterAts - scoreComparison.beforeAts}` : scoreComparison.afterAts - scoreComparison.beforeAts} pts
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Skill Coverage</span>
                  <div className="text-lg font-extrabold text-cyan-300 mt-0.5">
                    <span className="text-slate-400 line-through text-xs mr-1">{scoreComparison.beforeSkill}%</span>
                    <span className="text-emerald-400">{scoreComparison.afterSkill}%</span>
                  </div>
                  <span className="text-[10px] text-cyan-400">
                    {scoreComparison.afterSkill >= scoreComparison.beforeSkill ? `+${scoreComparison.afterSkill - scoreComparison.beforeSkill}%` : `${scoreComparison.afterSkill - scoreComparison.beforeSkill}%`}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Experience Fit</span>
                  <div className="text-lg font-extrabold text-purple-300 mt-0.5">
                    <span>{scoreComparison.afterExperience}%</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Domain alignment</span>
                </div>
              </div>

              {/* What improved pills & explanation */}
              <div className="pt-2 border-t border-emerald-900/50 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-300 font-semibold text-[11px]">Exact Metric Changes:</span>
                  {scoreComparison.deltas.atsStructure > 0 && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/40 text-[11px]">
                      ATS Structure: +{scoreComparison.deltas.atsStructure}
                    </span>
                  )}
                  {scoreComparison.deltas.keywordAlignment > 0 && (
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/40 text-[11px]">
                      Keyword Alignment: +{scoreComparison.deltas.keywordAlignment}
                    </span>
                  )}
                  {scoreComparison.deltas.projectRelevance > 0 && (
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/40 text-[11px]">
                      Project Relevance: +{scoreComparison.deltas.projectRelevance}
                    </span>
                  )}
                  {scoreComparison.deltas.contentQuality > 0 && (
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700/40 text-[11px]">
                      Content Quality: +{scoreComparison.deltas.contentQuality}
                    </span>
                  )}
                </div>

                {scoreComparison.textDiffs && scoreComparison.textDiffs.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <span className="text-slate-400 font-semibold text-[11px] block">What Changed in Content:</span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {scoreComparison.textDiffs.map((diff, i) => (
                        <div key={i} className="text-[11px] text-slate-300">
                          <strong className="text-cyan-400">[{diff.section}]:</strong>{' '}
                          {diff.added.length > 0 && (
                            <span className="text-emerald-300">+{diff.added.length} lines refined. </span>
                          )}
                          {diff.removed.length > 0 && (
                            <span className="text-rose-300/80">-{diff.removed.length} lines superseded. </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TWO COLUMN WORKSPACE: SUGGESTIONS vs IN-BROWSER EDITOR */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: AI Suggestions (Original vs Suggested) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Suggested Improvements ({currentAnalysis.optimizationSuggestions.length})
                </h3>
                <span className="text-xs text-slate-400">Click Apply to update editor</span>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {currentAnalysis.optimizationSuggestions.map(sug => (
                  <div key={sug.id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50 font-semibold text-[11px]">
                        {sug.section}
                      </span>
                      <button
                        onClick={() => applySuggestionToEditor(sug)}
                        className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium flex items-center gap-1 transition"
                      >
                        {copiedSuggestionId === sug.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Applied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Apply to Editor</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Original:</div>
                      <div className="p-2.5 rounded bg-slate-900/80 text-rose-300/90 border border-rose-950 line-through">
                        {sug.original}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider">Suggested:</div>
                      <div className="p-2.5 rounded bg-emerald-950/40 text-emerald-200 border border-emerald-800/40">
                        {sug.suggested}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic">
                      Rationale: {sug.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: In-Browser Resume Editor */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    In-Browser Resume Content Editor
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {editorText.length} chars
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Directly edit or fine-tune your resume content. Then re-analyze to recalculate your real ATS and job match scores.
                </p>

                <textarea
                  value={editorText}
                  onChange={e => setEditorText(e.target.value)}
                  rows={20}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setEditorText(currentAnalysis.rawResumeText)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Original</span>
                </button>

                <button
                  type="button"
                  onClick={handleReanalyzeFromEditor}
                  disabled={reanalyzing}
                  className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition"
                >
                  {reanalyzing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Re-evaluating Scores...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Re-analyze Resume</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. ANALYSIS HISTORY & MY RESUMES */}
      {/* ------------------------------------------------------------------ */}
      {candidateSubTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                Previous Analyses & Resume Sessions
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Each analysis session maintains its individual scores and target role calibration.
              </p>
            </div>
            <button
              onClick={() => setCandidateSubTab('analyze')}
              className="py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>New Analysis</span>
            </button>
          </div>

          {loadingHistory ? (
            <div className="py-16 text-center text-xs text-slate-400 space-y-2">
              <div className="w-7 h-7 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Loading analysis history...</p>
            </div>
          ) : pastAnalyses.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800">
              No previous analyses found. Upload your first resume to generate a detailed report.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastAnalyses.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleOpenPreviousAnalysis(item.id)}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/60 transition cursor-pointer shadow-md hover:shadow-cyan-950/30 flex flex-col justify-between gap-4 text-xs group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-0.5 rounded-full font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                        Score: {item.overallScore}/100
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition">
                      {item.targetRole}
                    </h3>
                    <p className="text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.resumeFilename}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-cyan-400 font-medium">
                    <span>ATS Compatibility: {item.atsScore}/100</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition">
                      <span>Open Report</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
