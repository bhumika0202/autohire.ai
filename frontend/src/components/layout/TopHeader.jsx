import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, MessageSquare, Menu, User, Settings, LogOut, Check, X, Sparkles, Send, Bot, ExternalLink, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './TopHeader.css';

const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    title: 'New High Match Job Found!',
    desc: 'Senior MERN Stack Developer at TechCorp Solutions matches 92% of your profile.',
    time: '10m ago',
    read: false,
    link: '/jobs'
  },
  {
    id: '2',
    title: 'Interview Scheduled',
    desc: 'Your interview for Software Engineer at BITS India is scheduled.',
    time: '1h ago',
    read: false,
    link: '/applications'
  },
  {
    id: '3',
    title: 'Resume Analyzed Successfully',
    desc: 'AI extracted 10 skills and updated your career profile.',
    time: '1d ago',
    read: true,
    link: '/profile'
  }
];

const QUICK_SEARCH_SUGGESTIONS = [
  { label: 'MERN Stack Developer', category: 'Role' },
  { label: 'React.js', category: 'Skill' },
  { label: 'Node.js', category: 'Skill' },
  { label: 'TechNova Solutions', category: 'Company' },
  { label: 'Ahmedabad', category: 'Location' }
];

export default function TopHeader({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const addToast = useToast();

  const [search, setSearch] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'ai', text: 'Hello Hitesh! 👋 How can I help with your job search today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'HS';

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchDropdown(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifMenu(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(search.trim())}`);
      setShowSearchDropdown(false);
    }
  };

  const handleSuggestionClick = (label) => {
    setSearch(label);
    navigate(`/jobs?search=${encodeURIComponent(label)}`);
    setShowSearchDropdown(false);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('Marked all notifications as read', 'info');
  };

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'info');
    navigate('/login');
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    const query = chatInput.toLowerCase();
    setChatInput('');

    // Instant AI Response logic
    setTimeout(() => {
      let aiText = 'Based on your career profile, focusing on MERN stack projects with React and Node.js will significantly increase your match rate for top tech roles!';
      if (query.includes('resume')) {
        aiText = 'Your uploaded resume has a strong 92% match for Full Stack roles! Make sure to highlight your PPMS procurement system project.';
      } else if (query.includes('salary') || query.includes('pay')) {
        aiText = 'For MERN Stack Developers in India with 1-3 years experience, typical salary ranges are between ₹6 LPA to ₹12 LPA.';
      } else if (query.includes('interview')) {
        aiText = 'For your upcoming interview, review React hooks (useEffect, useMemo), Node.js Event Loop, REST API design, and MongoDB indexing.';
      }

      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiText }]);
    }, 600);
  };

  return (
    <>
      <header className="top-header">
        <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={20} />
        </button>

        <div className="top-header-right">
          {/* Functional Search Bar */}
          <div className="top-header-search-wrap" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="top-header-search">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search jobs, skills, companies..."
                value={search}
                onChange={e => { setSearch(e.target.value); setShowSearchDropdown(true); }}
                onFocus={() => setShowSearchDropdown(true)}
              />
              {search && (
                <button type="button" className="clear-search-btn" onClick={() => setSearch('')}>
                  <X size={12} />
                </button>
              )}
            </form>

            {/* Quick Search Suggestions Popup */}
            {showSearchDropdown && (
              <div className="search-suggestions-dropdown animate-fade-in">
                <div className="dropdown-section-title">Quick Search</div>
                {QUICK_SEARCH_SUGGESTIONS.map((item, i) => (
                  <div key={i} className="suggestion-item" onClick={() => handleSuggestionClick(item.label)}>
                    <Search size={13} className="sug-icon" />
                    <span className="sug-label">{item.label}</span>
                    <span className="sug-cat">{item.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell Dropdown */}
          <div className="top-header-dropdown-wrap" ref={notifRef}>
            <button
              className={`top-header-icon-btn ${showNotifMenu ? 'active' : ''}`}
              title="Notifications"
              onClick={() => { setShowNotifMenu(!showNotifMenu); setShowUserMenu(false); }}
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>

            {showNotifMenu && (
              <div className="notif-dropdown-menu animate-fade-in">
                <div className="notif-dropdown-header">
                  <div className="notif-title-row">
                    <h3>Notifications</h3>
                    {unreadCount > 0 && <span className="unread-chip">{unreadCount} new</span>}
                  </div>
                  {unreadCount > 0 && (
                    <button className="mark-read-btn" onClick={handleMarkAllRead}>
                      <Check size={12} /> Mark read
                    </button>
                  )}
                </div>

                <div className="notif-list-container">
                  {notifications.map(item => (
                    <div
                      key={item.id}
                      className={`notif-item-card ${!item.read ? 'unread' : ''}`}
                      onClick={() => {
                        setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
                        navigate(item.link);
                        setShowNotifMenu(false);
                      }}
                    >
                      <div className="notif-item-title">{item.title}</div>
                      <div className="notif-item-desc">{item.desc}</div>
                      <div className="notif-item-time">{item.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Career Assistant Chat Button */}
          <button
            className={`top-header-icon-btn ${showAiChat ? 'active' : ''}`}
            title="AI Career Assistant"
            onClick={() => setShowAiChat(!showAiChat)}
          >
            <MessageSquare size={18} />
          </button>

          {/* User Profile Avatar Dropdown Menu */}
          <div className="top-header-dropdown-wrap" ref={userRef}>
            <div
              className="top-header-avatar"
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifMenu(false); }}
              title="User Account"
            >
              {initials}
            </div>

            {showUserMenu && (
              <div className="user-dropdown-menu animate-fade-in">
                <div className="user-info-header">
                  <div className="user-avatar-circle">{initials}</div>
                  <div className="user-details-box">
                    <div className="user-display-name">{user?.name || 'Hitesh Sharma'}</div>
                    <div className="user-email-text">{user?.email || 'hitesh@gmail.com'}</div>
                  </div>
                </div>

                <div className="dropdown-divider" />

                <button className="user-menu-item" onClick={() => { navigate('/profile'); setShowUserMenu(false); }}>
                  <User size={15} /> <span>Career Profile</span>
                </button>

                <button className="user-menu-item" onClick={() => { navigate('/settings'); setShowUserMenu(false); }}>
                  <Settings size={15} /> <span>Settings</span>
                </button>

                <div className="dropdown-divider" />

                <button className="user-menu-item danger" onClick={handleLogout}>
                  <LogOut size={15} /> <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* AI Career Assistant Slide-Out Drawer Modal */}
      {showAiChat && (
        <div className="ai-chat-drawer-overlay animate-fade-in" onClick={() => setShowAiChat(false)}>
          <div className="ai-chat-drawer-container" onClick={e => e.stopPropagation()}>
            <div className="ai-chat-drawer-header">
              <div className="ai-title-wrap">
                <Bot size={20} className="ai-bot-icon" />
                <div>
                  <h3>AI Career Assistant</h3>
                  <p>Ask anything about jobs, resume or salary</p>
                </div>
              </div>
              <button className="close-drawer-btn" onClick={() => setShowAiChat(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="ai-chat-messages-box">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`chat-bubble-row ${msg.sender}`}>
                  <div className="chat-bubble">{msg.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChatMessage} className="ai-chat-input-bar">
              <input
                type="text"
                placeholder="Ask AI Career Assistant..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
              />
              <button type="submit" className="send-chat-btn">
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
