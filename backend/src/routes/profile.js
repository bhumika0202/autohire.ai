import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '../db/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dm2qqbayd',
  api_key: process.env.CLOUDINARY_API_KEY || '263348621368692',
  api_secret: process.env.CLOUDINARY_API_SECRET || '7b2wgzgp3iM6MkKG2iojZuAPGRk'
});

// Configure Multer Memory Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload Profile Avatar to Cloudinary
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Stream upload to Cloudinary
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'autohire_avatars',
            transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
    };

    const cloudinaryResult = await uploadToCloudinary();
    const avatarUrl = cloudinaryResult.secure_url;

    // Update User record in Database
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl }
    });

    res.json({
      message: 'Avatar uploaded successfully',
      avatar_url: updatedUser.avatarUrl
    });
  } catch (err) {
    console.error('Cloudinary avatar upload error:', err);
    res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
  }
});

// Get career profile
router.get('/', authenticate, async (req, res) => {
  try {
    const profile = await prisma.careerProfile.findUnique({
      where: { userId: req.user.id },
      include: { user: { select: { avatarUrl: true, name: true, email: true } } }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      profile: {
        id: profile.id,
        user_id: profile.userId,
        avatar_url: profile.user?.avatarUrl,
        about: profile.about,
        target_roles: profile.targetRoles,
        skills: profile.skills,
        experience: profile.experience,
        education: profile.education,
        projects: profile.projects,
        certifications: profile.certifications,
        resume_url: profile.resumeUrl,
        resume_text: profile.resumeText,
        ai_summary: profile.aiSummary,
        created_at: profile.createdAt,
        updated_at: profile.updatedAt
      }
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update career profile
router.put('/', authenticate, async (req, res) => {
  try {
    const { about, target_roles, skills, experience, education, projects, certifications } = req.body;

    const updateData = {};
    if (about !== undefined) updateData.about = about;
    if (target_roles !== undefined) updateData.targetRoles = target_roles;
    if (skills !== undefined) updateData.skills = skills;
    if (experience !== undefined) updateData.experience = experience;
    if (education !== undefined) updateData.education = education;
    if (projects !== undefined) updateData.projects = projects;
    if (certifications !== undefined) updateData.certifications = certifications;

    const profile = await prisma.careerProfile.upsert({
      where: { userId: req.user.id },
      update: updateData,
      create: {
        userId: req.user.id,
        ...updateData
      },
      include: { user: { select: { avatarUrl: true } } }
    });

    res.json({
      profile: {
        id: profile.id,
        user_id: profile.userId,
        avatar_url: profile.user?.avatarUrl,
        about: profile.about,
        target_roles: profile.targetRoles,
        skills: profile.skills,
        experience: profile.experience,
        education: profile.education,
        projects: profile.projects,
        certifications: profile.certifications,
        resume_url: profile.resumeUrl,
        resume_text: profile.resumeText,
        ai_summary: profile.aiSummary,
        created_at: profile.createdAt,
        updated_at: profile.updatedAt
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get dashboard stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const [profile, appCount, interviewCount, jobs] = await Promise.all([
      prisma.careerProfile.findUnique({
        where: { userId: req.user.id },
        select: { skills: true }
      }),
      prisma.application.count({
        where: { userId: req.user.id }
      }),
      prisma.application.count({
        where: { userId: req.user.id, status: 'INTERVIEW' }
      }),
      prisma.job.findMany({
        where: { isActive: true },
        take: 50,
        select: { skills: true }
      })
    ]);

    const userSkills = profile?.skills || [];

    const allJobSkills = new Set(jobs.flatMap(j => j.skills || []));
    const matchedSkills = [...allJobSkills].filter(s =>
      userSkills.some(us => us.toLowerCase() === s.toLowerCase())
    );

    const resumeMatch = allJobSkills.size > 0
      ? Math.round((matchedSkills.length / Math.min(allJobSkills.size, 15)) * 100)
      : 0;

    res.json({
      resumeMatch: Math.min(resumeMatch, 99),
      recommendedJobs: Math.max(jobs.length, 0),
      applications: appCount,
      interviews: interviewCount,
      topSkills: userSkills.slice(0, 3)
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;
