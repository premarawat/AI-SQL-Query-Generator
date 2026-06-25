import React, { useState } from 'react';
import { Database, Table, Key, ChevronRight, ChevronDown } from 'lucide-react';

const SchemaExplorer = () => {
  const [expandedTables, setExpandedTables] = useState(['Employee']);

  const schema = [
    {
      name: 'Employee',
      columns: [
        { name: 'EmployeeID', type: 'INT', isPk: true },
        { name: 'Name', type: 'VARCHAR(100)' },
        { name: 'DepartmentID', type: 'INT', isFk: true },
        { name: 'Salary', type: 'DECIMAL(10,2)' },
        { name: 'HireDate', type: 'DATE' },
      ]
    },
    {
      name: 'Department',
      columns: [
        { name: 'DepartmentID', type: 'INT', isPk: true },
        { name: 'DepartmentName', type: 'VARCHAR(100)' },
        { name: 'ManagerID', type: 'INT', isFk: true },
      ]
    },
    {
      name: 'Project',
      columns: [
        { name: 'ProjectID', type: 'INT', isPk: true },
        { name: 'ProjectName', type: 'VARCHAR(100)' },
        { name: 'Budget', type: 'DECIMAL(15,2)' },
      ]
    }
  ];

  const toggleTable = (tableName) => {
    setExpandedTables(prev => 
      prev.includes(tableName) 
        ? prev.filter(t => t !== tableName)
        : [...prev, tableName]
    );
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Database className="sidebar-logo" /> Database Schema Explorer
      </h2>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Explore available tables, columns, and relationships in your database.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                  <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                    {table.columns.length} columns
                  </span>
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
