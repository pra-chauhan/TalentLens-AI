import {
  CandidateMatchResult,
  CandidateProfile,
  JobRequisition,
  LearningDistanceLevel,
  MatchEvidenceItem,
  MatchType,
  WhatIfWeights
} from '../types';
import {
  calculateLearningDistance,
  checkTransferability,
  normalizeSkill
} from '../data/skillOntology';

export const DEFAULT_WEIGHTS: WhatIfWeights = {
  requiredWeight: 35,
  preferredWeight: 15,
  semanticWeight: 20,
  experienceWeight: 15,
  projectWeight: 10,
  domainWeight: 5
};

/**
 * Calculates deterministic pseudo-semantic cosine similarity between two text corpuses
 * using term-frequency and keyword n-gram overlap vectors.
 */
export function calculateSemanticSimilarity(textA: string, textB: string): number {
  if (!textA || !textB) return 50;

  const tokenize = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
  };

  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  const freqA: Record<string, number> = {};
  const freqB: Record<string, number> = {};

  tokensA.forEach(t => { freqA[t] = (freqA[t] || 0) + 1; });
  tokensB.forEach(t => { freqB[t] = (freqB[t] || 0) + 1; });

  const allWords = Array.from(new Set([...Object.keys(freqA), ...Object.keys(freqB)]));

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const word of allWords) {
    const a = freqA[word] || 0;
    const b = freqB[word] || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (normA === 0 || normB === 0) return 40;
  const cosine = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  // Scale cosine [0, 1] to human-friendly 0-100 curve with minimum 30 base for related tech domains
  return Math.min(100, Math.round(cosine * 85 + 25));
}

/**
 * Evaluates candidate against a job description using the hybrid evidence-first matching engine
 */
