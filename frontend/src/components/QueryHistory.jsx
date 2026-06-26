import React, { useState, useEffect } from 'react';
import { History, Search, Play, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../api/axios';

const QueryHistory = ({ onReRun }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/queries/history');
        // Map backend keys to frontend expectations, formatting dates if needed
        const formatted = response.data.map(item => ({
          id: item.id,
          prompt: item.prompt,
          sql: item.generated_sql,
          timestamp: new Date(item.created_at).toLocaleString(),
          status: item.execution_status || 'success'
        }));
        setHistoryData(formatted);
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this query from history?')) {
      try {
        await api.delete(`/queries/history/${id}`);
        setHistoryData(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error('Failed to delete history item', err);
        alert('Failed to delete history item');
      }
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <History className="sidebar-logo" /> Query History
        </h2>
        
        <div className="chat-input-wrapper" style={{ padding: '0.25rem 1rem', width: '300px', minHeight: 'auto' }}>
          <Search size={16} style={{ color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search history..." 
            style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', padding: '0.5rem', width: '100%' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {historyData.map(item => (
          <div key={item.id} className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.25rem' }}>"{item.prompt}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>{item.timestamp}</span>
                  {item.status === 'success' 
                    ? <span style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={14} /> Executed Successfully</span>
                    : <span style={{ color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={14} /> Execution Failed</span>
                  }
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="glass-button" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  onClick={() => onReRun && onReRun(item.prompt)}
                >
                  <Play size={14} /> Re-run
                </button>
                <button 
                  className="glass-button" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--danger-color)' }}
                  onClick={() => handleDelete(item.id)}
                  title="Delete query"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            <div className="code-block" style={{ padding: '0.75rem' }}>
              <pre>{item.sql}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueryHistory;
