import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Check, Loader, User, Briefcase, GraduationCap, Code, FolderOpen, Award, Edit2, MoreVertical, Trash2, CloudUpload } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import './ResumePage.css';

const STEPS = [
  { id: 'upload', label: 'Resume uploaded', icon: Upload },
  { id: 'extract', label: 'Text extracted', icon: FileText },
  { id: 'analyze', label: 'AI analyzing', icon: Loader },
  { id: 'profile', label: 'Profile generated', icon: User },
];

export default function ResumePage() {
  const addToast = useToast();
  const fileInputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(-1); // -1 = idle
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
          if (res.profile.resume_url) {
            const fileName = res.profile.resume_url.replace('uploads/', '');
            setResumeHistory([
              {
                id: res.profile.id || '1',
                name: fileName,
                date: `Uploaded on ${new Date(res.profile.updated_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • 2.4 MB`,
                status: 'Analyzed'
              }
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const processFile = async (f) => {
    if (!f) return;
    setFile(f);
    setLoading(true);

    // Animate processing steps
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

      // Add actual uploaded file to history list
      const newHistoryItem = {
        id: Date.now().toString(),
        name: f.name,
        date: `Uploaded today • ${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        status: 'Analyzed'
      };
      setResumeHistory(prev => [newHistoryItem, ...prev.filter(h => h.name !== f.name)]);

      addToast('Resume analyzed & career profile saved to PostgreSQL!', 'success');
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

  const skills = Array.isArray(profile?.skills) ? profile.skills : [];

  return (
    <div className="resume-page animate-fade-in">
      {/* Header */}
      <div className="resume-page-header">
        <h1>My Resume</h1>
        <p>Upload your latest resume</p>
      </div>

      {step === -1 ? (
        /* Upload Area Card */
        <div
          className={`upload-card-box ${dragging ? 'dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
            onChange={e => processFile(e.target.files[0])}
          />
          <div className="upload-cloud-icon">
            <CloudUpload size={48} />
          </div>
          <h2 className="upload-main-text">Drag & drop your resume here</h2>
          <p className="upload-sub-text">
            or <span className="upload-blue-link" onClick={() => fileInputRef.current?.click()}>click to browse</span>
          </p>
          <p className="upload-limit-text">PDF only (Max 10MB)</p>
          <button className="upload-action-btn" onClick={() => fileInputRef.current?.click()}>
            Upload Resume
          </button>
        </div>
      ) : step < 3 ? (
        /* Processing Steps */
        <div className="processing-card card">
          <div className="processing-header">
            <div className="processing-ai-icon"><span>✦</span></div>
            <div>
              <h3 className="processing-title">AI is analyzing your resume...</h3>
              <p className="processing-desc">Extracting skills, experience, and building your career profile</p>
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
        /* Generated Career Profile View */
        <div className="extracted-profile-view animate-fade-in">
          <div className="extracted-profile-header">
            <div>
              <h2>AI Extracted Career Profile</h2>
              <p>Generated from {file?.name || 'your uploaded resume'}</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setStep(-1)}>
              <Upload size={14} /> Upload Another
            </button>
          </div>

          <div className="profile-grid">
            <div className="profile-main">
              <div className="card profile-section">
                <h3 className="profile-section-title"><User size={16} /> About</h3>
                <p className="profile-about">{profile?.about || 'Experienced developer with strong analytical and problem-solving skills.'}</p>
              </div>

              <div className="card profile-section">
                <h3 className="profile-section-title"><Code size={16} /> Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map(s => (
                    <span key={s} className="badge badge-skill">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume History Section */}
      {resumeHistory.length > 0 && (
        <div className="resume-history-section">
          <h3 className="history-section-title">Resume History</h3>

          <div className="history-list">
            {resumeHistory.map(item => (
              <div key={item.id} className="history-card">
                <div className="pdf-icon-box">
                  <FileText size={22} />
                </div>
                <div className="history-info">
                  <div className="history-filename">{item.name}</div>
                  <div className="history-date">{item.date}</div>
                </div>

                <div className="history-actions">
                  <span className="badge-analyzed">{item.status}</span>
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
