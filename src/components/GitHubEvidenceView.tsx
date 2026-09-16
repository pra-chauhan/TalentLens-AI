import React from 'react';
import { GitHubEvidenceProfile } from '../types';
import { Github, Star, GitBranch, Code2, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';

interface GitHubEvidenceViewProps {
  profile?: GitHubEvidenceProfile;
}

export const GitHubEvidenceView: React.FC<GitHubEvidenceViewProps> = ({ profile }) => {
  const defaultProfile: GitHubEvidenceProfile = profile || {
    username: 'alexchen-dev',
    totalPublicRepos: 8,
    primaryLanguages: [
      { language: 'Python', percentage: 55 },
      { language: 'TypeScript', percentage: 30 },
      { language: 'Go', percentage: 15 }
    ],
    verifiedRepositories: [
      {
        name: 'distributed-event-stream',
        description: 'High-throughput async event processor built with Python, FastAPI, and Redis pub/sub.',
        stars: 142,
        primaryLanguage: 'Python',
        skillsDemonstrated: ['Python', 'FastAPI', 'Redis', 'Docker'],
        lastCommitDate: '2026-03-02',
        url: 'https://github.com/example/distributed-event-stream'
      },
      {
        name: 'talentlens-evidence-matcher',
        description: 'Deterministic skill taxonomy matching engine with explainable weights and transferability vectors.',
        stars: 88,
        primaryLanguage: 'TypeScript',
        skillsDemonstrated: ['TypeScript', 'Node.js', 'PostgreSQL'],
        lastCommitDate: '2026-03-10',
        url: 'https://github.com/example/talentlens-evidence-matcher'
      }
    ],
    evidenceStrength: 'Strong',
    supportingSummary: 'Public commits verify hands-on production depth in Python asynchronous microservices, containerization, and data pipelines.'
  };

  const currentProfile = profile || defaultProfile;

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Github className="w-5 h-5 text-cyan-400" />
          Verified GitHub Artifacts & Repository Evidence
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Public code commits and repository architectures ground candidate capabilities in real, inspectable software.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 block">GitHub Handle</span>
          <span className="font-mono font-bold text-white text-sm mt-1 block flex items-center gap-1.5">
            <Github className="w-4 h-4 text-slate-300" />
            @{currentProfile.username}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 block">Repository Verification Strength</span>
          <span className="font-bold text-emerald-400 text-sm mt-1 block flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            {currentProfile.evidenceStrength} Evidence
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-slate-400 block">Public Repositories</span>
          <span className="font-bold text-white text-sm mt-1 block">
            {currentProfile.totalPublicRepos} Tracked Repos
          </span>
        </div>
      </div>

      {/* Language Composition */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <span className="text-xs font-semibold text-slate-300 block">
          Primary Codebase Languages:
        </span>
        <div className="space-y-2 text-xs">
          {currentProfile.primaryLanguages.map(lang => (
            <div key={lang.language} className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>{lang.language}</span>
                <span className="font-mono text-slate-400">{lang.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                  style={{ width: `${lang.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Repositories Cards */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-slate-300 block">
          Inspected Repositories & Demonstrated Skills:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentProfile.verifiedRepositories.map(repo => (
            <div
              key={repo.name}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="font-mono font-bold text-sm text-cyan-300 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    <span>{repo.name}</span>
                  </div>
                  {repo.stars > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 font-mono">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{repo.stars}</span>
                    </div>
                  )}
                </div>

                <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                  {repo.description}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {repo.skillsDemonstrated.map(skill => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Language: <strong className="text-slate-200">{repo.primaryLanguage}</strong></span>
                  <span>Active: {repo.lastCommitDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
