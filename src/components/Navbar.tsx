import React from 'react';
import { Shield, Sparkles, UserCheck, Briefcase, Eye, EyeOff, Search, FileText, Activity } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  activeView: 'recruiter' | 'candidate' | 'landing' | 'audit';
  setActiveView: (view: 'recruiter' | 'candidate' | 'landing' | 'audit') => void;
  blindScreening: boolean;
  setBlindScreening: (val: boolean) => void;
  onOpenAudit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  blindScreening,
  setBlindScreening,
  onOpenAudit
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveView('landing')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">TalentLens<span className="text-cyan-400">.ai</span></span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                Evidence-First
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">AI Talent Intelligence & Verified Matching</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-sm">
          <button
            onClick={() => setActiveView('landing')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'landing'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('recruiter')}
            className={`px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              activeView === 'recruiter'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Recruiter Workspace
          </button>
          <button
            onClick={() => setActiveView('candidate')}
            className={`px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              activeView === 'candidate'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Candidate Portal
          </button>
        </nav>

        {/* Right Controls: Blind Screening & Audit */}
        <div className="flex items-center gap-3">
          {/* Blind Screening Toggle */}
          <button
            onClick={() => setBlindScreening(!blindScreening)}
            title="Toggle Blind Screening Mode to mask candidate demographic identifiers and names"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              blindScreening
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-900/30'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {blindScreening ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
                <span>Blind Mode: <strong className="text-emerald-300">ACTIVE</strong></span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Blind Mode: <strong>OFF</strong></span>
              </>
            )}
          </button>

          {/* Audit Logs button */}
          <button
            onClick={onOpenAudit}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="View Compliance & Audit Trail"
          >
            <Activity className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
