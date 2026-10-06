/**
 * TalentLens AI — End-to-End Workflow Verification Suite
 * Tests Candidate Portal self-service analysis and Recruiter Portal bulk screening
 */

import assert from 'assert';
import {
  extractTextFromBuffer,
  analyzeDocumentStructure,
  buildDynamicCandidateProfile,
  calculateFileHash,
  segmentResumeSections
} from '../src/server/documentParser';
import { analyzeAtsAndContent } from '../src/server/atsService';
import {
  generateResumeSuggestions,
  calculateTextDiffs
} from '../src/server/optimizationService';
import {
  createScreeningBatch,
  buildJobRequisitionFromJd,
  processResumeForBatch,
  compareCandidates,
  exportCandidatesCsv
} from '../src/server/screeningService';
import { evaluateCandidateMatch, DEFAULT_WEIGHTS } from '../src/utils/matchingEngine';

async function runTests() {
  console.log('--- Starting TalentLens AI Workflow Tests ---');

  // Test 1: Plaintext & Buffer Extraction
  console.log('\n[Test 1] Document Extraction & Hash Calculation');
  const samplePdfLikeText = `Devon Vance
San Francisco, CA • devon@example.com

PROFESSIONAL SUMMARY
Senior Full Stack Developer with 4 years of experience building scalable web applications with React, TypeScript, Node.js, and PostgreSQL.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, SQL
Frameworks: React, Next.js, Express, FastAPI
Databases: PostgreSQL, Redis, MongoDB
DevOps: Docker, AWS, Git, CI/CD

PROFESSIONAL EXPERIENCE
Full Stack Engineer — Apex Solutions (2022 - Present)
- Engineered responsive client interfaces in React and TypeScript.
- Architected RESTful microservices in Node.js and PostgreSQL.
- Reduced API query latency by 40% through indexing and Redis caching.

EDUCATION
B.S. Computer Science — University of California (2021)`;

  const buffer = Buffer.from(samplePdfLikeText, 'utf-8');
  const hash = calculateFileHash(buffer);
  assert.ok(hash && hash.length === 64, 'SHA-256 hash must be 64 hex characters');

  const extracted = await extractTextFromBuffer(buffer, 'resume.txt', 'text/plain');
  assert.ok(extracted.normalizedText.includes('Devon Vance'), 'Extracted text must contain candidate name');
  console.log('✓ Document text and hash extracted successfully.');

  // Test 2: Document Structure & Format Warnings
  console.log('\n[Test 2] Document Structure & Format Warnings');
  const signals = analyzeDocumentStructure(extracted.rawText);
  assert.strictEqual(typeof signals.hasTwoColumnLayout, 'boolean');
  assert.strictEqual(typeof signals.hasTables, 'boolean');
  console.log('✓ Document layout signals parsed successfully.');

  // Test 3: Dynamic Candidate Profile Building
  console.log('\n[Test 3] Dynamic Candidate Profile Building (No Predefined Records)');
  const profile = await buildDynamicCandidateProfile(extracted.rawText, 'resume.txt', 1);
  assert.strictEqual(profile.fullName, 'Devon Vance');
  assert.ok(profile.skills.length >= 4, 'Must extract at least 4 technical skills');
  assert.ok(profile.skills.some(s => s.skill === 'React'), 'Must extract React');
  assert.ok(profile.skills.some(s => s.skill === 'TypeScript'), 'Must extract TypeScript');
  assert.ok(profile.skills.some(s => s.skill === 'PostgreSQL'), 'Must extract PostgreSQL');
  console.log(`✓ Candidate profile generated dynamically: ${profile.fullName} (${profile.skills.length} skills).`);

  // Test 4: Job Requisition Parsing from Real JD Text
  console.log('\n[Test 4] Requisition Extraction from Pasted JD Text');
  const jdText = `Senior Full Stack Developer
Requirements:
- 3+ years experience with React, TypeScript, and Node.js.
- Strong knowledge of PostgreSQL and REST APIs.
- Experience with Docker and containerization.
Preferred:
- AWS or GCP cloud knowledge.
- Familiarity with Redis.`;

  const jobReq = buildJobRequisitionFromJd('Senior Full Stack Developer', 'Product Engineering', jdText);
  assert.strictEqual(jobReq.title, 'Senior Full Stack Developer');
  assert.ok(jobReq.requirements.length >= 4, 'Must extract core requirements from JD');
  assert.ok(jobReq.requirements.some(r => r.skill === 'React'), 'Must detect React in JD');
  console.log(`✓ Job requisition extracted: ${jobReq.requirements.length} criteria.`);

  // Test 5: Evidence-First Matching Engine
  console.log('\n[Test 5] Evidence-First Matching Evaluation');
  const matchResult = evaluateCandidateMatch(profile, jobReq, DEFAULT_WEIGHTS);
  assert.ok(matchResult.overallScore > 70, 'Score should reflect strong technical match');
  assert.ok(matchResult.matchedRequiredSkills.includes('React'), 'Must confirm React direct match');
  assert.strictEqual(matchResult.evidenceItems.length, jobReq.requirements.length);
  console.log(`✓ Match evaluated: Overall Score = ${matchResult.overallScore}%, Required Coverage = ${matchResult.breakdown.requiredCoverage}%.`);

  // Test 6: ATS Compatibility & Ethical Guardrails
  console.log('\n[Test 6] ATS Compatibility & Ethical Keyword Classification');
  const extractedDoc = {
    rawText: extracted.rawText,
    normalizedText: extracted.normalizedText,
    fileHash: hash,
    charCount: extracted.rawText.length,
    wordCount: extracted.rawText.split(/\s+/).length,
    pageCount: extracted.pageCount,
    extractionMethod: extracted.extractionMethod,
    sections: segmentResumeSections(extracted.rawText),
    formattingSignals: signals
  };

  const atsAnalysis = analyzeAtsAndContent(profile, jobReq, extractedDoc, matchResult);
  assert.ok(atsAnalysis.atsScore.overallScore >= 50, 'ATS score should be computed');
  assert.strictEqual(typeof atsAnalysis.atsScore.parsingCompatibility, 'number');
  assert.strictEqual(typeof atsAnalysis.atsScore.keywordAlignment, 'number');
  assert.strictEqual(typeof atsAnalysis.atsScore.skillsAlignment, 'number');
  assert.strictEqual(typeof atsAnalysis.atsScore.experienceAlignment, 'number');
  assert.strictEqual(typeof atsAnalysis.atsScore.resumeStructure, 'number');
  assert.strictEqual(typeof atsAnalysis.atsScore.jobRelevance, 'number');

  // Verify ethical keyword rule: do NOT tell candidate to lie about undemonstrated skills
  const notDemonstrated = atsAnalysis.missingKeywords.filter(k => k.category === 'Not demonstrated');
  for (const item of notDemonstrated) {
    assert.strictEqual(item.safeToAdd, false, 'Undemonstrated skills must not be marked safe to add');
    assert.ok(item.recommendation.includes('Do not add'), 'Must warn candidate not to fabricate');
  }
  console.log(`✓ ATS score computed: ${atsAnalysis.atsScore.overallScore}/100 with ethical keyword safeguards.`);

  // Test 7: Resume Optimizer & Rewrite Suggestions
  console.log('\n[Test 7] Resume Rewrite Suggestions Across Modes');
  const suggestions = await generateResumeSuggestions(profile, jobReq, extractedDoc, 'ats_optimized');
  assert.ok(suggestions.length > 0, 'Must generate optimization suggestions');
  assert.ok(suggestions.some(s => s.section === 'Summary'), 'Must include Summary optimization');
  console.log(`✓ Generated ${suggestions.length} optimization suggestions.`);

  // Test 8: Recruiter Bulk Screening Batch & Duplicate Detection
  console.log('\n[Test 8] Recruiter Screening Batch & Duplicate Detection');
  const batch = createScreeningBatch('u-recruiter-test', 'Full Stack Developer', 'Engineering', jdText);
  assert.strictEqual(batch.status, 'PENDING');

  const resume1 = await processResumeForBatch(batch.id, buffer, 'candidate_1.txt', 'text/plain', 1);
  assert.strictEqual(resume1.candidateName, 'Devon Vance');
  batch.candidates.push(resume1);

  // Attempt duplicate upload: must throw error and log duplicate
  let duplicateCaught = false;
  try {
    await processResumeForBatch(batch.id, buffer, 'candidate_1_copy.txt', 'text/plain', 2);
  } catch (err: any) {
    if (err.message.includes('Duplicate resume detected')) {
      duplicateCaught = true;
    }
  }
  assert.ok(duplicateCaught, 'Duplicate resume must be intercepted and reported');
  console.log('✓ Duplicate resume file hash correctly intercepted.');

  // Test 9: Candidate Comparison Matrix & CSV Export
  console.log('\n[Test 9] Candidate Comparison & CSV Export');
  const comparison = compareCandidates(batch.candidates);
  assert.strictEqual(comparison.length, 1);

  const csv = exportCandidatesCsv(batch.candidates);
  assert.ok(csv.includes('Rank,Candidate Name'), 'CSV must contain headers');
  assert.ok(csv.includes('Devon Vance'), 'CSV must contain candidate name');
  console.log('✓ Candidate comparison and CSV export generated successfully.');

  console.log('\n=============================================');
  console.log('ALL WORKFLOW VERIFICATION TESTS PASSED (9/9)!');
  console.log('=============================================\n');
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
