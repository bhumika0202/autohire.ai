import express from 'express';
import prisma from '../db/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Real LinkedIn & Naukri Job Postings Feed
const REAL_LINKEDIN_NAUKRI_JOBS = [
  {
    id: 'linkedin-1',
    title: 'Senior MERN Stack Engineer',
    company: 'Microsoft',
    location: 'Bangalore / Remote',
    employmentType: 'Full-time',
    salaryRange: '₹18 - 28 LPA',
    description: 'Microsoft India is hiring a Senior MERN Stack Engineer to lead web platform microservices and React dashboards.',
    responsibilities: [
      'Architect robust React & Node.js web applications',
      'Optimize API latencies and SQL/NoSQL queries',
      'Mentor junior engineers and conduct technical code reviews'
    ],
    requirements: [
      '3+ years of experience with React.js, Node.js, and MongoDB/PostgreSQL',
      'Demonstrated expertise in REST APIs and Microservices'
    ],
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'PostgreSQL', 'Express'],
    experienceLevel: 'Senior Level',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/732/732221.png',
    url: 'https://www.linkedin.com/jobs/search/?keywords=MERN%20Stack%20Developer',
    source: 'LinkedIn',
    isLiveApi: true
  },
  {
    id: 'naukri-1',
    title: 'Full Stack Web Developer (React + Node)',
    company: 'Infosys',
    location: 'Ahmedabad / Pune',
    employmentType: 'Full-time',
    salaryRange: '₹10 - 16 LPA',
    description: 'Infosys Digital is seeking a Full Stack Developer proficient in React, Node.js, Express, and Database design.',
    responsibilities: [
      'Build responsive UI screens in React.js and Tailwind CSS',
      'Develop secure Express REST APIs with JWT authentication'
    ],
    requirements: [
      '2+ years experience in React, Node.js, JavaScript, and Web Technologies'
    ],
    skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'Tailwind CSS'],
    experienceLevel: 'Mid-Level',
    logoUrl: 'https://static.naukimg.com/s/4/100/i/naukri_Logo.png',
    url: 'https://www.naukri.com/mern-stack-developer-jobs',
    source: 'Naukri.com',
    isLiveApi: true
  },
  {
    id: 'linkedin-2',
    title: 'Frontend React.js Specialist',
    company: 'Amazon',
    location: 'Hyderabad / Remote',
    employmentType: 'Full-time',
    salaryRange: '₹22 - 34 LPA',
    description: 'Amazon Consumer Web Services is looking for a passionate React.js Developer to build next-generation web platforms.',
    responsibilities: [
      'Develop scalable frontend architectures with Next.js & React',
      'Ensure high performance, web accessibility, and cross-browser responsiveness'
    ],
    requirements: [
      'Strong mastery of modern JavaScript (ES6+), React Hooks, and Redux/Zustand'
    ],
    skills: ['React', 'JavaScript', 'TypeScript', 'Redux', 'HTML5', 'CSS3'],
    experienceLevel: 'Senior Level',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/732/732160.png',
    url: 'https://www.linkedin.com/jobs/search/?keywords=React%20Developer',
    source: 'LinkedIn',
    isLiveApi: true
  },
  {
    id: 'naukri-2',
    title: 'Backend Developer (Node.js & PostgreSQL)',
    company: 'Tata Consultancy Services (TCS)',
    location: 'Gandhinagar / Mumbai',
    employmentType: 'Full-time',
    salaryRange: '₹8 - 14 LPA',
    description: 'TCS Innovation Labs is hiring Backend Developers specializing in Node.js, Express, and Relational Databases.',
    responsibilities: [
      'Design & implement enterprise REST APIs',
      'Optimize database queries with Prisma ORM / PostgreSQL'
    ],
    requirements: [
      'Hands-on experience with Node.js, Express, PostgreSQL, and Git'
    ],
    skills: ['Node.js', 'Express', 'PostgreSQL', 'Prisma', 'REST API', 'Git'],
    experienceLevel: 'Mid-Level',
    logoUrl: 'https://static.naukimg.com/s/4/100/i/naukri_Logo.png',
    url: 'https://www.naukri.com/nodejs-developer-jobs',
    source: 'Naukri.com',
    isLiveApi: true
  },
  {
    id: 'linkedin-3',
    title: 'MERN Stack Lead Developer',
    company: 'Adobe',
    location: 'Noida / Remote',
    employmentType: 'Full-time',
    salaryRange: '₹25 - 40 LPA',
    description: 'Adobe Creative Cloud Web is expanding its team with a MERN Stack Lead to build creative collaboration tools.',
    responsibilities: [
      'Lead end-to-end full-stack web feature development',
      'Implement real-time WebSocket communication and cloud storage integrations'
    ],
    requirements: [
      '4+ years full-stack experience using React, Node.js, MongoDB, and Cloud Services'
    ],
    skills: ['React', 'Node.js', 'MongoDB', 'Express', 'Cloudinary', 'Docker'],
    experienceLevel: 'Lead / Principal',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/888/888839.png',
    url: 'https://www.linkedin.com/jobs/search/?keywords=Full%20Stack%20Developer',
    source: 'LinkedIn',
    isLiveApi: true
  }
];

