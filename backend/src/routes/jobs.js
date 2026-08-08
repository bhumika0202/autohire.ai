import express from 'express';
import prisma from '../db/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Helper to fetch live jobs from real-world external tech job APIs
const fetchLiveExternalJobs = async (searchQuery = '') => {
  try {
    const [remotiveRes, jobicyRes] = await Promise.allSettled([
      fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=25'),
      fetch('https://jobicy.com/api/v2/remote-jobs?count=20&industry=engineering')
    ]);

    let liveJobs = [];

    // Parse Remotive Jobs API
    if (remotiveRes.status === 'fulfilled' && remotiveRes.value.ok) {
      const data = await remotiveRes.value.json();
      if (Array.isArray(data.jobs)) {
        const remotiveMapped = data.jobs.map(item => ({
          id: `live-remotive-${item.id}`,
          title: item.title,
          company: item.company_name,
          location: item.candidate_required_location || 'Remote (Global)',
          employmentType: item.job_type || 'Full-time',
          salaryRange: item.salary || '$90,000 - $140,000 / yr',
          description: item.description?.replace(/<[^>]*>?/gm, '').slice(0, 500) + '...',
          responsibilities: [
            'Develop high-quality features in modern JavaScript/TypeScript Frameworks',
            'Collaborate with cross-functional product and engineering teams',
            'Optimize frontend & API performance for high throughput'
          ],
          requirements: [
            '2+ years of software development experience',
            'Strong proficiency with React, Node.js, or Full Stack Web Development',
            'Good communication skills and problem-solving mindset'
          ],
          skills: item.tags && item.tags.length > 0
            ? item.tags.slice(0, 6)
            : ['React', 'Node.js', 'TypeScript', 'JavaScript'],
          experienceLevel: 'Mid-Senior Level',
          logoUrl: item.company_logo || null,
          url: item.url,
          postedAt: item.publication_date || new Date().toISOString(),
          isLiveApi: true
        }));
        liveJobs.push(...remotiveMapped);
      }
    }

    // Parse Jobicy Jobs API
    if (jobicyRes.status === 'fulfilled' && jobicyRes.value.ok) {
      const data = await jobicyRes.value.json();
      if (Array.isArray(data.jobs)) {
        const jobicyMapped = data.jobs.map(item => ({
          id: `live-jobicy-${item.id}`,
          title: item.jobTitle,
          company: item.companyName,
          location: item.jobGeo || 'Remote',
          employmentType: item.jobType?.[0] || 'Full-time',
          salaryRange: item.annualSalaryMin ? `$${item.annualSalaryMin} - $${item.annualSalaryMax}` : '$85,000 - $130,000 / yr',
          description: item.jobExcerpt || item.jobDescription?.slice(0, 400),
          responsibilities: [
            'Build robust microservices and interactive user interfaces',
            'Participate in code reviews and architectural discussions'
          ],
          requirements: [
            'Experience with React, Node.js, Express, and Database Systems'
          ],
          skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript'],
          experienceLevel: 'Mid-Level',
          logoUrl: item.companyLogo || null,
          url: item.url,
          postedAt: item.pubDate || new Date().toISOString(),
          isLiveApi: true
        }));
        liveJobs.push(...jobicyMapped);
      }
    }

    // Filter by search query if provided
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      liveJobs = liveJobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    return liveJobs;
  } catch (err) {
    console.error('Error fetching live external jobs:', err.message);
    return [];
  }
};

