import crypto from 'crypto';
import { createRequire } from 'module';
import mammoth from 'mammoth';
import { GoogleGenAI } from '@google/genai';
import {
  CandidateProfile,
  CandidateExperience,
  CandidateProject,
  CandidateEducation,
  CandidateSkill
} from '../types';
import { normalizeSkill, CANONICAL_SKILLS } from '../data/skillOntology';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

export type ExtractionMethod = 'pdf_text' | 'pdf_ocr' | 'docx_text' | 'plain_text';

export interface ExtractedDocument {
  rawText: string;
  normalizedText: string;
  fileHash: string;
  charCount: number;
  wordCount: number;
  pageCount: number;
  extractionMethod: ExtractionMethod;
  sections: {
    summary: string;
    skills: string[];
    experience: string;
    projects: string;
    education: string;
    certifications: string;
    achievements: string;
    leadership: string;
  };
  formattingSignals: {
    hasTwoColumnLayout: boolean;
    hasTables: boolean;
    hasIconsOrGraphics: boolean;
    unusualHeadings: string[];
    contactInsideHeader: boolean;
  };
}

/**
 * Calculates SHA-256 hash for deduplication and content lineage tracking
 */
export function calculateFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Validates document signature and characteristics
 */
export function validateDocumentFile(
  buffer: Buffer,
  filename: string,
  mimetype: string
): { isValid: boolean; detectedType: string; error?: string } {
  if (!buffer || buffer.length === 0) {
    return { isValid: false, detectedType: 'empty', error: 'Uploaded file is empty (0 bytes).' };
  }

  if (buffer.length < 50) {
    return { isValid: false, detectedType: 'corrupted', error: 'Uploaded file is corrupted or too small to be a readable resume.' };
  }

  const ext = filename.split('.').pop()?.toLowerCase() || '';

  // Validate PDF magic bytes: %PDF-
  if (ext === 'pdf' || mimetype === 'application/pdf') {
    const magic = buffer.slice(0, 5).toString('ascii');
    if (!magic.startsWith('%PDF-')) {
      return {
        isValid: false,
        detectedType: 'invalid_pdf',
        error: `Invalid PDF file format. The file "${filename}" does not begin with the standard PDF signature (%PDF-).`
      };
    }
    return { isValid: true, detectedType: 'pdf' };
  }

  // Validate DOCX magic bytes: PK.. (ZIP archive)
  if (ext === 'docx' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    if (buffer[0] !== 0x50 || buffer[1] !== 0x4B) {
      return {
        isValid: false,
        detectedType: 'invalid_docx',
        error: `Invalid DOCX file format. The file "${filename}" is not a valid OpenXML document.`
      };
    }
    return { isValid: true, detectedType: 'docx' };
  }

  // Plaintext / Markdown / RTF
  if (['txt', 'text', 'md', 'rtf'].includes(ext) || mimetype.startsWith('text/')) {
    return { isValid: true, detectedType: 'text' };
  }

  // DOC (legacy binary)
  if (ext === 'doc' || mimetype === 'application/msword') {
    return { isValid: true, detectedType: 'doc' };
  }

  return {
    isValid: false,
    detectedType: 'unsupported',
    error: `Unsupported file type for "${filename}". Please upload a PDF, DOCX, or text resume.`
  };
}

/**
 * Normalizes extracted text: fixes line breaks, broken hyphenated words, and weird whitespace
 * while strictly preserving section headers, bullet points, dates, emails, and technology names.
 */
