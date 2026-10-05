# TalentLens AI — System Architecture

This document describes the architectural layout, component interaction, and data flows of the TalentLens AI platform.

## 1. High-Level Architecture

```mermaid
graph TD
    User[Recruiter / Candidate / Admin] -->|HTTPS| WebClient[React / Vite Web Interface]
    WebClient -->|REST API / JSON| APIEngine[Express Server :3000]
    
    subgraph Server Engine
        APIEngine --> DocParser[Document Parsing & Sanitize]
        APIEngine --> SkillTaxonomy[Skill Taxonomy & Normalization]
        APIEngine --> MatchingCore[Hybrid Matching Engine]
        APIEngine --> CopilotCore[AI Recruiter Copilot]
        APIEngine --> AuditService[Audit & Compliance Log]
    end

    subgraph Data & Persistence
        MatchingCore --> DBStore[(PostgreSQL / Relational Store)]
        AuditService --> DBStore
    end

    subgraph AI Service Layer
        DocParser --> LLMService[Gemini 3.8 Flash / @google/genai]
        CopilotCore --> LLMService
        MatchingCore --> Embeddings[Semantic Vector Similarity]
    end
```

## 2. Core Subsystems

### 2.1 Frontend Architecture
- **Framework**: React 19 with Vite, Tailwind CSS v4, Lucide React icons.
- **State Management**: Reactive in-memory state with live API synchronization.
- **Views**:
  - `Public Landing`: Interactive walkthrough of Evidence-First philosophy and live feature selector.
  - `Recruiter Portal`: Dashboard metrics, Job Creation with Quality Analyzer, Candidate Ranking Board, Explainable Evidence Card, What-If Simulator, Blind Screening, and AI Recruiter Copilot.
  - `Candidate Portal`: Profile, Resume Upload & Parser, Reverse Job Matches, Interactive Skill Graph, Resume Version Comparison, and GitHub Evidence Inspector.
  - `Admin / Fairness`: System metrics, Audit Logs, and Bias minimization metrics.

### 2.2 Backend Architecture
- **Runtime**: Node.js with TypeScript and Express.js (`server.ts`).
- **Middleware**:
  - Request logging with latency and request ID tracking.
  - Multer multipart/form-data streaming for high-performance single and bulk resume uploads.
  - Input validation and prompt injection neutralization.
  - Error-shielding middleware converting exceptions to standard JSON error payloads.
- **Service Layer**:
  - `documentParser.ts`: Real file parsing for PDF (`pdf-parse`), DOCX (`mammoth`), DOC, and TXT with Gemini 3.8 Flash multimodal OCR fallback. Extracts sections and checks for layout fragmentation (columns, tables, glyphs). Computes SHA-256 hashes for deduplication.
  - `atsService.ts`: Computes 6-factor ATS Compatibility Score out of 100, detects formatting warnings, compiles verified strengths and weaknesses, builds skill gap analysis, and enforces ethical anti-fabrication keyword rules.
  - `optimizationService.ts`: Generates rewrite suggestions across 4 modes (Conservative, Stronger, ATS Optimized, Recruiter Friendly) without hallucinating metrics, and computes real BEFORE vs AFTER score simulations with textual diffs.
  - `screeningService.ts`: Orchestrates recruiter screening batches, bulk file ingestion, dynamic candidate creation (`CandidateProfile`), deterministic ranking, candidate side-by-side comparison, and CSV export.
  - `matchingEngine.ts`: Mathematical composite scoring combining required skill coverage (35%), preferred skill coverage (15%), semantic similarity (20%), experience depth (15%), project evidence (10%), and domain alignment (5%).
  - `skillOntology.ts`: Canonical mapping of 60+ skills, synonym aliasing, hierarchy trees, and transferability matrix.
  - `CopilotService`: Grounded LLM reasoning agent answering comparative candidate questions without hallucinations.

### 2.3 Data Layer
- **PostgreSQL / Supabase Schema**: Designed with normalized tables for users, candidates, recruiters, jobs, resumes, candidate_skills, job_skills, skill_relationships, matches, match_evidence, screening_questions, and audit_logs.
- **In-Memory Store with Demo Seed**: High-performance local store pre-populated with 10 diverse candidates, 5 complex job requisitions, and full skill graphs for instant verification.

### 2.4 Security & Data Protection
- **Role-Based Access Control**: Strict segregation between CANDIDATE, RECRUITER, and ADMIN endpoints.
- **Blind Screening**: Masks candidate names, avatars, contact emails, and personal identifiers to `Candidate #XXXX` during technical review.
- **Untrusted Document Defense**: Resume and job text are sanitized and parsed into validated JSON schemas before any model processing to prevent prompt injection attacks.
