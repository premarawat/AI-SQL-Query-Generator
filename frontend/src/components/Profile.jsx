import React, { useState, useEffect } from 'react';
import { User, Settings, Lock, Activity, Save, RefreshCw, BarChart2, ShieldAlert, CheckCircle, AlertTriangle, LogOut } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [activityData, setActivityData] = useState([]);

  // Forms
  const [formData, setFormData] = useState({
    full_name: '',
    profile_image: '',
    preferred_database: '',
    preferred_model: '',
    theme: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [updateStatus, setUpdateStatus] = useState(null);
  const [pwdStatus, setPwdStatus] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, statsRes, activityRes] = await Promise.all([
        api.get('/profile'),
        api.get('/profile/statistics'),
        api.get('/profile/activity')
      ]);

      setProfileData(profileRes.data);
      setFormData({
        full_name: profileRes.data.full_name || '',
        profile_image: profileRes.data.profile_image || '',
        preferred_database: profileRes.data.preferred_database || 'PostgreSQL',
        preferred_model: profileRes.data.preferred_model || 'gpt-4o-mini',
        theme: profileRes.data.theme || 'dark'
      });
      
      setStatsData(statsRes.data);
      setActivityData(activityRes.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdateStatus({ loading: true });
    try {
      await api.put('/profile', formData);
      setUpdateStatus({ type: 'success', message: 'Profile updated successfully!' });
      // update global theme if changed
      document.documentElement.setAttribute('data-theme', formData.theme);
      fetchProfileData(); // refresh
    } catch (err) {
      setUpdateStatus({ type: 'error', message: 'Failed to update profile.' });
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPwdStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPwdStatus({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    setPwdStatus({ loading: true });
    try {
      await api.put('/profile/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPwdStatus({ type: 'success', message: 'Password updated successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update password' });
    }
  };

  const handleLogoutAll = () => {
    // Basic logout logic for now, could be expanded to clear all tokens in DB
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      navigate('/login');
    }
  };

  if (loading || !profileData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        <RefreshCw className="spin" style={{ marginRight: '0.5rem' }} /> Loading profile...
      </div>
    );
  }

  // Calculate avatar
  const avatarText = profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : '?';

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', height: '100%', overflowY: 'auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <User className="sidebar-logo" /> User Profile
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Personal Information */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--accent-blue)' }}>
            <User size={18} /> Personal Information
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-gradient)',
              display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', fontWeight: 600, color: 'white'
            }}>
              {profileData.profile_image ? <img src={profileData.profile_image} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} /> : avatarText}
            </div>
            <div>
              <h2 style={{ margin: 0 }}>{profileData.full_name}</h2>
              <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0' }}>{profileData.email}</p>
              <span className="badge select">{profileData.role.toUpperCase()}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Account Status:</span>
              <span style={{ color: 'var(--success-color)', fontWeight: 500 }}>{profileData.account_status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Joined:</span>
              <span>{new Date(profileData.created_at).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Last Login:</span>
              <span>{profileData.last_login ? new Date(profileData.last_login).toLocaleString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--accent-blue)' }}>
            <BarChart2 size={18} /> Account Statistics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{statsData?.totalQueries || 0}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Queries</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success-color)' }}>{statsData?.successfulExecutions || 0}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Successful Executions</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--info-color)' }}>{statsData?.savedQueries || 0}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Saved Queries</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--warning-color)' }}>{statsData?.averageResponseTime || 'N/A'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg AI Response</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Settings Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--accent-blue)' }}>
            <Settings size={18} /> Profile Settings
          </h3>
          <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Profile Image URL (Optional)</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.profile_image}
                onChange={e => setFormData({...formData, profile_image: e.target.value})}
                placeholder="https://..."
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Theme</label>
                <select 
                  className="form-control"
                  value={formData.theme}
                  onChange={e => setFormData({...formData, theme: e.target.value})}
                >
                  <option value="dark">Dark Theme</option>
                  <option value="light">Light Theme</option>
                </select>
              </div>
              <div className="form-group">
                <label>Default DB</label>
                <select 
                  className="form-control"
                  value={formData.preferred_database}
                  onChange={e => setFormData({...formData, preferred_database: e.target.value})}
                >
                  <option value="PostgreSQL">PostgreSQL</option>
                  <option value="MySQL">MySQL</option>
                  <option value="SQL Server">SQL Server</option>
                  <option value="MongoDB">MongoDB</option>
                </select>
              </div>
            </div>
            
            {updateStatus && (
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', 
                background: updateStatus.type === 'error' ? 'var(--danger-bg)' : 'var(--success-bg)',
                color: updateStatus.type === 'error' ? 'var(--danger-color)' : 'var(--success-color)'
              }}>
                {updateStatus.message}
              </div>
            )}
            
            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }} disabled={updateStatus?.loading}>
              <Save size={16} /> Save Settings
            </button>
          </form>
        </div>


      </div>

      {/* Recent Activity */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--accent-blue)' }}>
          <Activity size={18} /> Recent Activity
        </h3>
        
        {activityData.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No recent activity found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Prompt</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>SQL Query</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {activityData.map(act => (
                  <tr key={act.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>{new Date(act.created_at).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {act.prompt}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '3px', fontSize: '0.8rem' }}>
                        {act.generated_sql.substring(0, 50)}{act.generated_sql.length > 50 ? '...' : ''}
                      </code>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {act.status === 'success' 
                        ? <span style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={14} /> Success</span>
                        : <span style={{ color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={14} /> Failed</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Profile;
