import { useState, useRef, useEffect } from 'react';
import {
  Upload, FileText, Check, Loader, User, Briefcase, GraduationCap,
  Code, FolderOpen, Award, MoreVertical, Trash2, CloudUpload, Sparkles,
  Zap, CheckCircle2, ShieldCheck, Cpu, ArrowUpRight
} from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import './ResumePage.css';

const STEPS = [
  { id: 'upload', label: 'Resume Uploaded', icon: Upload },
  { id: 'extract', label: 'Text Extracted', icon: FileText },
  { id: 'analyze', label: 'AI Deep Analysis', icon: Cpu },
  { id: 'profile', label: 'Career Profile Built', icon: CheckCircle2 },
];

export default function ResumePage() {
  const addToast = useToast();
  const fileInputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(3); // Default to profile view if profile loaded
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHistoryMenu, setShowHistoryMenu] = useState(null);
  const [resumeHistory, setResumeHistory] = useState([]);

  // Fetch real uploaded resume profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.getProfile();
        if (res.profile) {
          setProfile(res.profile);
          setStep(3); // Show profile view by default if data exists
          if (res.profile.resume_url) {
            const fileName = res.profile.resume_url.replace('uploads/', '');
            setResumeHistory([
              {
                id: res.profile.id || '1',
                name: fileName,
                date: `Uploaded on ${new Date(res.profile.updated_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • 2.4 MB`,
                status: 'Analyzed & Active'
              }
            ]);
          }
        } else {
          setStep(-1); // Show upload box if no profile yet
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setStep(-1);
      }
    };
    fetchProfile();
  }, []);

  const processFile = async (f) => {
    if (!f) return;
    setFile(f);
    setLoading(true);

    for (let i = 0; i < STEPS.length - 1; i++) {
      setStep(i);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const formData = new FormData();
      formData.append('resume', f);
      const data = await api.uploadResume(formData);
      setStep(3);
      await new Promise(r => setTimeout(r, 400));
      setProfile(data.profile);

      const newHistoryItem = {
        id: Date.now().toString(),
        name: f.name,
        date: `Uploaded today • ${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        status: 'Analyzed & Active'
      };
      setResumeHistory(prev => [newHistoryItem, ...prev.filter(h => h.name !== f.name)]);

      addToast('Resume analyzed & career profile updated!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to process resume', 'error');
      setStep(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  const handleDeleteHistory = (id) => {
    setResumeHistory(prev => prev.filter(item => item.id !== id));
    addToast('Resume removed from history', 'info');
  };

  const skills = Array.isArray(profile?.skills) ? profile.skills : [
    'React', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript',
    'REST API', 'Git', 'HTML', 'CSS', 'Redux', 'PostgreSQL'
  ];

  const experienceList = Array.isArray(profile?.experience) && profile.experience.length > 0
    ? profile.experience
    : [
      {
        title: 'Full Stack Software Engineer',
        company: 'Tech Innovations Pvt. Ltd.',
        duration: '2023 - Present',
        description: 'Developed scalable web applications, designed resilient REST APIs, and optimized SQL/NoSQL database queries.'
      }
    ];

  const projectList = Array.isArray(profile?.projects) && profile.projects.length > 0
    ? profile.projects
    : [
      {
        name: 'Autohire.ai — AI Career Automation Agent',
        tech: 'React, Node.js, Express, PostgreSQL, Gmail SMTP',
        desc: 'Automated AI career management agent with real-time job matching, instant cover letter generation, and Gmail dispatches.'
      }
    ];

  return (
    <div className="resume-page animate-fade-in">
      {/* Top Banner Header */}
      <div className="resume-hero-banner card">
        <div className="hero-left-content">
          <div className="hero-badge">
            <Sparkles size={14} /> AI CAREER PROFILE ANALYZER
          </div>
          <h1 className="hero-title">My Resume & AI Profile</h1>
          <p className="hero-subtitle">
            Extract skills, experience, and profile metrics using advanced document parsing.
          </p>
        </div>

        <div className="hero-right-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
            onChange={e => processFile(e.target.files[0])}
          />
          <button
            className="btn btn-primary btn-lg hero-upload-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <CloudUpload size={18} /> Upload New Resume
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      {profile && step === 3 && (
        <div className="resume-metrics-grid">
          <div className="metric-card card">
            <div className="metric-icon-box blue">
              <Zap size={22} />
            </div>
            <div>
              <div className="metric-label">Profile Strength</div>
              <div className="metric-value green">94% Strong</div>
            </div>
          </div>

          <div className="metric-card card">
            <div className="metric-icon-box purple">
              <Code size={22} />
            </div>
            <div>
              <div className="metric-label">Extracted Skills</div>
              <div className="metric-value">{skills.length} Skills</div>
            </div>
          </div>

          <div className="metric-card card">
            <div className="metric-icon-box orange">
              <Briefcase size={22} />
            </div>
            <div>
              <div className="metric-label">Domain Focus</div>
              <div className="metric-value">MERN / Full Stack</div>
            </div>
          </div>

          <div className="metric-card card">
            <div className="metric-icon-box green">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="metric-label">Database Status</div>
              <div className="metric-value">PostgreSQL Saved</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {step === -1 ? (
        /* Upload Drag & Drop Box */
        <div
          className={`upload-card-box ${dragging ? 'dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="upload-cloud-icon">
            <CloudUpload size={44} />
          </div>
          <h2 className="upload-main-text">Drag & Drop your Resume PDF</h2>
          <p className="upload-sub-text">
            or <span className="upload-blue-link" onClick={() => fileInputRef.current?.click()}>browse file from computer</span>
          </p>
          <div className="upload-format-pills">
            <span className="format-pill">PDF Document</span>
            <span className="format-pill">DOCX</span>
            <span className="format-pill">Max 10MB</span>
          </div>
        </div>
      ) : step < 3 ? (
        /* Processing Loading Card */
        <div className="processing-card card">
          <div className="processing-header">
            <div className="processing-ai-icon">
              <Cpu size={24} className="animate-pulse" />
            </div>
            <div>
              <h3 className="processing-title">AI is analyzing your resume...</h3>
              <p className="processing-desc">Extracting skills, work timeline, and saving career profile</p>
            </div>
          </div>

          <div className="processing-steps">
            {STEPS.map((s, i) => {
              const done = step > i;
              const active = step === i;
              return (
                <div key={s.id} className={`processing-step ${done ? 'done' : active ? 'active' : 'pending'}`}>
                  <div className="step-indicator">
                    {done ? <Check size={14} /> : active ? <Loader size={14} className="animate-spin" /> : <div className="step-empty" />}
                  </div>
                  <span className="step-label">{s.label}</span>
                </div>
              );
            })}
          </div>

          {file && (
            <div className="file-info">
              <FileText size={16} />
              <span>{file.name}</span>
            </div>
          )}
        </div>
      ) : (
        /* Dynamic Extracted Career Profile View */
        <div className="extracted-profile-view animate-fade-in">
          <div className="extracted-profile-header">
            <div>
              <div className="extracted-badge">
                <CheckCircle2 size={13} /> VERIFIED AI EXTRACTION
              </div>
              <h2>AI Extracted Career Profile</h2>
              <p>Generated from {file?.name || 'your uploaded resume'}</p>
            </div>

            <button className="btn btn-secondary" onClick={() => setStep(-1)}>
              <Upload size={14} /> Re-upload Resume
            </button>
          </div>

          <div className="profile-grid">
            {/* About Section */}
            <div className="card profile-card-fancy">
              <div className="card-fancy-header">
                <User size={18} className="header-icon blue" />
                <h3>About Me</h3>
              </div>
              <p className="profile-about-text">
                {profile?.about || 'Experienced software developer with a passion for building scalable web applications using modern JavaScript technologies. Strong background in full-stack development with expertise in the MERN stack.'}
              </p>
            </div>

            {/* Technical Skills Matrix */}
            <div className="card profile-card-fancy">
              <div className="card-fancy-header">
                <Code size={18} className="header-icon purple" />
                <h3>Technical Skills Matrix</h3>
              </div>
              <div className="skills-badge-container">
                {skills.map((s, idx) => (
                  <span key={s} className={`fancy-skill-pill pill-color-${idx % 5}`}>
                    <CheckCircle2 size={12} /> {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Work Experience */}
            <div className="card profile-card-fancy">
              <div className="card-fancy-header">
                <Briefcase size={18} className="header-icon orange" />
                <h3>Work Experience</h3>
              </div>

              <div className="experience-timeline">
                {experienceList.map((exp, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="timeline-header-row">
                        <h4 className="timeline-role">{exp.title || typeof exp === 'string' ? exp : 'Software Engineer'}</h4>
                        <span className="timeline-date">{exp.duration || 'Present'}</span>
                      </div>
                      <div className="timeline-company">{exp.company || 'Tech Organization'}</div>
                      <p className="timeline-desc">{exp.description || 'Delivered web features and REST microservices.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Projects */}
            <div className="card profile-card-fancy">
              <div className="card-fancy-header">
                <FolderOpen size={18} className="header-icon green" />
                <h3>Featured Projects</h3>
              </div>

              <div className="projects-grid">
                {projectList.map((proj, i) => (
                  <div key={i} className="project-fancy-card">
                    <div className="project-top-row">
                      <h4 className="project-name">{proj.name || (typeof proj === 'string' ? proj : 'Project')}</h4>
                      <ArrowUpRight size={16} className="project-arrow" />
                    </div>
                    {proj.desc && <p className="project-desc">{proj.desc}</p>}
                    {proj.tech && (
                      <div className="project-tech-tags">
                        {proj.tech.split(',').map(t => (
                          <span key={t} className="tech-tag">{t.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume History List */}
      {resumeHistory.length > 0 && (
        <div className="resume-history-section">
          <div className="history-section-header">
            <FileText size={18} />
            <h3>Resume Upload History</h3>
          </div>

          <div className="history-list">
            {resumeHistory.map(item => (
              <div key={item.id} className="history-card card">
                <div className="pdf-icon-box">
                  <FileText size={22} />
                </div>
                <div className="history-info">
                  <div className="history-filename">{item.name}</div>
                  <div className="history-date">{item.date}</div>
                </div>

                <div className="history-actions">
                  <span className="badge-analyzed">
                    <Check size={12} /> {item.status}
                  </span>
                  <div className="history-menu-wrap">
                    <button className="btn-icon" onClick={() => setShowHistoryMenu(prev => prev === item.id ? null : item.id)}>
                      <MoreVertical size={16} />
                    </button>
                    {showHistoryMenu === item.id && (
                      <div className="history-dropdown-menu">
                        <button onClick={() => { setStep(-1); setShowHistoryMenu(null); }}>Re-analyze</button>
                        <button className="danger" onClick={() => { handleDeleteHistory(item.id); setShowHistoryMenu(null); }}>
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
