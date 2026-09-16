# TalentLens AI — Matching Engine Mathematics & Methodology

The TalentLens AI Matching Engine is a **hybrid, multi-factor deterministic and semantic scoring system**. It rejects single-number black-box models in favor of transparent, configurable component weights.

---

## 1. Overall Compatibility Score Equation

$$\text{OverallScore} = \sum_{i=1}^{n} (w_i \cdot S_i)$$

Where standard baseline weights $w_i$ are:
- **Required Skill Coverage ($w_{\text{req}} = 0.35$)**: Percentage of non-negotiable skills fulfilled directly or through transferable equivalents.
- **Semantic Vector Similarity ($w_{\text{sem}} = 0.20$)**: Cosine similarity between candidate career history embeddings and job context.
- **Preferred Skill Coverage ($w_{\text{pref}} = 0.15$)**: Percentage of bonus / preferred skills met.
- **Experience Compatibility ($w_{\text{exp}} = 0.15$)**: Match between candidate verified years and role requirement, penalizing under-experience while rewarding relevant depth.
- **Project Evidence Quality ($w_{\text{proj}} = 0.10$)**: Verified repository, artifact, or production deployment citations.
- **Domain Compatibility ($w_{\text{dom}} = 0.05$)**: Industry alignment (e.g., FinTech, HealthTech, Developer Tooling).

All weights are **fully adjustable** in the *What-If Job Simulator* so recruiters can test hypothesis-driven changes in real-time.

---

## 2. Requirement Match Classification

For each requirement $R_j$ in a job requisition:
1. **Direct Match ($S(R_j) = 1.0$)**: Candidate has documented experience with canonical skill $R_j$.
2. **Transferable Match ($S(R_j) = \gamma \cdot T(R_j, S_k)$)**: Candidate lacks $R_j$ but possesses adjacent skill $S_k$ with transferability coefficient $T \in [0.70, 0.90]$.
   - *Example*: Azure $\to$ AWS has $T = 0.85$.
3. **Partial Match ($S(R_j) = 0.50$)**: Mentioned only in coursework or basic hobby projects without professional deployment.
4. **Missing ($S(R_j) = 0.0$)**: No trace in candidate portfolio or experience.

---

## 3. Skill Learning Distance Model

Learning distance calculates how difficult it would be for a candidate to become proficient in missing skills based on prerequisite and adjacent skills already mastered.

$$\text{Distance}(S_{\text{missing}}) = \begin{cases} 
\text{LOW} & \text{if } \exists \text{ adjacent skill } S_k \text{ with } T(S_{\text{missing}}, S_k) \ge 0.75 \\
\text{MEDIUM} & \text{if candidate possesses foundational prerequisites} \\
\text{HIGH} & \text{if neither prerequisites nor adjacent capabilities are documented}
\end{cases}$$

### Example Case Study:
- **Job Needs**: `Kubernetes`
- **Candidate 1**: Has `Docker`, `Linux`, `CI/CD Pipelines`, and `Cloud Deployment`.
  - **Distance**: **LOW** (has 90% of foundational container primitives; can onboard within 2–4 weeks).
- **Candidate 2**: Has `HTML`, `CSS`, and basic `JavaScript`.
  - **Distance**: **HIGH** (lacks systems networking, containerization, and distributed infrastructure background).

---

## 4. Ethical Disclaimer
Matching scores are **engineering heuristics** intended to support human recruiters in discovering qualified talent. Scores do NOT represent personal worth, innate intelligence, or guaranteed job performance.
