import express from 'express';
import prisma from '../db/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all jobs with optional search/filter
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, location, type, experience, sort = 'match' } = req.query;

    const whereClause = {
      isActive: true,
    };

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { skills: { has: search } }
      ];
    }

    if (location && location !== 'all') {
      whereClause.location = { contains: location, mode: 'insensitive' };
    }

    if (type && type !== 'all') {
      whereClause.employmentType = { contains: type, mode: 'insensitive' };
    }

    if (experience && experience !== 'all') {
      whereClause.experienceLevel = { contains: experience, mode: 'insensitive' };
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
      orderBy: { postedAt: 'desc' }
    });

    // Get user profile for match scoring
    const profile = await prisma.careerProfile.findUnique({
      where: { userId: req.user.id },
      select: { skills: true }
    });

    const userSkills = profile?.skills || [];

    // Calculate match scores
    const jobsWithMatch = jobs.map(job => {
      const jobSkills = job.skills || [];
      const matchingSkills = jobSkills.filter(s => userSkills.some(us => us.toLowerCase() === s.toLowerCase()));
      const missingSkills = jobSkills.filter(s => !userSkills.some(us => us.toLowerCase() === s.toLowerCase()));
      const matchScore = jobSkills.length > 0
        ? Math.round((matchingSkills.length / jobSkills.length) * 100)
        : 50;

      return {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        employment_type: job.employmentType,
        salary_range: job.salaryRange,
        description: job.description,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        skills: job.skills,
        experience_level: job.experienceLevel,
        logo_url: job.logoUrl,
        posted_at: job.postedAt,
        match_score: matchScore,
        matching_skills: matchingSkills,
        missing_skills: missingSkills
      };
    });

    if (sort === 'match') {
      jobsWithMatch.sort((a, b) => b.match_score - a.match_score);
    }

    res.json({ jobs: jobsWithMatch, total: jobsWithMatch.length });
  } catch (err) {
    console.error('Get jobs error:', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get single job
router.get('/:id', authenticate, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const profile = await prisma.careerProfile.findUnique({
      where: { userId: req.user.id },
      select: { skills: true }
    });

    const userSkills = profile?.skills || [];
    const jobSkills = job.skills || [];

    const matchingSkills = jobSkills.filter(s => userSkills.some(us => us.toLowerCase() === s.toLowerCase()));
    const missingSkills = jobSkills.filter(s => !userSkills.some(us => us.toLowerCase() === s.toLowerCase()));
    const matchScore = jobSkills.length > 0
      ? Math.round((matchingSkills.length / jobSkills.length) * 100)
      : 50;

    const aiExplanation = matchScore >= 80
      ? `Your ${matchingSkills.slice(0,3).join(', ')} experience closely aligns with the core requirements of this role. You demonstrate strong fundamentals that match what ${job.company} is looking for in this position.`
      : matchScore >= 60
      ? `You match several key requirements for this role. With your ${matchingSkills.slice(0,2).join(' and ')} skills, you're a solid candidate. Consider strengthening your ${missingSkills.slice(0,2).join(' and ')} to increase your chances.`
      : `You have some relevant skills for this role. Your ${matchingSkills.join(', ')} experience is valuable, but you may want to develop ${missingSkills.slice(0,3).join(', ')} before applying.`;

    res.json({
      job: {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        employment_type: job.employmentType,
        salary_range: job.salaryRange,
        description: job.description,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        skills: job.skills,
        experience_level: job.experienceLevel,
        logo_url: job.logoUrl,
        posted_at: job.postedAt,
        match_score: matchScore,
        matching_skills: matchingSkills,
        missing_skills: missingSkills,
        ai_explanation: aiExplanation
      }
    });
  } catch (err) {
    console.error('Get job error:', err);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

export default router;
