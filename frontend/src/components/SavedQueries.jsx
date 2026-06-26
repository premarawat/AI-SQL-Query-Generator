import React, { useState, useEffect } from 'react';
import { Bookmark, Play, Trash2, Copy } from 'lucide-react';
import api from '../api/axios';

const SavedQueries = ({ onReRun }) => {
  const [savedData, setSavedData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const response = await api.get('/queries/saved');
        const formatted = response.data.map(item => ({
          id: item.id,
          name: item.query_name,
          sql: item.sql_query,
          timestamp: new Date(item.created_at).toLocaleString()
        }));
        setSavedData(formatted);
      } catch (err) {
        console.error('Failed to fetch saved queries', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this from saved queries?')) {
      try {
        await api.delete(`/queries/saved/${id}`);
        setSavedData(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error('Failed to delete saved query', err);
        alert('Failed to delete saved query');
      }
    }
  };

  const handleCopy = (sql) => {
    navigator.clipboard.writeText(sql);
    alert('Copied to clipboard!');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bookmark className="sidebar-logo" /> Saved Queries
        </h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading saved queries...</div>
      ) : savedData.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No saved queries yet. Run a query and click "Save" to keep it here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {savedData.map(item => (
            <div key={item.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.25rem' }}>{item.name}</p>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Saved on {item.timestamp}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="glass-button" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    onClick={() => handleCopy(item.sql)}
                  >
                    <Copy size={14} /> Copy
                  </button>
                  <button 
                    className="glass-button" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    onClick={() => onReRun && onReRun(item.name)}
                  >
                    <Play size={14} /> Load
                  </button>
                  <button 
                    className="glass-button" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--danger-color)' }}
                    onClick={() => handleDelete(item.id)}
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
      )}
    </div>
  );
};

export default SavedQueries;
