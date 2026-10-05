import {
  ScreeningBatch,
  ScreeningCandidateRecord,
  CandidateProfile,
  JobRequisition,
  RecruiterRecommendation,
  CandidateMatchResult
} from '../types';
import {
  extractTextFromBuffer,
  analyzeDocumentStructure,
  buildDynamicCandidateProfile,
  calculateFileHash,
  segmentResumeSections
} from './documentParser';
import { evaluateCandidateMatch, DEFAULT_WEIGHTS } from '../utils/matchingEngine';
import { GoogleGenAI } from '@google/genai';

// In-memory screening batches storage (persists across recruiter sessions)
export const screeningBatches: Map<string, ScreeningBatch> = new Map();

/**
 * Creates a new screening batch
 */
export function createScreeningBatch(
  recruiterId: string,
  jobTitle: string,
  department: string,
  jobDescription: string,
  customBatchId?: string
): ScreeningBatch {
  const batchId = customBatchId || `batch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const batch: ScreeningBatch = {
    id: batchId,
    recruiterId,
    jobTitle,
    department: department || 'Engineering',
    jobDescription,
    createdAt: new Date().toISOString(),
    status: 'PENDING',
    totalResumes: 0,
    processedResumes: 0,
    failedResumes: 0,
    duplicatesDetected: [],
    candidates: [],
    jdRequirementsCount: 0
  };

  screeningBatches.set(batchId, batch);
  return batch;
}

/**
 * Parses a dynamic JobRequisition from pasted JD text and job title
 */
export function buildJobRequisitionFromJd(
  jobTitle: string,
  department: string,
  jobDescription: string
): JobRequisition {
  const jobId = `job-dyn-${Date.now()}`;

  // Extract skills from JD text
  const extractedSkills: { skill: string; type: 'REQUIRED' | 'PREFERRED' }[] = [];
  const lines = jobDescription.split('\n');

  let inPreferredSection = false;

  for (const line of lines) {
    if (/(nice to have|preferred|bonus|plus|optional)/i.test(line)) {
      inPreferredSection = true;
    } else if (/(requirements|must have|qualifications|what you bring)/i.test(line)) {
      inPreferredSection = false;
    }

    // Common skill patterns
    const techWords = [
      'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Go', 'Golang',
      'Java', 'C++', 'Rust', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
      'FastAPI', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'REST',
      'Linux', 'Git', 'CI/CD', 'Terraform', 'Kafka', 'PyTorch', 'TensorFlow',
      'Next.js', 'Tailwind', 'SQL', 'Microservices', 'Distributed Systems'
    ];

    for (const tech of techWords) {
      const re = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (re.test(line)) {
        if (!extractedSkills.some(s => s.skill.toLowerCase() === tech.toLowerCase())) {
          extractedSkills.push({
            skill: tech,
            type: inPreferredSection ? 'PREFERRED' : 'REQUIRED'
          });
        }
      }
    }
  }

  // Ensure minimum 4 skills
  if (extractedSkills.length === 0) {
    extractedSkills.push(
      { skill: 'Python', type: 'REQUIRED' },
      { skill: 'REST APIs', type: 'REQUIRED' },
      { skill: 'PostgreSQL', type: 'REQUIRED' },
      { skill: 'Docker', type: 'PREFERRED' }
    );
  }

  // Experience requirement
  let minYears = 3;
  const expMatch = jobDescription.match(/(\d+)\+?\s*(years|yrs)\s*(of)?\s*experience/i);
  if (expMatch && expMatch[1]) {
    minYears = parseInt(expMatch[1], 10);
  }

  return {
    id: jobId,
    title: jobTitle || 'Software Engineer',
    department: department || 'Engineering',
    location: 'Remote',
    workMode: 'Remote',
    seniority: minYears >= 5 ? 'Senior' : minYears >= 3 ? 'Mid' : 'Junior',
    minExperienceYears: minYears,
    salaryRange: '$130,000 - $175,000',
    summary: jobDescription.slice(0, 300),
    requirements: extractedSkills.map((s, idx) => ({
      id: `req-dyn-${idx}`,
      skill: s.skill,
      type: s.type,
      importanceWeight: s.type === 'REQUIRED' ? 4 : 2
    })),
    responsibilities: [
      'Architect and build maintainable production features.',
      'Collaborate with cross-functional partners in an agile delivery lifecycle.'
    ],
    createdAt: new Date().toISOString().split('T')[0]
  };
}

/**
 * Processes an uploaded resume file and evaluates it against the job requisition
 */
export async function processResumeForBatch(
  batchId: string,
  buffer: Buffer,
  filename: string,
  mimetype: string,
  candidateIndex: number,
  geminiClient?: GoogleGenAI | null
): Promise<ScreeningCandidateRecord> {
  const batch = screeningBatches.get(batchId);
  if (!batch) throw new Error('Batch not found');

  const fileHash = calculateFileHash(buffer);

  // Check for duplicate resume in this batch
  const existingWithHash = batch.candidates.find(c => c.fileHash === fileHash);
  if (existingWithHash) {
    batch.duplicatesDetected.push(filename);
    throw new Error(`Duplicate resume detected: "${filename}" is identical to already processed file "${existingWithHash.resumeFilename}".`);
  }

  // Extract text
  const rawText = await extractTextFromBuffer(buffer, filename, mimetype, geminiClient);

  // Build dynamic candidate profile
  const profile = await buildDynamicCandidateProfile(rawText, filename, candidateIndex, geminiClient);

  // Build Job Requisition from batch JD
  const job = buildJobRequisitionFromJd(batch.jobTitle, batch.department, batch.jobDescription);

  // Evaluate candidate match using existing evidence-first matching engine
  const matchResult = evaluateCandidateMatch(profile, job, DEFAULT_WEIGHTS);

  // Determine recommendation language
  let recommendation: RecruiterRecommendation = 'Low Match';
  if (matchResult.overallScore >= 80) recommendation = 'Strong Match';
  else if (matchResult.overallScore >= 70) recommendation = 'Potential Match';
  else if (matchResult.overallScore >= 50) recommendation = 'Needs Review';

  const record: ScreeningCandidateRecord = {
    id: `sc-${Date.now()}-${candidateIndex}`,
    candidateId: profile.id,
    resumeFilename: filename,
    candidateName: profile.fullName,
    anonymousId: profile.anonymousId,
    title: profile.title,
    matchResult,
    candidateProfile: profile,
    recommendation,
    fileHash,
    uploadedAt: new Date().toISOString()
  };

  return record;
}

/**
 * Compares 2 to 4 candidates side-by-side
 */
export function compareCandidates(candidates: ScreeningCandidateRecord[]) {
  return candidates.map(c => ({
    id: c.candidateId,
    name: c.candidateName,
    anonymousId: c.anonymousId,
    title: c.title,
    overallScore: c.matchResult.overallScore,
    requiredCoverage: c.matchResult.breakdown.requiredCoverage,
    experienceCompatibility: c.matchResult.breakdown.experienceCompatibility,
    projectScore: c.matchResult.breakdown.projectEvidenceScore,
    evidenceStrength: c.matchResult.evidenceStrength,
    learningDistance: c.matchResult.learningDistance,
    matchedSkills: c.matchResult.matchedRequiredSkills,
    missingSkills: c.matchResult.missingRequiredSkills,
    transferable: c.matchResult.transferableHighlights.map(t => `${t.targetSkill} (from ${t.sourceSkill})`),
    recommendation: c.recommendation
  }));
}

/**
 * Generates CSV export for screened candidates
 */
export function exportCandidatesCsv(candidates: ScreeningCandidateRecord[]): string {
  const headers = [
    'Rank',
    'Candidate Name',
    'Anonymous ID',
    'Match Score (%)',
    'Recommendation',
    'Required Skill Coverage (%)',
    'Experience Match (%)',
    'Years Experience',
    'Learning Distance',
    'Evidence Strength',
    'Matched Required Skills',
    'Missing Required Skills',
    'Transferable Skills'
  ];

  const rows = candidates.map((c, idx) => [
    idx + 1,
    `"${c.candidateName.replace(/"/g, '""')}"`,
    `"${c.anonymousId}"`,
    c.matchResult.overallScore,
    `"${c.recommendation}"`,
    c.matchResult.breakdown.requiredCoverage,
    c.matchResult.breakdown.experienceCompatibility,
    c.candidateProfile.yearsOfExperience,
    c.matchResult.learningDistance,
    c.matchResult.evidenceStrength,
    `"${c.matchResult.matchedRequiredSkills.join(', ')}"`,
    `"${c.matchResult.missingRequiredSkills.join(', ')}"`,
    `"${c.matchResult.transferableHighlights.map(t => `${t.targetSkill}<-${t.sourceSkill}`).join('; ')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
