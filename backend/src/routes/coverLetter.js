import express from 'express';
import prisma from '../db/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Generate cover letter (simulated AI)
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { job_id } = req.body;
    if (!job_id) return res.status(400).json({ error: 'job_id is required' });

    const [job, profile, user] = await Promise.all([
      prisma.job.findUnique({ where: { id: job_id } }),
      prisma.careerProfile.findUnique({ where: { userId: req.user.id } }),
      prisma.user.findUnique({ where: { id: req.user.id }, select: { name: true } })
    ]);

    if (!job) return res.status(404).json({ error: 'Job not found' });

    const userName = user?.name || 'Candidate';
    const skills = profile?.skills || [];
    const projects = profile?.projects || [];
    const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    const matchingSkills = (job.skills || []).filter(s =>
      skills.some(us => us.toLowerCase() === s.toLowerCase())
    );

    const projectName = Array.isArray(projects) && projects[0]
      ? (typeof projects[0] === 'object' ? projects[0]?.name : projects[0])
      : null;

    const content = `${today}

Hiring Manager
${job.company}
${job.location}

Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}. Having reviewed the job requirements, I am confident that my technical skills and project experience make me an excellent candidate for this role.

${profile?.about || `I am a passionate software developer with experience building scalable web applications.`}

Throughout my career, I have developed strong proficiency in ${matchingSkills.slice(0, 4).join(', ')}, which directly aligns with your requirements. ${projectName ? `Most notably, my work on ${projectName} demonstrates my ability to deliver production-quality applications using these technologies.` : ''}

What excites me most about this opportunity at ${job.company} is the chance to work on meaningful products that impact real users. I am particularly drawn to your company's approach to ${job.employmentType === 'Remote' ? 'remote-first culture and' : ''} innovation in ${job.title.split(' ').pop()} development.

I am eager to bring my ${matchingSkills[0] || skills[0] || 'development'} expertise and collaborative mindset to your team. I look forward to discussing how I can contribute to ${job.company}'s continued success.

Thank you for considering my application. I look forward to the opportunity to speak with you.

Best regards,
${userName}`;

    const aiSuggestions = [
      `✓ Mentions relevant ${matchingSkills[0] || 'technical'} experience`,
      projectName ? `✓ References your ${projectName} project` : '✓ Highlights your project experience',
      `✓ Matches job requirements for ${job.title}`,
      `✓ Professional tone appropriate for ${job.company}`,
      `✓ Personalized to ${job.location} role`
    ];

    const coverLetter = await prisma.coverLetter.upsert({
      where: {
        userId_jobId: {
          userId: req.user.id,
          jobId: job_id
        }
      },
      update: {
        content,
        aiSuggestions
      },
      create: {
        userId: req.user.id,
        jobId: job_id,
        content,
        aiSuggestions
      }
    });

    res.json({
      coverLetter: {
        id: coverLetter.id,
        user_id: coverLetter.userId,
        job_id: coverLetter.jobId,
        content: coverLetter.content,
        ai_suggestions: coverLetter.aiSuggestions,
        created_at: coverLetter.createdAt,
        updated_at: coverLetter.updatedAt
      },
      aiSuggestions
    });
  } catch (err) {
    console.error('Cover letter error:', err);
    res.status(500).json({ error: 'Failed to generate cover letter' });
  }
});

// Get cover letters
router.get('/', authenticate, async (req, res) => {
  try {
    const letters = await prisma.coverLetter.findMany({
      where: { userId: req.user.id },
      include: {
        job: { select: { title: true, company: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const formatted = letters.map(cl => ({
      id: cl.id,
      user_id: cl.userId,
      job_id: cl.jobId,
      content: cl.content,
      ai_suggestions: cl.aiSuggestions,
      created_at: cl.createdAt,
      updated_at: cl.updatedAt,
      job_title: cl.job.title,
      company: cl.job.company
    }));

    res.json({ coverLetters: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cover letters' });
  }
});

// Get cover letter for specific job
router.get('/job/:jobId', authenticate, async (req, res) => {
  try {
    const cl = await prisma.coverLetter.findUnique({
      where: {
        userId_jobId: {
          userId: req.user.id,
          jobId: req.params.jobId
        }
      }
    });

    if (!cl) return res.status(404).json({ error: 'Cover letter not found' });
    res.json({
      coverLetter: {
        id: cl.id,
        user_id: cl.userId,
        job_id: cl.jobId,
        content: cl.content,
        ai_suggestions: cl.aiSuggestions,
        created_at: cl.createdAt,
        updated_at: cl.updatedAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cover letter' });
  }
});

// Update cover letter
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    const cl = await prisma.coverLetter.update({
      where: { id: req.params.id },
      data: { content }
    });

    res.json({
      coverLetter: {
        id: cl.id,
        user_id: cl.userId,
        job_id: cl.jobId,
        content: cl.content,
        ai_suggestions: cl.aiSuggestions,
        created_at: cl.createdAt,
        updated_at: cl.updatedAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cover letter' });
  }
});

export default router;
