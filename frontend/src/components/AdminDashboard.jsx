import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Activity, AlertTriangle, Cpu, TrendingUp, LockOpen, Lock } from 'lucide-react';
import api from '../api/axios';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [lockedAccounts, setLockedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, lockedRes] = await Promise.all([
          api.get('/admin/statistics'),
          api.get('/admin/locked-accounts')
        ]);
        setStats(statsRes.data);
        setLockedAccounts(lockedRes.data);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleUnlock = async (userId) => {
    try {
      await api.post('/admin/unlock-account', { userId });
      // Remove from UI
      setLockedAccounts(prev => prev.filter(u => u.id !== userId));
      alert("Account unlocked successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to unlock account.");
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading Admin Dashboard...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', color: 'var(--text-primary)', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield className="sidebar-logo" /> Admin Dashboard
        </h2>
        <button onClick={logout} className="glass-button" style={{ color: 'var(--danger-color)' }}>
          Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* User Stats */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', marginBottom: '1rem' }}>
            <Users size={18} /> User Statistics
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Registered Users:</span> <strong>{stats?.users?.total || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Active Users:</span> <strong style={{ color: 'var(--success-color)' }}>{stats?.users?.active || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Blocked Users:</span> <strong style={{ color: 'var(--danger-color)' }}>{stats?.users?.blocked || 0}</strong>
            </div>
          </div>
        </div>

        {/* AI & Queries */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning-color)', marginBottom: '1rem' }}>
            <Cpu size={18} /> Platform Usage
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Queries Generated Today:</span> <strong>{stats?.queriesToday || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Avg AI Response Time:</span> <strong>{stats?.aiResponseTimeMs || 0}ms</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total DB Executions:</span> <strong>{stats?.executions?.total || 0}</strong>
            </div>
          </div>
        </div>

        {/* Execution Health */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-color)', marginBottom: '1rem' }}>
            <AlertTriangle size={18} /> System Health
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Failed Executions:</span> <strong>{stats?.executions?.failed || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Success Rate:</span> 
              <strong style={{ color: 'var(--success-color)' }}>
                {stats?.executions?.total > 0 ? Math.round(((stats.executions.total - stats.executions.failed) / stats.executions.total) * 100) : 100}%
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', marginBottom: '1.5rem' }}>
          <TrendingUp size={18} /> Most Active Users
        </h3>
        {stats?.topUsers?.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--panel-border)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>Name</th>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Queries Generated</th>
              </tr>
            </thead>
            <tbody>
              {stats.topUsers.map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem' }}>{u.full_name}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{u.query_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>No active users yet.</p>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-color)', marginBottom: '1.5rem' }}>
          <Lock size={18} /> Locked Accounts
        </h3>
        {lockedAccounts.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--panel-border)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>Name / Email</th>
                  <th style={{ padding: '0.75rem' }}>Failed Attempts</th>
                  <th style={{ padding: '0.75rem' }}>Lock Time</th>
                  <th style={{ padding: '0.75rem' }}>Unlock Time</th>
                  <th style={{ padding: '0.75rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {lockedAccounts.map((u, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 600 }}>{u.full_name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--danger-color)', fontWeight: 600 }}>{u.failed_attempts}</td>
                    <td style={{ padding: '0.75rem' }}>{new Date(u.last_failed_login).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem' }}>{new Date(u.locked_until).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <button 
                        onClick={() => handleUnlock(u.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--success-bg)', color: 'var(--success-color)', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        <LockOpen size={14} /> Unlock Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <Shield size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>No locked accounts currently.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
