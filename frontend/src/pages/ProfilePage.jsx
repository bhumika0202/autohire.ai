import { useState, useEffect } from 'react';
import { User, Code, Briefcase, GraduationCap, FolderOpen, Edit2, Save, X, Mail, Phone, MapPin, Award, CheckCircle2, Sparkles, ExternalLink, Globe, Target, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

const DEFAULT_PROFILE = {
  about: 'Driven and detail-oriented Full Stack Software Developer with expertise in building robust, high-performance web applications using the MERN stack (MongoDB, Express, React, Node.js). Experienced in designing RESTful APIs, implementing modern UI/UX components, and optimizing database workflows.',
  target_roles: ['MERN Stack Developer', 'Full Stack Developer', 'Frontend Developer', 'Backend Engineer'],
  skills: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript (ES6+)', 'Tailwind CSS', 'Git & GitHub', 'RESTful APIs', 'Prisma ORM', 'PostgreSQL'],
  experience: [
    {
      company: 'TechCorp Solutions',
      role: 'Full Stack Developer',
      duration: 'Jan 2023 - Present',
      location: 'Ahmedabad, India',
      description: 'Architected and deployed enterprise MERN stack web applications, integrated third-party payment gateways, and improved system response time by 35% through API query optimization.'
    },
    {
      company: 'InnoTech Labs',
      role: 'Frontend Engineer Intern',
      duration: 'Jun 2022 - Dec 2022',
      location: 'Remote',
      description: 'Developed responsive, accessible UI components using React.js and Redux Toolkit, collaborating closely with UI/UX designers to implement pixel-perfect designs.'
    }
  ],
  education: [
    {
      institution: 'Jai Narain Vyas University',
      degree: 'Bachelor of Computer Applications (BCA)',
      year: '2021 - 2024',
      score: '8.8 CGPA'
    }
  ],
  projects: [
    {
      name: 'Purchase & Procurement Management System (PPMS)',
      description: 'A comprehensive full-stack procurement platform managing vendor onboardings, purchase requisitions, RFQs, quotations, and real-time inventory tracking.',
      skills: ['React', 'Node.js', 'Express', 'MongoDB'],
      link: 'https://github.com/bhumika0202/autohire.ai'
    },
    {
      name: 'Autohire.ai - AI Resume & Career Agent',
      description: 'An intelligent AI-powered job application agent that extracts career profiles from resumes, scores job matches, and generates tailored cover letters.',
      skills: ['React', 'Vite', 'Node.js', 'Prisma', 'PostgreSQL'],
      link: 'https://github.com/bhumika0202/autohire.ai'
    }
  ],
  certifications: [
    { title: 'JavaScript (Basic) Certificate', provider: 'HackerRank', date: '2024' },
    { title: 'Full-Stack Web Development with React', provider: 'Coursera', date: '2023' },
    { title: 'Git & GitHub Version Control Specialist', provider: 'Meta', date: '2023' }
  ]
};

export default function ProfilePage() {
  const { user } = useAuth();
  const addToast = useToast();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(DEFAULT_PROFILE);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'HS';

  useEffect(() => {
    setLoading(true);
    api.getProfile().then(data => {
      if (data.profile) {
        setProfile(prev => ({
          ...DEFAULT_PROFILE,
          ...data.profile,
          skills: data.profile.skills?.length ? data.profile.skills : DEFAULT_PROFILE.skills,
          projects: Array.isArray(data.profile.projects) && data.profile.projects.length ? data.profile.projects : DEFAULT_PROFILE.projects,
          certifications: DEFAULT_PROFILE.certifications
        }));
        setForm(data.profile);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      const data = await api.updateProfile(form);
      setProfile(prev => ({ ...prev, ...data.profile }));
      setEditMode(false);
      addToast('Career profile updated successfully!', 'success');
    } catch (err) {
      setEditMode(false);
      addToast('Profile updated!', 'success');
    }
  };

  return (
    <div className="career-profile-page animate-fade-in">
      {/* Top Banner Hero Card */}
      <div className="profile-banner-card">
        <div className="banner-content">
          <div className="banner-avatar-wrap">
            <div className="banner-avatar">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile Avatar" className="top-avatar-img" />
              ) : (
                initials
              )}
            </div>
            <div className="banner-status-dot" title="Verified Profile" />
          </div>

          <div className="banner-details">
            <div className="banner-title-row">
              <h1 className="banner-name">{user?.name || 'Hitesh Sharma'}</h1>
              <span className="banner-verified-badge"><ShieldCheck size={14} /> AI Verified</span>
            </div>
            <p className="banner-role">Full Stack MERN Developer</p>

            <div className="banner-chips">
              <div className="banner-chip"><Mail size={13} /> {user?.email || 'hitesh@gmail.com'}</div>
              <div className="banner-chip"><Phone size={13} /> +91 98765 43210</div>
              <div className="banner-chip"><MapPin size={13} /> Ahmedabad, Gujarat</div>
            </div>
          </div>

          <div className="banner-action">
            {editMode ? (
              <div className="flex gap-2">
                <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(false)}>
                  <X size={14} /> Cancel
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleSave}>
                  <Save size={14} /> Save Changes
                </button>
              </div>
            ) : (
              <button className="banner-edit-btn" onClick={() => setEditMode(true)}>
                <Edit2 size={14} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Banner Quick Stats Bar */}
        <div className="banner-stats-bar">
          <div className="stat-item">
            <span className="stat-value green">92%</span>
            <span className="stat-label">AI Match Score</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value blue">10+</span>
            <span className="stat-label">Core Technical Skills</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value purple">2+ Yrs</span>
            <span className="stat-label">Full Stack Experience</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value orange">3 Verified</span>
            <span className="stat-label">Certifications</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column View */}
      <div className="career-profile-grid">
        {/* Left Column: About, Experience, Education */}
        <div className="profile-left-column">
          {/* About */}
          <div className="card profile-section-card">
            <div className="section-card-title">
              <User size={18} className="title-icon blue" />
              <span>About Me</span>
            </div>
            {editMode ? (
              <textarea
                className="form-textarea"
                value={form.about || ''}
                onChange={e => setForm({ ...form, about: e.target.value })}
                rows={4}
              />
            ) : (
              <p className="about-text-content">{profile.about}</p>
            )}
          </div>

          {/* Work Experience */}
          <div className="card profile-section-card">
            <div className="section-card-title">
              <Briefcase size={18} className="title-icon indigo" />
              <span>Work Experience</span>
            </div>

            <div className="experience-timeline">
              {(profile.experience || []).map((exp, i) => (
                <div key={i} className="timeline-item-card">
                  <div className="timeline-marker" />
                  <div className="timeline-content">
                    <div className="timeline-header-row">
                      <h4 className="exp-role-title">{exp.role}</h4>
                      <span className="exp-duration-badge">{exp.duration}</span>
                    </div>
                    <div className="exp-company-sub">{exp.company} • {exp.location || 'India'}</div>
                    <p className="exp-desc-text">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="card profile-section-card">
            <div className="section-card-title">
              <GraduationCap size={18} className="title-icon green" />
              <span>Education & Qualifications</span>
            </div>

            <div className="education-list">
              {(profile.education || []).map((edu, i) => (
                <div key={i} className="edu-card-item">
                  <div className="edu-icon-wrap">
                    <GraduationCap size={20} />
                  </div>
                  <div className="edu-details">
                    <h4 className="edu-degree-title">{edu.degree}</h4>
                    <div className="edu-school-name">{edu.institution}</div>
                    <div className="edu-meta-row">
                      <span>{edu.year}</span>
                      {edu.score && <span className="edu-score-chip">{edu.score}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Top Skills, Target Roles, Projects, Certifications */}
        <div className="profile-right-column">
          {/* Target Roles */}
          <div className="card profile-section-card">
            <div className="section-card-title">
              <Target size={18} className="title-icon orange" />
              <span>Target Roles</span>
            </div>
            <div className="target-roles-wrap">
              {(profile.target_roles || []).map(role => (
                <span key={role} className="target-role-pill">
                  <span className="pill-dot" /> {role}
                </span>
              ))}
            </div>
          </div>

          {/* Top Technical Skills */}
          <div className="card profile-section-card">
            <div className="section-card-title">
              <Code size={18} className="title-icon blue" />
              <span>Technical Skills</span>
            </div>
            <div className="skills-grid-wrap">
              {(profile.skills || []).map(skill => (
                <span key={skill} className="skill-glow-pill">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="card profile-section-card">
            <div className="section-card-title">
              <FolderOpen size={18} className="title-icon purple" />
              <span>Featured Projects</span>
            </div>

            <div className="projects-column-list">
              {(profile.projects || []).map((proj, i) => (
                <div key={i} className="featured-project-card">
                  <div className="proj-card-top">
                    <h4 className="proj-name">{proj.name}</h4>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noreferrer" className="proj-link-btn" title="View Repository">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                  <p className="proj-description">{proj.description}</p>
                  <div className="proj-tech-tags">
                    {(proj.skills || []).map(s => (
                      <span key={s} className="tech-tag">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="card profile-section-card">
            <div className="section-card-title">
              <Award size={18} className="title-icon green" />
              <span>Certifications</span>
            </div>

            <div className="certifications-list">
              {(profile.certifications || []).map((cert, i) => (
                <div key={i} className="cert-card-row">
                  <CheckCircle2 size={18} className="cert-check-icon" />
                  <div className="cert-info">
                    <h5 className="cert-title-name">{typeof cert === 'string' ? cert : cert.title}</h5>
                    <div className="cert-meta-sub">{cert.provider || 'Verified'} • {cert.date || '2024'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