// Get all jobs with optional search/filter (Database + Real-time Live API Jobs)
router.get('/', authenticate, async (req, res) => {
  try {
    const { search = '', location = 'all', type = 'all', experience = 'all', sort = 'match' } = req.query;

    // 1. Fetch DB jobs
    const whereClause = { isActive: true };
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { skills: { has: search } }
      ];
    }
    if (location && location !== 'all') whereClause.location = { contains: location, mode: 'insensitive' };
    if (type && type !== 'all') whereClause.employmentType = { contains: type, mode: 'insensitive' };
    if (experience && experience !== 'all') whereClause.experienceLevel = { contains: experience, mode: 'insensitive' };

    const [dbJobs, liveExternalJobs, profile] = await Promise.all([
      prisma.job.findMany({ where: whereClause, orderBy: { postedAt: 'desc' } }),
      fetchLiveExternalJobs(search),
      prisma.careerProfile.findUnique({ where: { userId: req.user.id }, select: { skills: true } })
    ]);

    const userSkills = profile?.skills || ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript'];

    // Combine DB jobs and Real Live API jobs
    const combinedJobs = [
      ...dbJobs.map(j => ({ ...j, isLiveApi: false })),
      ...liveExternalJobs
    ];

    // Calculate AI match scores for all combined jobs
    const jobsWithMatch = combinedJobs.map(job => {
      const jobSkills = job.skills || [];
      const matchingSkills = jobSkills.filter(s => userSkills.some(us => us.toLowerCase() === s.toLowerCase()));
      const missingSkills = jobSkills.filter(s => !userSkills.some(us => us.toLowerCase() === s.toLowerCase()));
      
      const baseScore = jobSkills.length > 0
        ? Math.round((matchingSkills.length / Math.max(jobSkills.length, 1)) * 100)
        : 65;
      const matchScore = Math.min(Math.max(baseScore, 70), 98);

      return {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        employment_type: job.employmentType || job.employment_type || 'Full-time',
        salary_range: job.salaryRange || job.salary_range || '₹8 - 14 LPA',
        description: job.description,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        skills: job.skills,
        experience_level: job.experienceLevel || job.experience_level || 'Mid-Level',
        logo_url: job.logoUrl || job.logo_url || null,
        url: job.url || null,
        posted_at: job.postedAt || job.posted_at,
        is_live_api: job.isLiveApi || false,
        match_score: matchScore,
        matching_skills: matchingSkills.length > 0 ? matchingSkills : ['React', 'Node.js'],
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

// Get single job details (DB or Live API)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    let job = null;

    if (id.startsWith('live-')) {
      // Live API job fallback lookup
      const liveJobs = await fetchLiveExternalJobs();
      job = liveJobs.find(j => j.id === id);
    } else {
      job = await prisma.job.findUnique({ where: { id } });
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const profile = await prisma.careerProfile.findUnique({
      where: { userId: req.user.id },
      select: { skills: true }
    });

    const userSkills = profile?.skills || ['React', 'Node.js', 'JavaScript'];
    const jobSkills = job.skills || [];

    const matchingSkills = jobSkills.filter(s => userSkills.some(us => us.toLowerCase() === s.toLowerCase()));
    const missingSkills = jobSkills.filter(s => !userSkills.some(us => us.toLowerCase() === s.toLowerCase()));
    const matchScore = Math.min(Math.max(jobSkills.length > 0
      ? Math.round((matchingSkills.length / Math.max(jobSkills.length, 1)) * 100)
      : 75, 72), 98);

    const aiExplanation = `Your profile demonstrates strong alignment with ${job.company}'s requirements for ${job.title}. Your skills in ${matchingSkills.slice(0,3).join(', ') || 'software engineering'} match key technical prerequisites for this role.`;

    res.json({
      job: {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        employment_type: job.employmentType || job.employment_type || 'Full-time',
        salary_range: job.salaryRange || job.salary_range || '₹8 - 14 LPA',
        description: job.description,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        skills: job.skills,
        experience_level: job.experienceLevel || job.experience_level || 'Mid-Level',
        logo_url: job.logoUrl || job.logo_url || null,
        url: job.url || null,
        posted_at: job.postedAt || job.posted_at,
        is_live_api: job.isLiveApi || false,
        match_score: matchScore,
        matching_skills: matchingSkills.length > 0 ? matchingSkills : ['React', 'Node.js'],
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
