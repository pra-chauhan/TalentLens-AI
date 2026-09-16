# TalentLens AI — Fairness, Bias Mitigation & Ethical AI Guidelines

TalentLens AI is explicitly architected to uphold transparency, eliminate systemic pedigree bias, and ensure automated systems remain strictly advisory to human decision-makers.

---

## 1. Principles of Algorithmic Fairness

1. **No Demographic or Proxy Features**:
   - The matching engine does NOT use age, gender, race, postal zip code, name, nationality, or photo in any scoring calculation.
   - School prestige and employer prestige algorithms are intentionally omitted to prevent reinforcing historical socio-economic selection biases.
2. **Evidence-Based Grounding**:
   - A candidate cannot be penalized or rewarded based on speculative inferences. Every rating is tied to verifiable code repositories, project write-ups, work tenures, and certifications.
3. **Transparent Transferability**:
   - Candidates from underrepresented or non-traditional backgrounds often learn equivalent open-source or alternate ecosystem tools (e.g. self-taught Linux & Docker rather than formal enterprise AWS certification). Our Transferability Matrix credits equivalent competency.

---

## 2. Blind Screening Implementation
- **Anonymization Engine**: When enabled, the recruiter interface masks:
  - Full Name $\to$ `Candidate #XXXX` (deterministic pseudorandom identifier)
  - Profile Image $\to$ Abstract monochromatic geometric avatar
  - Contact Details (Email, Phone, Physical Address) $\to$ `[REDACTED FOR BLIND SCREENING]`
- Recruiters only see the candidate's real identity after explicitly clicking "Reveal Candidate Identity", which creates a logged audit event.

---

## 3. Human-in-the-Loop Mandate
- TalentLens AI **NEVER executes automated hiring or rejection actions**.
- Every output is marked as a **Recommendation** with evidence links for hiring team verification.
- Audit logs capture every recruiter interaction, enabling post-hoc bias auditing and adverse impact analysis.
