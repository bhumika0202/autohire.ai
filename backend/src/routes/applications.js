import express from 'express';
import prisma from '../db/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Helper to map DB application status enum to UI status format
const mapStatusToDb = (statusStr) => {
  const map = {
    saved: 'SAVED',
    applied: 'APPLIED',
    interview: 'INTERVIEW',
    offer: 'OFFER',
    rejected: 'REJECTED'
  };
  return map[statusStr?.toLowerCase()] || 'SAVED';
};

const mapStatusToUi = (dbStatus) => {
  return dbStatus ? dbStatus.toLowerCase() : 'saved';
};

// Get user's applications
router.get('/', authenticate, async (req, res) => {
  try {
    const apps = await prisma.application.findMany({
      where: { userId: req.user.id },
      include: {
        job: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    const formattedApps = apps.map(app => ({
      id: app.id,
      user_id: app.userId,
      job_id: app.jobId,
      status: mapStatusToUi(app.status),
      match_score: app.matchScore,
      matching_skills: app.matchingSkills,
      missing_skills: app.missingSkills,
      ai_explanation: app.aiExplanation,
      cover_letter: app.coverLetter,
      notes: app.notes,
      applied_at: app.appliedAt,
      created_at: app.createdAt,
      updated_at: app.updatedAt,
      job_title: app.job.title,
      company: app.job.company,
      location: app.job.location,
      employment_type: app.job.employmentType,
      salary_range: app.job.salaryRange,
      job_skills: app.job.skills
    }));

    res.json({ applications: formattedApps });
  } catch (err) {
    console.error('Get applications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Create application (save/apply job)
router.post('/', authenticate, async (req, res) => {
  try {
    const { job_id, status = 'saved' } = req.body;
    if (!job_id) return res.status(400).json({ error: 'job_id is required' });

    // Check if already exists
    const existing = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId: req.user.id,
          jobId: job_id
        }
      }
    });

    if (existing) {
      return res.status(409).json({
        error: 'Job already in applications',
        application: { ...existing, status: mapStatusToUi(existing.status) }
      });
    }

    // Get job & profile match data
    const [job, profile] = await Promise.all([
      prisma.job.findUnique({ where: { id: job_id } }),
      prisma.careerProfile.findUnique({ where: { userId: req.user.id } })
    ]);

    if (!job) return res.status(404).json({ error: 'Job not found' });

    const userSkills = profile?.skills || [];
    const jobSkills = job.skills || [];

    const matchingSkills = jobSkills.filter(s => userSkills.some(us => us.toLowerCase() === s.toLowerCase()));
    const missingSkills = jobSkills.filter(s => !userSkills.some(us => us.toLowerCase() === s.toLowerCase()));
    const matchScore = jobSkills.length > 0
      ? Math.round((matchingSkills.length / jobSkills.length) * 100)
      : 50;

    const dbStatus = mapStatusToDb(status);

    const app = await prisma.application.create({
      data: {
        userId: req.user.id,
        jobId: job_id,
        status: dbStatus,
        matchScore,
        matchingSkills,
        missingSkills,
        appliedAt: dbStatus === 'APPLIED' ? new Date() : null
      }
    });

    res.status(201).json({
      application: {
        id: app.id,
        user_id: app.userId,
        job_id: app.jobId,
        status: mapStatusToUi(app.status),
        match_score: app.matchScore,
        matching_skills: app.matchingSkills,
        missing_skills: app.missingSkills,
        applied_at: app.appliedAt,
        created_at: app.createdAt,
        updated_at: app.updatedAt
      }
    });
  } catch (err) {
    console.error('Create application error:', err);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// Update application status
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const updateData = {};
    if (status) {
      const dbStatus = mapStatusToDb(status);
      updateData.status = dbStatus;
      if (dbStatus === 'APPLIED') {
        updateData.appliedAt = new Date();
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const app = await prisma.application.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({
      application: {
        ...app,
        user_id: app.userId,
        job_id: app.jobId,
        status: mapStatusToUi(app.status),
        match_score: app.matchScore,
        matching_skills: app.matchingSkills,
        missing_skills: app.missingSkills,
        applied_at: app.appliedAt,
        created_at: app.createdAt,
        updated_at: app.updatedAt
      }
    });
  } catch (err) {
    console.error('Update application error:', err);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Delete application
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.application.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Application deleted' });
  } catch (err) {
    console.error('Delete application error:', err);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

export default router;
