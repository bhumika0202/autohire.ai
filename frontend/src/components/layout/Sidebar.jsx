import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Briefcase, Send,
  MessageSquare, User, Settings, LogOut, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const mainNav = [
  { icon: LayoutDashboard, label: 'Overview', to: '/dashboard' },
  { icon: FileText, label: 'My Resume', to: '/resume' },
  { icon: Briefcase, label: 'Job Matches', to: '/jobs' },
  { icon: Send, label: 'Applications', to: '/applications' },
  { icon: MessageSquare, label: 'Cover Letter', to: '/cover-letter' },
];

const accountNav = [
  { icon: User, label: 'Career Profile', to: '/profile' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

export default function Sidebar({ mobile, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'HS';

  return (
    <aside className={`sidebar ${mobile ? 'sidebar-mobile' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 19H22L12 2Z" fill="white" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            <circle cx="12" cy="13" r="3" fill="#2563EB" />
          </svg>
        </div>
        <span className="sidebar-logo-name">Autohire.ai</span>
      </div>

      {/* Main navigation */}
      <nav className="sidebar-nav">
        {mainNav.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={mobile ? onClose : undefined}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="sidebar-divider" />

        {accountNav.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={mobile ? onClose : undefined}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User profile footer */}
      <div className="sidebar-user" onClick={() => navigate('/profile')}>
        <div className="sidebar-avatar">{initials}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name || 'Hitesh Sharma'}</div>
          <div className="sidebar-user-email">{user?.email || 'hitesh@gmail.com'}</div>
        </div>
        <ChevronRight size={16} className="sidebar-user-arrow" />
      </div>
    </aside>
  );
}
