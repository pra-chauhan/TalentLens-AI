import {
  ATSAnalysisResult,
  ATSFormatWarning,
  SectionAnalysisItem,
  SkillGapItem,
  MissingKeywordItem,
  ExperienceAnalysisItem,
  ProjectAnalysisItem,
  AchievementAnalysisItem,
  ResumeQualityResult,
  ImprovementRoadmapItem,
  CandidateProfile,
  JobRequisition,
  CandidateMatchResult
} from '../types';
import { ExtractedDocument } from './documentParser';
import { CANONICAL_SKILLS, normalizeSkill, checkTransferability } from '../data/skillOntology';

/**
 * Evaluates comprehensive ATS Compatibility and content intelligence
 */
export function analyzeAtsAndContent(
  candidate: CandidateProfile,
  job: JobRequisition,
  extractedDoc: ExtractedDocument,
  matchResult: CandidateMatchResult
): {
  atsScore: ATSAnalysisResult;
  qualityScore: ResumeQualityResult;
  strengths: string[];
  weaknesses: string[];
  skillGaps: SkillGapItem[];
  missingKeywords: MissingKeywordItem[];
  experienceAnalysis: ExperienceAnalysisItem;
  projectAnalysis: ProjectAnalysisItem[];
  achievementAnalysis: AchievementAnalysisItem;
  improvementRoadmap: ImprovementRoadmapItem[];
  overallVerdict: string;
} {
  const { rawText, sections, formattingSignals } = extractedDoc;

  // 1. Format Warnings
  const formatWarnings: ATSFormatWarning[] = [];

  if (formattingSignals.hasTwoColumnLayout) {
    formatWarnings.push({
      id: 'warn-layout-cols',
      type: 'layout',
      severity: 'high',
      warning: 'Your resume contains multi-column or asymmetric formatting that may cause parsing fragmentation in legacy ATS readers.',
      recommendation: 'Use a clean, single-column chronological layout with clear linear top-to-bottom reading order.'
    });
  }

  if (formattingSignals.hasTables) {
    formatWarnings.push({
      id: 'warn-layout-tables',
      type: 'tables',
      severity: 'medium',
      warning: 'Information appears inside table cells or grid containers, which ATS parsers often skip or flatten unpredictably.',
      recommendation: 'Replace tables with standard bulleted lists and tabbed headers.'
    });
  }

  if (formattingSignals.hasIconsOrGraphics) {
    formatWarnings.push({
      id: 'warn-layout-icons',
      type: 'graphics',
      severity: 'low',
      warning: 'Unusual icons or decorative glyphs were detected near contact details or headers.',
      recommendation: 'Use plain text labels (e.g., "Email:", "GitHub:", "Phone:") instead of icon graphics.'
    });
  }

  if (formattingSignals.unusualHeadings.length > 0) {
    formattingSignals.unusualHeadings.forEach((heading, idx) => {
      formatWarnings.push({
        id: `warn-heading-${idx}`,
        type: 'headings',
        severity: 'medium',
        warning: `The section title "${heading}" is non-standard and may not be mapped correctly by candidate tracking systems.`,
        recommendation: `Rename "${heading}" to an industry-standard header such as "Professional Experience" or "Professional Summary".`
      });
    });
  }

  // Length warning
  const wordCount = extractedDoc.wordCount || rawText.split(/\s+/).length;
  if (wordCount > 1000) {
    formatWarnings.push({
      id: 'warn-length-long',
      type: 'length',
      severity: 'low',
      warning: `Resume word count (${wordCount} words) exceeds typical two-page brevity recommendations for technical resumes.`,
      recommendation: 'Focus bullets on recent high-impact roles and condense older experience.'
    });
  } else if (wordCount < 180) {
    formatWarnings.push({
      id: 'warn-length-short',
      type: 'length',
      severity: 'high',
      warning: 'Resume content appears sparse, lacking adequate descriptive detail for ATS keyword matching.',
      recommendation: 'Elaborate on technical project implementations, architectures, and measurable outcomes.'
    });
  }

  // 2. Section Structure Analysis
  const sectionAnalysis: SectionAnalysisItem[] = [
    {
      sectionName: 'Professional Summary',
      status: sections.summary && sections.summary.length > 60 ? 'strong' : sections.summary ? 'weak' : 'missing',
      notes: sections.summary ? 'Summary clearly introduces candidate domain and focus.' : 'No distinct professional summary detected.',
      recommendation: !sections.summary ? 'Add a 3-4 sentence professional summary highlighting your core tech stack and years of experience.' : undefined
    },
    {
      sectionName: 'Skills',
      status: sections.skills.length >= 6 ? 'strong' : sections.skills.length > 0 ? 'weak' : 'missing',
      notes: `Extracted ${sections.skills.length} normalized technical skills across languages, frameworks, and tools.`,
      recommendation: sections.skills.length < 5 ? 'Group technical competencies into categorized sections (Languages, Frameworks, Cloud, Databases).' : undefined
    },
    {
      sectionName: 'Experience',
      status: sections.experience && sections.experience.length > 100 ? 'strong' : sections.experience ? 'weak' : 'missing',
      notes: sections.experience ? 'Documented work history with responsibilities and technologies.' : 'No dedicated work experience section found.',
      recommendation: !sections.experience ? 'Include chronological experience entries with company names, job titles, dates, and bulleted contributions.' : undefined
    },
    {
      sectionName: 'Projects',
      status: sections.projects && sections.projects.length > 80 ? 'strong' : sections.projects ? 'weak' : 'missing',
      notes: sections.projects ? 'Projects demonstrate hands-on application of engineering skills.' : 'Projects section is minimal or absent.',
      recommendation: !sections.projects ? 'Detail 2-3 significant projects with architectural context, tech stack, and GitHub links.' : undefined
    },
    {
      sectionName: 'Education',
      status: sections.education ? 'strong' : 'weak',
      notes: sections.education ? 'Degree, major, and graduation credentials identified.' : 'Education details are brief or inferred.',
      recommendation: !sections.education ? 'Add degree, institution, and graduation year clearly.' : undefined
    },
    {
      sectionName: 'Certifications',
      status: sections.certifications && sections.certifications.length > 20 ? 'strong' : sections.certifications ? 'weak' : 'missing',
      notes: sections.certifications ? 'Documented industry certifications or credentials present.' : 'No certifications explicitly listed (optional for engineering roles).',
      recommendation: undefined
    },
    {
      sectionName: 'Achievements',
      status: sections.achievements && sections.achievements.length > 30 ? 'strong' : sections.achievements ? 'weak' : 'missing',
      notes: sections.achievements ? 'Quantified milestones or awards documented.' : 'No distinct achievements section; ensure metrics are woven into experience bullets.',
      recommendation: !sections.achievements ? 'Incorporate measurable impact (e.g. latency reductions, scale handled) directly into experience bullets.' : undefined
    }
  ];

  // 3. Category Score Calculation
  // Parsing compatibility (0-20)
  let parsingScore = 19;
  if (formattingSignals.hasTwoColumnLayout) parsingScore -= 4;
  if (formattingSignals.hasTables) parsingScore -= 3;
  if (formattingSignals.hasIconsOrGraphics) parsingScore -= 2;
  if (formattingSignals.unusualHeadings.length > 0) parsingScore -= 2;
  parsingScore = Math.max(8, parsingScore);

  // Keyword alignment (0-25)
  const reqTotal = job.requirements.length || 1;
  const reqMatchedCount = matchResult.matchedRequiredSkills.length;
  const keywordScore = Math.min(25, Math.max(6, Math.round((reqMatchedCount / reqTotal) * 25)));

  // Skills alignment (0-20)
  const skillCoveragePct = matchResult.breakdown.requiredCoverage ?? 0;
  const skillsScore = Math.min(20, Math.max(0, Math.round((skillCoveragePct / 100) * 20)));

  // Experience alignment (0-15)
  const expMatch = matchResult.breakdown.experienceCompatibility ?? 0;
  const experienceScore = Math.min(15, Math.max(0, Math.round((expMatch / 100) * 15)));

  // Resume structure (0-10)
  const presentSections = sectionAnalysis.filter(s => s.status === 'strong' || s.status === 'weak').length;
  const structureScore = Math.min(10, Math.max(0, Math.round((presentSections / 7) * 10)));

  // Job relevance (0-10)
  const semanticPct = matchResult.breakdown.semanticSimilarity ?? 0;
  const jobRelevanceScore = Math.min(10, Math.max(0, Math.round((semanticPct / 100) * 10)));

  const overallAts = parsingScore + keywordScore + skillsScore + experienceScore + structureScore + jobRelevanceScore;

  const atsScore: ATSAnalysisResult = {
    overallScore: Math.min(100, Math.max(0, overallAts)),
    parsingCompatibility: parsingScore,
    keywordAlignment: keywordScore,
    skillsAlignment: skillsScore,
    experienceAlignment: experienceScore,
    resumeStructure: structureScore,
    jobRelevance: jobRelevanceScore,
    formatWarnings,
    sectionAnalysis,
    disclaimer: 'TalentLens ATS Compatibility is an estimated analytical score based on resume structure, job alignment, skills, and content. Actual ATS systems may use different algorithms and configurations.'
  };

  // 4. Content Quality Score
  const qualityScore: ResumeQualityResult = {
    contentQuality: Math.round(overallAts * 0.95),
    clarity: parsingScore >= 16 ? 90 : 75,
    impact: Math.min(100, Math.round(matchResult.breakdown.projectEvidenceScore * 0.8 + 20)),
    relevance: Math.round(matchResult.breakdown.semanticSimilarity),
    technicalEvidence: Math.round(matchResult.breakdown.requiredCoverage),
    achievementStrength: rawText.includes('%') || /\b\d+\s*(ms|seconds|users|queries|requests|x)\b/i.test(rawText) ? 85 : 60,
    consistency: 88,
    readability: parsingScore >= 16 ? 92 : 78
  };

  // 5. Strengths (Evidence-backed)
  const strengths: string[] = [];
  if (matchResult.matchedRequiredSkills.length > 0) {
    strengths.push(`Direct alignment on ${matchResult.matchedRequiredSkills.slice(0, 4).join(', ')} required skills.`);
  }
  if (matchResult.transferableHighlights.length > 0) {
    const t = matchResult.transferableHighlights[0];
    strengths.push(`Strong transferable capability: ${t.targetSkill} backed by verified mastery in ${t.sourceSkill}.`);
  }
  if (candidate.yearsOfExperience >= job.minExperienceYears) {
    strengths.push(`Experience depth meets or exceeds requisition requirement (${candidate.yearsOfExperience} yrs vs ${job.minExperienceYears} yrs required).`);
  }
  if (sections.projects && sections.projects.length > 50) {
    strengths.push('Projects section demonstrates practical engineering implementation and architecture.');
  }
  if (parsingScore >= 17) {
    strengths.push('Clean layout structure with predictable section hierarchy for ATS tokenizers.');
  }

  // 6. Weaknesses (Where points are lost)
  const weaknesses: string[] = [];
  if (matchResult.missingRequiredSkills.length > 0) {
    weaknesses.push(`Required skill(s) not demonstrated in the uploaded resume: ${matchResult.missingRequiredSkills.join(', ')}.`);
  }
  if (formatWarnings.length > 0) {
    weaknesses.push(formatWarnings[0].warning);
  }
  if (candidate.yearsOfExperience < job.minExperienceYears) {
    weaknesses.push(`Documented experience (${candidate.yearsOfExperience} yrs) is under stated role baseline of ${job.minExperienceYears} years.`);
  }
  if (!rawText.includes('%') && !/\b\d+\b/.test(sections.experience)) {
    weaknesses.push('Experience bullets lack quantified scale, latency metrics, or business impact indicators.');
  }
  if (!sections.summary || sections.summary.length < 50) {
    weaknesses.push('Professional summary is brief or missing target role focus.');
  }

  // 7. Skill Gap Analysis Table
  const skillGaps: SkillGapItem[] = [];
  for (const req of job.requirements) {
    const direct = candidate.skills.find(
      s => s.skill.toLowerCase() === req.skill.toLowerCase() ||
           normalizeSkill(s.skill)?.name.toLowerCase() === normalizeSkill(req.skill)?.name.toLowerCase()
    );

    if (direct) {
      skillGaps.push({
        skill: req.skill,
        jdRequirement: req.type === 'REQUIRED' ? 'Required' : 'Preferred',
        resumeEvidence: direct.depth === 'production' ? 'Strong' : 'Project',
        status: 'MATCH',
        priority: 'Low',
        evidenceQuote: direct.evidence
      });
      continue;
    }

    const transfer = checkTransferability(candidate.skills.map(s => s.skill), req.skill);
    if (transfer.hasTransfer && transfer.sourceSkill) {
      skillGaps.push({
        skill: req.skill,
        jdRequirement: req.type === 'REQUIRED' ? 'Required' : 'Preferred',
        resumeEvidence: 'Transferable',
        status: 'TRANSFERABLE',
        priority: req.type === 'REQUIRED' ? 'Medium' : 'Low',
        transferRationale: transfer.rationale
      });
      continue;
    }

    skillGaps.push({
      skill: req.skill,
      jdRequirement: req.type === 'REQUIRED' ? 'Required' : 'Preferred',
      resumeEvidence: 'Not demonstrated in uploaded resume',
      status: 'MISSING / NOT DEMONSTRATED',
      priority: req.type === 'REQUIRED' ? 'High' : 'Medium'
    });
  }

  // 8. Missing Keywords Classification (Ethical AI safety rules)
  const candidateTextLower = rawText.toLowerCase();
  const missingKeywords: MissingKeywordItem[] = [];

  for (const req of job.requirements) {
    const isDirectMatch = matchResult.matchedRequiredSkills.includes(req.skill);
    if (isDirectMatch) continue;

    // Check if demonstrated indirectly
    const transfer = checkTransferability(candidate.skills.map(s => s.skill), req.skill);
    if (transfer.hasTransfer) {
      missingKeywords.push({
        keyword: req.skill,
        category: 'Demonstrated indirectly',
        recommendation: `Demonstrated via ${transfer.sourceSkill}. You may cite relevant familiarity or transition projects only if accurate.`,
        safeToAdd: true
      });
    } else {
      missingKeywords.push({
        keyword: req.skill,
        category: 'Not demonstrated',
        recommendation: `${req.skill} was not demonstrated in the uploaded resume. Do not add it unless you have actually used it. Never fabricate qualifications.`,
        safeToAdd: false
      });
    }
  }

  // 9. Experience Analysis
  const expMatchRatio = job.minExperienceYears > 0
    ? Math.min(100, Math.round((candidate.yearsOfExperience / job.minExperienceYears) * 100))
    : 100;

  const experienceAnalysis: ExperienceAnalysisItem = {
    jobRequiredYears: job.minExperienceYears,
    documentedRelevantYears: candidate.yearsOfExperience,
    experienceAlignmentPercentage: expMatchRatio,
    seniorityFit: candidate.yearsOfExperience >= job.minExperienceYears ? 'Aligned' : 'Under',
    domainRelevance: `${job.department} domain alignment with technical focus in ${job.title}.`,
    recencyNote: 'Most recent roles and projects demonstrate relevant contemporary technologies.'
  };

  // 10. Project Analysis
  const projectAnalysis: ProjectAnalysisItem[] = candidate.projects.map((proj, idx) => ({
    title: proj.title,
    relevance: idx === 0 ? 'HIGH' : 'MEDIUM',
    evidenceQuality: proj.skillsUsed.length >= 3 ? 'STRONG' : 'MODERATE',
    technologies: proj.skillsUsed,
    demonstratedSkills: proj.skillsUsed,
    measurableOutcomes: proj.impactSnippet ? [proj.impactSnippet] : ['Documented full-stack implementation.'],
    critique: 'Shows concrete software design and architecture implementation.'
  }));

  // 11. Achievement Analysis
  const bulletLines = (sections.experience + '\n' + sections.achievements)
    .split('\n')
    .map(b => b.trim())
    .filter(b => b.startsWith('-') || b.startsWith('•') || b.startsWith('*') || b.length > 20);

  const quantifiedBullets = bulletLines.filter(b => /\b\d+(\.\d+)?%|\b\d+\s*(users|requests|ms|seconds|x|million|k)\b/i.test(b));
  const weakBullets = bulletLines.filter(b => !/\b\d+(\.\d+)?%|\b\d+\s*(users|requests|ms|seconds|x|million|k)\b/i.test(b));

  const bulletCritiques = weakBullets.slice(0, 3).map(b => {
    const cleanedBullet = b.replace(/^[-•*]\s*/, '');
    return {
      originalBullet: cleanedBullet,
      suggestion: `Developed ${cleanedBullet.toLowerCase().replace(/^(worked on|helped with|responsible for)/i, '')}, improving execution efficiency and delivery velocity.`,
      hasMetrics: false
    };
  });

  const achievementAnalysis: AchievementAnalysisItem = {
    hasQuantifiedImpact: quantifiedBullets.length > 0,
    quantifiedCount: quantifiedBullets.length,
    weakBulletCount: weakBullets.length,
    templateRecommendation: 'Developed [feature/system] using [technology], improving [measurable outcome / metric if available].',
    bulletCritiques
  };

  // 12. Improvement Roadmap
  const improvementRoadmap: ImprovementRoadmapItem[] = [];

  let pCount = 1;
  if (matchResult.missingRequiredSkills.length > 0) {
    const topMissing = matchResult.missingRequiredSkills[0];
    improvementRoadmap.push({
      priority: pCount++,
      impact: 'High Impact',
      title: `Demonstrate ${topMissing} if genuinely applicable`,
      description: `The job explicitly requires ${topMissing}. If you have practical experience or built projects using it, highlight concrete evidence in your resume.`,
      actionableStep: `Detail your hands-on work with ${topMissing} in your Experience or Projects section.`
    });
  }

  if (formattingSignals.hasTwoColumnLayout || formattingSignals.hasTables) {
    improvementRoadmap.push({
      priority: pCount++,
      impact: 'High Impact',
      title: 'Normalize formatting for ATS parsing reliability',
      description: 'Multi-column layouts and tables can lead to interleaved or skipped text blocks during automated ingestion.',
      actionableStep: 'Convert to a clean, single-column chronological format.'
    });
  }

  if (quantifiedBullets.length === 0) {
    improvementRoadmap.push({
      priority: pCount++,
      impact: 'Medium Impact',
      title: 'Inject measurable engineering metrics into bullets',
      description: 'Recruiters and scoring models favor statements that demonstrate concrete business scale and technical impact.',
      actionableStep: 'Follow the impact formula: Action Verb + Technical Method + Measurable Metric (e.g. latency, concurrency, throughput).'
    });
  }

  if (sections.summary.length < 60) {
    improvementRoadmap.push({
      priority: pCount++,
      impact: 'Medium Impact',
      title: 'Sharpen Professional Summary for target role',
      description: `Tailor your opening summary to explicitly reflect the ${job.title} requisition context.`,
      actionableStep: 'Incorporate your core languages, cumulative engineering years, and key domain specializations.'
    });
  }

  improvementRoadmap.push({
    priority: pCount++,
    impact: 'Low Impact',
    title: 'Standardize section headers',
    description: 'Use standard headers ("Professional Experience", "Technical Skills", "Education") to ensure 100% parsing accuracy.',
    actionableStep: 'Verify header terminology against standard ATS taxonomy.'
  });

  // Overall Verdict
  let verdict = '';
  if (matchResult.overallScore >= 80 && atsScore.overallScore >= 75) {
    verdict = `Your resume demonstrates strong technical alignment (${matchResult.overallScore}%) for this ${job.title} role. Addressing key ATS formatting nuances and highlighting quantified metrics will further maximize interview selection rates.`;
  } else if (matchResult.overallScore >= 65) {
    verdict = `Your profile shows solid foundational capabilities for ${job.title}, but ATS compatibility is currently constrained by missing requirements (${matchResult.missingRequiredSkills.join(', ') || 'minor gaps'}) and unoptimized bullet statements.`;
  } else {
    verdict = `Significant skill and experience gaps exist between your resume and the ${job.title} requisition. Consider addressing missing non-negotiable requirements and reframing transferable experiences.`;
  }

  return {
    atsScore,
    qualityScore,
    strengths,
    weaknesses,
    skillGaps,
    missingKeywords,
    experienceAnalysis,
    projectAnalysis,
    achievementAnalysis,
    improvementRoadmap,
    overallVerdict: verdict
  };
}
