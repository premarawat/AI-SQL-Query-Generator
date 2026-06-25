import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Database, Lock, Mail, User } from 'lucide-react';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 8) {
      return setError('Password must be at least 8 characters long');
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { fullName, email, password });
      login(response.data.user, response.data.accessToken, response.data.refreshToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Database size={48} className="sidebar-logo" style={{ margin: '0 auto', marginBottom: '1rem' }} />
          <h2 className="gradient-text">Create an Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Join AI SQL Assistant today</p>
        </div>

        {error && <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', color: 'var(--danger-color)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Full Name</label>
            <div className="chat-input-wrapper" style={{ minHeight: 'auto', padding: '0.5rem 1rem' }}>
              <User size={18} style={{ color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                required 
                value={fullName} 
                onChange={e => setFullName(e.target.value)}
                style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', width: '100%', paddingLeft: '0.75rem' }} 
              />
            </div>
          </div>

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
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Password</label>
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
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Confirm Password</label>
            <div className="chat-input-wrapper" style={{ minHeight: 'auto', padding: '0.5rem 1rem' }}>
              <Lock size={18} style={{ color: 'var(--text-secondary)' }} />
              <input 
                type="password" 
                required 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
                style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', width: '100%', paddingLeft: '0.75rem' }} 
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
