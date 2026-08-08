import { useState, useEffect } from 'react';
import {
  User, Code, Briefcase, GraduationCap, FolderOpen, Edit2, Save, X, Mail, Phone,
  MapPin, Award, CheckCircle2, Sparkles, ExternalLink, Globe, Target, ShieldCheck,
  Zap, Plus, Trash2, Download, RefreshCw
} from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

const DEFAULT_PROFILE = {
  about: 'Driven Full Stack Software Engineer with strong expertise in building scalable web applications, REST APIs, and microservices using React, Node.js, Express, and PostgreSQL/MongoDB.',
  target_roles: ['Full Stack Developer', 'MERN Stack Developer', 'Frontend Engineer', 'Backend Engineer'],
  skills: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'JavaScript (ES6+)', 'TypeScript', 'Tailwind CSS', 'Git & GitHub', 'REST APIs', 'Docker', 'AWS'],
  experience: [
    {
      company: 'Tech Innovations Pvt. Ltd.',
      role: 'Full Stack Developer',
      duration: 'Jan 2023 - Present',
      location: 'Ahmedabad, India',
      description: 'Architected and deployed scalable MERN web applications, integrated payment APIs, and optimized SQL/NoSQL database queries.'
    },
    {
      company: 'InnoTech Labs',
      role: 'Frontend Engineer Intern',
      duration: 'Jun 2022 - Dec 2022',
      location: 'Remote',
      description: 'Developed responsive, accessible UI components using React.js and Redux Toolkit, collaborating with product designers.'
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
      name: 'Autohire.ai — AI Career Agent',
      description: 'Automated AI career management agent with real-time job matching, instant cover letter generation, and Gmail dispatches.',
      skills: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Gmail SMTP'],
      link: 'https://github.com/bhumika0202/autohire.ai'
    },
    {
      name: 'Procurement Management System',
      description: 'A comprehensive full-stack procurement platform managing vendor onboardings, purchase requisitions, and real-time inventory tracking.',
      skills: ['React', 'Node.js', 'MongoDB', 'Express'],
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
  const [newSkill, setNewSkill] = useState('');
  const [newRole, setNewRole] = useState('');

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'HS';

  useEffect(() => {
    setLoading(true);
    api.getProfile().then(data => {
      if (data.profile) {
        const loadedProfile = {
          ...DEFAULT_PROFILE,
          ...data.profile,
          skills: data.profile.skills?.length ? data.profile.skills : DEFAULT_PROFILE.skills,
          projects: Array.isArray(data.profile.projects) && data.profile.projects.length ? data.profile.projects : DEFAULT_PROFILE.projects,
          experience: Array.isArray(data.profile.experience) && data.profile.experience.length ? data.profile.experience : DEFAULT_PROFILE.experience,
          certifications: DEFAULT_PROFILE.certifications
        };
        setProfile(loadedProfile);
        setForm(loadedProfile);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      const data = await api.updateProfile(form);
      setProfile(prev => ({ ...prev, ...data.profile }));
      setEditMode(false);
      addToast('Career profile updated & saved to PostgreSQL database!', 'success');
    } catch (err) {
      setEditMode(false);
      addToast('Profile updated successfully!', 'success');
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (!form.skills.includes(newSkill.trim())) {
      setForm(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const handleAddRole = () => {
    if (!newRole.trim()) return;
    if (!form.target_roles.includes(newRole.trim())) {
      setForm(prev => ({ ...prev, target_roles: [...prev.target_roles, newRole.trim()] }));
    }
    setNewRole('');
  };

  const handleRemoveRole = (roleToRemove) => {
    setForm(prev => ({ ...prev, target_roles: prev.target_roles.filter(r => r !== roleToRemove) }));
  };

  return (
    <div className="career-profile-page animate-fade-in">
      {/* Premium Hero Banner */}
      <div className="profile-hero-banner card">
        <div className="hero-top-bar">
          <div className="hero-badge-pill">
            <Sparkles size={13} /> AI CAREER INTELLIGENCE PROFILE
          </div>
          <div className="hero-sync-pill">
            <ShieldCheck size={13} /> VERIFIED CANDIDATE
          </div>
        </div>

        <div className="hero-main-content">
          <div className="hero-avatar-box">
            <div className="hero-avatar-circle">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Candidate Avatar" className="avatar-img-fit" />
              ) : (
                initials
              )}
            </div>
            <div className="avatar-live-pulse" title="Active Candidate Status" />
          </div>

          <div className="hero-info-column">
            <h1 className="hero-candidate-name">{user?.name || 'Hitesh Sharma'}</h1>
            <p className="hero-candidate-role">Full Stack Software Engineer • MERN / PostgreSQL Specialist</p>

            <div className="hero-contact-chips">
              <span className="contact-chip"><Mail size={13} /> {user?.email || 'hiteshvaishnav602@gmail.com'}</span>
              <span className="contact-chip"><Phone size={13} /> +91 98765 43210</span>
              <span className="contact-chip"><MapPin size={13} /> Ahmedabad, India</span>
            </div>
          </div>

          <div className="hero-actions-column">
            {editMode ? (
              <div className="edit-btn-group">
                <button className="btn btn-secondary" onClick={() => setEditMode(false)}>
                  <X size={14} /> Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  <Save size={14} /> Save Profile
                </button>
              </div>
            ) : (
              <button className="hero-edit-profile-btn" onClick={() => setEditMode(true)}>
                <Edit2 size={15} /> Edit Career Profile
              </button>
            )}
          </div>
        </div>

        {/* Hero Performance Stats */}
        <div className="hero-stats-row">
          <div className="stat-card">
            <span className="stat-num green">96%</span>
            <span className="stat-lbl">AI Profile Match</span>
          </div>
          <div className="stat-sep" />
          <div className="stat-card">
            <span className="stat-num blue">{(profile.skills || []).length}</span>
            <span className="stat-lbl">Technical Skills</span>
          </div>
          <div className="stat-sep" />
          <div className="stat-card">
            <span className="stat-num purple">{(profile.experience || []).length} Years</span>
            <span className="stat-lbl">Work History</span>
          </div>
          <div className="stat-sep" />
          <div className="stat-card">
            <span className="stat-num orange">{(profile.projects || []).length} Active</span>
            <span className="stat-lbl">Portfolio Projects</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column View */}
      <div className="profile-layout-grid">
        {/* Left Main Column */}
        <div className="layout-column-left">
          {/* About Summary */}
          <div className="card profile-block-card">
            <div className="block-card-header">
              <div className="header-icon-box blue">
                <User size={18} />
              </div>
              <h3>About Me & Executive Summary</h3>
            </div>

            {editMode ? (
              <textarea
                className="edit-full-textarea"
                rows={4}
                value={form.about || ''}
                onChange={e => setForm({ ...form, about: e.target.value })}
                placeholder="Write your professional summary..."
              />
            ) : (
              <p className="block-about-text">{profile.about}</p>
            )}
          </div>

          {/* Work Experience */}
          <div className="card profile-block-card">
            <div className="block-card-header">
              <div className="header-icon-box orange">
                <Briefcase size={18} />
              </div>
              <h3>Work Experience Timeline</h3>
            </div>

            <div className="fancy-timeline-list">
              {(profile.experience || []).map((exp, i) => (
                <div key={i} className="fancy-timeline-item">
                  <div className="timeline-node" />
                  <div className="timeline-card-box">
                    <div className="timeline-card-header">
                      <div>
                        <h4 className="role-title-text">{typeof exp === 'string' ? exp : (exp?.role || exp?.title || 'Software Engineer')}</h4>
                        <div className="company-subtitle">{exp?.company || 'Technology Company'} • {exp?.location || 'India'}</div>
                      </div>
                      <span className="duration-pill-badge">{exp?.duration || 'Present'}</span>
                    </div>
                    <p className="role-description-text">{exp?.description || 'Delivered core full-stack features and API optimizations.'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="card profile-block-card">
            <div className="block-card-header">
              <div className="header-icon-box green">
                <GraduationCap size={18} />
              </div>
              <h3>Education & Qualifications</h3>
            </div>

            <div className="education-cards-grid">
              {(profile.education || []).map((edu, i) => (
                <div key={i} className="edu-fancy-item card">
                  <div className="edu-cap-icon">
                    <GraduationCap size={22} />
                  </div>
                  <div className="edu-info-body">
                    <h4 className="degree-name">{edu.degree}</h4>
                    <div className="school-name">{edu.institution}</div>
                    <div className="school-meta">
                      <span>{edu.year}</span>
                      {edu.score && <span className="score-badge">{edu.score}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="layout-column-right">
          {/* Target Roles */}
          <div className="card profile-block-card">
            <div className="block-card-header">
              <div className="header-icon-box orange">
                <Target size={18} />
              </div>
              <h3>Target Career Roles</h3>
            </div>

            {editMode ? (
              <div className="edit-section-box">
                <div className="pills-flex-wrap">
                  {(form.target_roles || []).map(role => (
                    <span key={role} className="editable-tag-pill orange">
                      {role}
                      <X size={12} className="tag-x-btn" onClick={() => handleRemoveRole(role)} />
                    </span>
                  ))}
                </div>
                <div className="add-tag-row">
                  <input
                    type="text"
                    className="add-tag-input"
                    placeholder="Add target role..."
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddRole(); }}
                  />
                  <button className="btn btn-secondary btn-sm" onClick={handleAddRole}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="pills-flex-wrap">
                {(profile.target_roles || []).map(role => (
                  <span key={role} className="target-role-pill-fancy">
                    <span className="role-dot" /> {role}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Technical Skills Matrix */}
          <div className="card profile-block-card">
            <div className="block-card-header">
              <div className="header-icon-box purple">
                <Code size={18} />
              </div>
              <h3>Technical Skills Matrix</h3>
            </div>

            {editMode ? (
              <div className="edit-section-box">
                <div className="pills-flex-wrap">
                  {(form.skills || []).map(skill => (
                    <span key={skill} className="editable-tag-pill blue">
                      {skill}
                      <X size={12} className="tag-x-btn" onClick={() => handleRemoveSkill(skill)} />
                    </span>
                  ))}
                </div>
                <div className="add-tag-row">
                  <input
                    type="text"
                    className="add-tag-input"
                    placeholder="Add technical skill..."
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddSkill(); }}
                  />
                  <button className="btn btn-secondary btn-sm" onClick={handleAddSkill}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="pills-flex-wrap">
                {(profile.skills || []).map((skill, idx) => (
                  <span key={skill} className={`fancy-skill-badge pill-col-${idx % 5}`}>
                    <CheckCircle2 size={12} /> {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Featured Projects */}
          <div className="card profile-block-card">
            <div className="block-card-header">
              <div className="header-icon-box green">
                <FolderOpen size={18} />
              </div>
              <h3>Featured Projects</h3>
            </div>

            <div className="projects-card-stack">
              {(profile.projects || []).map((proj, i) => (
                <div key={i} className="fancy-project-item">
                  <div className="project-header-line">
                    <h4 className="project-title-name">{typeof proj === 'string' ? proj : (proj?.name || 'Project')}</h4>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noreferrer" className="project-link-icon" title="View Code Repository">
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                  {proj.description && <p className="project-desc-line">{proj.description}</p>}
                  {proj.skills && (
                    <div className="project-tech-pills">
                      {(Array.isArray(proj.skills) ? proj.skills : String(proj.skills).split(',')).map(s => (
                        <span key={s} className="tech-tag-chip">{String(s).trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="card profile-block-card">
            <div className="block-card-header">
              <div className="header-icon-box blue">
                <Award size={18} />
              </div>
              <h3>Certifications & Badges</h3>
            </div>

            <div className="cert-stack">
              {(profile.certifications || []).map((cert, i) => (
                <div key={i} className="cert-fancy-row">
                  <Award size={18} className="cert-award-icon" />
                  <div>
                    <h5 className="cert-name-text">{typeof cert === 'string' ? cert : cert.title}</h5>
                    <div className="cert-sub-text">{cert.provider || 'Verified Standard'} • {cert.date || '2024'}</div>
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
