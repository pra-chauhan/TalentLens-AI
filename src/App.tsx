import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RecruiterPortal } from './components/recruiter/RecruiterPortal';
import { CandidatePortal } from './components/candidate/CandidatePortal';
import { PublicLanding } from './components/PublicLanding';
import { AuditLogsModal } from './components/AuditLogsModal';
import { Sparkles, ShieldCheck, Activity } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'recruiter' | 'candidate' | 'landing' | 'audit'>('candidate');
  const [blindScreening, setBlindScreening] = useState<boolean>(true);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [systemHealthy, setSystemHealthy] = useState<boolean>(true);

  useEffect(() => {
    // Check system health
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) setSystemHealthy(true);
      } catch {
        setSystemHealthy(false);
      }
    }
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        blindScreening={blindScreening}
        setBlindScreening={setBlindScreening}
        onOpenAudit={() => setShowAuditModal(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeView === 'landing' && (
          <PublicLanding
            onEnterRecruiter={() => setActiveView('recruiter')}
            onEnterCandidate={() => setActiveView('candidate')}
          />
        )}

        {activeView === 'recruiter' && (
          <RecruiterPortal
            blindScreening={blindScreening}
            setBlindScreening={setBlindScreening}
          />
        )}

        {activeView === 'candidate' && (
          <CandidatePortal />
        )}
      </main>

      {/* Audit Logs Modal */}
      {showAuditModal && (
        <AuditLogsModal onClose={() => setShowAuditModal(false)} />
      )}

      {/* Persistent Status Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>TalentLens AI Runtime v1.0.0</span>
            <span>•</span>
            <span className="text-slate-400">Canonical Skill Graph & Deterministic Math Engine</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              EEOC & Blind Screening Compliant
            </span>
            <button
              onClick={() => setShowAuditModal(true)}
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              Inspect Audit Trail
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
