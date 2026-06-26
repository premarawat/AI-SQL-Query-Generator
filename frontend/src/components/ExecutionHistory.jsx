import React from 'react';
import { Activity, Download, Filter, CheckCircle, XCircle } from 'lucide-react';

const ExecutionHistory = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Activity className="sidebar-logo" /> Execution History
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="glass-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} /> Filter
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>
      
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Timestamp</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Operation</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>SQL Snippet</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Duration</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Rows Affected</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
              <td style={{ padding: '1rem' }}><CheckCircle size={18} color="var(--success-color)" /></td>
              <td style={{ padding: '1rem', fontSize: '0.9rem' }}>2026-06-25 14:32:10</td>
              <td style={{ padding: '1rem' }}><span style={{ padding: '0.25rem 0.5rem', background: 'var(--accent-bg)', color: 'var(--accent-blue)', borderRadius: '4px', fontSize: '0.8rem' }}>SELECT</span></td>
              <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>SELECT id, name FROM users...</td>
              <td style={{ padding: '1rem', fontSize: '0.9rem' }}>45ms</td>
              <td style={{ padding: '1rem', fontSize: '0.9rem' }}>1,250</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
              <td style={{ padding: '1rem' }}><CheckCircle size={18} color="var(--success-color)" /></td>
              <td style={{ padding: '1rem', fontSize: '0.9rem' }}>2026-06-25 14:15:02</td>
              <td style={{ padding: '1rem' }}><span style={{ padding: '0.25rem 0.5rem', background: 'var(--warning-bg)', color: 'var(--warning-color)', borderRadius: '4px', fontSize: '0.8rem' }}>UPDATE</span></td>
              <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>UPDATE settings SET status...</td>
              <td style={{ padding: '1rem', fontSize: '0.9rem' }}>112ms</td>
              <td style={{ padding: '1rem', fontSize: '0.9rem' }}>1</td>
            </tr>
            <tr>
              <td style={{ padding: '1rem' }}><XCircle size={18} color="var(--danger-color)" /></td>
              <td style={{ padding: '1rem', fontSize: '0.9rem' }}>2026-06-25 13:45:22</td>
              <td style={{ padding: '1rem' }}><span style={{ padding: '0.25rem 0.5rem', background: 'var(--danger-bg)', color: 'var(--danger-color)', borderRadius: '4px', fontSize: '0.8rem' }}>DELETE</span></td>
              <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--danger-color)' }}>DELETE FROM logs WHERE...</td>
              <td style={{ padding: '1rem', fontSize: '0.9rem' }}>--</td>
              <td style={{ padding: '1rem', fontSize: '0.9rem' }}>Failed</td>
            </tr>
          </tbody>
        </table>
        
        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center', borderTop: '1px solid var(--panel-border)' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="glass-button" disabled>Prev</button>
            <button className="glass-button" style={{ background: 'var(--accent-blue)', color: 'white' }}>1</button>
            <button className="glass-button">2</button>
            <button className="glass-button">3</button>
            <button className="glass-button">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionHistory;
