# TalentLens AI — Local Development Guide

This guide describes how to run, test, and contribute to TalentLens AI locally.

---

## 1. Prerequisites
- Node.js 20+ / npm 10+
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Git

*(Note: Lightweight design allows running on standard laptops with 8GB RAM without local PostgreSQL or Docker).*

---

## 2. Windows PowerShell Setup
```powershell
# 1. Clone repository
git clone https://github.com/talentlens-ai/talentlens-ai.git
cd talentlens-ai

# 2. Install dependencies
npm install

# 3. Configure environment
Copy-Item .env.example .env

# 4. Start full-stack dev server
npm run dev
```

The application will bind to `http://localhost:3000`.

---

## 3. Project Structure
```
├── server.ts             # Express full-stack API server & Vite middleware
├── src/
│   ├── components/       # UI Components & Modules
│   │   ├── Navbar.tsx
│   │   ├── RecruiterDashboard.tsx
│   │   ├── CandidateDashboard.tsx
│   │   ├── CandidateCard.tsx
│   │   ├── MatchEvidenceModal.tsx
│   │   ├── WhatIfSimulator.tsx
│   │   ├── SkillGraphView.tsx
│   │   ├── CopilotModal.tsx
│   │   ├── InterviewGenerator.tsx
│   │   ├── JobQualityAnalyzer.tsx
│   │   ├── ResumeVersionDiff.tsx
│   │   ├── GitHubEvidenceView.tsx
│   │   ├── BlindScreeningToggle.tsx
│   │   └── AuditLogsView.tsx
│   ├── data/
│   │   ├── demoData.ts   # 10 realistic candidates, 5 jobs, 60+ skills
│   │   └── skillOntology.ts
│   ├── types.ts          # Core TypeScript interfaces & schemas
│   ├── App.tsx           # Main application shell with portal switching
│   └── main.tsx          # React DOM entry point
└── package.json
```

---

## 4. Useful Scripts
- `npm run dev`: Starts the Node/Express backend + Vite client on port 3000
- `npm run build`: Production build of Vite assets and backend bundle
- `npm run lint`: TypeScript type-checking without emitting files
- `npm test`: Runs test suite
