import React from 'react';
import { ShieldAlert, AlertTriangle, Info, CheckCircle, Database } from 'lucide-react';

const ImpactAnalyzer = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <ShieldAlert className="sidebar-logo" /> Query Impact Analyzer
      </h2>
      
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: '#ef4444' }}>
          <AlertTriangle size={24} />
          <h3 style={{ margin: 0 }}>High Risk Operation Detected</h3>
        </div>
        <p style={{ color: 'var(--text-primary)', marginLeft: '2.25rem' }}>
          <strong>Warning:</strong> DELETE without WHERE clause. This operation will truncate the table and remove all records.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Est. Returned Rows</h4>
          <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</span>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Est. Rows Updated</h4>
          <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</span>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid var(--danger-color)' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Est. Rows Deleted</h4>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger-color)' }}>~12,450</span>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={18} /> Tables Affected
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Table Name</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Operation</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Impact</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '1rem 0.75rem', fontWeight: 500 }}>users</td>
              <td style={{ padding: '1rem 0.75rem' }}>
                <span style={{ padding: '0.25rem 0.5rem', background: 'var(--danger-bg)', color: 'var(--danger-color)', borderRadius: '4px', fontSize: '0.85rem' }}>DELETE</span>
              </td>
              <td style={{ padding: '1rem 0.75rem' }}>Full Table Scan</td>
            </tr>
            <tr style={{ borderTop: '1px solid var(--panel-border)' }}>
              <td style={{ padding: '1rem 0.75rem', fontWeight: 500 }}>orders</td>
              <td style={{ padding: '1rem 0.75rem' }}>
                <span style={{ padding: '0.25rem 0.5rem', background: 'var(--warning-bg)', color: 'var(--warning-color)', borderRadius: '4px', fontSize: '0.85rem' }}>CASCADE</span>
              </td>
              <td style={{ padding: '1rem 0.75rem' }}>Orphaned records removed</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ImpactAnalyzer;
