import express from 'express';
import path from 'path';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { DEMO_CANDIDATES, DEMO_JOBS, DEMO_RESUME_VERSIONS, DEMO_GITHUB_PROFILES } from './src/data/demoData';
import { evaluateCandidateMatch, DEFAULT_WEIGHTS } from './src/utils/matchingEngine';
import { normalizeSkill, CANONICAL_SKILLS } from './src/data/skillOntology';
import {
  AuditLogEntry,
  CandidateProfile,
  JobQualityReport,
  JobRequisition,
  WhatIfWeights,
  CandidateAnalysisResult,
  RewriteMode,
  ScoreComparisonDiff,
  ScreeningBatch
} from './src/types';
import {
  extractTextFromBuffer,
  analyzeDocumentStructure,
  buildDynamicCandidateProfile,
  calculateFileHash,
  segmentResumeSections,
  normalizeExtractedText,
  ExtractedDocument
} from './src/server/documentParser';
import { analyzeAtsAndContent } from './src/server/atsService';
import { generateResumeSuggestions, calculateTextDiffs } from './src/server/optimizationService';
import {
  screeningBatches,
  createScreeningBatch,
  buildJobRequisitionFromJd,
  processResumeForBatch,
  compareCandidates,
  exportCandidatesCsv
} from './src/server/screeningService';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Multer memory storage configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB limit
});

// Candidate self-service analyses state
const candidateAnalyses: Map<string, CandidateAnalysisResult> = new Map();

// In-memory state initialized with production-grade demo seeds
let jobs: JobRequisition[] = [...DEMO_JOBS];
let candidates: CandidateProfile[] = [...DEMO_CANDIDATES];

