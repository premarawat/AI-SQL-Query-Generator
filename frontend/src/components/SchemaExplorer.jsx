import React, { useState, useEffect } from 'react';
import { Database, Table, Key, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';

const SchemaExplorer = () => {
  const [expandedTables, setExpandedTables] = useState(['Employee']);

  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const { default: api } = await import('../api/axios');
        const response = await api.get('/schema');
        setSchema(response.data);
        
        // Also keep sessionStorage in sync for easy local context if needed
        sessionStorage.setItem('db_schema', JSON.stringify(response.data));
      } catch (err) {
        console.error('Failed to fetch schema', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchema();
  }, []);

  const toggleTable = (tableName) => {
    setExpandedTables(prev => 
      prev.includes(tableName) 
        ? prev.filter(t => t !== tableName)
        : [...prev, tableName]
    );
  };

  const deleteTable = async (tableName, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the ${tableName} table?`)) {
      try {
        const { default: api } = await import('../api/axios');
        await api.delete(`/schema/${tableName}`);
        
        const newSchema = schema.filter(t => t.name !== tableName);
        setSchema(newSchema);
        sessionStorage.setItem('db_schema', JSON.stringify(newSchema));
      } catch (err) {
        console.error('Failed to delete table', err);
        alert('Failed to delete table from server');
      }
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', width: '100%', height: '100%', overflowY: 'auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Database className="sidebar-logo" /> Database Schema Explorer
      </h2>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Explore available tables, columns, and relationships in your database.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Loading schema...
            </div>
          ) : schema.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No tables in database. Go to Chat/Query to generate and execute CREATE TABLE statements.
            </div>
          )}
          {schema.map((table) => {
            const isExpanded = expandedTables.includes(table.name);
            return (
              <div key={table.name} style={{ border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    padding: '1rem', 
                    background: 'rgba(0,0,0,0.05)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                  onClick={() => toggleTable(table.name)}
                >
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  <Table size={18} style={{ color: 'var(--accent-blue)' }} />
                  {table.name}
                  <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'normal', marginRight: '1rem' }}>
                    {table.columns.length} columns
                  </span>
                  <button 
                    onClick={(e) => deleteTable(table.name, e)}
                    style={{
                      background: 'transparent', border: 'none', color: 'var(--danger-color)', 
                      cursor: 'pointer', display: 'flex', alignItems: 'center'
                    }}
                    title="Delete table"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                {isExpanded && (
                  <div style={{ padding: '0.5rem 0', background: 'var(--panel-bg)' }}>
                    {table.columns.map(col => (
                      <div key={col.name} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem 0.5rem 3rem', gap: '1rem', borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {col.isPk && <Key size={14} style={{ color: 'var(--warning-color)' }} title="Primary Key" />}
                          {col.isFk && <Key size={14} style={{ color: 'var(--info-color)' }} title="Foreign Key" />}
                          {!col.isPk && !col.isFk && <span style={{ width: 14 }}></span>}
                          <span>{col.name}</span>
                        </div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', width: '120px' }}>{col.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SchemaExplorer;
