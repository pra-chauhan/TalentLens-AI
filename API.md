# TalentLens AI — REST API Documentation

Base URL: `http://localhost:3000/api`

All responses return standard JSON structures with HTTP status codes.

---

## 1. System & Health

### `GET /api/health`
Returns backend health status.
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-09-16T17:15:00.000Z"
}
```

### `GET /api/health/ready`
Confirms database readiness and AI provider configuration.

---

## 2. Authentication

### `POST /api/auth/login`
**Request:**
```json
{
  "email": "sarah.recruiter@talentlens.ai",
  "role": "RECRUITER"
}
```
**Response:**
```json
{
  "user": {
    "id": "u-recruiter-1",
    "email": "sarah.recruiter@talentlens.ai",
    "name": "Sarah Jenkins",
    "role": "RECRUITER"
  },
  "token": "jwt_token_sample"
}
```

---

## 3. Resumes & Candidate Extraction

### `POST /api/candidate/upload-and-analyze` (Multipart Form-Data)
Uploads an actual resume document (PDF, DOC, DOCX, TXT) and target job parameters to run the complete analysis engine.
**Form Fields:**
- `resume`: File binary (PDF / DOC / DOCX / TXT)
- `targetRole`: string (e.g. "Full Stack Developer")
- `jobDescription`: string (Pasted JD text)

**Response:**
Returns `CandidateAnalysisResult` containing:
- `overallScore`: number (composite 0-100)
- `atsScore`: 6-category breakdown + format warnings
- `matchResult`: evidence-first match results & verbatim quotes
- `strengths`: verified candidate strengths
- `weaknesses`: specific score loss factors
- `skillGaps`: table of requirements vs evidence
- `missingKeywords`: categorized as safe / indirect / undemonstrated
- `improvementRoadmap`: prioritized high/medium/low impact steps
- `optimizationSuggestions`: section-by-section improvements

---

### `POST /api/candidate/reanalyze` (JSON)
Re-evaluates updated resume text from the in-browser editor and computes real BEFORE vs AFTER score changes.
**Request Body:**
```json
{
  "previousAnalysisId": "analysis-12345",
  "updatedResumeText": "Full updated text...",
  "targetRole": "Senior Backend Engineer",
  "jobDescription": "Full JD text..."
}
```
**Response:**
```json
{
  "analysis": { ... },
  "scoreComparison": {
    "beforeOverall": 74,
    "afterOverall": 84,
    "beforeAts": 72,
    "afterAts": 86,
    "beforeSkill": 76,
    "afterSkill": 84,
    "deltas": {
      "atsStructure": 8,
      "keywordAlignment": 7,
      "projectRelevance": 3,
      "contentQuality": 4
    },
    "textDiffs": [ ... ]
  }
}
```

---

### `POST /api/candidate/optimize` (JSON)
Generates tailored suggestions for a specific rewrite mode (`conservative`, `stronger`, `ats_optimized`, `recruiter_friendly`).

---

### `GET /api/candidate/analyses`
Returns past analysis sessions for the candidate.

---

## 4. Recruiter Bulk Screening Batches

### `POST /api/recruiter/screening-batches`
Creates a new screening session with requisition context.
**Request Body:**
```json
{
  "jobTitle": "Senior Backend Engineer",
  "department": "Core Infrastructure",
  "jobDescription": "Full job description text..."
}
```

---

### `POST /api/recruiter/screening-batches/:id/resumes` (Multipart Form-Data)
Uploads and bulk screens multiple resume files (up to 50 files) in a batch.
**Form Fields:**
- `resumes`: Array of File binaries (PDF, DOCX, DOC, TXT)

**Response:**
Returns updated `ScreeningBatch` containing ranked candidates (`overallScore` descending), file hashes, duplicate warnings, and advisory recommendations (`Strong Match`, `Potential Match`, `Needs Review`, `Low Match`).

---

### `GET /api/recruiter/screening-batches`
Lists all historical screening batches.

---

### `POST /api/recruiter/screening-batches/:id/compare`
Compares 2–4 selected candidates side-by-side.

---

### `GET /api/recruiter/screening-batches/:id/export`
Exports screened candidates to a standard CSV report.

---

## 5. Legacy & Hybrid Matching Engine
**Response:**
```json
{
  "resumeId": "res-alex-v1",
  "structuredProfile": {
    "name": "Alex Rivera",
    "title": "Senior AI / ML Engineer",
    "skills": ["Python", "PyTorch", "FastAPI", "Docker", "PostgreSQL"],
    "experiences": [...],
    "projects": [...]
  }
}
```

### `GET /api/resumes/:candidateId/versions`
Retrieves version history and skill diffs between iterations.

---

## 4. Jobs & Requisitions

### `GET /api/jobs`
Returns all active job requisitions.

### `POST /api/jobs`
Creates a new job requisition and runs the AI Quality Analyzer.
**Request:**
```json
{
  "title": "Senior AI / ML Platform Engineer",
  "department": "Engineering",
  "location": "San Francisco, CA / Remote",
  "seniority": "Senior",
  "requiredSkills": ["Python", "FastAPI", "Docker", "PostgreSQL"],
  "preferredSkills": ["AWS", "Kubernetes", "Redis"],
  "minExperienceYears": 4,
  "description": "..."
}
```

### `POST /api/jobs/analyze-quality`
Audits job description for ambiguous requirements, duplicates, and requirement bloat.

---

## 5. Hybrid Matching & Evidence

### `GET /api/matching/job/:jobId/candidates`
Returns all candidates ranked against the given job with granular evidence metrics.
Query params:
- `blind`: `true` | `false` (masks candidate personal identifiers)

**Response:**
```json
[
  {
    "candidateId": "cand-1",
    "displayName": "Candidate #A101",
    "overallScore": 92,
    "evidenceStrength": "High",
    "requiredCoverage": 100,
    "preferredCoverage": 67,
    "experienceMatch": 95,
    "learningDistance": "Low",
    "evidence": [
      {
        "skill": "Python",
        "matchType": "MATCH",
        "evidence": "Lead backend developer using Python 3.11 for 4+ years.",
        "source": "experience",
        "confidence": 0.98
      },
      {
        "skill": "AWS",
        "matchType": "TRANSFERABLE",
        "evidence": "Documented 3 years production experience architecting GCP Cloud Run.",
        "transferRationale": "Candidate has documented GCP cloud deployment experience that directly maps to AWS cloud primitives.",
        "confidence": 0.85
      }
    ]
  }
]
```

### `POST /api/matching/simulate`
Simulates "What-If" ranking changes when job requirements, weights, or seniority thresholds are dynamically shifted.

---

## 6. AI Recruiter Copilot & Interviews

### `POST /api/copilot/query`
Answers comparative candidate questions strictly based on stored evidence.
**Request:**
```json
{
  "jobId": "job-1",
  "question": "Why does Candidate A rank higher than Candidate B for the AI Engineer role?"
}
```

### `POST /api/interviews/generate`
Synthesizes customized technical, project, behavioral, and verification interview questions targeted to the candidate's skill gaps and resume claims.

---

## 7. Audit & Compliance

### `GET /api/audit`
Returns immutable audit log entries recording model inputs, parameter changes, and screening decisions.
