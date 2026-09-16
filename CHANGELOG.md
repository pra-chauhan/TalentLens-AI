# Changelog

All notable changes to TalentLens AI are documented here.

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
