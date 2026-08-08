import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, DollarSign, ArrowLeft, Check, Circle,
  Sparkles, Send, Bookmark, ChevronRight, Briefcase, ExternalLink
} from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import MatchScore from '../components/ui/MatchScore';
import './JobDetailPage.css';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getJob(id);
        setJob(data.job);
      } catch (err) {
        addToast('Failed to load job', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.createApplication({
        job_id: id,
        status: 'applied',
        job_title: job?.title,
        company: job?.company,
        location: job?.location,
        salary_range: job?.salary_range,
        skills: job?.skills,
        url: job?.url
      });
      addToast(`Application recorded for ${job?.company}! Redirecting to official application form...`, 'success');

      if (job?.url) {
        window.open(job.url, '_blank', 'noopener,noreferrer');
      }

      setTimeout(() => {
        navigate('/applications');
      }, 1200);
    } catch (err) {
      addToast(err.message || 'Failed to apply', 'error');
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.createApplication({ job_id: id, status: 'saved' });
      setSaved(true);
      addToast('Job saved!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to save', 'error');
    }
  };

  const handleCoverLetter = () => {
    navigate(`/cover-letter?job=${id}`);
  };

  if (loading) {
    return (
      <div className="job-detail-page">
        <div className="job-detail-loading">
          <div className="skeleton" style={{ height: 32, width: '60%', marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 32 }} />
          <div className="skeleton" style={{ height: 120 }} />
        </div>
      </div>
    );
  }

  if (!job) return null;

  const matchColor = job.match_score >= 80 ? 'var(--green)' : job.match_score >= 60 ? 'var(--brand-orange)' : 'var(--text-muted)';

  return (
    <div className="job-detail-page">
      {/* Back */}
      <button className="back-btn" onClick={() => navigate('/jobs')}>
        <ArrowLeft size={16} /> Back to Jobs
      </button>

      <div className="job-detail-layout">
        {/* LEFT: Job info */}
        <div className="job-detail-main animate-fade-in">
          {/* Job header */}
          <div className="card job-detail-header-card">
            <div className="job-detail-header-top">
              <div className="job-detail-avatar">{job.company?.charAt(0)}</div>
              <div className="job-detail-header-info">
                <div className="job-detail-company">{job.company}</div>
                <h1 className="job-detail-title">{job.title}</h1>
                <div className="job-detail-meta">
                  <span className="job-meta-item"><MapPin size={14} /> {job.location}</span>
                  <span className="job-meta-item"><Clock size={14} /> {job.employment_type}</span>
                  {job.salary_range && <span className="job-meta-item"><DollarSign size={14} /> {job.salary_range}</span>}
                </div>
              </div>
            </div>

            <div className="job-detail-skills">
              {(job.skills || []).map(skill => (
                <span
                  key={skill}
                  className={`badge ${(job.matching_skills || []).includes(skill) ? 'badge-green' : 'badge-skill'}`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="card job-section">
            <h2 className="job-section-title">About the Role</h2>
            <p className="job-desc-text">{job.description}</p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities?.length > 0 && (
            <div className="card job-section">
              <h2 className="job-section-title">Responsibilities</h2>
              <ul className="job-list">
                {job.responsibilities.map((r, i) => (
                  <li key={i} className="job-list-item">
                    <ChevronRight size={14} style={{ color: 'var(--brand-orange)', flexShrink: 0, marginTop: 3 }} />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements?.length > 0 && (
            <div className="card job-section">
              <h2 className="job-section-title">Requirements</h2>
              <ul className="job-list">
                {job.requirements.map((r, i) => (
                  <li key={i} className="job-list-item">
                    <Check size={14} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 3 }} />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT: AI Match */}
        <div className="job-detail-sidebar">
          <div className="ai-match-panel card animate-fade-in">
            {/* Header */}
            <div className="ai-match-header">
              <div className="ai-match-badge">
                <Sparkles size={12} /> AI MATCH ANALYSIS
              </div>
            </div>

            {/* Score */}
            <div className="ai-match-score-section">
              <MatchScore score={job.match_score || 0} size="lg" />
            </div>

            {/* Progress bar */}
            <div className="ai-match-bar">
              <div className="progress-bar" style={{ height: 8 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${job.match_score || 0}%`,
                    background: matchColor,
                    transition: 'width 1s ease'
                  }}
                />
              </div>
            </div>

            <div className="ai-match-divider" />

            {/* Matching skills */}
            {(job.matching_skills || []).length > 0 && (
              <div className="ai-match-section">
                <div className="ai-match-section-title">
                  <Check size={14} style={{ color: 'var(--green)' }} /> Why you match
                </div>
                <div className="ai-skill-list">
                  {(job.matching_skills || []).map(skill => (
                    <div key={skill} className="ai-skill-item ai-skill-match">
                      <Check size={13} /> {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing skills */}
            {(job.missing_skills || []).length > 0 && (
              <div className="ai-match-section">
                <div className="ai-match-section-title">
                  <Circle size={14} style={{ color: 'var(--text-muted)' }} /> Skill gaps
                </div>
                <div className="ai-skill-list">
                  {(job.missing_skills || []).map(skill => (
                    <div key={skill} className="ai-skill-item ai-skill-gap">
                      <Circle size={13} /> {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI explanation */}
            {job.ai_explanation && (
              <div className="ai-explanation">
                <div className="ai-explanation-label">AI Explanation</div>
                <p className="ai-explanation-text">"{job.ai_explanation}"</p>
              </div>
            )}

            {/* Recommendation */}
            <div className={`ai-recommendation ${job.match_score >= 75 ? 'recommended' : 'neutral'}`}>
              {job.match_score >= 75 ? (
                <><Check size={15} /> Strongly Recommended</>
              ) : job.match_score >= 60 ? (
                <><Circle size={15} /> Moderate Match</>
              ) : (
                <><Circle size={15} /> Consider Upskilling First</>
              )}
            </div>

            <div className="ai-match-divider" />

            {/* CTAs */}
            <div className="ai-match-ctas">
              <button
                className="btn btn-primary btn-lg w-full"
                onClick={handleApply}
                disabled={applying}
              >
                {applying ? 'Submitting...' : <><Send size={16} /> Apply Now</>}
              </button>

              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary w-full"
                  style={{ textDecoration: 'none', display: 'flex', fontStyle: 'normal', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '6px 0' }}
                >
                  <ExternalLink size={15} /> Apply on Company Site
                </a>
              )}

              <button
                className={`btn ${saved ? 'btn-secondary' : 'btn-ghost'} w-full`}
                onClick={handleSave}
                disabled={saved}
              >
                <Bookmark size={15} /> {saved ? 'Saved' : 'Save Job'}
              </button>
              <button className="btn btn-ai w-full" onClick={handleCoverLetter}>
                <Sparkles size={15} /> Generate Cover Letter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
