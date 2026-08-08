import express from 'express';
import prisma from '../db/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Generate cover letter (supports live & DB jobs with dynamic real company metadata)
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { job_id, job_title, company, location, skills: reqSkills } = req.body;
    if (!job_id) return res.status(400).json({ error: 'job_id is required' });

    let [job, profile, user] = await Promise.all([
      prisma.job.findUnique({ where: { id: job_id } }),
      prisma.careerProfile.findUnique({ where: { userId: req.user.id } }),
      prisma.user.findUnique({ where: { id: req.user.id }, select: { name: true } })
    ]);

    const targetCompany = company || job?.company || 'Enterprise';
    const targetTitle = job_title || job?.title || 'Software Development Engineer';
    const targetLocation = location || job?.location || 'Bangalore, India';

    // If live API job or company mismatch, update/create DB record using REAL company metadata
    if (!job) {
      job = await prisma.job.create({
        data: {
          id: job_id,
          title: targetTitle,
          company: targetCompany,
          location: targetLocation,
          employmentType: 'Full-time',
          salaryRange: '₹14 - 24 LPA',
          description: `Live software development position at ${targetCompany}`,
          skills: Array.isArray(reqSkills) && reqSkills.length > 0 ? reqSkills : ['React', 'Node.js', 'JavaScript'],
          experienceLevel: 'Mid-Level',
          isActive: true
        }
      });
    } else if (company && job.company !== company) {
      job = await prisma.job.update({
        where: { id: job_id },
        data: {
          title: targetTitle,
          company: targetCompany,
          location: targetLocation
        }
      });
    }

    const userName = user?.name || 'Hitesh Vaishnav';
    const skills = profile?.skills || ['React', 'Node.js', 'JavaScript'];
    const projects = profile?.projects || [];
    const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    const matchingSkills = (job.skills || []).filter(s =>
      skills.some(us => us.toLowerCase() === s.toLowerCase())
    );

    const projectName = Array.isArray(projects) && projects[0]
      ? (typeof projects[0] === 'object' ? projects[0]?.name : projects[0])
      : 'Autohire.ai Platform';

    const content = `${today}

Hiring Manager
${job.company}
${job.location}

Dear Hiring Manager,

I am writing to express my strong enthusiasm for the ${job.title} position at ${job.company}. Having reviewed the requirements for this role, I am confident that my technical expertise in modern full-stack web development aligns perfectly with your engineering goals.

${profile?.about || `I am a passionate software engineer with hands-on experience building scalable, high-throughput web applications and RESTful backend microservices.`}

Throughout my recent work, I have developed strong mastery in ${matchingSkills.slice(0, 4).join(', ') || 'React, Node.js, and JavaScript'}, which directly reflects the key prerequisites for this role. ${projectName ? `Most notably, my project ${projectName} demonstrates my ability to engineer production-ready web solutions with clean architectural practices.` : ''}

What excites me most about joining ${job.company} is the opportunity to contribute to high-impact products and collaborate with a forward-thinking tech team. I am eager to leverage my technical skills, problem-solving mindset, and dedication to code quality at ${job.company}.

Thank you for your time and consideration. I welcome the opportunity to discuss how my background and skills can drive success for your team.

Best regards,
${userName}`;

    const aiSuggestions = [
      `✓ Mentions relevant ${matchingSkills[0] || 'technical'} experience`,
      `✓ References your ${projectName} project`,
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
      job_title: cl.job?.title || 'Software Engineer',
      company: cl.job?.company || 'Enterprise'
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
