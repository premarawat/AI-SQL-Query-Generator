import React from 'react';
import { History, Search, Play, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

const QueryHistory = () => {
  const historyData = [
    {
      id: 1,
      prompt: 'Show employees whose salary is greater than 50000',
      sql: 'SELECT EmployeeID, Name, Salary FROM Employee WHERE Salary > 50000;',
      timestamp: '2 mins ago',
      status: 'success'
    },
    {
      id: 2,
      prompt: 'Delete all employees in HR',
      sql: 'DELETE FROM Employee WHERE DepartmentID = (SELECT DepartmentID FROM Department WHERE DepartmentName = "HR");',
      timestamp: '15 mins ago',
      status: 'error'
    },
    {
      id: 3,
      prompt: 'Find top 5 students by CGPA',
      sql: 'SELECT * FROM Students ORDER BY CGPA DESC LIMIT 5;',
      timestamp: '1 hour ago',
      status: 'success'
    }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
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
                <button className="glass-button" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  <Play size={14} /> Re-run
                </button>
                <button className="glass-button" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--danger-color)' }}>
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