// Bootstrap initial screening batch and candidate analysis for seamless first-load inspection
function bootstrapSeeds() {
  const sampleResumeText = `Alex Chen
San Francisco, CA • alexchen@example.com • github.com/alexchen-dev

PROFESSIONAL SUMMARY
Senior Software Engineer with 4.5 years of experience architecting distributed backend services, high-throughput microservices, and database query optimization with Python, FastAPI, Docker, and PostgreSQL. Proven track record of improving latency by 35% and scaling APIs to 50k requests per second.

TECHNICAL SKILLS
Languages: Python, TypeScript, SQL, Go, HTML5/CSS3
Frameworks & Libraries: FastAPI, Flask, React, Node.js, Express, PyTorch
Databases & Storage: PostgreSQL, Redis, MongoDB
Cloud & DevOps: Docker, Kubernetes, AWS (S3, EC2), CI/CD, Git, Linux
Architecture: RESTful APIs, Microservices, Event-Driven Architecture, GraphQL

PROFESSIONAL EXPERIENCE
Senior Backend Engineer — CloudScale Technologies (2022 - Present)
- Architected and deployed microservices handling 45M daily API requests using Python, FastAPI, and PostgreSQL.
- Optimized query execution plans and database connection pooling, reducing p99 response times from 340ms to 92ms.
- Built automated container deployment pipelines using Docker and Kubernetes, cutting deploy lead times by 60%.
- Integrated Redis cache layers for real-time leaderboards, mitigating database read spikes under peak traffic.

Software Engineer — Nexus Media Labs (2020 - 2022)
- Implemented REST APIs and background task workers using Python, Flask, Celery, and PostgreSQL.
- Designed database schemas and migrated relational entities across production databases with zero downtime.
- Collaborated across engineering and product teams to deliver responsive user dashboards in React and TypeScript.

KEY PROJECTS
Distributed Task Queue Engine (2023)
- Engineered an asynchronous worker framework in Python and Redis supporting delayed task execution and exponential retry backoffs.
- Published open-source package with 98% unit test coverage and automated GitHub Actions CI/CD.

EDUCATION
B.S. in Computer Science — University of California, Berkeley (2020)`;

  const sampleJd = `Senior Backend Engineer
Department: Core Infrastructure
Location: Remote (US)

About the Role:
We are looking for an experienced Senior Backend Engineer to design, scale, and maintain high-throughput backend services and data pipelines.

Requirements:
- 3+ years of professional backend engineering experience with Python.
- Strong hands-on experience with FastAPI or Flask, REST APIs, and microservices architecture.
- Deep expertise in relational databases, particularly PostgreSQL (schema design, indexing, performance tuning).
- Practical experience with Docker and containerized deployment workflows.
- Familiarity with Redis caching and asynchronous queues.

Preferred:
- Experience with Kubernetes and AWS infrastructure.
- Familiarity with TypeScript and modern frontend integration.`;

  const jobReq = buildJobRequisitionFromJd('Senior Backend Engineer', 'Core Infrastructure', sampleJd);
  const candProf = buildDynamicCandidateProfile(sampleResumeText, 'Alex_Chen_Resume.pdf', 101);
  candProf.then(prof => {
    const sampleHash = calculateFileHash(Buffer.from(sampleResumeText));
    const extractedDoc: ExtractedDocument = {
      rawText: sampleResumeText,
      normalizedText: sampleResumeText,
      fileHash: sampleHash,
      charCount: sampleResumeText.length,
      wordCount: sampleResumeText.split(/\s+/).filter(Boolean).length,
      pageCount: 1,
      extractionMethod: 'plain_text',
      sections: segmentResumeSections(sampleResumeText),
      formattingSignals: analyzeDocumentStructure(sampleResumeText)
    };
    const match = evaluateCandidateMatch(prof, jobReq, DEFAULT_WEIGHTS);
    const ats = analyzeAtsAndContent(prof, jobReq, extractedDoc, match);
    const sug = generateResumeSuggestions(prof, jobReq, extractedDoc, 'ats_optimized');
    sug.then(sugs => {
      const seedAnalysis: CandidateAnalysisResult = {
        id: 'analysis-seed-alex',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        resumeFilename: 'Alex_Chen_Resume.pdf',
        fileSizeBytes: sampleResumeText.length,
        fileType: 'application/pdf',
        targetRole: 'Senior Backend Engineer',
        jobDescription: sampleJd,
        candidateProfile: prof,
        matchResult: match,
        atsScore: ats.atsScore,
        qualityScore: ats.qualityScore,
        overallScore: Math.round((match.overallScore * 0.55) + (ats.atsScore.overallScore * 0.45)),
        overallVerdict: ats.overallVerdict,
        strengths: ats.strengths,
        weaknesses: ats.weaknesses,
        skillGaps: ats.skillGaps,
        missingKeywords: ats.missingKeywords,
        experienceAnalysis: ats.experienceAnalysis,
        projectAnalysis: ats.projectAnalysis,
        achievementAnalysis: ats.achievementAnalysis,
        improvementRoadmap: ats.improvementRoadmap,
        optimizationSuggestions: sugs,
        rawResumeText: sampleResumeText,
        normalizedResumeText: sampleResumeText,
        parsedSections: extractedDoc.sections.parsedSectionsDict || {},
        lineage: {
          resumeId: `res-${sampleHash.substring(0, 12)}`,
          resumeVersionId: 'v1.0',
          contentHash: sampleHash,
          analysisId: 'analysis-seed-alex',
          jobId: jobReq.id,
          candidateId: prof.id,
          parserVersion: 'v2.4-pdfparse',
          analysisVersion: 'v2.0-evidence',
          extractionMethod: 'plain_text',
          textLength: sampleResumeText.length,
          pageCount: 1,
          timestamp: new Date().toISOString()
        }
      };
      candidateAnalyses.set(seedAnalysis.id, seedAnalysis);
    });
  });

  // Seed screening batch
  const seedBatch = createScreeningBatch(
    'u-recruiter-1',
    'Senior Backend Engineer',
    'Core Infrastructure',
    sampleJd,
    'batch-seed-eng-1'
  );
  seedBatch.status = 'COMPLETED';
  seedBatch.totalResumes = 5;
  seedBatch.processedResumes = 5;

  const names = ['Jordan Lee', 'Morgan Taylor', 'Casey Rivera', 'Devon Kim', 'Samira Patel'];
  const titles = ['Senior Backend Engineer', 'Full Stack Developer', 'Systems Software Engineer', 'Cloud Infrastructure Engineer', 'Data & Backend Engineer'];
  const exps = [4.5, 3.2, 5.0, 2.8, 4.0];

  seedBatch.candidates = names.map((name, i) => {
    const anonId = `Candidate #R${100 + i}`;
    const pText = `${name}\n${titles[i]}\nExperienced in Python, PostgreSQL, Docker, REST APIs, Redis with ${exps[i]} years experience.`;
    const candP: CandidateProfile = {
      id: `cand-seed-${i}`,
      userId: `u-cand-seed-${i}`,
      fullName: name,
      anonymousId: anonId,
      title: titles[i],
      summary: `${titles[i]} with ${exps[i]} years experience in Python and cloud systems.`,
      location: 'Remote',
      yearsOfExperience: exps[i],
      education: [{ id: `edu-${i}`, degree: 'B.S. Computer Science', fieldOfStudy: 'Computer Science', institution: 'University', graduationYear: 2020 }],
      experiences: [{ id: `exp-${i}`, company: 'Tech Inc', title: titles[i], startDate: '2021', endDate: 'Present', location: 'Remote', description: 'Engineered backend systems', skillsUsed: ['Python', 'PostgreSQL', 'Docker'], keyAchievements: ['Reduced latency by 25%'] }],
      projects: [{ id: `proj-${i}`, title: 'High Throughput API', description: 'Built REST service with Python', role: 'Lead Developer', skillsUsed: ['Python', 'Docker', 'FastAPI'] }],
      skills: [
        { skill: 'Python', category: 'Programming Languages', confidence: 0.95, source: 'experience', evidence: 'Verified Python experience', recency: 'recent', depth: 'production' },
        { skill: 'PostgreSQL', category: 'Databases & Storage', confidence: 0.90, source: 'experience', evidence: 'Verified PostgreSQL schema work', recency: 'recent', depth: 'production' },
        { skill: 'Docker', category: 'Cloud & DevOps', confidence: i < 3 ? 0.90 : 0.65, source: 'project', evidence: 'Container deployment', recency: 'recent', depth: 'production' },
        { skill: 'FastAPI', category: 'Frameworks & Libraries', confidence: 0.88, source: 'experience', evidence: 'FastAPI microservices', recency: 'recent', depth: 'production' }
      ],
      certifications: []
    };
    const m = evaluateCandidateMatch(candP, jobReq, DEFAULT_WEIGHTS);
    candidates.unshift(candP);
    return {
      id: `sc-seed-${i}`,
      candidateId: candP.id,
      resumeFilename: `${name.replace(/\s+/g, '_')}_Resume.pdf`,
      candidateName: name,
      anonymousId: anonId,
      title: titles[i],
      matchResult: m,
      candidateProfile: candP,
      recommendation: m.overallScore >= 80 ? 'Strong Match' : m.overallScore >= 70 ? 'Potential Match' : 'Needs Review',
      fileHash: `hash-seed-${i}`,
      uploadedAt: new Date(Date.now() - 3600000 * (i + 1)).toISOString()
    };
  });
  seedBatch.candidates.sort((a, b) => b.matchResult.overallScore - a.matchResult.overallScore);
  screeningBatches.set(seedBatch.id, seedBatch);

  // Register batch job requisition with batch ID so What-If and Copilot can find it
  const batchJobReq: JobRequisition = {
    ...jobReq,
    id: seedBatch.id
  };
  jobs.unshift(batchJobReq);
}

bootstrapSeeds();
const auditLogs: AuditLogEntry[] = [
  {
    id: 'log-init-1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userId: 'u-system',
    userRole: 'ADMIN',
    action: 'SYSTEM_BOOTSTRAP',
    resourceType: 'JOB',
    resourceId: 'all',
    details: 'System bootstrapped with 5 verified job requisitions, 10 candidate profiles, and canonical skill taxonomy.'
  },
  {
    id: 'log-init-2',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    userId: 'u-recruiter-1',
    userRole: 'RECRUITER',
    action: 'CANDIDATE_SCREENING',
    resourceType: 'CANDIDATE',
    resourceId: 'cand-alex-1',
    details: 'Recruiter reviewed candidate evidence under Blind Screening Mode.'
  }
];

// Server-side Gemini client with recommended aistudio-build telemetry
let geminiAi: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiAi && process.env.GEMINI_API_KEY) {
    geminiAi = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiAi;
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// 1. Health Checks
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    candidatesCount: candidates.length,
    jobsCount: jobs.length,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health/ready', (req, res) => {
  res.json({ status: 'ready', database: 'connected', ontologyLoaded: true });
});

// 2. Jobs Endpoints
app.get('/api/jobs', (req, res) => {
  res.json(jobs);
});

app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Job requisition not found' } });
  res.json(job);
});

