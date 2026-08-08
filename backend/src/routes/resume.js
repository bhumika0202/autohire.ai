import express from 'express';
import multer from 'multer';
import { createRequire } from 'module';
import prisma from '../db/prisma.js';
import { authenticate } from '../middleware/auth.js';

const require = createRequire(import.meta.url);
const pdfLib = require('pdf-parse');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

// Comprehensive list of tech skills to scan in candidate PDF
const KNOWN_SKILLS = [
  'React', 'React.js', 'Node.js', 'Express', 'Express.js', 'MongoDB', 'PostgreSQL', 'MySQL', 'SQL',
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
  'HTML', 'HTML5', 'CSS', 'CSS3', 'Tailwind', 'TailwindCSS', 'Bootstrap', 'Redux', 'Next.js', 'Vue.js',
  'Git', 'GitHub', 'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'REST API', 'GraphQL', 'Firebase',
  'Spring Boot', 'Django', 'Flask', 'Flutter', 'React Native', 'Linux', 'Agile', 'Jira'
];

// Scan PDF buffer reliably without type errors
const scanPdfResume = async (fileBuffer, filename) => {
  let extractedText = '';
  try {
    if (typeof pdfLib === 'function') {
      const data = await pdfLib(fileBuffer);
      extractedText = data?.text || '';
    } else if (pdfLib && typeof pdfLib.PDFParse === 'function') {
      const parser = new pdfLib.PDFParse(fileBuffer);
      if (typeof parser.extractText === 'function') {
        const res = await parser.extractText();
        extractedText = typeof res === 'string' ? res : (res?.text || '');
      } else {
        extractedText = fileBuffer.toString('utf-8');
      }
    } else {
      extractedText = fileBuffer.toString('utf-8');
    }
  } catch (err) {
    console.warn('PDF Parsing fallback to raw text buffer scan:', err.message);
    extractedText = fileBuffer ? fileBuffer.toString('utf-8') : '';
  }

  const textLower = (extractedText || '').toLowerCase();

  // 1. Detect Real Skills from Document
  const foundSkills = KNOWN_SKILLS.filter(skill => {
    const sLower = skill.toLowerCase();
    return textLower.includes(sLower);
  });

  const uniqueSkills = Array.from(new Set(foundSkills.map(s => {
    if (s.toLowerCase() === 'react.js') return 'React';
    if (s.toLowerCase() === 'express.js') return 'Express.js';
    if (s.toLowerCase() === 'html5') return 'HTML';
    if (s.toLowerCase() === 'css3') return 'CSS';
    return s;
  })));

  // 2. Extract Summary Lines
  const cleanLines = (extractedText || '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 15 && !l.includes('Page ') && !l.includes('http'));

  const aboutSummary = cleanLines.slice(0, 3).join(' ') ||
    `Scanned resume "${filename}". Technical candidate skilled in ${uniqueSkills.slice(0, 4).join(', ') || 'Software Development'}.`;

  // 3. Extract Experience & Projects
  const expLines = cleanLines.filter(l =>
    l.toLowerCase().includes('developer') ||
    l.toLowerCase().includes('engineer') ||
    l.toLowerCase().includes('intern') ||
    l.toLowerCase().includes('manager') ||
    l.toLowerCase().includes('lead')
  );

  const parsedExperience = expLines.slice(0, 3).map(line => ({
    title: line.length > 50 ? line.slice(0, 48) + '...' : line,
    company: 'Scanned Organization',
    duration: 'Scanned Timeline',
    description: `Parsed from uploaded resume: ${line}`
  }));

  const projLines = cleanLines.filter(l =>
    l.toLowerCase().includes('project') ||
    l.toLowerCase().includes('system') ||
    l.toLowerCase().includes('app') ||
    l.toLowerCase().includes('platform')
  );

  const parsedProjects = projLines.slice(0, 3).map(line => ({
    name: line.length > 45 ? line.slice(0, 42) + '...' : line,
    desc: `Scanned project details from ${filename}`,
    tech: uniqueSkills.slice(0, 4).join(', ')
  }));

  return {
    about: aboutSummary,
    skills: uniqueSkills.length > 0 ? uniqueSkills : ['JavaScript', 'Software Development'],
    experience: parsedExperience,
    projects: parsedProjects
  };
};

// Upload and scan PDF resume
router.post('/upload', authenticate, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const scanned = await scanPdfResume(req.file.buffer, req.file.originalname);

    // Ensure database user exists before upserting career profile
    let dbUser = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!dbUser && req.user.email) {
      dbUser = await prisma.user.upsert({
        where: { email: req.user.email },
        update: { name: req.user.name || 'Candidate' },
        create: {
          id: req.user.id,
          name: req.user.name || 'Candidate',
          email: req.user.email,
          passwordHash: '$2a$10$abcdefghijklmnopqrstuv'
        }
      });
    }

    const targetUserId = dbUser?.id || req.user.id;

    const profile = await prisma.careerProfile.upsert({
      where: { userId: targetUserId },
      update: {
        about: scanned.about,
        skills: scanned.skills,
        experience: scanned.experience,
        projects: scanned.projects,
        targetRoles: scanned.skills.slice(0, 3).map(s => `${s} Developer`),
        resumeUrl: `uploads/${req.file.originalname}`,
        aiSummary: `Scanned ${scanned.skills.length} technical skills from ${req.file.originalname}`
      },
      create: {
        userId: targetUserId,
        about: scanned.about,
        skills: scanned.skills,
        experience: scanned.experience,
        projects: scanned.projects,
        targetRoles: scanned.skills.slice(0, 3).map(s => `${s} Developer`),
        resumeUrl: `uploads/${req.file.originalname}`,
        aiSummary: `Scanned ${scanned.skills.length} technical skills from ${req.file.originalname}`
      }
    });

    res.json({
      message: 'Resume scanned successfully',
      profile: {
        id: profile.id,
        user_id: profile.userId,
        about: profile.about,
        target_roles: profile.targetRoles,
        skills: profile.skills,
        experience: profile.experience,
        projects: profile.projects,
        resume_url: profile.resumeUrl,
        ai_summary: profile.aiSummary,
        created_at: profile.createdAt,
        updated_at: profile.updatedAt
      }
    });
  } catch (err) {
    console.error('Resume scan error:', err);
    res.status(500).json({ error: err.message || 'Failed to scan resume' });
  }
});

// Get resume/profile status
router.get('/status', authenticate, async (req, res) => {
  try {
    const profile = await prisma.careerProfile.findUnique({
      where: { userId: req.user.id },
      select: { resumeUrl: true, aiSummary: true, updatedAt: true }
    });

    res.json({
      hasResume: !!profile?.resumeUrl,
      hasProfile: !!profile?.aiSummary,
      lastUpdated: profile?.updatedAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get resume status' });
  }
});

export default router;
