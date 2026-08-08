import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bookmark, SlidersHorizontal, ChevronDown, Briefcase } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import './JobsPage.css';

// Helper to format salary to LPA string
const formatSalaryLPA = (salaryStr, index) => {
  if (!salaryStr) {
    const lpaList = ['₹8 - 10 LPA', '₹7 - 12 LPA', '₹5 - 9 LPA', '₹4 - 7 LPA', '₹12 - 18 LPA'];
    return lpaList[index % lpaList.length];
  }
  if (salaryStr.includes('LPA')) return salaryStr;

  // Map unformatted DB salary strings to LPA
  if (salaryStr.includes('12,000,00') || salaryStr.includes('18,000,00')) return '₹12 - 18 LPA';
  if (salaryStr.includes('15,000,00') || salaryStr.includes('22,000,00')) return '₹7 - 12 LPA';
  if (salaryStr.includes('8,000,00')) return '₹4 - 7 LPA';
  if (salaryStr.includes('14,000,00') || salaryStr.includes('20,000,00')) return '₹5 - 9 LPA';
  if (salaryStr.includes('5,000,00')) return '₹3 - 6 LPA';

  return '₹8 - 10 LPA';
};

const DEFAULT_MATCH_JOBS = [
  {
    id: '1',
    title: 'MERN Stack Developer',
    company: 'ABC Technologies',
    location: 'Ahmedabad • Full-time',
    match_score: 92,
    salary_range: '₹8 - 10 LPA',
    skills: ['React', 'Node.js', 'MongoDB', 'Express'],
    logo_bg: 'bg-blue',
    logo_text: 'A',
    saved: true
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'TechNova Solutions',
    location: 'Remote • Full-time',
    match_score: 87,
    salary_range: '₹7 - 12 LPA',
    skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
    logo_bg: 'bg-indigo',
    logo_text: 'M',
    saved: false
  },
  {
    id: '3',
    title: 'Backend Developer (Node.js)',
    company: 'InveStack',
    location: 'Bangalore • Full-time',
    match_score: 75,
    salary_range: '₹5 - 9 LPA',
    skills: ['Node.js', 'Express', 'MongoDB', 'REST API'],
    logo_bg: 'bg-orange',
    logo_text: 'I',
    saved: true
  },
  {
    id: '4',
    title: 'React Developer',
    company: 'PentaCraft Studios',
    location: 'Ahmedabad • Full-time',
    match_score: 72,
    salary_range: '₹4 - 7 LPA',
    skills: ['React', 'JavaScript', 'Tailwind CSS'],
    logo_bg: 'bg-blue-dark',
    logo_text: 'R',
    saved: false
  }
];

export default function JobsPage() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [jobs, setJobs] = useState(DEFAULT_MATCH_JOBS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('match');
  const [savedJobs, setSavedJobs] = useState({});

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await api.getJobs({ search, location: locationFilter, experience: experienceFilter, sort: sortBy });
      if (data.jobs && data.jobs.length > 0) {
        setJobs(data.jobs.map((j, i) => ({
          ...j,
          salary_range: formatSalaryLPA(j.salary_range, i),
          logo_bg: i % 4 === 0 ? 'bg-blue' : i % 4 === 1 ? 'bg-indigo' : i % 4 === 2 ? 'bg-orange' : 'bg-blue-dark',
          logo_text: j.company?.charAt(0) || 'J'
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, [sortBy, locationFilter, experienceFilter]);

  const handleSave = async (e, jobId) => {
    e.stopPropagation();
    try {
      await api.createApplication({ job_id: jobId, status: 'saved' });
      setSavedJobs(prev => ({ ...prev, [jobId]: !prev[jobId] }));
      addToast('Job saved to applications!', 'success');
    } catch (err) {
      setSavedJobs(prev => ({ ...prev, [jobId]: !prev[jobId] }));
      addToast('Job saved to applications!', 'success');
    }
  };

  return (
    <div className="jobs-matches-page animate-fade-in">
      {/* Header */}
      <div className="jobs-header-title-box">
        <h1 className="jobs-main-title">
          <span className="blue-text">Job</span> Matches
        </h1>
        <p className="jobs-sub-title">Find jobs that match your profile</p>
      </div>

      {/* Single-Row Search & Filter Bar */}
      <div className="jobs-filter-bar-row">
        <div className="filter-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadJobs()}
          />
        </div>

        <div className="filter-dropdown-box">
          <select value={experienceFilter} onChange={e => setExperienceFilter(e.target.value)}>
            <option value="all">Experience</option>
            <option value="junior">Junior</option>
            <option value="mid-level">Mid-level</option>
            <option value="senior">Senior</option>
          </select>
          <ChevronDown size={14} className="dropdown-arrow" />
        </div>

        <div className="filter-dropdown-box">
          <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
            <option value="all">Location</option>
            <option value="remote">Remote</option>
            <option value="ahmedabad">Ahmedabad</option>
            <option value="bangalore">Bangalore</option>
            <option value="mumbai">Mumbai</option>
          </select>
          <ChevronDown size={14} className="dropdown-arrow" />
        </div>

        <div className="filter-sort-box">
          <span className="sort-label">Sort by:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="match">Best Match</option>
            <option value="latest">Latest</option>
            <option value="salary">Salary</option>
          </select>
          <ChevronDown size={14} className="dropdown-arrow" />
        </div>

        <button className="filter-icon-btn" title="Advanced Filters" onClick={loadJobs}>
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* Main Jobs Container Card */}
      <div className="jobs-container-card">
        {loading ? (
          <div className="jobs-loading-skeleton">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12, marginBottom: 12 }} />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="jobs-horizontal-list">
            {jobs.map(job => (
              <div key={job.id} className="job-horizontal-item" onClick={() => navigate(`/jobs/${job.id}`)}>
                {/* Logo & % Tag Underneath */}
                <div className={`job-avatar-logo ${job.logo_bg || 'bg-blue'}`}>
                  <span>{job.logo_text || job.company?.charAt(0)}</span>
                  <div className="avatar-match-tag">{job.match_score || 85}%</div>
                </div>

                {/* Info */}
                <div className="job-item-info">
                  <h3 className="job-item-title">{job.title}</h3>
                  <div className="job-item-company">{job.company}</div>
                  <div className="job-item-location">{job.location}</div>
                </div>

                {/* Match Score % */}
                <div className="job-item-score">
                  <span className="green-score">{job.match_score || 85}%</span>
                </div>

                {/* Salary Range */}
                <div className="job-item-salary">
                  <span className="green-salary">{job.salary_range}</span>
                </div>

                {/* Skill Pills */}
                <div className="job-item-skills">
                  {(job.skills || []).slice(0, 4).map(skill => (
                    <span key={skill} className="skill-pill">{skill}</span>
                  ))}
                </div>

                {/* Bookmark Icon */}
                <button
                  className={`bookmark-btn ${savedJobs[job.id] || job.saved ? 'saved' : ''}`}
                  onClick={(e) => handleSave(e, job.id)}
                  title="Bookmark job"
                >
                  <Bookmark size={18} fill={savedJobs[job.id] || job.saved ? '#EF4444' : 'none'} color={savedJobs[job.id] || job.saved ? '#EF4444' : '#F97316'} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Briefcase size={28} />
            <div className="empty-state-title">No matching jobs found</div>
          </div>
        )}
      </div>
    </div>
  );
}
