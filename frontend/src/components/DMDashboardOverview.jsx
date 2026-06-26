import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Database, LayoutDashboard, Activity, FileJson, Clock, BookOpen, AlertOctagon } from 'lucide-react';
import api from '../api/axios';

const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ padding: '1rem', background: `var(--${color}-bg)`, color: `var(--${color}-color)`, borderRadius: '12px' }}>
      <Icon size={24} />
    </div>
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{title}</p>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</h3>
    </div>
  </div>
);

const DMDashboardOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dbmanager/statistics');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch DB Manager stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading Database Manager...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', height: '100%', overflowY: 'auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <LayoutDashboard className="sidebar-logo" /> Dashboard Overview
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome, Database Manager {user?.full_name?.split(' ')[0]}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard icon={Database} title="Total Tables" value={stats?.totalTables || 0} color="accent" />
        <StatCard icon={FileJson} title="Database Size" value={stats?.databaseSize || '0 bytes'} color="warning" />
        <StatCard icon={Activity} title="Active Connections" value={stats?.activeConnections || 0} color="success" />
        <StatCard icon={BookOpen} title="Tracked Queries" value={stats?.totalTrackedQueries || 0} color="accent" />
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Recent Database Executions</h3>
        {stats?.recentLogs?.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--panel-border)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>Time</th>
                  <th style={{ padding: '0.75rem' }}>User Email</th>
                  <th style={{ padding: '0.75rem' }}>SQL Executed</th>
                  <th style={{ padding: '0.75rem' }}>Duration (ms)</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLogs.map((log, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem' }}>{log.email}</td>
                    <td style={{ padding: '0.75rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>
                        {log.executed_sql}
                      </code>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{log.execution_time_ms}</td>
                    <td style={{ padding: '0.75rem', color: log.execution_status === 'success' ? 'var(--success-color)' : 'var(--danger-color)' }}>
                      {log.execution_status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>No queries executed yet.</p>
        )}
      </div>
    </div>
  );
};

export default DMDashboardOverview;