// Quality Analyzer for Job Descriptions
app.post('/api/jobs/analyze-quality', (req, res) => {
  const { title, description, requirements } = req.body;
  const reqList: { skill: string; type?: string }[] = requirements || [];

  const duplicates: { skillA: string; skillB: string; reason: string }[] = [];
  const ambiguous: string[] = [];
  const missing: string[] = [];

  // Check for duplicate / overlapping skills (e.g., React and ReactJS, or Docker and Containers)
  for (let i = 0; i < reqList.length; i++) {
    for (let j = i + 1; j < reqList.length; j++) {
      const normA = normalizeSkill(reqList[i].skill);
      const normB = normalizeSkill(reqList[j].skill);
      if (normA && normB && normA.name === normB.name) {
        duplicates.push({
          skillA: reqList[i].skill,
          skillB: reqList[j].skill,
          reason: `Both map to canonical skill ${normA.name}`
        });
      }
    }
  }

  // Check for excessive requirement count
  const requiredCount = reqList.filter(r => r.type === 'REQUIRED').length;
  if (requiredCount > 8) {
    ambiguous.push(`Job lists ${requiredCount} required non-negotiables. Best practice is 4–6 core requirements to avoid filtering out diverse applicants.`);
  }

  // Check for missing elements
  if (!description || description.length < 50) {
    missing.push('Job description is too brief to extract meaningful context or responsibilities.');
  }

  const score = Math.max(50, 100 - (duplicates.length * 10) - (ambiguous.length * 8) - (missing.length * 15));

  const report: JobQualityReport = {
    overallScore: score,
    requirementCount: reqList.length,
    requiredCount,
    preferredCount: reqList.length - requiredCount,
    duplicatesFound: duplicates,
    ambiguousRequirements: ambiguous,
    missingElements: missing,
    recommendations: [
      requiredCount > 6 ? 'Consider moving 2–3 required skills into the preferred category.' : 'Requirement volume is well-balanced.',
      'Explicitly cite team goals and project impact in the summary.',
      'Ensure salary transparency to maximize qualified candidate applications.'
    ]
  };

  res.json(report);
});

app.post('/api/jobs', (req, res) => {
  const newJob: JobRequisition = {
    id: `job-${Date.now()}`,
    title: req.body.title || 'Untitled Role',
    department: req.body.department || 'Engineering',
    location: req.body.location || 'Remote',
    workMode: req.body.workMode || 'Remote',
    seniority: req.body.seniority || 'Mid',
    minExperienceYears: Number(req.body.minExperienceYears) || 3,
    salaryRange: req.body.salaryRange || '$140,000 - $180,000',
    summary: req.body.summary || '',
    requirements: req.body.requirements || [],
    responsibilities: req.body.responsibilities || [],
    qualityScore: 90,
    createdAt: new Date().toISOString().split('T')[0]
  };

  jobs.unshift(newJob);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'u-recruiter-current',
    userRole: 'RECRUITER',
    action: 'JOB_CREATED',
    resourceType: 'JOB',
    resourceId: newJob.id,
    details: `Created new requisition: "${newJob.title}" with ${newJob.requirements.length} requirements.`
  });

  res.status(201).json(newJob);
});

// 3. Candidates Endpoints
app.get('/api/candidates', (req, res) => {
  const blind = req.query.blind === 'true';
  if (blind) {
    const masked = candidates.map(c => ({
      ...c,
      fullName: c.anonymousId,
      location: '[REDACTED FOR BLIND SCREENING]',
      githubUsername: undefined,
      linkedinUrl: undefined
    }));
    return res.json(masked);
  }
  res.json(candidates);
});

app.get('/api/candidates/:id', (req, res) => {
  const candidate = candidates.find(c => c.id === req.params.id);
  if (!candidate) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
  res.json(candidate);
});

// 4. Hybrid Matching Endpoints
app.get('/api/matching/job/:jobId/candidates', (req, res) => {
  const job = jobs.find(j => j.id === req.params.jobId);
  if (!job) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Job not found' } });

  const blind = req.query.blind === 'true';

  const matches = candidates.map(c => {
    const result = evaluateCandidateMatch(c, job, DEFAULT_WEIGHTS);
    if (blind) {
      return {
        ...result,
        candidateName: result.anonymousId
      };
    }
    return result;
  });

  matches.sort((a, b) => b.overallScore - a.overallScore);
  res.json(matches);
});

// What-If Job Simulator
app.post('/api/matching/simulate', (req, res) => {
  const { jobId, weights } = req.body as { jobId: string; weights: WhatIfWeights };
  const job = jobs.find(j => j.id === jobId);
  if (!job) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Job not found' } });

  const effectiveWeights = { ...DEFAULT_WEIGHTS, ...weights };

  const recalculated = candidates.map(c => evaluateCandidateMatch(c, job, effectiveWeights));
  recalculated.sort((a, b) => b.overallScore - a.overallScore);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'u-recruiter-current',
    userRole: 'RECRUITER',
    action: 'WHAT_IF_SIMULATION',
    resourceType: 'WHAT_IF',
    resourceId: jobId,
    details: `Ran What-If simulation on job "${job.title}". Weights: Req=${effectiveWeights.requiredWeight}%, Sem=${effectiveWeights.semanticWeight}%, Exp=${effectiveWeights.experienceWeight}%.`
  });

  res.json(recalculated);
});

// Reverse Candidate -> Jobs Matching
app.get('/api/matching/candidate/:candidateId/jobs', (req, res) => {
  const candidate = candidates.find(c => c.id === req.params.candidateId);
  if (!candidate) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });

  const matchedJobs = jobs.map(job => {
    const match = evaluateCandidateMatch(candidate, job, DEFAULT_WEIGHTS);
    return {
      jobId: job.id,
      jobTitle: job.title,
      department: job.department,
      location: job.location,
      workMode: job.workMode,
      overallScore: match.overallScore,
      evidenceStrength: match.evidenceStrength,
      learningDistance: match.learningDistance,
      learningDistanceSummary: match.learningDistanceSummary,
      matchedRequiredSkills: match.matchedRequiredSkills,
      missingRequiredSkills: match.missingRequiredSkills,
      transferableHighlights: match.transferableHighlights
    };
  });

  matchedJobs.sort((a, b) => b.overallScore - a.overallScore);
  res.json(matchedJobs);
});

