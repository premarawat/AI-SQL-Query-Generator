import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Database, Key, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    if (!location.state?.email) {
      navigate('/forgot-password'); // Redirect back if no email
    } else {
      setEmail(location.state.email);
    }
  }, [location, navigate]);

  // Main 10-minute timer for OTP expiry
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Cooldown timer for Resend button (60 seconds)
  useEffect(() => {
    if (resendCooldown <= 0) {
      setResendDisabled(false);
      return;
    }
    
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (timeLeft <= 0) {
      setError('OTP expired. Please request another OTP.');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/login`, { email, otp });
      // Success, go to reset password
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
      if (err.response?.data?.message?.includes('expired') || err.response?.data?.message?.includes('Too many')) {
         setTimeLeft(0); // Force expiry state visually
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResendLoading(true);
    
    try {
      await axios.post(
    `${import.meta.env.VITE_API_URL}/api/auth/verify-otp`,
    { email, otp }
);
      // Reset timers
      setTimeLeft(600);
      setResendCooldown(60);
      setResendDisabled(true);
      setOtp(''); // clear input
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Database size={48} className="sidebar-logo" style={{ margin: '0 auto', marginBottom: '1rem' }} />
          <h2 className="gradient-text">Verify OTP</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            We sent a 6-digit code to your email
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', color: 'var(--danger-color)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleVerifySubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Email (Read Only)</label>
            <input 
              type="email" 
              value={email}
              readOnly
              style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', outline: 'none', cursor: 'not-allowed' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>6-Digit OTP</label>
              <span style={{ color: timeLeft <= 60 ? 'var(--danger-color)' : 'var(--accent-blue)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <Key size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none', fontSize: '1.1rem', letterSpacing: '4px', textAlign: 'center' }}
                placeholder="000000"
                required
                disabled={loading || timeLeft <= 0}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="action-button"
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--accent-blue)', color: 'white', border: 'none', cursor: (loading || timeLeft <= 0) ? 'not-allowed' : 'pointer', fontWeight: '500', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: (loading || timeLeft <= 0) ? 0.7 : 1 }}
            disabled={loading || timeLeft <= 0}
          >
            {loading ? <Loader2 size={18} className="spin" /> : 'Verify OTP'}
          </button>
          
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <button 
              type="button"
              onClick={handleResend}
              disabled={resendDisabled || resendLoading}
              style={{ background: 'none', border: 'none', color: (resendDisabled || resendLoading) ? 'var(--text-secondary)' : 'var(--accent-blue)', cursor: (resendDisabled || resendLoading) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: 0 }}
            >
              <RefreshCw size={14} className={resendLoading ? 'spin' : ''} />
              {resendDisabled ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
            </button>
            <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