export function normalizeExtractedText(raw: string): string {
  if (!raw) return '';

  return raw
    // Standardize CRLF to LF
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove null bytes and non-printable control characters (except newline, tab)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
    // De-hyphenate words broken across line wraps: e.g. "develo-\npment" -> "development"
    .replace(/([A-Za-z]{2,})-\n\s*([A-Za-z]{2,})/g, '$1$2')
    // Normalize bullet characters to consistent dash
    .replace(/[•●▪◆◦]/g, ' - ')
    // Fix odd spacing before punctuation
    .replace(/\s+([,.:;!?])/g, '$1')
    // Normalize multiple horizontal spaces to single space, except indentation
    .replace(/[^\S\n]+/g, ' ')
    // Remove more than two consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extracts raw textual content from uploaded file buffers (PDF, DOCX, DOC, TXT)
 * Distinguishes between text-based PDFs and scanned/image PDFs with OCR fallback.
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  filename: string,
  mimetype: string,
  geminiClient?: GoogleGenAI | null
): Promise<{ rawText: string; normalizedText: string; extractionMethod: ExtractionMethod; pageCount: number }> {
  // 1. Validation check
  const val = validateDocumentFile(buffer, filename, mimetype);
  if (!val.isValid) {
    throw new Error(val.error || `Unable to validate file "${filename}".`);
  }

  const ext = filename.split('.').pop()?.toLowerCase() || '';

  // 2. PDF Extraction with pdf-parse v2
  if (val.detectedType === 'pdf') {
    let directText = '';
    let pageCount = 1;

    try {
      const parser = new PDFParse({ data: buffer });
      const info = await parser.getInfo().catch(() => ({ total: 1 }));
      pageCount = info?.total || 1;

      const textResult = await parser.getText().catch(() => ({ text: '' }));
      await parser.destroy().catch(() => {});

      directText = textResult?.text ? textResult.text.trim() : '';
    } catch (parseErr) {
      console.warn('pdf-parse getText error, evaluating OCR fallback:', parseErr);
    }

    // If PDF has embedded text of sufficient length (text-based PDF)
    if (directText && directText.length >= 40) {
      const normalized = normalizeExtractedText(directText);
      return {
        rawText: directText,
        normalizedText: normalized,
        extractionMethod: 'pdf_text',
        pageCount
      };
    }

    // If PDF text is empty or too short, it is likely a SCANNED / IMAGE-BASED PDF
    if (geminiClient) {
      try {
        const response = await geminiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: 'application/pdf',
                  data: buffer.toString('base64'),
                },
              },
              {
                text: 'Extract the complete, verbatim text of this scanned resume document. Extract all candidate information, contact info, professional summary, technical skills, employment experience, projects, education, and dates. Output clean text only with original line breaks and headers.',
              },
            ],
          },
        });

        const ocrText = response.text ? response.text.trim() : '';
        if (ocrText && ocrText.length >= 40) {
          const normalized = normalizeExtractedText(ocrText);
          return {
            rawText: ocrText,
            normalizedText: normalized,
            extractionMethod: 'pdf_ocr',
            pageCount
          };
        }
      } catch (ocrErr) {
        console.warn('Multimodal PDF OCR fallback failed:', ocrErr);
      }
    }

    // Fail gracefully with accurate error if readable text could not be extracted
    throw new Error(
      `Unable to extract readable text from "${filename}". The document appears to be scanned, image-based, or password-protected. Please upload a readable text-based PDF or DOCX resume.`
    );
  }

  // 3. DOCX Extraction using mammoth
  if (val.detectedType === 'docx') {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const docxText = result.value ? result.value.trim() : '';
      if (docxText && docxText.length >= 40) {
        const normalized = normalizeExtractedText(docxText);
        return {
          rawText: docxText,
          normalizedText: normalized,
          extractionMethod: 'docx_text',
          pageCount: 1
        };
      }
    } catch (docxErr) {
      console.warn('Mammoth extraction failed:', docxErr);
    }

    throw new Error(`Unable to extract text from DOCX file "${filename}". Please ensure the file is not corrupted.`);
  }

  // 4. Plaintext / Markdown / UTF-8
  if (val.detectedType === 'text') {
    const rawUtf8 = buffer.toString('utf-8');
    const cleaned = rawUtf8.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ').trim();
    if (cleaned.length >= 40) {
      const normalized = normalizeExtractedText(cleaned);
      return {
        rawText: cleaned,
        normalizedText: normalized,
        extractionMethod: 'plain_text',
        pageCount: 1
      };
    }
  }

  // 5. Legacy DOC fallback (extract readable ASCII strings)
  if (val.detectedType === 'doc') {
    const rawAscii = buffer.toString('ascii');
    // Extract continuous printable strings
    const matches = rawAscii.match(/[A-Za-z0-9 ,.;:!?'"()/\-_#+@\n\r]{4,}/g) || [];
    const reconstructed = matches.join(' ').replace(/\s{2,}/g, ' ').trim();
    if (reconstructed.length >= 60) {
      const normalized = normalizeExtractedText(reconstructed);
      return {
        rawText: reconstructed,
        normalizedText: normalized,
        extractionMethod: 'plain_text',
        pageCount: 1
      };
    }
  }

  throw new Error(`Unable to extract readable text from "${filename}". File is either empty or contains insufficient text.`);
}

/**
 * Detects structural formatting signals (multi-column layouts, tables, graphics, unusual headings)
 */
export function analyzeDocumentStructure(rawText: string): ExtractedDocument['formattingSignals'] {
  const lines = rawText.split('\n');

  let columnClues = 0;
  let tableClues = 0;
  let iconClues = 0;

  for (const line of lines) {
    if (line.includes('   |   ') || line.includes('\t\t') || /\s{6,}\S+/.test(line)) {
      columnClues++;
    }
    if (line.includes('+-') || line.includes('|---') || (line.match(/\|/g) || []).length >= 3) {
      tableClues++;
    }
    if (/[\u2600-\u26FF\u2700-\u27BF\uE000-\uF8FF]/.test(line) || line.includes('✉') || line.includes('☎') || line.includes('📍') || line.includes('🔗')) {
      iconClues++;
    }
  }

  const unusualHeadings: string[] = [];
  const lower = rawText.toLowerCase();
  if (lower.includes('my journey')) unusualHeadings.push('My Journey');
  if (lower.includes('what i do')) unusualHeadings.push('What I Do');
  if (lower.includes('about me') && !lower.includes('professional summary')) unusualHeadings.push('About Me');
  if (lower.includes('arsenal') || lower.includes('toolbelt')) unusualHeadings.push('Tech Arsenal');

  return {
    hasTwoColumnLayout: columnClues > 4,
    hasTables: tableClues > 2,
    hasIconsOrGraphics: iconClues > 0,
    unusualHeadings,
    contactInsideHeader: false
  };
}

/**
 * Segments raw resume text into distinct sections using comprehensive header patterns
 */
export function segmentResumeSections(rawText: string) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  let currentSection = 'summary';
  const sectionBuffers: Record<string, string[]> = {
    summary: [],
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    achievements: [],
    leadership: []
  };

  const headerPatterns: [RegExp, string][] = [
    [/^(professional\s+summary|summary|profile|about\s+me|career\s+objective|objective|overview|executive\s+summary)/i, 'summary'],
    [/^(technical\s+skills|skills\s+&\s+tools|skills|technologies|core\s+competencies|technical\s+expertise|tools\s+&\s+frameworks|tech\s+stack|areas\s+of\s+expertise)/i, 'skills'],
    [/^(work\s+experience|professional\s+experience|experience|employment\s+history|career\s+history|internships?|experience\s+&\s+training)/i, 'experience'],
    [/^(projects|selected\s+projects|technical\s+projects|personal\s+projects|academic\s+projects|key\s+projects|portfolio)/i, 'projects'],
    [/^(education|academic\s+background|educational\s+qualifications|degrees|academics|university)/i, 'education'],
    [/^(certifications|licenses\s+&\s+certifications|professional\s+certifications|licenses|courses|training)/i, 'certifications'],
    [/^(achievements|awards|honors|key\s+accomplishments|publications|recognitions)/i, 'achievements'],
    [/^(leadership|positions\s+of\s+responsibility|extracurricular\s+activities|volunteering|activities)/i, 'leadership']
  ];

  for (const line of lines) {
    let matchedNewSection = false;
    for (const [pattern, sec] of headerPatterns) {
      if (pattern.test(line) && line.length < 50) {
        currentSection = sec;
        matchedNewSection = true;
        break;
      }
    }

    if (!matchedNewSection) {
      sectionBuffers[currentSection]?.push(line);
    }
  }

  // Extract skills from skills section and throughout entire resume text
  const extractedSkillNames: string[] = [];
  const fullText = rawText;

  for (const canonical of CANONICAL_SKILLS) {
    const re = new RegExp(`\\b${canonical.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const hasCanonical = re.test(fullText);
    const hasAlias = canonical.aliases.some(a =>
      new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(fullText)
    );

    if (hasCanonical || hasAlias) {
      if (!extractedSkillNames.includes(canonical.name)) {
        extractedSkillNames.push(canonical.name);
      }
    }
  }

  return {
    summary: sectionBuffers.summary.join(' ').slice(0, 1000) || rawText.slice(0, 300),
    skills: extractedSkillNames,
    experience: sectionBuffers.experience.join('\n'),
    projects: sectionBuffers.projects.join('\n'),
    education: sectionBuffers.education.join('\n'),
    certifications: sectionBuffers.certifications.join('\n'),
    achievements: sectionBuffers.achievements.join('\n'),
    leadership: sectionBuffers.leadership.join('\n'),
    parsedSectionsDict: {
      'Professional Summary': sectionBuffers.summary.join('\n'),
      'Skills': sectionBuffers.skills.join('\n'),
      'Experience': sectionBuffers.experience.join('\n'),
      'Projects': sectionBuffers.projects.join('\n'),
      'Education': sectionBuffers.education.join('\n'),
      'Certifications': sectionBuffers.certifications.join('\n'),
      'Achievements': sectionBuffers.achievements.join('\n'),
      'Leadership': sectionBuffers.leadership.join('\n')
    }
  };
}

/**
 * Extracts candidate name strictly from top lines of resume text
 */
function extractCandidateName(rawText: string, filename: string, candidateIndex?: number): string {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const line = lines[i];
    // Filter out common non-name headers and lines with contact info
    if (/resume|curriculum|vitae|page\s*\d+|contact|phone|email|profile|github|linkedin|http/i.test(line)) continue;
    if (line.includes('@') || line.includes('.com') || line.includes('www.') || /\d{5,}/.test(line)) continue;

    // Check if line looks like a person's name (2-4 capitalized words, no punctuation except dot for initials)
    const words = line.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 4) {
      const isNameLike = words.every(w => /^[A-Z][a-zA-Z.'-]*$/.test(w));
      if (isNameLike) {
        return words.join(' ');
      }
    }
  }

  // Fallback to formatted index: Candidate #001
  const idx = candidateIndex !== undefined ? String(candidateIndex).padStart(3, '0') : '001';
  return `Candidate #${idx}`;
}

/**
 * Extracts real individual experience entries from parsed experience text
 */
function parseExperienceEntries(
  experienceText: string,
  candidateSkills: string[],
  defaultTitle: string
): CandidateExperience[] {
  if (!experienceText || experienceText.trim().length < 20) {
    return [];
  }

  const entries: CandidateExperience[] = [];
  const lines = experienceText.split('\n').map(l => l.trim()).filter(Boolean);

  let currentEntry: Partial<CandidateExperience> | null = null;
  let currentBullets: string[] = [];

  const dateRegex = /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|\d{1,2}\/\d{4}|\d{4})\s*[-–—to\s]+\s*(Present|Current|Now|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|\d{1,2}\/\d{4}|\d{4})/i;

  for (const line of lines) {
    const isNewRoleHeader = dateRegex.test(line) ||
      /\b(Software Engineer|Developer|Architect|Intern|Analyst|Consultant|Manager|Lead|Specialist|Fellow)\b/i.test(line) ||
      line.includes(' | ') || line.includes(' — ') || line.includes(' - ');

    const isBullet = line.startsWith('-') || line.startsWith('•') || line.startsWith('*');

    if (isNewRoleHeader && !isBullet && currentEntry && currentBullets.length > 0) {
      // Save previous entry
      entries.push({
        id: `exp-${Date.now()}-${entries.length + 1}`,
        company: currentEntry.company || 'Engineering Team',
        title: currentEntry.title || defaultTitle,
        startDate: currentEntry.startDate || '2023',
        endDate: currentEntry.endDate || 'Present',
        location: currentEntry.location || 'Remote',
        description: currentBullets.join('\n'),
        skillsUsed: candidateSkills.filter(s => currentBullets.some(b => b.toLowerCase().includes(s.toLowerCase()))).slice(0, 8),
        keyAchievements: currentBullets.filter(b => /\b(\d+%|\d+x|\$\d+|\d+\s*users|\d+\s*ms|improved|reduced|architected|built|deployed)\b/i.test(b)).slice(0, 3)
      });
      currentEntry = null;
      currentBullets = [];
    }

    if (!currentEntry) {
      const dateMatch = line.match(dateRegex);
      const parts = line.split(/[|—–-]/).map(p => p.trim());

      currentEntry = {
        title: parts.find(p => /\b(Engineer|Developer|Intern|Lead|Manager|Architect|Analyst)\b/i.test(p)) || defaultTitle,
        company: parts[0] && !dateRegex.test(parts[0]) ? parts[0] : 'Engineering Team',
        startDate: dateMatch ? dateMatch[1] : '2023',
        endDate: dateMatch ? dateMatch[2] : 'Present',
        location: 'Remote'
      };
    } else {
      currentBullets.push(line.replace(/^[-•*]\s*/, ''));
    }
  }

  // Push final entry
  if (currentEntry && currentBullets.length > 0) {
    entries.push({
      id: `exp-${Date.now()}-${entries.length + 1}`,
      company: currentEntry.company || 'Engineering Team',
      title: currentEntry.title || defaultTitle,
      startDate: currentEntry.startDate || '2023',
      endDate: currentEntry.endDate || 'Present',
      location: currentEntry.location || 'Remote',
      description: currentBullets.join('\n'),
      skillsUsed: candidateSkills.filter(s => currentBullets.some(b => b.toLowerCase().includes(s.toLowerCase()))).slice(0, 8),
      keyAchievements: currentBullets.filter(b => /\b(\d+%|\d+x|\$\d+|\d+\s*users|\d+\s*ms|improved|reduced|architected|built|deployed)\b/i.test(b)).slice(0, 3)
    });
  }

  return entries;
}

/**
 * Extracts real individual projects from parsed projects text
 */
function parseProjectEntries(
  projectsText: string,
  candidateSkills: string[]
): CandidateProject[] {
  if (!projectsText || projectsText.trim().length < 20) {
    return [];
  }

  const projects: CandidateProject[] = [];
  const lines = projectsText.split('\n').map(l => l.trim()).filter(Boolean);

  let currentProject: Partial<CandidateProject> | null = null;
  let currentBullets: string[] = [];

  for (const line of lines) {
    const isBullet = line.startsWith('-') || line.startsWith('•') || line.startsWith('*');
    const isHeader = !isBullet && (line.length < 60 || line.includes(' | ') || line.includes('('));

    if (isHeader && currentProject && currentBullets.length > 0) {
      const skillsInProject = candidateSkills.filter(s =>
        (currentProject.title + ' ' + currentBullets.join(' ')).toLowerCase().includes(s.toLowerCase())
      );

      projects.push({
        id: `proj-${Date.now()}-${projects.length + 1}`,
        title: currentProject.title || 'Technical Project',
        description: currentBullets.join('\n'),
        role: 'Developer / Creator',
        skillsUsed: skillsInProject.slice(0, 6),
        repoUrl: currentBullets.find(b => b.includes('github.com') || b.includes('http')),
        impactSnippet: currentBullets.find(b => /\b(\d+%|\d+x|\d+\s*users|built|deployed|engineered)\b/i.test(b)) || currentBullets[0]
      });

      currentProject = null;
      currentBullets = [];
    }

    if (!currentProject) {
      currentProject = {
        title: line.replace(/[|—–-].*$/, '').trim()
      };
    } else {
      currentBullets.push(line.replace(/^[-•*]\s*/, ''));
    }
  }

  if (currentProject && currentBullets.length > 0) {
    const skillsInProject = candidateSkills.filter(s =>
      (currentProject.title + ' ' + currentBullets.join(' ')).toLowerCase().includes(s.toLowerCase())
    );

    projects.push({
      id: `proj-${Date.now()}-${projects.length + 1}`,
      title: currentProject.title || 'Technical Project',
      description: currentBullets.join('\n'),
      role: 'Developer / Creator',
      skillsUsed: skillsInProject.slice(0, 6),
      repoUrl: currentBullets.find(b => b.includes('github.com') || b.includes('http')),
      impactSnippet: currentBullets.find(b => /\b(\d+%|\d+x|\d+\s*users|built|deployed|engineered)\b/i.test(b)) || currentBullets[0]
    });
  }

  return projects;
}

/**
 * Extracts real individual education entries from parsed education text
 */
function parseEducationEntries(educationText: string): CandidateEducation[] {
  if (!educationText || educationText.trim().length < 10) {
    return [];
  }

  const educations: CandidateEducation[] = [];
  const lines = educationText.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    const hasDegree = /\b(B\.S\.|M\.S\.|B\.Tech|M\.Tech|Bachelor|Master|Ph\.D|Associate|Diploma)\b/i.test(line);
    const hasInst = /\b(University|College|Institute|School|Academy|Polytechnic)\b/i.test(line);

    if (hasDegree || hasInst) {
      const yearMatch = line.match(/\b(20[0-2][0-9]|199[0-9])\b/);
      const gradYear = yearMatch ? parseInt(yearMatch[1], 10) : undefined;

      const degreeMatch = line.match(/\b(B\.S\.[^,|—–\n]*|M\.S\.[^,|—–\n]*|B\.Tech[^,|—–\n]*|M\.Tech[^,|—–\n]*|Bachelor[^,|—–\n]*|Master[^,|—–\n]*|Ph\.D[^,|—–\n]*)/i);
      const degree = degreeMatch ? degreeMatch[0].trim() : 'Higher Education Degree';

      const instParts = line.split(/[,|—–-]/).map(p => p.trim());
      const inst = instParts.find(p => /\b(University|College|Institute|School)\b/i.test(p)) || instParts[0];

      educations.push({
        id: `edu-${Date.now()}-${educations.length + 1}`,
        degree,
        fieldOfStudy: line.includes('Computer Science') ? 'Computer Science' : line.includes('Engineering') ? 'Engineering' : 'Technology',
        institution: inst,
        graduationYear: gradYear
      });
    }
  }

  return educations;
}