export function evaluateCandidateMatch(
  candidate: CandidateProfile,
  job: JobRequisition,
  weights: WhatIfWeights = DEFAULT_WEIGHTS
): CandidateMatchResult {
  const candidateSkillNames = candidate.skills.map(s => s.skill);
  const evidenceItems: MatchEvidenceItem[] = [];

  let requiredMetCount = 0;
  let requiredTotal = 0;
  let preferredMetCount = 0;
  let preferredTotal = 0;

  const missingRequiredSkills: string[] = [];
  const matchedRequiredSkills: string[] = [];
  const transferableHighlights: { targetSkill: string; sourceSkill: string; rationale: string }[] = [];

  // Evaluate each job requirement
  for (const req of job.requirements) {
    const isDemoted = weights.demoteSkillToPreferred?.toLowerCase() === req.skill.toLowerCase();
    const effectiveType = isDemoted ? 'PREFERRED' : req.type;

    if (effectiveType === 'REQUIRED') requiredTotal++;
    if (effectiveType === 'PREFERRED') preferredTotal++;

    // 1. Check direct match
    const directCandidateSkill = candidate.skills.find(
      s => s.skill.toLowerCase() === req.skill.toLowerCase() ||
           normalizeSkill(s.skill)?.name.toLowerCase() === normalizeSkill(req.skill)?.name.toLowerCase()
    );

    if (directCandidateSkill) {
      if (directCandidateSkill.depth === 'coursework' || directCandidateSkill.confidence < 0.75) {
        // Partial match
        evidenceItems.push({
          id: `ev-${req.id}`,
          skill: req.skill,
          requirementType: effectiveType,
          matchType: 'PARTIAL',
          candidateEvidence: directCandidateSkill.evidence,
          evidenceSource: directCandidateSkill.source,
          confidence: directCandidateSkill.confidence,
          recency: directCandidateSkill.recency
        });
        if (effectiveType === 'REQUIRED') requiredMetCount += 0.5;
        if (effectiveType === 'PREFERRED') preferredMetCount += 0.5;
      } else {
        // Full direct match
        evidenceItems.push({
          id: `ev-${req.id}`,
          skill: req.skill,
          requirementType: effectiveType,
          matchType: 'MATCH',
          candidateEvidence: directCandidateSkill.evidence,
          evidenceSource: directCandidateSkill.source,
          confidence: directCandidateSkill.confidence,
          recency: directCandidateSkill.recency
        });
        if (effectiveType === 'REQUIRED') {
          requiredMetCount += 1.0;
          matchedRequiredSkills.push(req.skill);
        }
        if (effectiveType === 'PREFERRED') preferredMetCount += 1.0;
      }
      continue;
    }

    // 2. Check transferable skills
    const transfer = checkTransferability(candidateSkillNames, req.skill);
    if (transfer.hasTransfer && transfer.sourceSkill) {
      const sourceCandSkill = candidate.skills.find(
        s => s.skill.toLowerCase() === transfer.sourceSkill?.toLowerCase() ||
             normalizeSkill(s.skill)?.name.toLowerCase() === normalizeSkill(transfer.sourceSkill || '')?.name.toLowerCase()
      );

      const evidenceSnippet = sourceCandSkill
        ? `${sourceCandSkill.evidence} (${transfer.sourceSkill})`
        : `Demonstrated competency in ${transfer.sourceSkill}`;

      evidenceItems.push({
        id: `ev-${req.id}`,
        skill: req.skill,
        requirementType: effectiveType,
        matchType: 'TRANSFERABLE',
        candidateEvidence: evidenceSnippet,
        evidenceSource: sourceCandSkill?.source || 'experience',
        confidence: transfer.transferScore || 0.85,
        transferSourceSkill: transfer.sourceSkill,
        transferRationale: transfer.rationale,
        learningDistance: 'LOW',
        learningDistanceRationale: `Candidate has ${transfer.sourceSkill}, allowing seamless transition to ${req.skill}.`
      });

      transferableHighlights.push({
        targetSkill: req.skill,
        sourceSkill: transfer.sourceSkill,
        rationale: transfer.rationale || `Directly transferable capability from ${transfer.sourceSkill}`
      });

      const credit = (transfer.transferScore || 0.85);
      if (effectiveType === 'REQUIRED') requiredMetCount += credit;
      if (effectiveType === 'PREFERRED') preferredMetCount += credit;
      continue;
    }

    // 3. Missing skill
    const dist = calculateLearningDistance(req.skill, candidateSkillNames);
    evidenceItems.push({
      id: `ev-${req.id}`,
      skill: req.skill,
      requirementType: effectiveType,
      matchType: 'MISSING',
      candidateEvidence: `${req.skill} was not demonstrated in the uploaded resume or linked artifacts`,
      evidenceSource: 'none',
      confidence: 0,
      learningDistance: dist.level,
      learningDistanceRationale: dist.rationale
    });

    if (effectiveType === 'REQUIRED') {
      missingRequiredSkills.push(req.skill);
    }
  }

  // Calculate component percentages
  const requiredCoverage = requiredTotal > 0 ? Math.min(100, Math.round((requiredMetCount / requiredTotal) * 100)) : 100;
  const preferredCoverage = preferredTotal > 0 ? Math.min(100, Math.round((preferredMetCount / preferredTotal) * 100)) : 80;

  // Semantic similarity between candidate bio/experiences and job context
  const candidateCorpus = [
    candidate.title,
    candidate.summary,
    ...candidate.experiences.map(e => `${e.title} ${e.description} ${e.skillsUsed.join(' ')}`),
    ...candidate.projects.map(p => `${p.title} ${p.description} ${p.skillsUsed.join(' ')}`)
  ].join(' ');

  const jobCorpus = [
    job.title,
    job.department,
    job.summary,
    ...job.responsibilities,
    ...job.requirements.map(r => r.skill)
  ].join(' ');

  const semanticSimilarity = calculateSemanticSimilarity(candidateCorpus, jobCorpus);

  // Experience compatibility
  const minYears = weights.minExperienceOverride !== undefined ? weights.minExperienceOverride : job.minExperienceYears;
  let experienceCompatibility = 100;
  if (minYears > 0) {
    if (candidate.yearsOfExperience >= minYears) {
      experienceCompatibility = Math.min(100, 90 + Math.round((candidate.yearsOfExperience - minYears) * 3));
    } else {
      const ratio = candidate.yearsOfExperience / minYears;
      experienceCompatibility = Math.max(25, Math.round(ratio * 80));
    }
  }

  // Project evidence score
  let projectEvidenceScore = 50;
  if (candidate.projects.length >= 1) projectEvidenceScore += 25;
  if (candidate.projects.some(p => p.repoUrl || p.impactSnippet)) projectEvidenceScore += 20;
  projectEvidenceScore = Math.min(100, projectEvidenceScore);

  // Domain alignment
  const domainAlignment = candidate.title.toLowerCase().includes('engineer') ||
    candidate.summary.toLowerCase().includes(job.department.toLowerCase().split(' ')[0])
    ? 90
    : 70;

  // Composite Weighted Score
  const totalWeight = weights.requiredWeight +
    weights.preferredWeight +
    weights.semanticWeight +
    weights.experienceWeight +
    weights.projectWeight +
    weights.domainWeight;

  const rawOverall = (
    requiredCoverage * weights.requiredWeight +
    preferredCoverage * weights.preferredWeight +
    semanticSimilarity * weights.semanticWeight +
    experienceCompatibility * weights.experienceWeight +
    projectEvidenceScore * weights.projectWeight +
    domainAlignment * weights.domainWeight
  ) / (totalWeight || 100);

  const overallScore = Math.max(15, Math.min(99, Math.round(rawOverall)));

  // Overall Learning Distance computation
  let overallLearningDistance: LearningDistanceLevel = 'LOW';
  let learningDistanceSummary = 'Candidate possesses all core requirements or adjacent equivalents.';

  if (missingRequiredSkills.length > 0) {
    const missingDistances = evidenceItems
      .filter(e => e.requirementType === 'REQUIRED' && e.matchType === 'MISSING')
      .map(e => e.learningDistance || 'MEDIUM');

    if (missingDistances.includes('HIGH')) {
      overallLearningDistance = 'HIGH';
      learningDistanceSummary = `Missing ${missingRequiredSkills.join(', ')} without prerequisite capabilities. Significant onboarding required.`;
    } else if (missingDistances.includes('MEDIUM')) {
      overallLearningDistance = 'MEDIUM';
      learningDistanceSummary = `Missing ${missingRequiredSkills.join(', ')}. Candidate has foundational background in related technologies (est. 4–6 weeks ramp-up).`;
    } else {
      overallLearningDistance = 'LOW';
      learningDistanceSummary = `Missing ${missingRequiredSkills.join(', ')}, but candidate has transferable adjacent skills (est. 2–3 weeks ramp-up).`;
    }
  }

  // Overall Evidence Strength
  let evidenceStrength: 'High' | 'Medium' | 'Low' = 'High';
  if (overallScore < 50 || missingRequiredSkills.length >= 3) {
    evidenceStrength = 'Low';
  } else if (overallScore < 75 || missingRequiredSkills.length >= 1) {
    evidenceStrength = 'Medium';
  }

  return {
    candidateId: candidate.id,
    candidateName: candidate.fullName,
    anonymousId: candidate.anonymousId,
    title: candidate.title,
    yearsExperience: candidate.yearsOfExperience,
    jobId: job.id,
    jobTitle: job.title,
    overallScore,
    evidenceStrength,
    learningDistance: overallLearningDistance,
    learningDistanceSummary,
    breakdown: {
      requiredCoverage,
      preferredCoverage,
      semanticSimilarity,
      experienceCompatibility,
      projectEvidenceScore,
      domainAlignment
    },
    evidenceItems,
    transferableHighlights,
    missingRequiredSkills,
    matchedRequiredSkills
  };
}
