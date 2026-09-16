# TalentLens AI — Testing & Verification Plan

---

## 1. Test Coverage Strategy

TalentLens AI implements multi-tiered testing across core modules:

1. **Unit & Mathematical Testing**:
   - Skill normalization (synonym deduplication, casing, parent/child traversal).
   - Transferability score calculation (e.g. Azure $\to$ AWS score $\ge 0.85$).
   - Learning distance thresholds (Low vs Medium vs High).
   - Hybrid match score calculation with adjustable weights.
2. **Security & Prompt Injection Testing**:
   - Verification that adversarial strings in uploaded resumes do not break JSON extraction.
   - Verification that personal contact details are completely masked when Blind Screening is enabled.
3. **Integration Testing**:
   - End-to-end recruiter workflow: Job Creation $\to$ Candidate Screening $\to$ What-If Simulation $\to$ Interview Generation.
   - Candidate workflow: Resume Upload $\to$ Skill Graph $\to$ Reverse Job Match.
4. **API Contract Testing**:
   - `/api/health`, `/api/jobs`, `/api/resumes/upload`, `/api/matching/*`, `/api/copilot/*`.
