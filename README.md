# TalentLens AI

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Status: Production-Grade MVP](https://img.shields.io/badge/Status-Production--Grade%20MVP-success.svg)]()
[![Platform: AI Talent Intelligence](https://img.shields.io/badge/Platform-TalentLens%20AI-indigo.svg)]()

> **Evidence-First AI Talent Intelligence Platform**
> Beyond black-box scores: explainable candidate-job matching, verified skill evidence, transferable capability analysis, and auditable talent decisions.

---

## 🌟 Overview

Traditional Applicant Tracking Systems (ATS) and modern AI screening tools suffer from a critical flaw: **they rely on keyword matching or opaque "87% match" black-box scores**. Recruiters don't know *why* a candidate matched, and qualified candidates with transferable skills are rejected unfairly.

**TalentLens AI** replaces black-box scoring with **Evidence-First Talent Intelligence**:
1. **Explainable Matching**: Every score is accompanied by granular evidence cited directly from the candidate's verified experiences, projects, and certifications.
2. **Skill Ontology & Normalization**: Maps thousands of synonyms (e.g., "ReactJS", "React.js", "React") to canonical nodes with parent/child hierarchies.
3. **Transferable Skills Recognition**: Understands that an Azure cloud engineer can transition rapidly to AWS, crediting documented adjacent capabilities.
4. **Skill Learning Distance**: Evaluates transition effort (Low / Medium / High) based on underlying engineering fundamentals.
5. **What-If Job Simulator**: Recalculate applicant ranks dynamically when requirements, seniority, or skill weights shift.
6. **AI Recruiter Copilot**: Ask natural-language questions grounded strictly in candidate records—no hallucinated facts.
7. **Blind Screening**: Toggle anonymous candidate evaluation to eliminate cognitive and unconscious demographic bias.
8. **Auditable Decision Trail**: Full traceability of model inputs, criteria weights, and recruiter actions for compliance and fairness.

---

## 🔄 Core User Workflows

TalentLens AI is architected around two specialized, production-ready workflows built for real resume documents (PDF, DOCX, DOC):

### 1. Candidate Portal — Self-Service AI Resume Analyzer & ATS Optimizer

The candidate portal is a self-service intelligence engine that requires **no predefined candidate selection** and **no manual copy-pasting of resume text**. Upload your actual resume document:

```
Upload Resume (PDF/DOC/DOCX)
           ↓
Select Target Job Role (or Custom Role)
           ↓
Paste Target Job Description
           ↓
Click "Analyze My Resume"
           ↓
Inspect Complete Analysis Report
  • ATS Compatibility Score (Breakdown out of 100)
  • ATS Formatting Warnings & Recommended Alternatives
  • Section Structure Analysis (Summary, Skills, Exp, Projects, etc.)
  • Verified Strengths & Weaknesses
  • Skill Gap Analysis & Ethical Keyword Recommendations
  • Prioritized Action Roadmap
           ↓
Open Resume Optimizer & In-Browser Editor
  • 4 Rewrite Modes: Conservative, Stronger, ATS Optimized, Recruiter Friendly
  • Original vs. Suggested Improvements
           ↓
Click "Re-analyze Resume"
           ↓
Inspect Real "BEFORE vs AFTER" Score Simulation & Visual Diff
```

### 2. Recruiter Portal — Dynamic Requisitions & Multi-Resume Bulk Screening

The recruiter portal requires **no predefined candidates**. Recruiters dynamically screen batches of candidate resumes against real requisitions:

```
Create Requisition & Paste Job Description
           ↓
Upload Multiple Resumes (PDF, DOC, DOCX - up to 50 files)
           ↓
Automatic SHA-256 Duplicate Resume Detection
           ↓
Click "Screen Candidates"
           ↓
Asynchronous Multi-Step Ingestion & Matching Pipeline
  • Text & layout extraction
  • Dynamic CandidateProfile generation
  • Deterministic ontology & evidence matching
           ↓
Ranked Candidate Results & Filtering
  • Advisory Recommendations: Strong Match, Potential Match, Needs Review, Low Match
  • Filter by Score, Required Skills, Gaps, Experience, Learning Curve
           ↓
Deep Candidate Evidence Inspection
  • Verbatim resume quotes & evidence citations
  • Transferable skill mapping & learning curves
           ↓
Side-by-Side Candidate Comparison Matrix (2–4 Candidates)
           ↓
AI-Targeted Interview Questions Generation
           ↓
Export Screening Results to CSV
```

---

## 🏛️ System Architecture

```
                                  TalentLens AI Platform
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Frontend (React / Vite)                                     │
│  ┌───────────────────────┐  ┌────────────────────────┐  ┌───────────────────────────────┐  │
│  │   Public Portal       │  │   Recruiter Workspace   │  │   Candidate Portal            │  │
│  │  - Landing & Insights │  │  - Job Manager & Quality│  │  - Profile & Resume Analyzer  │  │
│  │  - Live Interactive   │  │  - Ranked Evidence Board│  │  - Reverse Job Matches        │  │
│  │    Platform Demo      │  │  - What-If Simulator    │  │  - Skill Graph & Evidence     │  │
│  │  - Role Selector      │  │  - Blind Screening Mode │  │  - Version Diff & Career Path │  │
│  │                       │  │  - AI Copilot Assistant │  │  - GitHub Evidence Inspector  │  │
│  └───────────────────────┘  └────────────────────────┘  └───────────────────────────────┘  │
└─────────────────────────────────────────▲───────────────────────────────────────────────────┘
                                          │ REST API / JSON
┌─────────────────────────────────────────▼───────────────────────────────────────────────────┐
│                               Server Engine (Express / TypeScript)                          │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐  ┌───────────────┐  │
│  │ Document Parser    │  │ Skill Ontology     │  │ Hybrid Matching    │  │ AI Copilot &  │  │
│  │ - PDF / DOCX / TXT │  │ - 60+ Canonical    │  │ - Semantic Cosine  │  │ Interview     │  │
│  │ - Section Detection│  │ - Synonym Aliases  │  │ - Coverage & Weight│  │ Generator     │  │
│  │ - Sanitization     │  │ - Transfer Matrix  │  │ - Evidence Citing  │  │ - Gemini 3.8  │  │
│  │ - Prompt-Shield    │  │ - Learning Distance│  │ - Traceable Models │  │ - Grounded Q&A│  │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘  └───────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Persistence & Audit Engine (PostgreSQL / Supabase Schema Model + Fast In-Memory DB)  │  │
│  │  - Candidates, Jobs, Resumes, MatchEvidence, AuditLogs, SkillRelationships            │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

| Capability | What It Does | Why It Matters |
|---|---|---|
| **Evidence-Based Matching** | Breaks match into MATCH, PARTIAL, TRANSFERABLE, and MISSING with exact source citations | Eliminates black-box distrust; gives hiring managers bulletproof justifications |
| **Candidate Skill Graph** | Multi-level hierarchy of candidate skills with confidence score, source, and recency | Visualizes actual technical depth vs superficial resume claims |
| **Transferable Capability Engine** | Identifies parallel technologies (e.g. PyTorch ↔ TensorFlow, AWS ↔ GCP) | Unlocks hidden talent pools overlooked by rigid keyword ATS |
| **Skill Learning Distance** | Calculates cognitive/conceptual leap to bridge remaining skill gaps | Helps hiring teams spot fast learners and craft tailored onboarding plans |
| **What-If Job Simulator** | Live slider to toggle requirement priority (e.g. make Kubernetes preferred vs required) | Test hiring criteria impact on candidate rankings before posting |
| **JD Quality Analyzer** | Audits job descriptions for jargon, duplicated skills, and excessive requirements | Improves applicant conversion and filters out contradictory specs |
| **Blind Screening Mode** | Shields candidate names, avatars, and contact info during initial review | Prevents demographic and pedigree bias during technical evaluation |
| **AI Recruiter Copilot** | Answers comparative questions ("Why did candidate A rank above candidate B?") | High-velocity decision support grounded exclusively in factual candidate records |
| **Interview Generator** | Synthesizes tailored technical, project, and verification questions | Streamlines interview loops with questions targeted at specific resume claims |
| **Resume Version Diff** | Tracks candidate skill improvements and project evolution across iterations | Empowers candidates to optimize their applications honestly |

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Motion, Lucide Icons, Recharts
- **Backend**: Express.js, TypeScript, Node.js (`server.ts` running on port 3000)
- **AI / LLM Engine**: `@google/genai` (Gemini 3.8 Flash) with deterministic NLP fallback
- **Skill Engine**: Canonical Taxonomy + Transferability Matrix + Semantic Embedding Cosine Engine
- **Persistence**: Relational Schema (PostgreSQL/Supabase compatible) + Integrated In-Memory Store
- **Security**: Prompt Injection Sanitization, Role-Based Access Control, Blind Screening Masking

---

## 📦 Quick Start

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/talentlens-ai/talentlens-ai.git
cd talentlens-ai

# Install dependencies
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```env
# Gemini API Key (managed automatically in AI Studio or provide your key)
GEMINI_API_KEY=your_gemini_api_key_here

# Application Port (default 3000)
PORT=3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 📄 Documentation Index
- [System Architecture](ARCHITECTURE.md)
- [REST API Reference](API.md)
- [Database Schema & Migrations](DATABASE.md)
- [AI & NLP Pipeline](AI_PIPELINE.md)
- [Matching Engine Mathematics](MATCHING_ENGINE.md)
- [Security & Prompt-Injection Defense](SECURITY.md)
- [Fairness & Bias Audit](FAIRNESS.md)
- [Local Development Guide](DEVELOPMENT.md)
- [Production Deployment](DEPLOYMENT.md)
- [Testing Suite](TESTING.md)
- [Product Roadmap](ROADMAP.md)
- [Contributing](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

---

## ⚖️ Advisory Notice & Ethics
TalentLens AI recommendations are **strictly advisory**. Final hiring, screening, and interview decisions remain under human control. The platform does NOT execute automated employment rejections.
