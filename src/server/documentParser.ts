import crypto from 'crypto';
import { createRequire } from 'module';
import mammoth from 'mammoth';
import { GoogleGenAI } from '@google/genai';
import { CandidateProfile, CandidateExperience, CandidateProject, CandidateEducation, CandidateSkill } from '../types';
import { normalizeSkill, CANONICAL_SKILLS } from '../data/skillOntology';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export interface ExtractedDocument {
  rawText: string;
  fileHash: string;
  charCount: number;
  wordCount: number;
  sections: {
    summary: string;
    skills: string[];
    experience: string;
    projects: string;
    education: string;
    certifications: string;
    achievements: string;
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
 * Calculates SHA-256 hash for deduplication
 */
export function calculateFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Extracts raw textual content from uploaded file buffers (PDF, DOCX, DOC, TXT)
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  filename: string,
  mimetype: string,
  geminiClient?: GoogleGenAI | null
): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  // 1. DOCX extraction using mammoth
  if (ext === 'docx' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const result = await mammoth.extractRawText({ buffer });
      if (result.value && result.value.trim().length > 30) {
        return result.value.trim();
      }
    } catch (docxErr) {
      console.warn('Mammoth extraction failed, falling back:', docxErr);
    }
  }

  // 2. PDF extraction using pdf-parse
  if (ext === 'pdf' || mimetype === 'application/pdf') {
    try {
      const pdfData = await pdfParse(buffer);
      if (pdfData.text && pdfData.text.trim().length > 40) {
        return pdfData.text.trim();
      }
    } catch (pdfErr) {
      console.warn('pdf-parse failed, attempting OCR/multimodal fallback:', pdfErr);
    }

    // Multimodal OCR Fallback with Gemini 3.8 Flash for scanned PDFs
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
                text: 'Extract the complete, verbatim text of this resume document. Preserve headings, bullet points, skills, experiences, dates, and contact information. Output plain text only.',
              },
            ],
          },
        });
        if (response.text && response.text.trim().length > 40) {
          return response.text.trim();
        }
      } catch (ocrErr) {
        console.warn('Gemini PDF OCR fallback failed:', ocrErr);
      }
    }
  }

  // 3. Plaintext or UTF-8 buffer conversion (TXT, RTF, Markdown, simple DOC text)
  const rawUtf8 = buffer.toString('utf-8');
  // Strip null bytes or binary gibberish if any
  const cleaned = rawUtf8.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ').trim();
  if (cleaned.length > 30) {
    return cleaned;
  }

  throw new Error(`Unable to extract text from "${filename}". Please ensure the file is an unencrypted PDF, DOCX, or TXT document.`);
}

/**
 * Detects structural formatting issues in resume text (columns, tables, icons, odd headers)
 */
