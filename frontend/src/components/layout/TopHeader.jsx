import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, MessageSquare, Menu, User, Settings, LogOut, Check, X, Sparkles, Send, Bot, ArrowRight, FileText, Briefcase, ChevronRight } from 'lucide-react';
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

const QUICK_AI_PROMPTS = [
  '🚀 How to increase match score to 95%?',
  '💰 MERN Developer salary trend in India?',
  '📝 Help optimize my resume summary',
  '🎯 React & Node.js interview prep'
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
    {
      id: 1,
      sender: 'ai',
      text: 'Hello Hitesh! 👋 I am your Autohire.ai Career Assistant. How can I accelerate your job search today?',
      action: { label: 'Explore 24 Job Matches →', link: '/jobs' }
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const chatMessagesEndRef = useRef(null);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'HS';

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

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

  const sendQueryToAi = (userText) => {
    if (!userText.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: userText };
    setChatMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const query = userText.toLowerCase();

    setTimeout(() => {
      let aiText = 'Based on your career profile, focusing on MERN stack projects with React, Node.js, and Express will significantly increase your match score for top engineering roles!';
      let action = { label: 'View Top Job Matches →', link: '/jobs' };

      if (query.includes('match') || query.includes('95%') || query.includes('score')) {
        aiText = 'To boost your AI Match Score to 95%+:\n1. Add Docker & AWS Deployment experience\n2. Highlight REST API optimization in your PPMS project\n3. Include TypeScript & Prisma ORM in your core skills.';
        action = { label: 'Update Career Profile →', link: '/profile' };
      } else if (query.includes('salary') || query.includes('pay') || query.includes('trend')) {
        aiText = 'MERN Stack Developer Salary Trends in India (2026):\n• Junior (0-2 yrs): ₹5 LPA - ₹9 LPA\n• Mid-Level (2-5 yrs): ₹8 LPA - ₹15 LPA\n• Senior (5+ yrs): ₹16 LPA - ₹28 LPA+';
        action = { label: 'Explore High Paying Jobs →', link: '/jobs' };
      } else if (query.includes('resume') || query.includes('summary')) {
        aiText = 'Your resume is analyzed! Here is a recommended 1-line professional summary:\n"Passionate MERN Stack Developer with experience building scalable React frontends and Node.js REST APIs with MongoDB & PostgreSQL."';
        action = { label: 'Go to My Resume →', link: '/resume' };
      } else if (query.includes('interview') || query.includes('prep')) {
        aiText = 'Key React & Node.js Interview Prep Topics:\n1. Event Loop & Async/Await in Node.js\n2. React Virtual DOM & Reconciliation\n3. MongoDB Indexing & Aggregation Pipelines\n4. JWT Authentication & Refresh Tokens';
        action = { label: 'Generate Cover Letter →', link: '/cover-letter' };
      }

      setIsTyping(false);
      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiText, action }]);
    }, 700);
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    sendQueryToAi(chatInput);
    setChatInput('');
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

      {/* Upgraded AI Career Assistant Slide-Out Drawer Modal */}
      {showAiChat && (
        <div className="ai-chat-drawer-overlay animate-fade-in" onClick={() => setShowAiChat(false)}>
          <div className="ai-chat-drawer-container" onClick={e => e.stopPropagation()}>
            {/* Header Banner */}
            <div className="ai-chat-drawer-header">
              <div className="ai-title-wrap">
                <div className="ai-bot-avatar">
                  <Bot size={22} />
                  <span className="online-dot" />
                </div>
                <div>
                  <h3>Autohire.ai Career Agent</h3>
                  <p>Deep AI Career Intelligence</p>
                </div>
              </div>
              <button className="close-drawer-btn" onClick={() => setShowAiChat(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Quick Prompts Bar */}
            <div className="quick-prompts-bar">
              <div className="quick-prompts-title"><Sparkles size={12} /> Suggested Questions</div>
              <div className="quick-prompts-scroll">
                {QUICK_AI_PROMPTS.map((promptText, idx) => (
                  <button key={idx} className="prompt-chip-btn" onClick={() => sendQueryToAi(promptText)}>
                    {promptText}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Box */}
            <div className="ai-chat-messages-box">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`chat-bubble-row ${msg.sender}`}>
                  <div className="chat-bubble">
                    <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>

                    {msg.action && (
                      <button
                        className="chat-action-btn"
                        onClick={() => {
                          navigate(msg.action.link);
                          setShowAiChat(false);
                        }}
                      >
                        {msg.action.label}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="chat-bubble-row ai">
                  <div className="chat-bubble typing">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}
              <div ref={chatMessagesEndRef} />
            </div>

            {/* Quick Navigation Shortcuts */}
            <div className="chat-shortcuts-row">
              <button onClick={() => { navigate('/resume'); setShowAiChat(false); }}>
                <FileText size={13} /> Resume
              </button>
              <button onClick={() => { navigate('/jobs'); setShowAiChat(false); }}>
                <Briefcase size={13} /> Jobs
              </button>
              <button onClick={() => { navigate('/cover-letter'); setShowAiChat(false); }}>
                <Sparkles size={13} /> Cover Letter
              </button>
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChatMessage} className="ai-chat-input-bar">
              <input
                type="text"
                placeholder="Ask AI Career Agent..."
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
