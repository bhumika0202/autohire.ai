import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './LoginPage.css';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const addToast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(form.email || 'hitesh@gmail.com', form.password || 'password123');
        addToast('Welcome back!', 'success');
      } else {
        if (form.password && form.password !== form.confirmPassword) {
          addToast('Passwords do not match', 'error');
          setLoading(false);
          return;
        }
        await register(form.name || 'Hitesh Sharma', form.email || 'hitesh@gmail.com', form.password || 'password123');
        addToast('Account created successfully!', 'success');
      }
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
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
                    placeholder="Hitesh Sharma"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              )}

              <div className="form-field">
                <label>Email address</label>
                <input
                  type="email"
                  placeholder="hitesh@gmail.com"
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

              <button type="submit" className="auth-submit-btn" disabled={loading}>
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
                    onClick={() => {
                      addToast('Google login simulated!', 'success');
                      login('hitesh@gmail.com', 'password123').then(() => navigate('/dashboard'));
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z"/>
                      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                    </svg>
                    <span>Continue with Google</span>
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
    </div>
  );
}
