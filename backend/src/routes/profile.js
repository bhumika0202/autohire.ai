import express from 'express';
import prisma from '../db/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get career profile
router.get('/', authenticate, async (req, res) => {
  try {
    const profile = await prisma.careerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
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
      }
    });

    res.json({
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
