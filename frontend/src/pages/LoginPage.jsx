import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader, User, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './LoginPage.css';

const MOCK_GOOGLE_ACCOUNTS = [
  {
    name: 'Hitesh Vaishnav',
    email: 'hiteshvaishnav602@gmail.com',
    initial: 'H',
    bg: '#2563EB'
  },
  {
    name: 'Hitesh Sharma',
    email: 'hitesh@gmail.com',
    initial: 'H',
    bg: '#16A34A'
  },
  {
    name: 'Bhumika',
    email: 'bhumika.autohire@gmail.com',
    initial: 'B',
    bg: '#9333EA'
  }
];

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google Account Picker State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const { login, register, googleLogin } = useAuth();
  const addToast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(form.email || 'hiteshvaishnav602@gmail.com', form.password || 'password123');
        addToast('Welcome back to Autohire.ai!', 'success');
      } else {
        if (form.password && form.password !== form.confirmPassword) {
          addToast('Passwords do not match', 'error');
          setLoading(false);
          return;
        }
        await register(form.name || 'Hitesh Vaishnav', form.email || 'hiteshvaishnav602@gmail.com', form.password || 'password123');
        addToast('Account created! Welcome email sent to your inbox.', 'success');
      }
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGoogleAccount = async (account) => {
    setGoogleLoading(true);
    setShowGoogleModal(false);
    try {
      const res = await googleLogin({
        email: account.email,
        name: account.name
      });
      addToast(`Logged in as ${account.email}! Welcome email sent.`, 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Google Login failed', 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      addToast('Please enter a valid Google email address', 'error');
      return;
    }

    const userName = customEmail.split('@')[0].replace('.', ' ').toUpperCase();
    await handleSelectGoogleAccount({
      email: customEmail,
      name: userName
    });
  };

  return (
    <div className="login-auth-page">
      <div className="login-auth-container">
        {/* Left Illustration Box */}
        <div className="login-illustration-box">
          <div className="auth-brand-logo">
            <div className="auth-brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 19H22L12 2Z" fill="white"/>
                <circle cx="12" cy="13" r="3" fill="#2563EB"/>
              </svg>
            </div>
            <span className="auth-brand-name">Autohire.ai</span>
          </div>

          <div className="illustration-center">
            <div className="vector-art">
              <div className="lock-circle">
                <Lock size={48} className="lock-icon" />
              </div>
              <div className="floating-card c-1"><ShieldCheck size={18} /> <span>Security Verified</span></div>
              <div className="floating-card c-2"><Mail size={18} /> <span>AI Powered</span></div>
            </div>
          </div>
        </div>

        {/* Right Form Box */}
        <div className="login-form-box">
          <div className="form-inner">
            <div className="auth-header">
              <h2>{mode === 'login' ? 'Welcome back!' : 'Create your account'}</h2>
              <p>{mode === 'login' ? 'Login to your account' : 'Join thousands of job seekers'}</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {mode === 'register' && (
                <div className="form-field">
                  <label>Full name</label>
                  <input
                    type="text"
                    placeholder="Hitesh Vaishnav"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              )}

              <div className="form-field">
                <label>Email address</label>
                <input
                  type="email"
                  placeholder="hiteshvaishnav602@gmail.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <label>Password</label>
                <div className="pass-wrap">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button type="button" className="pass-eye" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div className="form-field">
                  <label>Confirm password</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  />
                </div>
              )}

              {mode === 'login' ? (
                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>
                  <button type="button" className="forgot-link">Forgot password?</button>
                </div>
              ) : (
                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={e => setAgreeTerms(e.target.checked)}
                    />
                    <span>I agree to the <strong>Terms & Privacy Policy</strong></span>
                  </label>
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={loading || googleLoading}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
              </button>

              {mode === 'login' && (
                <>
                  <div className="or-divider">
                    <span>or continue with</span>
                  </div>

                  <button
                    type="button"
                    className="google-btn"
                    onClick={() => setShowGoogleModal(true)}
                    disabled={googleLoading || loading}
                  >
                    {googleLoading ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        <span>Signing in with Google...</span>
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 18 18">
                          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z"/>
                          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                          <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                        </svg>
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </form>

            <div className="auth-footer">
              {mode === 'login' ? (
                <p>Don't have an account? <button onClick={() => setMode('register')}>Sign up</button></p>
              ) : (
                <p>Already have an account? <button onClick={() => setMode('login')}>Login</button></p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Google Account Selector Dialog Modal */}
      {showGoogleModal && (
        <div className="google-modal-overlay animate-fade-in" onClick={() => setShowGoogleModal(false)}>
          <div className="google-modal-dialog" onClick={e => e.stopPropagation()}>
            <button className="google-modal-close" onClick={() => setShowGoogleModal(false)}>
              <X size={18} />
            </button>

            <div className="google-modal-header">
              <svg width="24" height="24" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              <h2>Choose an account</h2>
              <p>to continue to <strong>Autohire.ai</strong></p>
            </div>

            <div className="google-accounts-list">
              {MOCK_GOOGLE_ACCOUNTS.map((acc, index) => (
                <div
                  key={index}
                  className="google-account-row"
                  onClick={() => handleSelectGoogleAccount(acc)}
                >
                  <div className="account-avatar-box" style={{ background: acc.bg }}>
                    {acc.initial}
                  </div>
                  <div className="account-info-box">
                    <div className="account-name">{acc.name}</div>
                    <div className="account-email">{acc.email}</div>
                  </div>
                </div>
              ))}

              {showCustomInput ? (
                <form onSubmit={handleCustomGoogleSubmit} className="custom-google-form">
                  <input
                    type="email"
                    placeholder="Enter Google email ID..."
                    value={customEmail}
                    onChange={e => setCustomEmail(e.target.value)}
                    autoFocus
                    required
                  />
                  <button type="submit" className="custom-submit-btn">
                    Sign in
                  </button>
                </form>
              ) : (
                <div
                  className="google-account-row add-account"
                  onClick={() => setShowCustomInput(true)}
                >
                  <div className="account-avatar-box add-icon-bg">
                    <Plus size={18} />
                  </div>
                  <div className="account-info-box">
                    <div className="account-name font-bold">Use another account</div>
                    <div className="account-email">Sign in with a different Google email</div>
                  </div>
                </div>
              )}
            </div>

            <div className="google-modal-footer">
              <p>To continue, Google will share your name, email address, and profile picture with Autohire.ai.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
