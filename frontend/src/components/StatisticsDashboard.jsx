import React, { useState, useEffect } from 'react';
import { BarChart3, Database, Activity, Clock } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const StatisticsDashboard = () => {
  const [stats, setStats] = useState({ queries_run: 0, queries_saved: 0, schema_views: 0, last_login: null });
  const [loading, setLoading] = useState(true);

  const [queryTypesData, setQueryTypesData] = useState([]);

  useEffect(() => {
    const fetchStatsAndHistory = async () => {
      try {
        const { default: api } = await import('../api/axios');
        const [statsRes, historyRes] = await Promise.all([
          api.get('/profile/statistics'),
          api.get('/queries/history')
        ]);
        setStats(statsRes.data);

        // Calculate distribution
        const history = historyRes.data || [];
        const typeCount = {};
        history.forEach(item => {
          let sql = (item.generated_sql || '').trim().toUpperCase();
          let type = 'OTHER';
          if (sql.startsWith('SELECT')) type = 'SELECT';
          else if (sql.startsWith('UPDATE')) type = 'UPDATE';
          else if (sql.startsWith('INSERT')) type = 'INSERT';
          else if (sql.startsWith('DELETE')) type = 'DELETE';
          else if (sql.startsWith('CREATE')) type = 'CREATE';
          else if (sql.startsWith('ALTER')) type = 'ALTER';
          else if (sql.startsWith('DROP')) type = 'DROP';
          else type = 'SELECT'; // Fallback for very simple prompts if needed

          typeCount[type] = (typeCount[type] || 0) + 1;
        });

        const chartData = Object.keys(typeCount).map(key => ({
          name: key,
          value: typeCount[key]
        }));
        setQueryTypesData(chartData.length > 0 ? chartData : [{name: 'No Data', value: 1}]);
      } catch (err) {
        console.error('Failed to fetch statistics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatsAndHistory();
  }, []);

  const COLORS = ['#0ea5e9', '#eab308', '#22c55e', '#ef4444', '#8b5cf6', '#f97316'];

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%', height: '100%', overflowY: 'auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <BarChart3 className="sidebar-logo" /> Statistics Dashboard
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} /> Total Queries
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{stats.totalQueries || 0}</div>
        </div>
        
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircleIcon size={18} /> Queries Saved
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success-color)' }}>{stats.savedQueries || 0}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} /> Avg AI Response
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning-color)' }}>{stats.averageResponseTime || '0ms'}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', textAlign: 'center' }}>Query Types Distribution</h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={queryTypesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {queryTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component since CheckCircle wasn't imported properly from lucide-react above
const CheckCircleIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default StatisticsDashboard;
