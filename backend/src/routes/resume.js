import express from 'express';
import multer from 'multer';
import prisma from '../db/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.includes('word') || file.mimetype.includes('text')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word files are allowed'));
    }
  }
});

// Simulate AI resume analysis
const analyzeResume = (filename) => {
  return {
    about: "Experienced software developer with a passion for building scalable web applications using modern JavaScript technologies. Strong background in full-stack development with expertise in the MERN stack.",
    target_roles: ["MERN Stack Developer", "Full Stack Developer", "Frontend Developer", "Backend Developer"],
    skills: ["React", "Node.js", "MongoDB", "Express.js", "JavaScript", "REST API", "Git", "HTML", "CSS", "Redux"],
    experience: [
      {
        company: "StartupXYZ",
        role: "Junior Developer",
        duration: "Jan 2023 - Present",
        description: "Built and maintained React frontends and Node.js APIs for the company's SaaS product"
      }
    ],
    education: [
      {
        institution: "Gujarat Technological University",
        degree: "B.E. Computer Engineering",
        year: "2022"
      }
    ],
    projects: [
      {
        name: "PPMS - Project Portfolio Management System",
        description: "Full-stack MERN application for managing project portfolios with real-time collaboration",
        skills: ["React", "Node.js", "MongoDB", "Socket.io"]
      }
    ],
    certifications: ["React Developer Certification - Meta", "MongoDB Associate Developer"],
    ai_summary: "Strong MERN stack developer with solid fundamentals. Best suited for mid-level full-stack roles."
  };
};

// Upload and analyze resume
router.post('/upload', authenticate, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const analysis = analyzeResume(req.file.originalname);

    const profile = await prisma.careerProfile.upsert({
      where: { userId: req.user.id },
      update: {
        about: analysis.about,
        targetRoles: analysis.target_roles,
        skills: analysis.skills,
        experience: analysis.experience,
        education: analysis.education,
        projects: analysis.projects,
        certifications: analysis.certifications,
        aiSummary: analysis.ai_summary,
        resumeUrl: `uploads/${req.file.originalname}`
      },
      create: {
        userId: req.user.id,
        about: analysis.about,
        targetRoles: analysis.target_roles,
        skills: analysis.skills,
        experience: analysis.experience,
        education: analysis.education,
        projects: analysis.projects,
        certifications: analysis.certifications,
        aiSummary: analysis.ai_summary,
        resumeUrl: `uploads/${req.file.originalname}`
      }
    });

    res.json({
      message: 'Resume analyzed successfully',
      profile: {
        id: profile.id,
        user_id: profile.userId,
        about: profile.about,
        target_roles: profile.targetRoles,
        skills: profile.skills,
        experience: profile.experience,
        education: profile.education,
        projects: profile.projects,
        certifications: profile.certifications,
        resume_url: profile.resumeUrl,
        ai_summary: profile.aiSummary,
        created_at: profile.createdAt,
        updated_at: profile.updatedAt
      },
      analysis
    });
  } catch (err) {
    console.error('Resume upload error:', err);
    res.status(500).json({ error: 'Failed to process resume' });
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
