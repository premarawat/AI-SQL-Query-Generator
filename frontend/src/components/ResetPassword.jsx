import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Database, Lock, Loader2, CheckCircle, XCircle } from 'lucide-react';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location.state?.email) {
      navigate('/forgot-password');
    } else {
      setEmail(location.state.email);
    }
  }, [location, navigate]);

  // Validation rules
  const rules = [
    { id: 'length', text: 'Minimum 8 characters', check: (pw) => pw.length >= 8 },
    { id: 'upper', text: 'Uppercase letter', check: (pw) => /[A-Z]/.test(pw) },
    { id: 'lower', text: 'Lowercase letter', check: (pw) => /[a-z]/.test(pw) },
    { id: 'number', text: 'Number', check: (pw) => /[0-9]/.test(pw) },
    { id: 'special', text: 'Special character (@$!%*?&)', check: (pw) => /[@$!%*?&]/.test(pw) },
  ];

  const allRulesPassed = rules.every(rule => rule.check(newPassword));
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  
  const canSubmit = allRulesPassed && passwordsMatch && !loading;

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    setError('');
    setLoading(true);

    try {
      await axios.post(
  `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
  {
    email,
    newPassword,
  }
);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '3rem 2rem', textAlign: 'center', animation: 'scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
          <CheckCircle size={64} style={{ color: '#10b981', margin: '0 auto', marginBottom: '1.5rem', animation: 'bounce 1s infinite alternate' }} />
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Success!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Password changed successfully.</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1rem' }}>Redirecting to login...</p>
        </div>
        <style>{`
          @keyframes scaleIn {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes bounce {
            from { transform: translateY(0); }
            to { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Database size={48} className="sidebar-logo" style={{ margin: '0 auto', marginBottom: '1rem' }} />
          <h2 className="gradient-text">Reset Password</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Create a strong new password
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', color: 'var(--danger-color)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleResetSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
            
            {/* Live Validation Rules */}
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
              {rules.map(rule => {
                const passed = rule.check(newPassword);
                return (
                  <div key={rule.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: passed ? '#10b981' : 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    {passed ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    <span>{rule.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(0,0,0,0.2)', border: `1px solid ${confirmPassword ? (passwordsMatch ? '#10b981' : 'var(--danger-color)') : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
            {confirmPassword && !passwordsMatch && (
              <p style={{ color: 'var(--danger-color)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Passwords do not match</p>
            )}
          </div>

          <button 
            type="submit" 
            className="action-button"
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: canSubmit ? 'var(--accent-blue)' : 'var(--bg-secondary)', color: canSubmit ? 'white' : 'var(--text-secondary)', border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed', fontWeight: '500', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
            disabled={!canSubmit}
          >
            {loading ? <Loader2 size={18} className="spin" /> : 'Reset Password'}
          </button>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link to="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