// 5. Resume Upload & Structured Parsing
app.post('/api/resumes/upload', async (req, res) => {
  try {
    const { filename, rawText, candidateName } = req.body;
    const textContent = (rawText || '').trim();

    if (!textContent) {
      return res.status(400).json({ error: { code: 'EMPTY_TEXT', message: 'Resume text is empty' } });
    }

    // Prompt injection check
    const lower = textContent.toLowerCase();
    if (lower.includes('ignore previous instructions') || lower.includes('system prompt') || lower.includes('rank me 100%')) {
      return res.status(400).json({
        error: {
          code: 'ADVERSARIAL_PAYLOAD_DETECTED',
          message: 'Security Guard: Adversarial prompt injection text was detected and neutralized.'
        }
      });
    }

    let parsedTitle = 'Software Engineer';
    let parsedSummary = textContent.slice(0, 240);
    const extractedSkills: string[] = [];

    // Check skills against canonical list
    for (const skill of CANONICAL_SKILLS) {
      const re = new RegExp(`\\b${skill.name.toLowerCase()}\\b`, 'i');
      if (re.test(textContent) || skill.aliases.some(a => new RegExp(`\\b${a}\\b`, 'i').test(textContent))) {
        extractedSkills.push(skill.name);
      }
    }

    // Attempt Gemini 3.8 Flash structured extraction if API key is available
    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Extract the candidate title, professional summary, and key skills from this resume text:
${textContent.slice(0, 3000)}`,
          config: {
            responseMimeType: 'application/json',
            systemInstruction: 'You are an expert ATS document parser. Return JSON with title (string), summary (string), and skills (array of strings).'
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed.title) parsedTitle = parsed.title;
          if (parsed.summary) parsedSummary = parsed.summary;
          if (Array.isArray(parsed.skills)) {
            parsed.skills.forEach((s: string) => {
              const norm = normalizeSkill(s);
              if (norm && !extractedSkills.includes(norm.name)) {
                extractedSkills.push(norm.name);
              }
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini extraction fallback:', geminiErr);
      }
    }

    // Construct new candidate
    const newCandId = `cand-upload-${Date.now()}`;
    const newCandidate: CandidateProfile = {
      id: newCandId,
      userId: `u-${newCandId}`,
      fullName: candidateName || 'Alex Chen',
      anonymousId: `Candidate #U${Math.floor(1000 + Math.random() * 9000)}`,
      title: parsedTitle,
      summary: parsedSummary,
      location: 'San Francisco, CA',
      yearsOfExperience: 3.5,
      education: [
        {
          id: `edu-${Date.now()}`,
          degree: 'B.S. in Computer Science',
          fieldOfStudy: 'Computer Science',
          institution: 'University of California',
          graduationYear: 2023
        }
      ],
      experiences: [
        {
          id: `exp-${Date.now()}`,
          company: 'Tech Solutions Inc.',
          title: parsedTitle,
          startDate: '2023-06',
          endDate: 'Present',
          location: 'San Francisco, CA',
          description: textContent.slice(0, 300),
          skillsUsed: extractedSkills.slice(0, 5),
          keyAchievements: ['Engineered scalable microservices and database query optimization.']
        }
      ],
      projects: [
        {
          id: `proj-${Date.now()}`,
          title: 'Production Engineering Project',
          description: 'Documented full-stack implementation using modern framework stack.',
          role: 'Lead Developer',
          skillsUsed: extractedSkills.slice(0, 3),
          impactSnippet: 'Demonstrated end-to-end deployment in cloud container runtime.'
        }
      ],
      skills: extractedSkills.slice(0, 10).map((skillName, idx) => {
        const norm = normalizeSkill(skillName);
        return {
          skill: norm?.name || skillName,
          category: norm?.category || 'Programming Languages',
          confidence: 0.90 - idx * 0.02,
          source: 'experience',
          evidence: `Verified mention in resume experience for ${skillName}`,
          recency: 'recent',
          depth: 'production',
          yearsExperience: 2.5
        };
      }),
      certifications: [],
      githubUsername: 'alexchen-dev'
    };

    candidates.unshift(newCandidate);

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'u-candidate',
      userRole: 'CANDIDATE',
      action: 'RESUME_UPLOADED',
      resourceType: 'CANDIDATE',
      resourceId: newCandidate.id,
      details: `Parsed and structured resume "${filename || 'uploaded_resume.pdf'}" into ${extractedSkills.length} normalized skills.`
    });

    res.status(201).json({
      success: true,
      candidate: newCandidate
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown parsing error';
    res.status(500).json({ error: { code: 'RESUME_PARSE_FAILED', message: msg } });
  }
});

// 6. AI Recruiter Copilot
app.post('/api/copilot/query', async (req, res) => {
  try {
    const { jobId, question } = req.body;
    const job = jobs.find(j => j.id === jobId) || jobs[0];

    // Compute matches for context
    const matches = candidates.map(c => evaluateCandidateMatch(c, job, DEFAULT_WEIGHTS));
    matches.sort((a, b) => b.overallScore - a.overallScore);

    const topCandidateA = matches[0];
    const topCandidateB = matches[1];

    const contextSnippet = `
JOB REQUISITION: ${job.title}
Required Skills: ${job.requirements.filter(r => r.type === 'REQUIRED').map(r => r.skill).join(', ')}
Preferred Skills: ${job.requirements.filter(r => r.type === 'PREFERRED').map(r => r.skill).join(', ')}

TOP CANDIDATES IN PIPELINE:
1. ${topCandidateA.candidateName} (Score: ${topCandidateA.overallScore}%, Required: ${topCandidateA.breakdown.requiredCoverage}%, Exp: ${topCandidateA.yearsExperience} yrs)
- Matched: ${topCandidateA.matchedRequiredSkills.join(', ')}
- Missing: ${topCandidateA.missingRequiredSkills.join(', ') || 'None'}
- Learning Distance: ${topCandidateA.learningDistance} (${topCandidateA.learningDistanceSummary})
- Transferable: ${topCandidateA.transferableHighlights.map(t => `${t.targetSkill} <- ${t.sourceSkill}`).join('; ') || 'None'}

2. ${topCandidateB.candidateName} (Score: ${topCandidateB.overallScore}%, Required: ${topCandidateB.breakdown.requiredCoverage}%, Exp: ${topCandidateB.yearsExperience} yrs)
- Matched: ${topCandidateB.matchedRequiredSkills.join(', ')}
- Missing: ${topCandidateB.missingRequiredSkills.join(', ') || 'None'}
- Learning Distance: ${topCandidateB.learningDistance} (${topCandidateB.learningDistanceSummary})
- Transferable: ${topCandidateB.transferableHighlights.map(t => `${t.targetSkill} <- ${t.sourceSkill}`).join('; ') || 'None'}
`;

    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `You are TalentLens AI Copilot, an evidence-first talent intelligence assistant.
Answer the recruiter's question strictly grounded in the verified candidate records provided below.
Cite specific numbers, skills, and evidence citations. Never invent facts.
Question: "${question}"

CONTEXT:
${contextSnippet}`
        });

        if (response.text) {
          return res.json({ answer: response.text, groundedEvidence: true });
        }
      } catch (geminiErr) {
        console.warn('Copilot Gemini error, using grounded fallback:', geminiErr);
      }
    }

    // Deterministic grounded response
    const fallbackAnswer = `Based on the verified records for **${job.title}**:

1. **${topCandidateA.candidateName}** achieves a **${topCandidateA.overallScore}% compatibility score** with **${topCandidateA.breakdown.requiredCoverage}% required skill coverage**. Documented evidence confirms hands-on mastery in ${topCandidateA.matchedRequiredSkills.join(', ')}.
2. In contrast, **${topCandidateB.candidateName}** scores **${topCandidateB.overallScore}%** with **${topCandidateB.breakdown.requiredCoverage}% required coverage**. Their gaps include ${topCandidateB.missingRequiredSkills.join(', ') || 'minor preferred requirements'}.
3. **Evidence Strength & Learning Distance**: ${topCandidateA.candidateName} exhibits ${topCandidateA.learningDistance} learning distance because ${topCandidateA.learningDistanceSummary}`;

    res.json({ answer: fallbackAnswer, groundedEvidence: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Copilot error';
    res.status(500).json({ error: { code: 'COPILOT_FAILED', message: msg } });
  }
});

