import prisma from './prisma.js';

const sampleJobs = [
  {
    title: 'Senior MERN Stack Developer',
    company: 'TechCorp Solutions',
    location: 'Remote (Ahmedabad)',
    employmentType: 'Full-time',
    salaryRange: '₹12,000,00 - ₹18,000,00 / year',
    description: 'We are seeking an experienced MERN Stack Developer to lead the development of our flagship SaaS product. You will architect scalable frontends using React and robust backend APIs with Node.js, Express, and PostgreSQL/MongoDB.',
    responsibilities: [
      'Architect and build scalable web applications using React and Node.js',
      'Optimize database queries and system performance',
      'Collaborate with product designers to implement pixel-perfect UIs',
      'Mentor junior team members and conduct code reviews'
    ],
    requirements: [
      '4+ years experience with React, Node.js, Express, and MongoDB/PostgreSQL',
      'Strong understanding of RESTful APIs, state management, and modern CSS',
      'Experience with TypeScript and modern CI/CD pipelines',
      'Bachelor’s degree in Computer Science or equivalent'
    ],
    skills: ['React', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript', 'REST API', 'Git', 'CSS'],
    experienceLevel: 'Senior'
  },
  {
    title: 'Full Stack React & Node Engineer',
    company: 'InnovateAI Labs',
    location: 'Bangalore / Hybrid',
    employmentType: 'Full-time',
    salaryRange: '₹15,000,00 - ₹22,000,00 / year',
    description: 'Join our fast-growing AI startup building cutting-edge career productivity tools. Work closely with AI researchers to integrate LLM features into sleek user interfaces.',
    responsibilities: [
      'Develop real-time features using WebSockets and React',
      'Integrate AI services and vector databases',
      'Maintain high test coverage and documentation'
    ],
    requirements: [
      '3+ years full-stack experience with JavaScript/TypeScript',
      'Hands-on experience with modern React, Redux/Zustand, and Express',
      'Passion for AI tools and startup environment'
    ],
    skills: ['React', 'Node.js', 'Express.js', 'JavaScript', 'TypeScript', 'REST API', 'HTML', 'CSS'],
    experienceLevel: 'Mid-level'
  },
  {
    title: 'Frontend Developer (React)',
    company: 'PixelCraft Studios',
    location: 'Remote',
    employmentType: 'Full-time',
    salaryRange: '₹8,000,00 - ₹12,000,00 / year',
    description: 'Looking for a UI/UX-focused frontend developer who loves crafting beautiful visual experiences, responsive micro-interactions, and high-performance React components.',
    responsibilities: [
      'Transform Figma designs into clean, responsive React code',
      'Implement glassmorphism, micro-animations, and dynamic visual state',
      'Ensure cross-browser compatibility and high Lighthouse scores'
    ],
    requirements: [
      '2+ years frontend development experience with React',
      'Mastery of Vanilla CSS, CSS Variables, and responsive design',
      'Eye for design details and typography'
    ],
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git', 'REST API'],
    experienceLevel: 'Junior / Mid'
  },
  {
    title: 'Backend Node.js API Engineer',
    company: 'CloudScale Systems',
    location: 'Pune / Hybrid',
    employmentType: 'Full-time',
    salaryRange: '₹14,000,00 - ₹20,000,00 / year',
    description: 'Architect resilient backend microservices, authentication systems, and database schema designs using Node.js, Express, PostgreSQL, and Redis.',
    responsibilities: [
      'Design high-throughput REST APIs and database queries',
      'Implement JWT/OAuth2 authentication and authorization middleware',
      'Monitor server metrics and optimize database indexes'
    ],
    requirements: [
      '3+ years backend engineering experience with Node.js',
      'Strong database design skills in PostgreSQL / Prisma',
      'Knowledge of AWS, Docker, and Redis caching'
    ],
    skills: ['Node.js', 'Express.js', 'REST API', 'JavaScript', 'Git', 'MongoDB'],
    experienceLevel: 'Mid-Senior'
  },
  {
    title: 'Junior Web Developer (MERN Stack)',
    company: 'NextGen Solutions',
    location: 'Ahmedabad',
    employmentType: 'Full-time',
    salaryRange: '₹5,000,00 - ₹8,000,00 / year',
    description: 'Great opportunity for an ambitious junior developer with solid foundations in React, JavaScript, HTML, CSS, and basic Node.js backend concepts.',
    responsibilities: [
      'Build internal dashboard components and landing pages',
      'Fix bug tickets and assist senior engineers with API integration',
      'Participate in daily standups and sprint planning'
    ],
    requirements: [
      'Proficiency in React, HTML5, CSS3, and JavaScript (ES6+)',
      'Basic knowledge of Node.js and Express APIs',
      'Strong problem-solving and communication skills'
    ],
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Node.js', 'Git'],
    experienceLevel: 'Junior'
  }
];

async function seed() {
  console.log('🌱 Starting Prisma database seed...');

  try {
    for (const job of sampleJobs) {
      await prisma.job.create({
        data: job
      });
    }

    console.log(`✅ Successfully seeded ${sampleJobs.length} jobs into database via Prisma.`);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
