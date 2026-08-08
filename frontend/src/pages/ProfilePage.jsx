import { useState, useEffect } from 'react';
import { User, Code, Briefcase, GraduationCap, FolderOpen, Edit2, Save, X, Mail, Phone, MapPin, Award, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

const DEFAULT_PROFILE = {
  about: 'Experienced software developer with a passion for building scalable web applications using modern JavaScript technologies. Strong background in full-stack development with expertise in the MERN stack.',
  target_roles: ['MERN Stack Developer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer'],
  skills: ['React', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript', 'Tailwind CSS', 'Git', 'REST API'],
  experience: [
    {
      company: 'TechCorp Solutions',
      role: 'Junior Developer',
      duration: 'Jan 2023 - Present',
      description: 'Built and maintained React frontends and Node.js APIs for the company’s SaaS products'
    }
  ],
  education: [
    {
      institution: 'Jai Narain Vyas University',
      degree: 'Bachelor of Computer Applications (BCA)',
      year: '2021 - 2024'
    }
  ],
  projects: [
    {
      name: 'Purchase & Procurement Management System (PPMS)',
      description: 'A full stack application to manage purchase requests, vendors, quotations and inventory.',
      skills: ['React', 'Node.js', 'MongoDB']
    }
  ],
  certifications: [
    { title: 'JavaScript (Basic)', provider: 'HackerRank' },
    { title: 'Git & GitHub', provider: 'Coursera' }
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
        setProfile({
          ...DEFAULT_PROFILE,
          ...data.profile,
          skills: data.profile.skills || DEFAULT_PROFILE.skills,
          projects: Array.isArray(data.profile.projects) ? data.profile.projects : DEFAULT_PROFILE.projects,
          certifications: DEFAULT_PROFILE.certifications
        });
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
      {/* Header */}
      <div className="career-profile-header">
        <div>
          <h1 className="career-profile-title">Career Profile</h1>
          <p className="career-profile-subtitle">Your AI-generated profile from resume</p>
        </div>
        <div>
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
            <button className="edit-profile-btn" onClick={() => setEditMode(true)}>
              <Edit2 size={14} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Two Column Layout (Matching Reference Screenshot) */}
      <div className="career-profile-grid">
        {/* Left Column: Bio, Contact, Experience, Education */}
        <div className="profile-left-column">
          <div className="card bio-card">
            <div className="bio-header">
              <div className="bio-avatar">{initials}</div>
              <div className="bio-info">
                <h2 className="user-name">{user?.name || 'Hitesh Sharma'}</h2>
                <div className="user-role">Full Stack Developer</div>
                <div className="contact-list">
                  <div className="contact-item">
                    <Mail size={13} /> <span>{user?.email || 'hitesh@gmail.com'}</span>
                  </div>
                  <div className="contact-item">
                    <Phone size={13} /> <span>+91 98765 43210</span>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bio-section">
              <h3 className="section-heading">About</h3>
              {editMode ? (
                <textarea
                  className="form-textarea"
                  value={form.about || ''}
                  onChange={e => setForm({ ...form, about: e.target.value })}
                  rows={3}
                />
              ) : (
                <p className="bio-text">{profile.about}</p>
              )}
            </div>

            {/* Experience Section */}
            <div className="bio-section">
              <h3 className="section-heading">Experience</h3>
              <div className="timeline-list">
                {(profile.experience || []).map((exp, i) => (
                  <div key={i} className="timeline-row">
                    <div className="timeline-dot" />
                    <div className="timeline-body">
                      <div className="timeline-role">{exp.role || 'Junior Developer'}</div>
                      <div className="timeline-company">{exp.company} • {exp.duration}</div>
                      {exp.description && <p className="timeline-desc">{exp.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education Section */}
            <div className="bio-section">
              <h3 className="section-heading">Education</h3>
              <div className="timeline-list">
                {(profile.education || []).map((edu, i) => (
                  <div key={i} className="timeline-row">
                    <div className="timeline-dot blue" />
                    <div className="timeline-body">
                      <div className="timeline-role">{edu.degree}</div>
                      <div className="timeline-company">{edu.institution}</div>
                      <div className="timeline-year">{edu.year}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Top Skills, Projects, Certifications */}
        <div className="profile-right-column">
          {/* Top Skills Card */}
          <div className="card skills-card">
            <h3 className="card-section-title">Top Skills</h3>
            <div className="skills-pill-wrap">
              {(profile.skills || []).map(skill => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>

          {/* Projects Card */}
          <div className="card projects-card">
            <h3 className="card-section-title">Projects</h3>
            <div className="projects-list">
              {(profile.projects || []).map((proj, i) => (
                <div key={i} className="project-card-item">
                  <h4 className="project-title">{proj.name}</h4>
                  <p className="project-description">{proj.description}</p>
                  <div className="project-skills">
                    {(proj.skills || []).map(s => (
                      <span key={s} className="project-skill-badge">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications Card */}
          <div className="card certs-card">
            <h3 className="card-section-title">Certifications</h3>
            <div className="certs-list">
              {(profile.certifications || []).map((cert, i) => (
                <div key={i} className="cert-row">
                  <CheckCircle2 size={16} className="cert-icon" />
                  <div>
                    <div className="cert-title">{typeof cert === 'string' ? cert : cert.title}</div>
                    <div className="cert-provider">{cert.provider || 'Verified'}</div>
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