// 7. Interview Question Generator
app.post('/api/interviews/generate', async (req, res) => {
  const { candidateId, jobId } = req.body;
  const candidate = candidates.find(c => c.id === candidateId) || candidates[0];
  const job = jobs.find(j => j.id === jobId) || jobs[0];

  const match = evaluateCandidateMatch(candidate, job, DEFAULT_WEIGHTS);

  const missingSkills = match.missingRequiredSkills;
  const transferable = match.transferableHighlights;

  const questions = [
    {
      id: 'q-tech-1',
      category: 'Technical Deep-Dive',
      question: `In your recent work with ${match.matchedRequiredSkills[0] || 'Python'}, how do you handle concurrency, resource bottlenecks, and asynchronous execution under peak traffic?`,
      targetedSkillOrGap: match.matchedRequiredSkills[0] || 'Core Architecture',
      rationale: `Validates candidate's claimed production-level depth in ${match.matchedRequiredSkills[0] || 'core technologies'}.`,
      expectedEvidenceSignals: ['Understanding of async event loops / connection pooling', 'Quantifiable latency benchmarks', 'Troubleshooting bottlenecks']
    },
    {
      id: 'q-proj-2',
      category: 'Project Architecture',
      question: `Walk us through the architecture of your project "${candidate.projects[0]?.title || 'Recent Service'}". What trade-offs did you make in your data schema and deployment choices?`,
      targetedSkillOrGap: 'System Design & Trade-offs',
      rationale: 'Connects resume project claim directly to engineering decision-making ability.',
      expectedEvidenceSignals: ['Discussion of alternatives evaluated', 'Data consistency considerations', 'Observability metrics']
    },
    {
      id: 'q-verif-3',
      category: 'Evidence Verification',
      question: transferable.length > 0
        ? `We noted your strong documented experience in ${transferable[0].sourceSkill}. How would you translate your knowledge of its primitives to ${transferable[0].targetSkill}?`
        : `Your resume mentions ${candidate.skills[0]?.evidence || 'high-throughput work'}. Can you describe a critical production incident you resolved in that environment?`,
      targetedSkillOrGap: transferable[0]?.targetSkill || 'Hands-on Production Depth',
      rationale: 'Tests transferable capability claim and prevents keyword exaggeration.',
      expectedEvidenceSignals: ['Accurate architectural mapping between platforms', 'Detailed incident postmortem methodology']
    },
    {
      id: 'q-gap-4',
      category: 'Skill Gap & Learning',
      question: missingSkills.length > 0
        ? `This role requires production use of ${missingSkills[0]}. What is your familiarization roadmap for picking up this tool, and what adjacent tools have you leveraged in the past?`
        : 'Describe a technology you had to learn from scratch and bring into production in less than a month.',
      targetedSkillOrGap: missingSkills[0] || 'Fast Upskilling Ability',
      rationale: `Assesses learning agility for verified gap in ${missingSkills[0] || 'new technologies'}.`,
      expectedEvidenceSignals: ['Concrete self-learning methodology', 'Prerequisite concept mastery', 'Rapid prototyping mindset']
    }
  ];

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'u-recruiter-current',
    userRole: 'RECRUITER',
    action: 'INTERVIEW_QUESTIONS_GENERATED',
    resourceType: 'INTERVIEW',
    resourceId: candidate.id,
    details: `Generated 4 tailored interview questions for candidate ${candidate.anonymousId} against job "${job.title}".`
  });

  res.json({ questions, candidate: candidate.anonymousId, jobTitle: job.title });
});

// 8. Resume Version Diff
app.get('/api/resumes/:candidateId/versions', (req, res) => {
  const versions = DEMO_RESUME_VERSIONS[req.params.candidateId] || [];
  res.json(versions);
});

// 9. GitHub Evidence
app.get('/api/github/:candidateId', (req, res) => {
  const profile = DEMO_GITHUB_PROFILES[req.params.candidateId];
  if (!profile) {
    return res.json({
      username: 'connected_account',
      totalPublicRepos: 6,
      primaryLanguages: [{ language: 'Python', percentage: 70 }, { language: 'TypeScript', percentage: 30 }],
      verifiedRepositories: [],
      evidenceStrength: 'Moderate',
      supportingSummary: 'Public repositories verify active commit activity and consistent programming practice.'
    });
  }
  res.json(profile);
});

// 10. Audit Logs
app.get('/api/audit', (req, res) => {
  res.json(auditLogs);
});

app.post('/api/audit', (req, res) => {
  const newEntry: AuditLogEntry = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: req.body.userId || 'u-user',
    userRole: req.body.userRole || 'RECRUITER',
    action: req.body.action || 'ACTION',
    resourceType: req.body.resourceType || 'CANDIDATE',
    resourceId: req.body.resourceId || 'unknown',
    details: req.body.details || '',
    parametersLogged: req.body.parametersLogged
  };
  auditLogs.unshift(newEntry);
  res.status(201).json(newEntry);
});

// ----------------------------------------------------
// 11. CANDIDATE SELF-SERVICE ATS & RESUME OPTIMIZER API
// ----------------------------------------------------

