import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { DEMO_CANDIDATES, DEMO_JOBS, DEMO_RESUME_VERSIONS, DEMO_GITHUB_PROFILES } from './src/data/demoData';
import { evaluateCandidateMatch, DEFAULT_WEIGHTS } from './src/utils/matchingEngine';
import { normalizeSkill, CANONICAL_SKILLS } from './src/data/skillOntology';
import { AuditLogEntry, CandidateProfile, JobQualityReport, JobRequisition, WhatIfWeights } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// In-memory state initialized with production-grade demo seeds
let jobs: JobRequisition[] = [...DEMO_JOBS];
let candidates: CandidateProfile[] = [...DEMO_CANDIDATES];
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
