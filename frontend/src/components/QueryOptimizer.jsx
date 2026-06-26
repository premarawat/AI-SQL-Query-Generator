import React from 'react';
import { Zap, ThumbsUp, AlertCircle, FileSearch, Code, ArrowRight } from 'lucide-react';

const QueryOptimizer = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Zap className="sidebar-logo" /> Query Optimizer
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code size={18} /> Analyze Target SQL
            </h3>
            <textarea 
              className="chat-input-wrapper"
              style={{ width: '100%', height: '150px', background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', padding: '1rem', resize: 'vertical' }}
              placeholder="Paste SQL query here to analyze..."
              defaultValue="SELECT * FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at > '2023-01-01' GROUP BY u.id;"
            ></textarea>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileSearch size={16} /> Analyze Query
              </button>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Optimization Suggestions</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', borderRadius: '4px' }}>
                <strong>Avoid SELECT *</strong>: Specify columns explicitly to reduce memory overhead and improve performance.
              </li>
              <li style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #f59e0b', borderRadius: '4px' }}>
                <strong>Index Suggestion</strong>: Adding an index on `users(created_at)` could speed up the WHERE clause filter by ~45%.
              </li>
              <li style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6', borderRadius: '4px' }}>
                <strong>GROUP BY Optimization</strong>: Ensure `u.id` is the primary key to avoid unnecessary sorting operations.
              </li>
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Performance Score</h4>
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '8px solid var(--warning-color)' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning-color)' }}>68</span>
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Moderate optimization needed</p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Execution Cost</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>CPU Cost:</span>
              <span>124.5</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>I/O Cost:</span>
              <span>890.2</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--panel-border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              <strong>Total Cost:</strong>
              <strong style={{ color: 'var(--danger-color)' }}>1014.7</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryOptimizer;
