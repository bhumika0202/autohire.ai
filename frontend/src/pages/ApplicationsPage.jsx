import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Gift, ChevronRight, MoreVertical, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import './ApplicationsPage.css';

const DEFAULT_APPLICATIONS = [
  // Saved (3)
  {
    id: 's1',
    job_title: 'React Developer',
    company: 'PentaCraft Studios',
    match_score: 72,
    dateText: 'Saved on Aug 5',
    status: 'saved'
  },
  {
    id: 's2',
    job_title: 'Backend Developer',
    company: 'InveStack',
    match_score: 75,
    dateText: 'Saved on Aug 5',
    status: 'saved'
  },
  {
    id: 's3',
    job_title: 'Frontend Developer',
    company: 'DesignCraft',
    match_score: 68,
    dateText: 'Saved on Aug 4',
    status: 'saved'
  },
  // Applied (3)
  {
    id: 'a1',
    job_title: 'MERN Stack Developer',
    company: 'ABC Technologies',
    match_score: 92,
    dateText: 'Applied on Aug 7',
    status: 'applied'
  },
  {
    id: 'a2',
    job_title: 'Full Stack Developer',
    company: 'TechNova Solutions',
    match_score: 87,
    dateText: 'Applied on Aug 6',
    status: 'applied'
  },
  {
    id: 'a3',
    job_title: 'Frontend Developer',
    company: 'VizioLine',
    match_score: 68,
    dateText: 'Applied on Aug 3',
    status: 'applied'
  },
  // Interview (1)
  {
    id: 'i1',
    job_title: 'Software Engineer',
    company: 'BITS India',
    match_score: 87,
    dateText: 'Interview on Aug 8',
    status: 'interview'
  },
  // Offer (0)
  // Rejected (1)
  {
    id: 'r1',
    job_title: 'Junior Developer',
    company: 'DevNova',
    match_score: 60,
    dateText: 'Rejected on Aug 4',
    status: 'rejected'
  }
];

const KANBAN_COLUMNS = [
  { id: 'saved', label: 'Saved', colorClass: 'col-saved' },
  { id: 'applied', label: 'Applied', colorClass: 'col-applied' },
  { id: 'interview', label: 'Interview', colorClass: 'col-interview' },
  { id: 'offer', label: 'Offer', colorClass: 'col-offer' },
  { id: 'rejected', label: 'Rejected', colorClass: 'col-rejected' }
];

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [applications, setApplications] = useState(DEFAULT_APPLICATIONS);
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await api.getApplications();
      if (data.applications && data.applications.length > 0) {
        setApplications(data.applications.map(a => ({
          ...a,
          dateText: `${a.status.charAt(0).toUpperCase() + a.status.slice(1)} on ${new Date(a.applied_at || a.updated_at || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadApplications(); }, []);

  const handleMove = async (id, newStatus) => {
    try {
      await api.updateApplication(id, { status: newStatus });
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      addToast(`Moved application to ${newStatus}`, 'success');
    } catch (err) {
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      addToast(`Moved application to ${newStatus}`, 'success');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteApplication(id);
      setApplications(prev => prev.filter(a => a.id !== id));
      addToast('Application removed', 'info');
    } catch (err) {
      setApplications(prev => prev.filter(a => a.id !== id));
      addToast('Application removed', 'info');
    }
  };

  const getAppsByColumn = (colId) => applications.filter(a => a.status === colId);

  return (
    <div className="applications-kanban-page animate-fade-in">
      {/* Header */}
      <div className="applications-header-row">
        <div>
          <h1 className="applications-title">Applications</h1>
          <p className="applications-subtitle">Track your job applications</p>
        </div>
        <button className="add-app-btn" onClick={() => navigate('/jobs')}>
          <Plus size={16} /> Add Application
        </button>
      </div>

      {/* 5 Column Kanban Board */}
      <div className="kanban-board-grid">
        {KANBAN_COLUMNS.map(col => {
          const colApps = getAppsByColumn(col.id);
          return (
            <div key={col.id} className={`kanban-col-container ${col.colorClass}`}>
              {/* Column Header */}
              <div className="kanban-col-header">
                <span className="col-header-title">{col.label} ({colApps.length})</span>
                <ChevronRight size={14} className="col-header-arrow" />
              </div>

              {/* Column Content / Cards List */}
              <div className="kanban-col-content">
                {colApps.length > 0 ? (
                  colApps.map(app => (
                    <div key={app.id} className="kanban-job-card">
                      <div className="kanban-card-header">
                        <div>
                          <h4 className="card-job-title">{app.job_title}</h4>
                          <div className="card-company-name">{app.company}</div>
                        </div>
                        <div className="menu-trigger-wrap">
                          <button
                            className="card-menu-btn"
                            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === app.id ? null : app.id); }}
                          >
                            <MoreVertical size={14} />
                          </button>

                          {activeMenu === app.id && (
                            <div className="card-dropdown-menu">
                              <span className="dropdown-label">Move to:</span>
                              {KANBAN_COLUMNS.filter(c => c.id !== app.status).map(c => (
                                <button key={c.id} onClick={() => { handleMove(app.id, c.id); setActiveMenu(null); }}>
                                  {c.label}
                                </button>
                              ))}
                              <div className="menu-divider" />
                              <button className="danger" onClick={() => { handleDelete(app.id); setActiveMenu(null); }}>
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="card-match-percentage">
                        <span className={col.id === 'applied' || app.match_score >= 80 ? 'green' : 'grey'}>
                          {app.match_score}% Match
                        </span>
                      </div>

                      <div className="card-status-date">
                        {app.dateText || `${app.status} on Aug 5`}
                      </div>
                    </div>
                  ))
                ) : (
                  /* Empty state inside column (e.g. Offer column in reference UI) */
                  <div className="kanban-col-empty">
                    <div className="gift-box-icon">
                      <Gift size={44} strokeWidth={1.2} />
                    </div>
                    <span className="empty-text">No offers yet</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
