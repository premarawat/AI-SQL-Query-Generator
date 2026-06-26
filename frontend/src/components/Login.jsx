import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Database, Lock, Mail, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockedInfo, setLockedInfo] = useState(null);
  const [remainingTime, setRemainingTime] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    let timer;
    if (lockedInfo?.lockedUntil) {
      const updateTimer = () => {
        const unlockDate = new Date(lockedInfo.lockedUntil);
        const now = new Date();
        const diff = unlockDate - now;

        if (diff <= 0) {
          setLockedInfo(null);
          setRemainingTime('');
          setError('Lock expired. You can now try logging in again.');
          return;
        }

        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setRemainingTime(`${hours} hours ${minutes} minutes ${seconds} seconds`);
      };

      updateTimer();
      timer = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(timer);
  }, [lockedInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:4000/api/auth/login', { email, password, role });
      
      // If unlocked just now on success, show a nice toast (optional, we use alert for simplicity here or let it pass)
      if (response.data.unlockedStatus) {
        alert("Welcome back! Your account has been unlocked.");
      }

      login(response.data.user, response.data.accessToken, response.data.refreshToken);
      
      const userRole = response.data.user.role;
      if (userRole === 'admin') navigate('/admin');
      else if (userRole === 'database_manager') navigate('/db-manager');
      else navigate('/');
      
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.locked) {
        setLockedInfo(err.response.data);
        setError('');
      } else if (err.response?.status === 401 && err.response?.data?.locked) {
        // Just locked on 5th attempt
        setLockedInfo({ locked: true, lockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() });
        setError('');
      } else if (err.response?.status === 401 && err.response?.data?.warning) {
        // 4th attempt warning
        setError(err.response.data.message);
      } else {
        setError(err.response?.data?.message || 'Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Database size={48} className="sidebar-logo" style={{ margin: '0 auto', marginBottom: '1rem' }} />
          <h2 className="gradient-text">Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sign in to continue to AI SQL Assistant</p>
        </div>

        {error && <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', color: 'var(--danger-color)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}

        {lockedInfo ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>Account Locked</h3>
            <p style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Your account has been temporarily locked because of 5 consecutive failed login attempts.<br/><br/>
              For your security, login has been disabled for 24 hours.
            </p>
            <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
              <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>You can log in again after:</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                {new Date(lockedInfo.lockedUntil).toLocaleString()}
              </strong>
              
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--panel-border)' }}>
                <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Remaining Time:</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--accent-blue)' }}>{remainingTime}</strong>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              If you believe this is a mistake, please contact the administrator.
            </p>
            <button 
              className="glass-button" 
              style={{ width: '100%', marginTop: '1.5rem' }} 
              onClick={() => { setLockedInfo(null); setError(''); }}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Email Address</label>
              <div className="chat-input-wrapper" style={{ minHeight: 'auto', padding: '0.5rem 1rem' }}>
                <Mail size={18} style={{ color: 'var(--text-secondary)' }} />
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', width: '100%', paddingLeft: '0.75rem' }} 
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Password</label>
                <Link to="/forgot-password" style={{ color: 'var(--accent-blue)', fontSize: '0.85rem', textDecoration: 'none' }}>Forgot Password?</Link>
              </div>
              <div className="chat-input-wrapper" style={{ minHeight: 'auto', padding: '0.5rem 1rem' }}>
                <Lock size={18} style={{ color: 'var(--text-secondary)' }} />
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', width: '100%', paddingLeft: '0.75rem' }} 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Login As</label>
              <div className="chat-input-wrapper" style={{ minHeight: 'auto', padding: '0.5rem 1rem' }}>
                <User size={18} style={{ color: 'var(--text-secondary)' }} />
                <select 
                  value={role} 
                  onChange={e => setRole(e.target.value)}
                  style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', width: '100%', paddingLeft: '0.75rem' }}
                >
                  <option value="user" style={{ color: '#000' }}>User</option>
                  <option value="database_manager" style={{ color: '#000' }}>Database Manager</option>
                  <option value="admin" style={{ color: '#000' }}>Admin</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
