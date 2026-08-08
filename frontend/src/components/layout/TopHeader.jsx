import { useState } from 'react';
import { Search, Bell, MessageSquare, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './TopHeader.css';

export default function TopHeader({ onMenuClick }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'HS';

  return (
    <header className="top-header">
      <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={20} />
      </button>

      <div className="top-header-right">
        {/* Search Input */}
        <div className="top-header-search">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search jobs, skills, companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Notifications & Chat */}
        <button className="top-header-icon-btn" title="Notifications">
          <Bell size={18} />
          <span className="notif-badge" />
        </button>

        <button className="top-header-icon-btn" title="Messages">
          <MessageSquare size={18} />
        </button>

        {/* User avatar */}
        <div className="top-header-avatar">{initials}</div>
      </div>
    </header>
  );
}
