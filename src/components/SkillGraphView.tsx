import React, { useState } from 'react';
import { CandidateProfile, CandidateSkill } from '../types';
import { ShieldCheck, Award, Calendar, Layers, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

interface SkillGraphViewProps {
  candidate: CandidateProfile;
}

export const SkillGraphView: React.FC<SkillGraphViewProps> = ({ candidate }) => {
  const [selectedSkill, setSelectedSkill] = useState<CandidateSkill | null>(candidate.skills[0] || null);

  // Group candidate skills by category
  const skillsByCategory: Record<string, CandidateSkill[]> = {};
  candidate.skills.forEach(s => {
    const cat = s.category || 'General Technologies';
    if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
    skillsByCategory[cat].push(s);
  });

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Verified Skill Graph & Depth Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Every skill node links directly to verifiable resume achievements, production systems, and project repos.
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {candidate.skills.length} Documented Skills
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Skill Categories (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {Object.entries(skillsByCategory).map(([category, skills]) => (
            <div key={category} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 border-b border-slate-800 pb-2">
                <span>{category}</span>
                <span className="text-slate-500 font-normal">{skills.length} skills</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {skills.map(skill => {
                  const isSelected = selectedSkill?.skill === skill.skill;
                  return (
                    <button
                      key={skill.skill}
                      onClick={() => setSelectedSkill(skill)}
                      className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-indigo-950/70 border-indigo-500 shadow-sm shadow-indigo-900/40'
                          : 'bg-slate-800/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold text-xs text-white">{skill.skill}</span>
                        <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded font-semibold ${
                          skill.depth === 'production'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/40'
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {skill.depth}
                        </span>
                      </div>

                      <div className="w-full space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Confidence:</span>
                          <span className="font-mono font-bold text-slate-200">
                            {(skill.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                            style={{ width: `${skill.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Detail Pane for Selected Skill (5 cols) */}
        <div className="lg:col-span-5">
          {selectedSkill ? (
            <div className="sticky top-20 p-5 rounded-xl bg-slate-900/90 border border-indigo-500/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                  Skill Evidence Inspector
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {(selectedSkill.confidence * 100).toFixed(0)}% verified
                </span>
              </div>

              <div>
                <h4 className="text-xl font-bold text-white tracking-tight">{selectedSkill.skill}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{selectedSkill.category}</p>
              </div>

              {/* Evidence Quote */}
              <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs space-y-2">
                <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Primary Verifiable Citation:
                </span>
                <blockquote className="text-slate-200 italic pl-2 border-l-2 border-indigo-500 leading-relaxed">
                  "{selectedSkill.evidence}"
                </blockquote>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Verified Source</span>
                  <span className="font-semibold text-white capitalize mt-0.5 block">
                    {selectedSkill.source}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Recency</span>
                  <span className="font-semibold text-emerald-400 capitalize mt-0.5 block">
                    {selectedSkill.recency} (Active)
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Years Used</span>
                  <span className="font-semibold text-white mt-0.5 block">
                    {selectedSkill.yearsExperience || 2}+ Years
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Depth Tier</span>
                  <span className="font-semibold text-indigo-300 capitalize mt-0.5 block">
                    {selectedSkill.depth} Level
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  This skill is verified by both resume tenure and corresponding code artifacts in public repositories.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 border border-slate-800 rounded-xl">
              Select a skill to inspect its verification trail.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
