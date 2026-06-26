import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, Activity } from 'lucide-react';

const DMProfile = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <User className="sidebar-logo" /> Profile Settings
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--accent-purple)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold', margin: '0 auto 1rem auto' }}>
              {user?.full_name?.charAt(0) || 'D'}
            </div>
            <h3 style={{ marginBottom: '0.25rem' }}>{user?.full_name || 'Database Manager'}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              <Shield size={14} /> {user?.role || 'database_manager'}
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Activity Summary</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Queries Generated:</span>
              <strong>1,245</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Queries Executed:</span>
              <strong>890</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} /> Personal Information
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Full Name</label>
              <div className="chat-input-wrapper" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} style={{ color: 'var(--text-secondary)' }} />
                <input type="text" defaultValue={user?.full_name} style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', width: '100%' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Email Address</label>
              <div className="chat-input-wrapper" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.1)' }}>
                <Mail size={16} style={{ color: 'var(--text-secondary)' }} />
                <input type="email" defaultValue={user?.email} readOnly style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', outline: 'none', width: '100%' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Account Created</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                <Calendar size={16} /> October 15, 2025
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button className="btn-primary">Update Profile</button>
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Security</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Update your password to keep your account secure.</p>
            <button className="glass-button">Change Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DMProfile;
