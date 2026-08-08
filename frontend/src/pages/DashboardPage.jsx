import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, TrendingUp, Briefcase, Send, Users,
  ArrowRight, ChevronRight, Target, Bookmark, Bot, Edit3, Shield, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const firstName = user?.name?.split(' ')[0] || 'Hitesh';

  useEffect(() => {
    const load = async () => {
      try {
        const statsData = await api.getStats();
        setStats(statsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
            Explore 24 matching jobs <ArrowRight size={14} />
          </button>
        </div>

        <div className="ai-insight-robot-wrap">
          <div className="robot-circle">
            <Bot size={54} className="robot-icon" />
            <div className="floating-badge badge-1"><Sparkles size={10} /></div>
            <div className="floating-badge badge-2">MERN</div>
            <div className="floating-badge badge-3">92%</div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="stats-row">
        {/* Card 1 */}
        <div className="stat-card" onClick={() => navigate('/resume')}>
          <div className="stat-card-top">
            <div className="stat-label">Resume Match</div>
            <div className="stat-badge-icon badge-orange">
              <Bookmark size={16} />
            </div>
          </div>
          <div className="stat-number">87%</div>
          <div className="stat-subtitle-text green">Strong Match</div>
          <div className="stat-trend green">
            <TrendingUp size={12} /> 12% this week
          </div>
        </div>

        {/* Card 2 */}
        <div className="stat-card" onClick={() => navigate('/jobs')}>
          <div className="stat-card-top">
            <div className="stat-label">Recommended Jobs</div>
            <div className="stat-badge-icon badge-green">
              <Edit3 size={16} />
            </div>
          </div>
          <div className="stat-number">24</div>
          <div className="stat-subtitle-text text-muted">New matches</div>
          <div className="stat-trend green">
            <TrendingUp size={12} /> 8 new today
          </div>
        </div>

        {/* Card 3 */}
        <div className="stat-card" onClick={() => navigate('/applications')}>
          <div className="stat-card-top">
            <div className="stat-label">Applications</div>
            <div className="stat-badge-icon badge-purple">
              <Shield size={16} />
            </div>
          </div>
          <div className="stat-number">8</div>
          <div className="stat-subtitle-text text-muted">Total applied</div>
          <div className="stat-trend green">
            <TrendingUp size={12} /> 2 this week
          </div>
        </div>

        {/* Card 4 */}
        <div className="stat-card" onClick={() => navigate('/applications')}>
          <div className="stat-card-top">
            <div className="stat-label">Interviews</div>
            <div className="stat-badge-icon badge-purple-light">
              <Calendar size={16} />
            </div>
          </div>
          <div className="stat-number">3</div>
          <div className="stat-subtitle-text text-muted">Upcoming</div>
          <div className="stat-trend green">
            <TrendingUp size={12} /> 1 this week
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
            {/* Job Item 1 */}
            <div className="job-item-row" onClick={() => navigate('/jobs')}>
              <div className="job-logo-box bg-red">
                <span>A</span>
                <div className="job-logo-match orange">87%</div>
              </div>
              <div className="job-info">
                <h4 className="job-title">MERN Stack Developer</h4>
                <div className="job-company">ABC Technologies</div>
                <div className="job-meta">Ahmedabad • Full-time</div>
                <div className="job-skills">
                  <span>React</span>
                  <span>Node.js</span>
                  <span>MongoDB</span>
                  <span>Express</span>
                </div>
              </div>
              <div className="job-match-right">
                <span className="match-score-big">92%</span>
                <Target size={16} className="target-icon" />
              </div>
            </div>

            {/* Job Item 2 */}
            <div className="job-item-row" onClick={() => navigate('/jobs')}>
              <div className="job-logo-box bg-blue">
                <span>M</span>
                <div className="job-logo-match green">82%</div>
              </div>
              <div className="job-info">
                <h4 className="job-title">Full Stack Developer</h4>
                <div className="job-company">TechNova Solutions</div>
                <div className="job-meta">Remote • Full-time</div>
                <div className="job-skills">
                  <span>React</span>
                  <span>Node.js</span>
                  <span>MongoDB</span>
                  <span>AWS</span>
                </div>
              </div>
              <div className="job-match-right">
                <span className="match-score-big">87%</span>
                <Target size={16} className="target-icon" />
              </div>
            </div>

            {/* Job Item 3 */}
            <div className="job-item-row" onClick={() => navigate('/jobs')}>
              <div className="job-logo-box bg-yellow">
                <span>P</span>
                <div className="job-logo-match green">82%</div>
              </div>
              <div className="job-info">
                <h4 className="job-title">React Developer</h4>
                <div className="job-company">PentaCraft Studios</div>
                <div className="job-meta">Ahmedabad • Full-time</div>
                <div className="job-skills">
                  <span>React</span>
                  <span>JavaScript</span>
                  <span>Tailwind CSS</span>
                </div>
              </div>
              <div className="job-match-right">
                <span className="match-score-big">82%</span>
                <Target size={16} className="target-icon" />
              </div>
            </div>
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
                  <span className="donut-big-num">8</span>
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
                <div className="legend-row"><span className="dot red" /> Saved <span className="val">3</span></div>
                <div className="legend-row"><span className="dot blue" /> Applied <span className="val">3</span></div>
                <div className="legend-row"><span className="dot green" /> Interview <span className="val">1</span></div>
                <div className="legend-row"><span className="dot yellow" /> Offer <span className="val">0</span></div>
                <div className="legend-row"><span className="dot dark-red" /> Rejected <span className="val">1</span></div>
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
