import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Lock, Bell, Moon, Shield, Save, Camera, Check } from 'lucide-react';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user } = useAuth();
  const addToast = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({
    name: user?.name || 'Hitesh Sharma',
    email: user?.email || 'hitesh@gmail.com',
    phone: '+91 98765 43210',
    location: 'Ahmedabad, Gujarat'
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: ''
  });

  const [notifs, setNotifs] = useState({
    jobMatches: true,
    applicationUpdates: true,
    weeklyDigest: false,
    emailAlerts: true
  });

  const [theme, setTheme] = useState('light');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Moon },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  const initials = form.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'HS';

  const handleSaveProfile = (e) => {
    e.preventDefault();
    addToast('Settings saved successfully!', 'success');
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (passwords.newPass && passwords.newPass !== passwords.confirmPass) {
      addToast('New passwords do not match', 'error');
      return;
    }
    addToast('Password updated successfully!', 'success');
    setPasswords({ current: '', newPass: '', confirmPass: '' });
  };

  return (
    <div className="settings-page-wrapper animate-fade-in">
      {/* Header */}
      <div className="settings-header-box">
        <h1 className="settings-main-title">Settings</h1>
        <p className="settings-sub-title">Manage your account preferences and profile settings</p>
      </div>

      {/* Horizontal Nav Tabs (Matching Reference UI) */}
      <div className="settings-nav-tabs">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`settings-nav-btn ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Main Tab Panels */}
      <div className="settings-panel-container">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="settings-panel card animate-fade-in">
            {/* Profile Picture Box */}
            <div className="profile-picture-section">
              <h3 className="section-title-sm">Profile Picture</h3>
              <div className="picture-row">
                <div className="avatar-preview-box">
                  <span>{initials}</span>
                </div>
                <div className="picture-actions">
                  <button className="change-photo-btn" onClick={() => addToast('Photo uploaded!', 'success')}>
                    <Camera size={14} /> Change Photo
                  </button>
                  <p className="photo-help-text">JPG, PNG up to 2MB</p>
                </div>
              </div>
            </div>

            <div className="settings-divider" />

            {/* Profile Form */}
            <form onSubmit={handleSaveProfile} className="settings-form-grid">
              <div className="form-field-group">
                <label className="field-label">Full Name</label>
                <input
                  type="text"
                  className="field-input"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-field-group">
                <label className="field-label">Email</label>
                <input
                  type="email"
                  className="field-input"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="form-field-group">
                <label className="field-label">Phone</label>
                <input
                  type="text"
                  className="field-input"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="form-field-group">
                <label className="field-label">Location</label>
                <input
                  type="text"
                  className="field-input"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                />
              </div>

              <div className="form-submit-row">
                <button type="submit" className="save-changes-btn">
                  <Save size={15} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="settings-panel card animate-fade-in">
            <h3 className="section-title-sm mb-4">Change Password</h3>
            <form onSubmit={handleSavePassword} className="settings-form-grid max-w-lg">
              <div className="form-field-group">
                <label className="field-label">Current Password</label>
                <input
                  type="password"
                  className="field-input"
                  placeholder="••••••••••••"
                  value={passwords.current}
                  onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                />
              </div>

              <div className="form-field-group">
                <label className="field-label">New Password</label>
                <input
                  type="password"
                  className="field-input"
                  placeholder="••••••••••••"
                  value={passwords.newPass}
                  onChange={e => setPasswords({ ...passwords, newPass: e.target.value })}
                />
              </div>

              <div className="form-field-group">
                <label className="field-label">Confirm New Password</label>
                <input
                  type="password"
                  className="field-input"
                  placeholder="••••••••••••"
                  value={passwords.confirmPass}
                  onChange={e => setPasswords({ ...passwords, confirmPass: e.target.value })}
                />
              </div>

              <div className="form-submit-row">
                <button type="submit" className="save-changes-btn">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="settings-panel card animate-fade-in">
            <h3 className="section-title-sm mb-4">Email Notifications</h3>
            <div className="toggles-list">
              {[
                { key: 'jobMatches', title: 'Job Match Alerts', desc: 'Receive instant notifications when new jobs match your profile' },
                { key: 'applicationUpdates', title: 'Application Updates', desc: 'Get updates when status changes in your applications pipeline' },
                { key: 'weeklyDigest', title: 'Weekly Career Digest', desc: 'A weekly summary of your profile performance and top matches' },
                { key: 'emailAlerts', title: 'Email Newsletters', desc: 'Career tips, resume improvement insights and platform updates' },
              ].map(n => (
                <div key={n.key} className="toggle-row">
                  <div>
                    <div className="toggle-title">{n.title}</div>
                    <div className="toggle-desc">{n.desc}</div>
                  </div>
                  <button
                    type="button"
                    className={`custom-switch ${notifs[n.key] ? 'on' : ''}`}
                    onClick={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                  >
                    <span className="switch-knob" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="settings-panel card animate-fade-in">
            <h3 className="section-title-sm mb-4">Theme Selection</h3>
            <div className="theme-options-grid">
              <div className={`theme-card ${theme === 'light' ? 'selected' : ''}`} onClick={() => setTheme('light')}>
                <div className="theme-preview light-prev">
                  <div className="prev-bar" />
                  <div className="prev-box" />
                </div>
                <div className="theme-label">
                  <span>Light Mode</span>
                  {theme === 'light' && <Check size={14} className="check-blue" />}
                </div>
              </div>

              <div className={`theme-card ${theme === 'dark' ? 'selected' : ''}`} onClick={() => setTheme('dark')}>
                <div className="theme-preview dark-prev">
                  <div className="prev-bar" />
                  <div className="prev-box" />
                </div>
                <div className="theme-label">
                  <span>Dark Mode</span>
                  {theme === 'dark' && <Check size={14} className="check-blue" />}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="settings-panel card animate-fade-in">
            <h3 className="section-title-sm mb-4">Data & Privacy</h3>
            <div className="privacy-actions-list">
              <div className="privacy-row">
                <div>
                  <div className="privacy-title">Export Profile Data</div>
                  <div className="privacy-desc">Download a copy of your career profile, applications, and resume data.</div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => addToast('Exporting data...', 'success')}>
                  Download Data
                </button>
              </div>

              <div className="privacy-row danger">
                <div>
                  <div className="privacy-title">Delete Account</div>
                  <div className="privacy-desc">Permanently remove your account and all associated data.</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => addToast('Account deletion requested', 'info')}>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
