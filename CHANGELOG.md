# Changelog

All notable changes to TalentLens AI are documented here.

## [1.0.0] - 2026-10-04
### Major Workflow Update
- **Candidate Portal Self-Service AI Resume Analyzer & ATS Optimizer**:
  - Replaced predefined candidate selection with real document upload (PDF, DOC, DOCX, TXT) and target job role selection.
  - Multi-step progress interface displaying real parsing, ontology extraction, and matching stages.
  - Estimated ATS Compatibility Score (/100) with 6-category breakdown (parsing compatibility, keyword alignment, skills alignment, experience alignment, structure, and relevance).
  - ATS formatting warnings (multi-column layouts, tables, glyphs/icons, non-standard section titles) with recommended alternatives.
  - Section-by-section structure analysis (Professional Summary, Skills, Experience, Projects, Education, Certifications, Achievements) categorized into Strong, Present, Weak, and Missing.
  - Skill Gap Analysis table with ethical classification ("Not demonstrated in the uploaded resume" rather than "Candidate doesn't know it").
  - Ethical ATS Keyword Recommendations (Already demonstrated, Demonstrated indirectly, and Not demonstrated with strict anti-fabrication warnings).
  - Resume Content Quality score (Clarity, Impact, Relevance, Technical evidence, Achievement strength).
  - Resume Optimizer & In-Browser Editor supporting 4 rewrite modes (Conservative, Stronger, ATS Optimized, Recruiter Friendly).
  - Real Score Simulator showing BEFORE vs AFTER scores with delta improvements (+X ATS structure, +Y keyword alignment, etc.) and visual diffs.
- **Recruiter Portal Dynamic Bulk Screening**:
  - Removed reliance on predefined candidates.
  - Requisition definition from custom job role and pasted Job Description.
  - Multi-file drag & drop resume upload (up to 50 files) with SHA-256 duplicate file detection.
  - Dynamic candidate profile extraction and deterministic ranking using the evidence-first matching engine.
  - Advisory recommendation categories: "Strong Match", "Potential Match", "Needs Review", "Low Match".
  - Comprehensive filtering by minimum match score, experience, recommendation category, and learning distance.
  - Preserved deep candidate intelligence views (`MatchEvidenceModal`, `InterviewGeneratorModal`, `WhatIfSimulator`, `CopilotModal`, `JobQualityAnalyzerModal`).
  - Side-by-side Candidate Comparison Matrix comparing 2–4 selected candidates.
  - Export screened candidates to CSV report.
  - Screening Sessions History to reopen past screening batches.
- **Backend Architecture & Document Parser**:
  - Implemented `src/server/documentParser.ts` for PDF, DOCX, DOC, and TXT with Gemini 3.8 Flash multimodal OCR fallback.
  - Implemented `src/server/atsService.ts` for comprehensive ATS scoring and formatting checks.
  - Implemented `src/server/optimizationService.ts` for multi-mode resume suggestions and diff tracking.
  - Implemented `src/server/screeningService.ts` for batch processing, duplicate detection, and candidate comparison.
  - Added automated test suite `tests/workflows.test.ts` verifying candidate and recruiter workflows.

## [0.1.0] - 2026-09-16
### Added
- Initial release of TalentLens AI (Evidence-First AI Talent Intelligence Platform).
- Express backend running on port 3000 with clean REST API routes (`/api/*`).
- Modern SaaS UI supporting Recruiter, Candidate, and Public views.
- Canonical Skill Ontology with 60+ skills, alias resolution, and transferability matrix.
- Hybrid matching engine combining required skills, preferred skills, semantic cosine similarity, experience depth, and project evidence.
- Evidence-First match explanation card with explicit citations from candidate profiles.
- Transferable capability analysis (e.g., Azure ↔ AWS, PyTorch ↔ TensorFlow).
- Skill Learning Distance model (Low, Medium, High) with transition rationale.
- What-If Job Simulator allowing live parameter tuning and instant candidate re-ranking.
- Job Description Quality Analyzer auditing ambiguity, skill duplication, and requirement bloat.
- AI Recruiter Copilot grounded strictly in verified candidate records (Gemini 3.8 Flash).
- Tailored Interview Question Generator synthesizing role-specific and gap-verification questions.
- Blind Screening Mode with anonymized candidate shielding (`Candidate #XXXX`).
- Candidate Skill Graph visualization showing multi-level confidence and depth.
- Resume Version Comparison with skill diffs and alignment improvements.
- GitHub Evidence Inspector connecting claims to repository signals.
- Immutable Audit Logging for compliance and screening transparency.
- 10 comprehensive demo candidates and 5 realistic job requisitions.