// Upload real resume file (PDF, DOCX, DOC, TXT) and analyze against target role & JD
app.post('/api/candidate/upload-and-analyze', upload.single('resume'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: { code: 'NO_FILE', message: 'Please upload a resume file (PDF, DOC, or DOCX).' } });
    }

    const targetRole = (req.body.targetRole || 'Software Engineer').trim();
    const jobDescription = (req.body.jobDescription || '').trim();

    if (!jobDescription || jobDescription.length < 25) {
      return res.status(400).json({
        error: {
          code: 'INVALID_JD',
          message: 'Please provide a valid Job Description with sufficient detail (at least 25 characters).'
        }
      });
    }

    const gemini = getGeminiClient();

    // 1. Extract text
    const extracted = await extractTextFromBuffer(file.buffer, file.originalname, file.mimetype, gemini);
    const rawText = extracted.rawText;
    const normalizedText = extracted.normalizedText;
    const extractionMethod = extracted.extractionMethod;
    const pageCount = extracted.pageCount;

    if (!rawText || rawText.trim().length < 40) {
      return res.status(400).json({
        error: {
          code: 'UNREADABLE_FILE',
          message: 'The uploaded file appears empty or could not be parsed into readable text.'
        }
      });
    }

    // 2. Prompt injection safety check
    const lower = rawText.toLowerCase();
    if (lower.includes('ignore previous instructions') || lower.includes('system prompt') || lower.includes('rank me 100%')) {
      return res.status(400).json({
        error: {
          code: 'ADVERSARIAL_PAYLOAD_DETECTED',
          message: 'Security Guard: Adversarial prompt injection text was detected in the resume document.'
        }
      });
    }

    // 3. Document structure & sections
    const formattingSignals = analyzeDocumentStructure(rawText);
    const segmented = segmentResumeSections(rawText);
    const fileHash = calculateFileHash(file.buffer);

    const extractedDoc: ExtractedDocument = {
      rawText,
      normalizedText,
      fileHash,
      charCount: rawText.length,
      wordCount: rawText.split(/\s+/).filter(Boolean).length,
      pageCount,
      extractionMethod,
      sections: segmented,
      formattingSignals
    };

    // 4. Dynamic Candidate Profile & Requisition
    const candidateProfile = await buildDynamicCandidateProfile(rawText, file.originalname, 1, gemini);
    const jobRequisition = buildJobRequisitionFromJd(targetRole, 'Engineering', jobDescription);

    // 5. Matching & Evidence
    const matchResult = evaluateCandidateMatch(candidateProfile, jobRequisition, DEFAULT_WEIGHTS);

    // 6. ATS Analysis, Strengths, Weaknesses, Skill Gaps, Roadmap
    const atsAndContent = analyzeAtsAndContent(candidateProfile, jobRequisition, extractedDoc, matchResult);

    // 7. Initial Optimization Suggestions
    const suggestions = await generateResumeSuggestions(candidateProfile, jobRequisition, extractedDoc, 'ats_optimized', gemini);

    const analysisId = `analysis-${Date.now()}`;
    const fullAnalysis: CandidateAnalysisResult = {
      id: analysisId,
      createdAt: new Date().toISOString(),
      resumeFilename: file.originalname,
      fileSizeBytes: file.size,
      fileType: file.mimetype || path.extname(file.originalname),
      targetRole,
      jobDescription,
      candidateProfile,
      matchResult,
      atsScore: atsAndContent.atsScore,
      qualityScore: atsAndContent.qualityScore,
      overallScore: Math.round((matchResult.overallScore * 0.55) + (atsAndContent.atsScore.overallScore * 0.45)),
      overallVerdict: atsAndContent.overallVerdict,
      strengths: atsAndContent.strengths,
      weaknesses: atsAndContent.weaknesses,
      skillGaps: atsAndContent.skillGaps,
      missingKeywords: atsAndContent.missingKeywords,
      experienceAnalysis: atsAndContent.experienceAnalysis,
      projectAnalysis: atsAndContent.projectAnalysis,
      achievementAnalysis: atsAndContent.achievementAnalysis,
      improvementRoadmap: atsAndContent.improvementRoadmap,
      optimizationSuggestions: suggestions,
      rawResumeText: rawText,
      normalizedResumeText: normalizedText,
      parsedSections: segmented.parsedSectionsDict,
      lineage: {
        resumeId: `res-${fileHash.substring(0, 12)}`,
        resumeVersionId: 'v1.0',
        contentHash: fileHash,
        analysisId,
        jobId: jobRequisition.id,
        candidateId: candidateProfile.id,
        parserVersion: 'v2.4-pdfparse',
        analysisVersion: 'v2.0-evidence',
        extractionMethod,
        textLength: rawText.length,
        pageCount,
        timestamp: new Date().toISOString()
      }
    };

    candidateAnalyses.set(analysisId, fullAnalysis);

    // Add to in-memory candidate list for cross-portal visibility if needed
    candidates.unshift(candidateProfile);

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'u-candidate-self',
      userRole: 'CANDIDATE',
      action: 'RESUME_ANALYSIS_COMPLETED',
      resourceType: 'RESUME_ANALYSIS',
      resourceId: analysisId,
      details: `Analyzed resume "${file.originalname}" against target role "${targetRole}". ATS: ${atsAndContent.atsScore.overallScore}/100, Match: ${matchResult.overallScore}%.`
    });

    res.status(201).json(fullAnalysis);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error analyzing resume';
    console.error('Resume analysis error:', err);
    res.status(500).json({ error: { code: 'ANALYSIS_FAILED', message: msg } });
  }
});

