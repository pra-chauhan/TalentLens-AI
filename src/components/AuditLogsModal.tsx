import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../types';
import { Activity, Shield, Filter, Search, X, CheckCircle2 } from 'lucide-react';

interface AuditLogsModalProps {
  onClose: () => void;
}

export const AuditLogsModal: React.FC<AuditLogsModalProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>('ALL');

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/audit');
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    if (filterAction === 'ALL') return true;
    return l.action.includes(filterAction);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/95 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-indigo-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                Compliance & System Audit Trail
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">Immutable Event Log</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Advisory Decision & Screening Audit Log
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Logs all recruiter weight adjustments, screening sessions, and AI copilot interactions to guarantee transparency.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Filter Action:</span>
            <select
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Actions ({logs.length})</option>
              <option value="SIMULATION">What-If Simulations</option>
              <option value="SCREENING">Candidate Screenings</option>
              <option value="INTERVIEW">Interview Generations</option>
              <option value="RESUME">Resume Uploads</option>
            </select>
          </div>

          <span className="text-slate-500 text-[11px]">
            Total Logged Events: {filteredLogs.length}
          </span>
        </div>

        {/* Table Content */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading audit trail...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No matching audit events found.</div>
          ) : (
            <div className="space-y-2.5">
              {filteredLogs.map(log => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition flex items-start justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/50">
                        {log.action}
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono">
                        {log.timestamp.replace('T', ' ').slice(0, 19)}
                      </span>
                      <span className="text-slate-500 text-[11px]">•</span>
                      <span className="text-slate-300 font-medium">Role: {log.userRole}</span>
                    </div>

                    <p className="text-slate-200 text-xs mt-1">
                      {log.details}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    ID: {log.id}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};
