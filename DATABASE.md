# TalentLens AI — Database Schema & Data Modeling

This document outlines the relational data models used in TalentLens AI (compatible with PostgreSQL, Supabase, and Alembic).

---

## 1. Entity-Relationship Diagram

```
[users] 1───1 [candidates] 1───* [resumes] 1───* [resume_versions]
   │                │
   │                ├───* [candidate_skills] *───1 [skills]
   │                │                                 │
[recruiters]        ├───* [experiences]               ├───* [skill_relationships]
   │                │                                 │
   │                └───* [projects]                  │
   │                                                  │
   └───* [jobs] 1───* [job_skills] *──────────────────┘
           │
           └───* [applications] 1───1 [matches] 1───* [match_evidence]
```

---

## 2. Core Tables Specification

### `users`
- `id`: UUID (PK)
- `email`: VARCHAR(255) UNIQUE NOT NULL
- `password_hash`: VARCHAR(255) NOT NULL
- `role`: ENUM ('CANDIDATE', 'RECRUITER', 'ADMIN') NOT NULL
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### `candidates`
- `id`: UUID (PK)
- `user_id`: UUID (FK -> users.id)
- `full_name`: VARCHAR(255) NOT NULL
- `anonymous_code`: VARCHAR(32) NOT NULL (e.g., "Candidate #A102" for Blind Screening)
- `headline`: VARCHAR(255)
- `years_of_experience`: NUMERIC(4, 1)
- `location`: VARCHAR(255)
- `github_username`: VARCHAR(100)
- `linkedin_url`: VARCHAR(255)

### `jobs`
- `id`: UUID (PK)
- `recruiter_id`: UUID (FK -> recruiters.id)
- `title`: VARCHAR(255) NOT NULL
- `department`: VARCHAR(100)
- `seniority`: VARCHAR(50)
- `location`: VARCHAR(255)
- `work_mode`: ENUM ('REMOTE', 'HYBRID', 'ONSITE')
- `min_experience_years`: INT
- `raw_description`: TEXT
- `quality_score`: NUMERIC(4, 1)
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### `skills` & `skill_relationships`
- `skills.id`: UUID (PK)
- `skills.canonical_name`: VARCHAR(100) UNIQUE (e.g., "React", "PostgreSQL", "FastAPI")
- `skills.category`: VARCHAR(100) (e.g., "Frontend", "Database", "Backend", "DevOps")
- `skills.aliases`: TEXT[] (e.g., ["ReactJS", "React.js"])
- `skill_relationships.parent_skill_id`: UUID (FK -> skills.id)
- `skill_relationships.child_skill_id`: UUID (FK -> skills.id)
- `skill_relationships.transfer_score`: NUMERIC(3, 2) (0.00 to 1.00)
- `skill_relationships.relationship_type`: ENUM ('PARENT_CHILD', 'EQUIVALENT', 'TRANSFERABLE', 'COMPLEMENTARY')

### `matches` & `match_evidence`
- `matches.id`: UUID (PK)
- `matches.candidate_id`: UUID (FK -> candidates.id)
- `matches.job_id`: UUID (FK -> jobs.id)
- `matches.overall_score`: NUMERIC(5, 2)
- `matches.required_coverage`: NUMERIC(5, 2)
- `matches.preferred_coverage`: NUMERIC(5, 2)
- `matches.learning_distance`: ENUM ('LOW', 'MEDIUM', 'HIGH')
- `match_evidence.match_id`: UUID (FK -> matches.id)
- `match_evidence.skill`: VARCHAR(100)
- `match_evidence.match_type`: ENUM ('MATCH', 'PARTIAL', 'TRANSFERABLE', 'MISSING', 'CONFLICT')
- `match_evidence.evidence_snippet`: TEXT
- `match_evidence.source`: VARCHAR(50) ('experience', 'project', 'certification', 'github')
- `match_evidence.confidence`: NUMERIC(3, 2)
- `match_evidence.transfer_rationale`: TEXT

### `audit_logs`
- `id`: UUID (PK)
- `user_id`: UUID
- `action`: VARCHAR(100)
- `resource_type`: VARCHAR(50)
- `resource_id`: VARCHAR(100)
- `metadata`: JSONB
- `timestamp`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