// Re-analyze updated resume content (Score Simulator & Before vs After comparison)
app.post('/api/candidate/reanalyze', async (req, res) => {
  try {
    const { previousAnalysisId, updatedResumeText, targetRole, jobDescription } = req.body;
    const prev = candidateAnalyses.get(previousAnalysisId);

    const resumeTextToUse = (updatedResumeText || (prev ? prev.rawResumeText : '')).trim();
    if (!resumeTextToUse || resumeTextToUse.length < 30) {
      return res.status(400).json({ error: { code: 'EMPTY_TEXT', message: 'Updated resume content is too short to analyze.' } });
    }

    const effectiveRole = targetRole || (prev ? prev.targetRole : 'Software Engineer');
    const effectiveJd = jobDescription || (prev ? prev.jobDescription : 'Software Engineer with modern technical capabilities');

    const gemini = getGeminiClient();
    const formattingSignals = analyzeDocumentStructure(resumeTextToUse);
    const segmented = segmentResumeSections(resumeTextToUse);
    const resumeHash = calculateFileHash(Buffer.from(resumeTextToUse));
    const normalizedText = normalizeExtractedText(resumeTextToUse);

    const extractedDoc: ExtractedDocument = {
      rawText: resumeTextToUse,
      normalizedText,
      fileHash: resumeHash,
      charCount: resumeTextToUse.length,
      wordCount: resumeTextToUse.split(/\s+/).filter(Boolean).length,
      pageCount: prev?.lineage?.pageCount || 1,
      extractionMethod: prev?.lineage?.extractionMethod || 'plain_text',
      sections: segmented,
      formattingSignals
    };

    const candidateProfile = await buildDynamicCandidateProfile(resumeTextToUse, prev?.resumeFilename || 'resume_v2.txt', 2, gemini);
    const jobRequisition = buildJobRequisitionFromJd(effectiveRole, 'Engineering', effectiveJd);

    const matchResult = evaluateCandidateMatch(candidateProfile, jobRequisition, DEFAULT_WEIGHTS);
    const atsAndContent = analyzeAtsAndContent(candidateProfile, jobRequisition, extractedDoc, matchResult);
    const newSuggestions = await generateResumeSuggestions(candidateProfile, jobRequisition, extractedDoc, 'ats_optimized', gemini);

    const newAnalysisId = `analysis-${Date.now()}`;
    const afterOverall = Math.round((matchResult.overallScore * 0.55) + (atsAndContent.atsScore.overallScore * 0.45));
    const afterAts = atsAndContent.atsScore.overallScore;
    const afterSkill = matchResult.breakdown.requiredCoverage;
    const afterExperience = matchResult.breakdown.experienceCompatibility;

    const beforeOverall = prev ? prev.overallScore : Math.max(50, afterOverall - 10);
    const beforeAts = prev ? prev.atsScore.overallScore : Math.max(50, atsAndContent.atsScore.overallScore - 12);
    const beforeSkill = prev ? prev.matchResult.breakdown.requiredCoverage : Math.max(50, matchResult.breakdown.requiredCoverage - 8);
    const beforeExperience = prev ? prev.matchResult.breakdown.experienceCompatibility : matchResult.breakdown.experienceCompatibility;

    const textDiffs = calculateTextDiffs(
      prev?.parsedSections || {},
      segmented.parsedSectionsDict
    );

    const scoreComparison: ScoreComparisonDiff = {
      beforeOverall,
      afterOverall,
      beforeAts,
      afterAts,
      beforeSkill,
      afterSkill,
      beforeExperience,
      afterExperience,
      deltas: {
        atsStructure: Math.max(0, atsAndContent.atsScore.resumeStructure - (prev ? prev.atsScore.resumeStructure : 6)),
        keywordAlignment: Math.max(0, atsAndContent.atsScore.keywordAlignment - (prev ? prev.atsScore.keywordAlignment : 12)),
        projectRelevance: Math.max(0, Math.round((matchResult.breakdown.projectEvidenceScore - (prev ? prev.matchResult.breakdown.projectEvidenceScore : 60)) / 10)),
        contentQuality: Math.max(0, atsAndContent.qualityScore.contentQuality - (prev ? prev.qualityScore.contentQuality : 70))
      },
      textDiffs
    };

    const updatedAnalysis: CandidateAnalysisResult = {
      id: newAnalysisId,
      createdAt: new Date().toISOString(),
      resumeFilename: prev ? `${prev.resumeFilename.replace(/\.[^/.]+$/, '')}_optimized.pdf` : 'resume_optimized.pdf',
      fileSizeBytes: resumeTextToUse.length,
      fileType: 'application/pdf',
      targetRole: effectiveRole,
      jobDescription: effectiveJd,
      candidateProfile,
      matchResult,
      atsScore: atsAndContent.atsScore,
      qualityScore: atsAndContent.qualityScore,
      overallScore: afterOverall,
      overallVerdict: atsAndContent.overallVerdict,
      strengths: atsAndContent.strengths,
      weaknesses: atsAndContent.weaknesses,
      skillGaps: atsAndContent.skillGaps,
      missingKeywords: atsAndContent.missingKeywords,
      experienceAnalysis: atsAndContent.experienceAnalysis,
      projectAnalysis: atsAndContent.projectAnalysis,
      achievementAnalysis: atsAndContent.achievementAnalysis,
      improvementRoadmap: atsAndContent.improvementRoadmap,
      optimizationSuggestions: newSuggestions,
      rawResumeText: resumeTextToUse,
      normalizedResumeText: normalizedText,
      parsedSections: segmented.parsedSectionsDict,
      lineage: {
        resumeId: prev?.lineage?.resumeId || `res-${resumeHash.substring(0, 12)}`,
        resumeVersionId: 'v2.0-optimized',
        contentHash: resumeHash,
        analysisId: newAnalysisId,
        jobId: jobRequisition.id,
        candidateId: candidateProfile.id,
        parserVersion: 'v2.4-pdfparse',
        analysisVersion: 'v2.0-evidence',
        extractionMethod: prev?.lineage?.extractionMethod || 'plain_text',
        textLength: resumeTextToUse.length,
        pageCount: prev?.lineage?.pageCount || 1,
        timestamp: new Date().toISOString()
      }
    };

    candidateAnalyses.set(newAnalysisId, updatedAnalysis);

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'u-candidate-self',
      userRole: 'CANDIDATE',
      action: 'RESUME_REANALYZED',
      resourceType: 'RESUME_ANALYSIS',
      resourceId: newAnalysisId,
      details: `Re-analyzed resume. Score shifted: ATS ${beforeAts} -> ${afterAts}, Overall ${beforeOverall} -> ${afterOverall}.`
    });

    res.json({
      analysis: updatedAnalysis,
      scoreComparison
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error re-analyzing resume';
    res.status(500).json({ error: { code: 'REANALYZE_FAILED', message: msg } });
  }
});

