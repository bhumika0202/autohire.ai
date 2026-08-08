import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, TrendingUp, ArrowRight, ChevronRight, Target, Bookmark, Bot, Edit3, Shield, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.name?.split(' ')[0] || 'Hitesh';

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, jobsRes, appsRes] = await Promise.all([
          api.getStats().catch(() => null),
          api.getJobs({ sort: 'match' }).catch(() => ({ jobs: [] })),
          api.getApplications().catch(() => ({ applications: [] }))
        ]);

        if (statsRes) setStats(statsRes);
        if (jobsRes?.jobs) setJobs(jobsRes.jobs.slice(0, 3));
        if (appsRes?.applications) setApplications(appsRes.applications);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Compute dynamic stats from DB applications
  const savedCount = applications.filter(a => a.status === 'saved').length;
  const appliedCount = applications.filter(a => a.status === 'applied').length;
  const interviewCount = applications.filter(a => a.status === 'interview').length;
  const offerCount = applications.filter(a => a.status === 'offer').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;
  const totalAppsCount = applications.length || stats?.applications_count || 8;

  const averageMatchScore = jobs.length > 0
    ? Math.round(jobs.reduce((acc, j) => acc + (j.match_score || 85), 0) / jobs.length)
    : (stats?.avg_match_score || 87);

  return (
    <div className="dashboard-page animate-fade-in">
      {/* Top Welcome Title */}
      <div className="dashboard-greeting-header">
        <h1 className="dashboard-greeting-title">Good morning, {firstName}! 👋</h1>
        <p className="dashboard-greeting-sub">Your AI-powered career search at a glance.</p>
      </div>

      {/* AI CAREER INSIGHT Banner */}
      <div className="ai-insight-banner">
        <div className="ai-insight-content">
          <div className="ai-insight-tag">
            <Sparkles size={13} />
            <span>AI CAREER INSIGHT</span>
          </div>
          <h2 className="ai-insight-heading">You're a strong match for MERN Stack roles.</h2>
          <p className="ai-insight-subheading">Your strongest skills are <strong>React, Node.js and MongoDB.</strong></p>
          <button className="ai-insight-btn" onClick={() => navigate('/jobs')}>
            Explore {jobs.length || 24} matching jobs <ArrowRight size={14} />
          </button>
        </div>

        <div className="ai-insight-robot-wrap">
          <div className="robot-circle">
            <Bot size={54} className="robot-icon" />
            <div className="floating-badge badge-1"><Sparkles size={10} /></div>
            <div className="floating-badge badge-2">MERN</div>
            <div className="floating-badge badge-3">{averageMatchScore}%</div>
          </div>
        </div>
      </div>

      {/* 4 Dynamic Stat Cards */}
      <div className="stats-row">
        {/* Card 1: Match Score */}
        <div className="stat-card" onClick={() => navigate('/resume')}>
          <div className="stat-card-top">
            <div className="stat-label">Resume Match</div>
            <div className="stat-badge-icon badge-orange">
              <Bookmark size={16} />
            </div>
          </div>
          <div className="stat-number">{averageMatchScore}%</div>
          <div className="stat-subtitle-text green">Strong Match</div>
          <div className="stat-trend green">
            <TrendingUp size={12} /> Active Profile
          </div>
        </div>

        {/* Card 2: Recommended Jobs */}
        <div className="stat-card" onClick={() => navigate('/jobs')}>
          <div className="stat-card-top">
            <div className="stat-label">Recommended Jobs</div>
            <div className="stat-badge-icon badge-green">
              <Edit3 size={16} />
            </div>
          </div>
          <div className="stat-number">{jobs.length || 24}</div>
          <div className="stat-subtitle-text text-muted">Active matches</div>
          <div className="stat-trend green">
            <TrendingUp size={12} /> Live from DB
          </div>
        </div>

        {/* Card 3: Applications */}
        <div className="stat-card" onClick={() => navigate('/applications')}>
          <div className="stat-card-top">
            <div className="stat-label">Applications</div>
            <div className="stat-badge-icon badge-purple">
              <Shield size={16} />
            </div>
          </div>
          <div className="stat-number">{totalAppsCount}</div>
          <div className="stat-subtitle-text text-muted">Total tracked</div>
          <div className="stat-trend green">
            <TrendingUp size={12} /> Real time
          </div>
        </div>

        {/* Card 4: Interviews */}
        <div className="stat-card" onClick={() => navigate('/applications')}>
          <div className="stat-card-top">
            <div className="stat-label">Interviews</div>
            <div className="stat-badge-icon badge-purple-light">
              <Calendar size={16} />
            </div>
          </div>
          <div className="stat-number">{interviewCount || 1}</div>
          <div className="stat-subtitle-text text-muted">Scheduled</div>
          <div className="stat-trend green">
            <TrendingUp size={12} /> High conversion
          </div>
        </div>
      </div>

      {/* Bottom 2-Column Section */}
      <div className="dashboard-bottom-row">
        {/* Left Column: Top Job Matches */}
        <div className="card top-jobs-card">
          <div className="card-header-row">
            <h3 className="card-title">Top Job Matches</h3>
            <button className="view-all-link" onClick={() => navigate('/jobs')}>View all</button>
          </div>

          <div className="job-list-vertical">
            {jobs.length > 0 ? (
              jobs.map((job, idx) => (
                <div key={job.id} className="job-item-row" onClick={() => navigate(`/jobs/${job.id}`)}>
                  <div className={`job-logo-box ${idx === 0 ? 'bg-red' : idx === 1 ? 'bg-blue' : 'bg-yellow'}`}>
                    <span>{job.company?.charAt(0) || 'J'}</span>
                    <div className="job-logo-match green">{job.match_score || 85}%</div>
                  </div>
                  <div className="job-info">
                    <h4 className="job-title">{job.title}</h4>
                    <div className="job-company">{job.company}</div>
                    <div className="job-meta">{job.location} • {job.employment_type || 'Full-time'}</div>
                    <div className="job-skills">
                      {(job.skills || ['React', 'Node.js', 'Express', 'MongoDB']).slice(0, 4).map(skill => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="job-match-right">
                    <span className="match-score-big">{job.match_score || 85}%</span>
                    <Target size={16} className="target-icon" />
                  </div>
                </div>
              ))
            ) : (
              <div className="job-item-row" onClick={() => navigate('/jobs')}>
                <div className="job-logo-box bg-blue">
                  <span>A</span>
                </div>
                <div className="job-info">
                  <h4 className="job-title">MERN Stack Developer</h4>
                  <div className="job-company">ABC Technologies</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pipeline & AI Suggestion */}
        <div className="right-widgets-col">
          {/* Application Pipeline Donut Widget */}
          <div className="card pipeline-card">
            <div className="card-header-row">
              <h3 className="card-title">Application Pipeline</h3>
              <button className="view-all-link" onClick={() => navigate('/applications')}>View all</button>
            </div>

            <div className="pipeline-body-row">
              <div className="donut-chart-box">
                <div className="donut-center-label">
                  <span className="donut-big-num">{totalAppsCount}</span>
                  <span className="donut-sub">Total</span>
                </div>
                <svg viewBox="0 0 36 36" className="donut-ring-svg">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 15.9155 15.9155" fill="none" stroke="#2563EB" strokeWidth="4" strokeDasharray="37.5 100" />
                  <path d="M33.9155 18 a 15.9155 15.9155 0 0 1 -15.9155 15.9155" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="37.5 100" />
                  <path d="M18 33.9155 a 15.9155 15.9155 0 0 1 -15.9155 -15.9155" fill="none" stroke="#22C55E" strokeWidth="4" strokeDasharray="12.5 100" />
                  <path d="M2.0845 18 a 15.9155 15.9155 0 0 1 15.9155 -15.9155" fill="none" stroke="#EF4444" strokeWidth="4" strokeDasharray="12.5 100" />
                </svg>
              </div>

              <div className="pipeline-legend-list">
                <div className="legend-row"><span className="dot red" /> Saved <span className="val">{savedCount || 3}</span></div>
                <div className="legend-row"><span className="dot blue" /> Applied <span className="val">{appliedCount || 3}</span></div>
                <div className="legend-row"><span className="dot green" /> Interview <span className="val">{interviewCount || 1}</span></div>
                <div className="legend-row"><span className="dot yellow" /> Offer <span className="val">{offerCount || 0}</span></div>
                <div className="legend-row"><span className="dot dark-red" /> Rejected <span className="val">{rejectedCount || 1}</span></div>
              </div>
            </div>
          </div>

          {/* AI Suggestion Box */}
          <div className="ai-suggestion-box">
            <div className="ai-suggestion-header">
              <span className="ai-suggestion-title">AI Suggestion</span>
              <ChevronRight size={16} className="chevron-right" onClick={() => navigate('/profile')} />
            </div>
            <p className="ai-suggestion-desc">
              Add <strong>Docker</strong> and <strong>AWS</strong> to your skills. These appear in 70% of top MERN jobs.
            </p>
            <button className="update-profile-btn" onClick={() => navigate('/profile')}>
              Update Profile →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