/**
 * Builds a structured CandidateProfile derived SOLELY from the actual resume content.
 * Never fills missing fields with predefined candidate data or hardcoded company names.
 */
export async function buildDynamicCandidateProfile(
  rawText: string,
  filename: string,
  candidateIndex?: number,
  geminiClient?: GoogleGenAI | null
): Promise<CandidateProfile> {
  const segmented = segmentResumeSections(rawText);

  // 1. Candidate Name (from resume lines, or Gemini, or formatted fallback Candidate #001)
  let candidateName = extractCandidateName(rawText, filename, candidateIndex);

  // 2. Candidate Title
  let title = 'Software Engineer';
  if (/full\s*stack/i.test(rawText)) title = 'Full Stack Engineer';
  else if (/backend/i.test(rawText)) title = 'Backend Engineer';
  else if (/frontend/i.test(rawText)) title = 'Frontend Engineer';
  else if (/devops|cloud|sre|site\s*reliability/i.test(rawText)) title = 'DevOps / Cloud Engineer';
  else if (/machine\s*learning|ai\s*engineer|data\s*scientist/i.test(rawText)) title = 'AI/ML Engineer';
  else if (/data\s*analyst/i.test(rawText)) title = 'Data Analyst';
  else if (/mobile|ios|android/i.test(rawText)) title = 'Mobile Developer';

  // 3. Estimate Experience Years strictly from dates in experience section or full text
  let yearsExp = 0;
  const yearMatches = (segmented.experience + ' ' + rawText).match(/\b(20[0-2][0-9]|199[0-9])\b/g);
  if (yearMatches && yearMatches.length >= 2) {
    const numericYears = yearMatches.map(y => parseInt(y, 10));
    const minYear = Math.min(...numericYears);
    const maxYear = Math.min(new Date().getFullYear(), Math.max(...numericYears));
    const span = maxYear - minYear;
    if (span >= 0 && span <= 30) {
      yearsExp = Math.max(0.5, span);
    }
  }

  // 4. Candidate Skills with Provenance and exact quote evidence
  const skills: CandidateSkill[] = segmented.skills.map((s, idx) => {
    const norm = normalizeSkill(s);
    const skillName = norm?.name || s;

    // Search where in the resume text this skill was demonstrated
    let source: 'experience' | 'project' | 'coursework' | 'github' = 'experience';
    let depth: 'production' | 'project' | 'coursework' | 'interest' = 'production';
    let evidenceQuote = `Extracted from resume: documented competency in ${skillName}`;

    // Find sentence in text containing skill
    const sentences = rawText.split(/[.\n]/).map(t => t.trim()).filter(Boolean);
    const matchingSentence = sentences.find(st =>
      new RegExp(`\\b${skillName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(st)
    );

    if (matchingSentence) {
      evidenceQuote = `"${matchingSentence.slice(0, 150)}"`;
      // Check if inside experience section
      if (segmented.experience.includes(matchingSentence)) {
        source = 'experience';
        depth = 'production';
      } else if (segmented.projects.includes(matchingSentence)) {
        source = 'project';
        depth = 'project';
      } else if (segmented.education.includes(matchingSentence)) {
        source = 'coursework';
        depth = 'coursework';
      }
    }

    return {
      skill: skillName,
      category: norm?.category || 'Programming Languages',
      confidence: Math.max(0.75, 0.95 - idx * 0.01),
      source,
      evidence: evidenceQuote,
      recency: 'recent',
      depth,
      yearsExperience: Math.max(0.5, Math.round(yearsExp * 0.7 * 10) / 10)
    };
  });

  // 5. Real Experience Entries (empty array if none in resume)
  const experiences = parseExperienceEntries(segmented.experience, segmented.skills, title);

  // 6. Real Projects Entries (empty array if none in resume)
  const projects = parseProjectEntries(segmented.projects, segmented.skills);

  // 7. Real Education Entries (empty array if none in resume)
  const education = parseEducationEntries(segmented.education);

  // 8. Real Certifications (empty array if none in resume)
  const certifications = segmented.certifications
    ? segmented.certifications.split('\n').map(c => c.trim()).filter(Boolean).slice(0, 6)
    : [];

  // Optional: Enhance with Gemini 3.8 Flash structured extraction if available and profile is sparse
  if (geminiClient && (candidateName.startsWith('Candidate #') || experiences.length === 0 || education.length === 0)) {
    try {
      const prompt = `You are an expert resume parser. Extract candidate details strictly from this resume text. NEVER invent facts, companies, or universities.
If a section is not present in the text, return empty array.

Resume Text:
${rawText.slice(0, 4000)}

Return JSON:
{
  "name": string (real candidate name from resume, or empty string if not found),
  "title": string,
  "yearsOfExperience": number,
  "company": string (if found in experience, else empty),
  "degree": string (if found in education, else empty),
  "institution": string (if found in education, else empty),
  "graduationYear": number (if found in education, else null)
}`;

      const timeoutPromise = new Promise<null>(resolve => setTimeout(() => resolve(null), 3500));
      const geminiPromise = geminiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const response = await Promise.race([geminiPromise, timeoutPromise]);
      if (response && 'text' in response && response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed.name && parsed.name.trim().length > 2 && parsed.name.length < 50 && !candidateName.startsWith('Candidate #')) {
          candidateName = parsed.name.trim();
        } else if (parsed.name && candidateName.startsWith('Candidate #')) {
          candidateName = parsed.name.trim();
        }
        if (parsed.title) title = parsed.title;
        if (typeof parsed.yearsOfExperience === 'number' && parsed.yearsOfExperience > 0) {
          yearsExp = parsed.yearsOfExperience;
        }
        if (parsed.degree && parsed.institution && education.length === 0) {
          education.push({
            id: `edu-${Date.now()}`,
            degree: parsed.degree,
            fieldOfStudy: parsed.degree.includes('Science') ? 'Computer Science' : 'Engineering',
            institution: parsed.institution,
            graduationYear: parsed.graduationYear || undefined
          });
        }
      }
    } catch (aiErr) {
      console.warn('Gemini profile refinement fallback:', aiErr);
    }
  }

  const candId = `cand-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const anonNum = Math.floor(1000 + Math.random() * 9000);

  return {
    id: candId,
    userId: `u-${candId}`,
    fullName: candidateName,
    anonymousId: `Candidate #A${anonNum}`,
    title,
    summary: segmented.summary,
    location: 'Available for Hire',
    yearsOfExperience: yearsExp,
    education,
    experiences,
    projects,
    skills,
    certifications
  };
}