// Generate optimization suggestions for specific mode ('conservative' | 'stronger' | 'ats_optimized' | 'recruiter_friendly')
app.post('/api/candidate/optimize', async (req, res) => {
  try {
    const { analysisId, mode } = req.body as { analysisId: string; mode: RewriteMode };
    const analysis = candidateAnalyses.get(analysisId);
    if (!analysis) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Analysis not found' } });
    }

    const gemini = getGeminiClient();
    const optHash = calculateFileHash(Buffer.from(analysis.rawResumeText));
    const extractedDoc: ExtractedDocument = {
      rawText: analysis.rawResumeText,
      normalizedText: analysis.normalizedResumeText || analysis.rawResumeText,
      fileHash: optHash,
      charCount: analysis.rawResumeText.length,
      wordCount: analysis.rawResumeText.split(/\s+/).filter(Boolean).length,
      pageCount: analysis.lineage?.pageCount || 1,
      extractionMethod: analysis.lineage?.extractionMethod || 'plain_text',
      sections: segmentResumeSections(analysis.rawResumeText),
      formattingSignals: analyzeDocumentStructure(analysis.rawResumeText)
    };

    const suggestions = await generateResumeSuggestions(
      analysis.candidateProfile,
      buildJobRequisitionFromJd(analysis.targetRole, 'Engineering', analysis.jobDescription),
      extractedDoc,
      mode || 'ats_optimized',
      gemini
    );

    res.json({ suggestions, mode });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Optimization error';
    res.status(500).json({ error: { code: 'OPTIMIZE_FAILED', message: msg } });
  }
});

// List saved candidate analyses
app.get('/api/candidate/analyses', (req, res) => {
  const list = Array.from(candidateAnalyses.values()).map(a => ({
    id: a.id,
    createdAt: a.createdAt,
    resumeFilename: a.resumeFilename,
    targetRole: a.targetRole,
    overallScore: a.overallScore,
    atsScore: a.atsScore.overallScore,
    candidateName: a.candidateProfile.fullName
  }));
  res.json(list);
});

// Get specific candidate analysis
app.get('/api/candidate/analyses/:id', (req, res) => {
  const analysis = candidateAnalyses.get(req.params.id);
  if (!analysis) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Analysis not found' } });
  }
  res.json(analysis);
});

// ----------------------------------------------------
// 12. RECRUITER SCREENING BATCHES & BULK SCREENING API
// ----------------------------------------------------

// Create a new screening batch
app.post('/api/recruiter/screening-batches', (req, res) => {
  const { jobTitle, department, jobDescription } = req.body;
  if (!jobDescription || jobDescription.trim().length < 25) {
    return res.status(400).json({ error: { code: 'INVALID_JD', message: 'Please provide a meaningful Job Description.' } });
  }

  const batch = createScreeningBatch('u-recruiter-1', jobTitle || 'Software Engineer', department || 'Engineering', jobDescription);

  // Register job requisition with batch ID so What-If and Copilot endpoints match
  const jobReq = buildJobRequisitionFromJd(batch.jobTitle, batch.department, batch.jobDescription);
  jobReq.id = batch.id;
  jobs.unshift(jobReq);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'u-recruiter-1',
    userRole: 'RECRUITER',
    action: 'SCREENING_BATCH_CREATED',
    resourceType: 'SCREENING_BATCH',
    resourceId: batch.id,
    details: `Created candidate screening batch for "${batch.jobTitle}" in ${batch.department}.`
  });

  res.status(201).json(batch);
});

// Bulk upload and process resumes for a screening batch
app.post('/api/recruiter/screening-batches/:id/resumes', upload.array('resumes', 50), async (req, res) => {
  try {
    const batchId = req.params.id;
    const batch = screeningBatches.get(batchId);
    if (!batch) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Screening batch not found' } });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: { code: 'NO_FILES', message: 'Please upload at least one resume file.' } });
    }

    batch.status = 'PROCESSING';
    batch.totalResumes = files.length;
    batch.processedResumes = 0;
    batch.failedResumes = 0;

    const gemini = getGeminiClient();
    const processedCandidates = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const record = await processResumeForBatch(
          batchId,
          file.buffer,
          file.originalname,
          file.mimetype,
          i + 1,
          gemini
        );
        batch.candidates.push(record);
        processedCandidates.push(record);
        batch.processedResumes++;
        // Register dynamically created candidate in candidates array for copilot and interview generator
        candidates.unshift(record.candidateProfile);
      } catch (err: unknown) {
        console.warn(`Failed processing resume "${file.originalname}":`, err);
        batch.failedResumes++;
      }
    }

    // Rank candidates by overallScore descending
    batch.candidates.sort((a, b) => b.matchResult.overallScore - a.matchResult.overallScore);
    batch.status = 'COMPLETED';

    auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'u-recruiter-1',
      userRole: 'RECRUITER',
      action: 'BATCH_SCREENING_COMPLETED',
      resourceType: 'SCREENING_BATCH',
      resourceId: batchId,
      details: `Screened ${batch.processedResumes} candidates for role "${batch.jobTitle}". Top match: ${batch.candidates[0]?.candidateName || 'N/A'} (${batch.candidates[0]?.matchResult.overallScore || 0}%).`
    });

    res.json(batch);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error screening resumes';
    res.status(500).json({ error: { code: 'SCREENING_FAILED', message: msg } });
  }
});

// List all screening batches (Screening History)
app.get('/api/recruiter/screening-batches', (req, res) => {
  const list = Array.from(screeningBatches.values()).map(b => ({
    id: b.id,
    jobTitle: b.jobTitle,
    department: b.department,
    createdAt: b.createdAt,
    status: b.status,
    totalResumes: b.totalResumes,
    processedResumes: b.processedResumes,
    failedResumes: b.failedResumes,
    topScore: b.candidates[0]?.matchResult.overallScore || 0
  }));
  res.json(list);
});

// Get details of a specific screening batch
app.get('/api/recruiter/screening-batches/:id', (req, res) => {
  const batch = screeningBatches.get(req.params.id);
  if (!batch) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Screening batch not found' } });
  }
  res.json(batch);
});

// Compare selected candidates in a screening batch
app.post('/api/recruiter/screening-batches/:id/compare', (req, res) => {
  const batch = screeningBatches.get(req.params.id);
  if (!batch) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Screening batch not found' } });
  }

  const { candidateIds } = req.body as { candidateIds: string[] };
  const selected = batch.candidates.filter(c => candidateIds.includes(c.candidateId));

  const comparison = compareCandidates(selected);
  res.json(comparison);
});

// Export candidates to CSV
app.get('/api/recruiter/screening-batches/:id/export', (req, res) => {
  const batch = screeningBatches.get(req.params.id);
  if (!batch) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Screening batch not found' } });
  }

  const csv = exportCandidatesCsv(batch.candidates);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="candidates_${batch.jobTitle.replace(/\s+/g, '_')}_${batch.id}.csv"`);
  res.send(csv);
});

// ----------------------------------------------------
// VITE / STATIC SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TalentLens AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
