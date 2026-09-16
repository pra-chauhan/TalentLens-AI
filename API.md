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

### `POST /api/resumes/upload`
Uploads and parses a candidate resume (PDF, DOCX, TXT) into structured entities.
**Request:**
```json
{
  "filename": "Alex_Rivera_Resume.pdf",
  "rawText": "Alex Rivera | AI/ML Engineer | Python, PyTorch, FastAPI...",
  "candidateId": "cand-alex-1"
}
```
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
