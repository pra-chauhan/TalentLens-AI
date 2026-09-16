/**
 * TalentLens AI — Domain Type Definitions
 */

export type UserRole = 'CANDIDATE' | 'RECRUITER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export type SkillCategory = 
  | 'Programming Languages'
  | 'Frameworks & Libraries'
  | 'Databases & Storage'
  | 'Cloud & DevOps'
  | 'Machine Learning & AI'
  | 'Architecture & APIs'
  | 'Tools & Methodologies';

export interface CanonicalSkill {
  id: string;
  name: string;
  category: SkillCategory;
  aliases: string[];
  description: string;
  parentSkills?: string[];
  childSkills?: string[];
}

export interface CandidateSkill {
  skill: string;
  category: SkillCategory;
  confidence: number; // 0.0 to 1.0
  source: 'experience' | 'project' | 'certification' | 'github' | 'academic';
  evidence: string;
  recency: 'recent' | 'past' | 'academic';
  depth: 'production' | 'project' | 'coursework';
  yearsExperience?: number;
}

export interface CandidateExperience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string | 'Present';
  location: string;
  description: string;
  skillsUsed: string[];
  keyAchievements: string[];
}

export interface CandidateProject {
  id: string;
  title: string;
  description: string;
  role: string;
  skillsUsed: string[];
  repoUrl?: string;
  liveUrl?: string;
  impactSnippet?: string;
}

export interface CandidateEducation {
  id: string;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: number;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  fullName: string;
  anonymousId: string; // e.g. "Candidate #A102"
  title: string;
  summary: string;
  location: string;
  yearsOfExperience: number;
  education: CandidateEducation[];
  experiences: CandidateExperience[];
  projects: CandidateProject[];
  skills: CandidateSkill[];
  certifications: string[];
  githubUsername?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

export type RequirementType = 'REQUIRED' | 'PREFERRED' | 'OPTIONAL' | 'AMBIGUOUS';

export interface JobRequirement {
  id: string;
  skill: string;
  type: RequirementType;
  minYears?: number;
  importanceWeight: number; // 1 to 5
  notes?: string;
}

export interface JobRequisition {
  id: string;
  title: string;
  department: string;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  seniority: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Principal';
  minExperienceYears: number;
  salaryRange?: string;
  summary: string;
  requirements: JobRequirement[];
  responsibilities: string[];
  qualityScore?: number; // 0 to 100 calculated by Quality Analyzer
  qualityIssues?: string[];
  createdAt: string;
}

export type MatchType = 'MATCH' | 'PARTIAL' | 'TRANSFERABLE' | 'MISSING' | 'CONFLICT';
export type LearningDistanceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface MatchEvidenceItem {
  id: string;
  skill: string;
  requirementType: RequirementType;
  matchType: MatchType;
  candidateEvidence: string;
  evidenceSource: 'experience' | 'project' | 'certification' | 'github' | 'academic' | 'none';
  confidence: number;
  recency?: string;
  transferRationale?: string;
  transferSourceSkill?: string;
  learningDistance?: LearningDistanceLevel;
  learningDistanceRationale?: string;
}

export interface MatchScoreBreakdown {
  requiredCoverage: number; // 0 to 100
  preferredCoverage: number; // 0 to 100
  semanticSimilarity: number; // 0 to 100
  experienceCompatibility: number; // 0 to 100
  projectEvidenceScore: number; // 0 to 100
  domainAlignment: number; // 0 to 100
}

export interface CandidateMatchResult {
  candidateId: string;
  candidateName: string;
  anonymousId: string;
  title: string;
  yearsExperience: number;
  jobId: string;
  jobTitle: string;
  overallScore: number; // 0 to 100
  evidenceStrength: 'High' | 'Medium' | 'Low';
  learningDistance: LearningDistanceLevel;
  learningDistanceSummary: string;
  breakdown: MatchScoreBreakdown;
  evidenceItems: MatchEvidenceItem[];
  transferableHighlights: {
    targetSkill: string;
    sourceSkill: string;
    rationale: string;
  }[];
  missingRequiredSkills: string[];
  matchedRequiredSkills: string[];
}

export interface WhatIfWeights {
  requiredWeight: number; // default 35
  preferredWeight: number; // default 15
  semanticWeight: number; // default 20
  experienceWeight: number; // default 15
  projectWeight: number; // default 10
  domainWeight: number; // default 5
  minExperienceOverride?: number;
  demoteSkillToPreferred?: string; // e.g., "Docker" or "AWS"
  waiveDegreeRequirement?: boolean;
}

export interface JobQualityReport {
  overallScore: number;
  requirementCount: number;
  requiredCount: number;
  preferredCount: number;
  duplicatesFound: { skillA: string; skillB: string; reason: string }[];
  ambiguousRequirements: string[];
  missingElements: string[];
  recommendations: string[];
}

export interface ResumeVersionDiff {
  versionId: string;
  candidateId: string;
  versionName: string;
  uploadDate: string;
  skillsAdded: string[];
  skillsRemoved: string[];
  evidenceExpansions: string[];
  targetRoleAlignmentScore: number; // 0 to 100
  clarityImprovementScore: number; // 0 to 100
}

export type ResumeVersion = ResumeVersionDiff;

export interface GitHubRepoEvidence {
  name: string;
  language: string;
  stars: number;
  description: string;
  verifiedSkills: string[];
  commitFrequency: 'High' | 'Moderate' | 'Low';
  lastPushed: string;
}

export interface GitHubEvidenceProfile {
  username: string;
  totalPublicRepos: number;
  primaryLanguages: { language: string; percentage: number }[];
  verifiedRepositories: GitHubRepoEvidence[];
  evidenceStrength: 'Strong' | 'Moderate' | 'Inconclusive';
  supportingSummary: string;
}

export type InterviewQuestionCategory = 
  | 'Technical Deep-Dive'
  | 'Project Architecture'
  | 'Evidence Verification'
  | 'Skill Gap & Learning'
  | 'Behavioral & Collaboration';

export interface InterviewQuestion {
  id: string;
  category: InterviewQuestionCategory;
  question: string;
  targetedSkillOrGap: string;
  rationale: string;
  expectedEvidenceSignals: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userRole: UserRole;
  action: string;
  resourceType: 'CANDIDATE' | 'JOB' | 'MATCH' | 'WHAT_IF' | 'INTERVIEW' | 'BLIND_SCREENING';
  resourceId: string;
  details: string;
  parametersLogged?: Record<string, unknown>;
}
