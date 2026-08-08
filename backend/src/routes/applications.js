import express from 'express';
import prisma from '../db/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { sendApplicationConfirmationEmail } from '../services/mailer.js';

const router = express.Router();

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
      job_title: app.job?.title || 'Software Engineer',
      company: app.job?.company || 'Enterprise',
      location: app.job?.location || 'India',
      employment_type: app.job?.employmentType || 'Full-time',
      salary_range: app.job?.salaryRange || '₹10 - 18 LPA',
      job_skills: app.job?.skills || []
    }));

    res.json({ applications: formattedApps });
  } catch (err) {
    console.error('Get applications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Create application (save/apply job - supports live & DB jobs + Gmail SMTP Receipt)
router.post('/', authenticate, async (req, res) => {
  try {
    const { job_id, status = 'saved', job_title, company } = req.body;
    if (!job_id) return res.status(400).json({ error: 'job_id is required' });

    let job = await prisma.job.findUnique({ where: { id: job_id } });

    if (!job) {
      job = await prisma.job.create({
        data: {
          id: job_id,
          title: job_title || 'Software Development Engineer',
          company: company || 'Tech Enterprise',
          location: 'Bangalore, India',
          employmentType: 'Full-time',
          salaryRange: '₹12 - 20 LPA',
          description: 'Live Software Engineering role',
          skills: ['React', 'Node.js', 'JavaScript'],
          experienceLevel: 'Mid-Level',
          isActive: true
        }
      });
    }

    const existing = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId: req.user.id,
          jobId: job_id
        }
      }
    });

    const dbStatus = mapStatusToDb(status);

    if (existing) {
      const updatedApp = await prisma.application.update({
        where: { id: existing.id },
        data: {
          status: dbStatus,
          appliedAt: dbStatus === 'APPLIED' ? new Date() : existing.appliedAt
        }
      });

      if (dbStatus === 'APPLIED' && req.user.email) {
        sendApplicationConfirmationEmail({
          email: req.user.email,
          name: req.user.name,
          jobTitle: job.title,
          company: job.company,
          matchScore: existing.matchScore || 85
        });
      }

      return res.json({
        message: 'Application updated',
        application: { ...updatedApp, status: mapStatusToUi(updatedApp.status) }
      });
    }

    const profile = await prisma.careerProfile.findUnique({ where: { userId: req.user.id } });
    const userSkills = profile?.skills || ['React', 'Node.js', 'JavaScript'];
    const jobSkills = job.skills || ['React', 'Node.js', 'JavaScript'];

    const matchingSkills = jobSkills.filter(s => userSkills.some(us => us.toLowerCase() === s.toLowerCase()));
    const missingSkills = jobSkills.filter(s => !userSkills.some(us => us.toLowerCase() === s.toLowerCase()));
    const matchScore = Math.min(Math.max(jobSkills.length > 0
      ? Math.round((matchingSkills.length / Math.max(jobSkills.length, 1)) * 100)
      : 75, 70), 98);

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

    // Send instant email confirmation receipt if status is APPLIED
    if (dbStatus === 'APPLIED' && req.user.email) {
      sendApplicationConfirmationEmail({
        email: req.user.email,
        name: req.user.name,
        jobTitle: job.title,
        company: job.company,
        matchScore
      });
    }

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