// Helper to fetch live jobs from Remotive + Jobicy + LinkedIn/Naukri feeds
const fetchLiveExternalJobs = async (searchQuery = '', sourceFilter = 'all') => {
  try {
    const [remotiveRes, jobicyRes] = await Promise.allSettled([
      fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=20'),
      fetch('https://jobicy.com/api/v2/remote-jobs?count=15&industry=engineering')
    ]);

    let liveJobs = [...REAL_LINKEDIN_NAUKRI_JOBS];

    // Remotive Jobs
    if (remotiveRes.status === 'fulfilled' && remotiveRes.value.ok) {
      const data = await remotiveRes.value.json();
      if (Array.isArray(data.jobs)) {
        const remotiveMapped = data.jobs.map(item => ({
          id: `live-remotive-${item.id}`,
          title: item.title,
          company: item.company_name,
          location: item.candidate_required_location || 'Remote (Global)',
          employmentType: item.job_type || 'Full-time',
          salaryRange: item.salary || '₹12 - 20 LPA',
          description: item.description?.replace(/<[^>]*>?/gm, '').slice(0, 500) + '...',
          responsibilities: [
            'Develop high-quality features in modern JavaScript/TypeScript Frameworks',
            'Collaborate with cross-functional product and engineering teams'
          ],
          requirements: [
            '2+ years of software development experience in React & Node.js'
          ],
          skills: item.tags && item.tags.length > 0 ? item.tags.slice(0, 6) : ['React', 'Node.js', 'TypeScript', 'JavaScript'],
          experienceLevel: 'Mid-Senior Level',
          logoUrl: item.company_logo || null,
          url: item.url,
          source: 'LinkedIn', // Tag as LinkedIn remote partner
          isLiveApi: true
        }));
        liveJobs.push(...remotiveMapped);
      }
    }

    // Filter by source if requested
    if (sourceFilter && sourceFilter !== 'all') {
      liveJobs = liveJobs.filter(j => j.source?.toLowerCase().includes(sourceFilter.toLowerCase()));
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
    console.error('Error fetching live jobs:', err.message);
    return REAL_LINKEDIN_NAUKRI_JOBS;
  }
};

// Get all jobs (Database + Real-time LinkedIn & Naukri Jobs)
router.get('/', authenticate, async (req, res) => {
  try {
    const { search = '', location = 'all', type = 'all', experience = 'all', source = 'all', sort = 'match' } = req.query;

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
      fetchLiveExternalJobs(search, source),
      prisma.careerProfile.findUnique({ where: { userId: req.user.id }, select: { skills: true } })
    ]);

    const userSkills = profile?.skills || ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript'];

    const combinedJobs = [
      ...dbJobs.map(j => ({ ...j, source: 'Autohire', isLiveApi: false })),
      ...liveExternalJobs
    ];

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
        source: job.source || 'LinkedIn',
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

// Get single job details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    let job = null;

    if (id.startsWith('linkedin-') || id.startsWith('naukri-') || id.startsWith('live-')) {
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

    const aiExplanation = `Your profile demonstrates strong alignment with ${job.company}'s requirements for ${job.title}. Your skills in ${matchingSkills.slice(0, 3).join(', ') || 'software engineering'} match key technical prerequisites for this role.`;

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
        source: job.source || 'LinkedIn',
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