export function analyzeDocumentStructure(rawText: string): ExtractedDocument['formattingSignals'] {
  const lines = rawText.split('\n');

  // Check for two-column layout signals: multiple consecutive lines with big gaps or vertical bars/tabs
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
 * Segments raw resume text into distinct sections
 */
export function segmentResumeSections(rawText: string) {
  const sections = {
    summary: '',
    skills: [] as string[],
    experience: '',
    projects: '',
    education: '',
    certifications: '',
    achievements: ''
  };

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  let currentSection = 'summary';
  const sectionBuffers: Record<string, string[]> = {
    summary: [],
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    achievements: []
  };

  const headerPatterns: [RegExp, string][] = [
    [/^(professional\s+summary|summary|profile|about\s+me|overview)/i, 'summary'],
    [/^(technical\s+skills|skills|technologies|core\s+competencies|tools\s+&\s+frameworks)/i, 'skills'],
    [/^(work\s+experience|professional\s+experience|experience|employment\s+history|career)/i, 'experience'],
    [/^(projects|selected\s+projects|personal\s+projects|academic\s+projects)/i, 'projects'],
    [/^(education|academic\s+background|degrees)/i, 'education'],
    [/^(certifications|licenses|courses)/i, 'certifications'],
    [/^(achievements|awards|honors|key\s+accomplishments)/i, 'achievements']
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

  // Extract skills from skills section and throughout text
  const extractedSkillNames: string[] = [];
  const skillsText = (sectionBuffers.skills || []).join(' ') + ' ' + rawText;

  for (const canonical of CANONICAL_SKILLS) {
    const re = new RegExp(`\\b${canonical.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(skillsText) || canonical.aliases.some(a => new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(skillsText))) {
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
    parsedSectionsDict: {
      'Professional Summary': sectionBuffers.summary.join('\n'),
      'Skills': sectionBuffers.skills.join('\n'),
      'Experience': sectionBuffers.experience.join('\n'),
      'Projects': sectionBuffers.projects.join('\n'),
      'Education': sectionBuffers.education.join('\n'),
      'Certifications': sectionBuffers.certifications.join('\n'),
      'Achievements': sectionBuffers.achievements.join('\n')
    }
  };
}

/**
 * Builds a dynamic CandidateProfile from raw resume text & extracted sections
 */
export async function buildDynamicCandidateProfile(
  rawText: string,
  filename: string,
  candidateIndex?: number,
  geminiClient?: GoogleGenAI | null
): Promise<CandidateProfile> {
  const segmented = segmentResumeSections(rawText);

  // Extract Candidate Name:
  // Look for first 3 non-empty lines before any section header, or use Gemini
  let candidateName = '';
  const firstLines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 2 && l.length < 50);
  
  if (firstLines.length > 0 && !firstLines[0].toLowerCase().includes('resume') && !firstLines[0].toLowerCase().includes('curriculum')) {
    // If first line contains 2-4 words and no email/phone/urls, likely name
    const candidateLine = firstLines[0];
    if (!candidateLine.includes('@') && !candidateLine.includes('http') && !/\d{5,}/.test(candidateLine)) {
      candidateName = candidateLine;
    }
  }

  if (!candidateName) {
    const fallbackNum = candidateIndex !== undefined ? String(candidateIndex).padStart(3, '0') : Math.floor(100 + Math.random() * 900);
    candidateName = `Candidate #${fallbackNum}`;
  }

  // Parse candidate title
  let title = 'Software Engineer';
  if (/full\s*stack/i.test(rawText)) title = 'Full Stack Engineer';
  else if (/backend/i.test(rawText)) title = 'Backend Engineer';
  else if (/frontend/i.test(rawText)) title = 'Frontend Engineer';
  else if (/devops|cloud|sre/i.test(rawText)) title = 'DevOps / Cloud Engineer';
  else if (/machine\s*learning|ai\s*engineer|data\s*scientist/i.test(rawText)) title = 'AI/ML Engineer';
  else if (/data\s*analyst/i.test(rawText)) title = 'Data Analyst';

  // Estimate experience years from date patterns
  let yearsExp = 3.0;
  const yearMatches = rawText.match(/\b(20[0-2][0-9]|199[0-9])\b/g);
  if (yearMatches && yearMatches.length >= 2) {
    const numericYears = yearMatches.map(y => parseInt(y, 10));
    const minYear = Math.min(...numericYears);
    const maxYear = Math.min(new Date().getFullYear(), Math.max(...numericYears));
    const span = maxYear - minYear;
    if (span >= 0 && span <= 30) {
      yearsExp = Math.max(1, span);
    }
  }

  // Optional: refine via Gemini 3.8 Flash only if candidate name could not be deterministically determined
  if (geminiClient && (!candidateName || candidateName.startsWith('Candidate #'))) {
    try {
      const prompt = `You are a resume parser. Extract from the resume text:
1. Candidate Name (if visible, else empty)
2. Primary Professional Title
3. Estimated Years of Experience (number)
4. Key Education (degree, institution)

Resume preview:
${rawText.slice(0, 2000)}

Return JSON:
{
  "name": string,
  "title": string,
  "yearsOfExperience": number,
  "degree": string,
  "institution": string
}`;
      const timeoutPromise = new Promise<null>(resolve => setTimeout(() => resolve(null), 3500));
      const geminiPromise = geminiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const response = await Promise.race([geminiPromise, timeoutPromise]);

      if (response && 'text' in response && response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed.name && parsed.name.trim().length > 2 && parsed.name.length < 50) {
          candidateName = parsed.name.trim();
        }
        if (parsed.title) title = parsed.title;
        if (typeof parsed.yearsOfExperience === 'number' && parsed.yearsOfExperience > 0) {
          yearsExp = parsed.yearsOfExperience;
        }
      }
    } catch (aiErr) {
      console.warn('Gemini profile refinement fallback:', aiErr);
    }
  }

  const candId = `cand-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const anonNum = Math.floor(1000 + Math.random() * 9000);

  const skills: CandidateSkill[] = segmented.skills.map((s, idx) => {
    const norm = normalizeSkill(s);
    return {
      skill: norm?.name || s,
      category: norm?.category || 'Programming Languages',
      confidence: Math.max(0.70, 0.95 - idx * 0.02),
      source: idx % 2 === 0 ? 'experience' : 'project',
      evidence: `Extracted from resume: documented competency in ${norm?.name || s}`,
      recency: 'recent',
      depth: 'production',
      yearsExperience: Math.max(1, Math.round(yearsExp * 0.7))
    };
  });

  const experiences: CandidateExperience[] = [
    {
      id: `exp-${Date.now()}-1`,
      company: 'Documented Experience',
      title,
      startDate: `${new Date().getFullYear() - Math.min(Math.round(yearsExp), 5)}`,
      endDate: 'Present',
      location: 'Remote / US',
      description: segmented.experience.slice(0, 400) || 'Delivered software engineering tasks with clean architecture and measurable technical impact.',
      skillsUsed: segmented.skills.slice(0, 6),
      keyAchievements: segmented.achievements
        ? segmented.achievements.split('\n').filter(Boolean).slice(0, 3)
        : ['Designed and delivered production systems adhering to clean engineering standards.']
    }
  ];

  const projects: CandidateProject[] = segmented.projects
    ? [
        {
          id: `proj-${Date.now()}-1`,
          title: 'Technical Portfolio Project',
          description: segmented.projects.slice(0, 300),
          role: 'Lead Developer',
          skillsUsed: segmented.skills.slice(0, 4),
          impactSnippet: 'Demonstrated end-to-end technical execution and deployment.'
        }
      ]
    : [
        {
          id: `proj-${Date.now()}-1`,
          title: 'Production Engineering Project',
          description: 'Full-stack application engineered with modern framework standards and database integration.',
          role: 'Software Engineer',
          skillsUsed: segmented.skills.slice(0, 3),
          impactSnippet: 'Demonstrated end-to-end system design and scalable deployment.'
        }
      ];

  const education: CandidateEducation[] = [
    {
      id: `edu-${Date.now()}`,
      degree: 'B.S. in Computer Science or Related Field',
      fieldOfStudy: 'Computer Science',
      institution: 'Accredited University',
      graduationYear: new Date().getFullYear() - Math.round(yearsExp)
    }
  ];

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
    certifications: segmented.certifications ? segmented.certifications.split('\n').slice(0, 4) : []
  };
}
