import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  ArrowRightLeft,
  Sliders,
  Layers,
  CheckCircle2,
  XCircle,
  EyeOff,
  GitBranch,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface PublicLandingProps {
  onEnterRecruiter: () => void;
  onEnterCandidate: () => void;
}

export const PublicLanding: React.FC<PublicLandingProps> = ({
  onEnterRecruiter,
  onEnterCandidate
}) => {
  return (
    <div className="space-y-16 py-8 text-slate-100 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center space-y-5 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Evidence-First AI Talent Intelligence Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Explainable Matching Grounded in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">Verifiable Code & Real Experience</span>
        </h1>

        <p className="text-base text-slate-300 leading-relaxed">
          No black-box percentages. TalentLens AI audits candidate resumes, project repositories, and skill ontologies to prove exactly why candidates match, identify transferable capabilities, and estimate realistic learning distance.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onEnterRecruiter}
            className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center gap-2 transition shadow-xl shadow-indigo-950/50"
          >
            <span>Launch Recruiter Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onEnterCandidate}
            className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition"
          >
            <span>Open Candidate Portal</span>
          </button>
        </div>
      </div>

      {/* Comparison Grid: Traditional ATS vs TalentLens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traditional ATS */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <XCircle className="w-5 h-5" />
            <span>The Traditional Keyword ATS Trap</span>
          </div>

          <ul className="space-y-2.5 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 mt-0.5">•</span>
              <span><strong>Opaque Black-Box Scores:</strong> Produces arbitrary numbers (e.g. "87% fit") with zero evidence citations.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 mt-0.5">•</span>
              <span><strong>Brittle Keyword Matching:</strong> Disqualifies top engineers who know Azure simply because the job description typed "AWS".</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 mt-0.5">•</span>
              <span><strong>Unconscious Demographic Bias:</strong> Screens candidates with full visibility into names, universities, and photos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 mt-0.5">•</span>
              <span><strong>Binary Rejection:</strong> Fails candidates who lack one tool even if learning curve is less than 2 weeks.</span>
            </li>
          </ul>
        </div>

        {/* TalentLens AI Solution */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/40 space-y-4 text-xs shadow-xl shadow-indigo-950/20">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>TalentLens Evidence-First Architecture</span>
          </div>

          <ul className="space-y-2.5 text-slate-200">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              <span><strong>Verifiable Evidence Citations:</strong> Every match links directly to production systems, GitHub repos, and quantified metrics.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              <span><strong>Skill Graph & Transferability:</strong> Automatically recognizes equivalent architectural tooling (e.g. AWS ↔ Azure, PyTorch ↔ TensorFlow).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              <span><strong>Native Blind Screening:</strong> Deterministic pseudorandom masking (`Candidate #A102`) prevents gender, ethnic, or age bias.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span><strong>Calculated Learning Distance:</strong> Evaluates adjacent foundational skills to forecast onboarding ramp-up in weeks.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Feature Pillar Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center border border-indigo-800/50">
            <Sliders className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white">What-If Simulator</h4>
          <p className="text-slate-400 leading-relaxed">
            Test how candidate rankings change when requirement weights, degree mandates, or experience minimums shift.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-800/50">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white">Recruiter AI Copilot</h4>
          <p className="text-slate-400 leading-relaxed">
            Ask natural-language questions grounded strictly in candidate evidence records with verified citations.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/50">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white">Blind Screening</h4>
          <p className="text-slate-400 leading-relaxed">
            Strip demographic identifiers and PII to ensure candidates are evaluated purely on technical merit.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
            <GitBranch className="w-4 h-4 text-indigo-400" />
          </div>
          <h4 className="text-sm font-bold text-white">GitHub Verification</h4>
          <p className="text-slate-400 leading-relaxed">
            Cross-reference resume claims with public repository commits, star counts, and active language distributions.
          </p>
        </div>
      </div>
    </div>
  );
};
