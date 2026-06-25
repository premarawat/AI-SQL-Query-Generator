import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Copy, 
  Play, 
  Save, 
  Download, 
  RefreshCw,
  Database,
  Info,
  ShieldAlert,
  Zap
} from 'lucide-react';

const AnalysisPanel = ({ result }) => {
  const [selectedOption, setSelectedOption] = useState(0);

  const getIntentColor = (intent) => {
    switch (intent) {
      case 'SELECT': return 'select';
      case 'INSERT': return 'insert';
      case 'UPDATE': return 'update';
      case 'DELETE': return 'delete';
      default: return 'select';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Safe': return 'var(--success-color)';
      case 'Moderate': return 'var(--warning-color)';
      case 'High Risk': return 'var(--danger-color)';
      default: return 'var(--success-color)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      {/* A & B. Requirement and Intent */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>User Requirement</h3>
            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>"{result.requirement}"</p>
          </div>
          <div>
            <span className={`badge ${getIntentColor(result.intent)}`}>
              {result.intent} Operation
            </span>
          </div>
        </div>
      </div>

      <div className="analysis-grid">
        {/* C. Database Mapping */}
        <div className="card">
          <div className="card-header">
            <Database size={18} />
            <span>Database Mapping</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Tables Involved:</span>
              <span style={{ fontWeight: 500 }}>{result.tables.join(', ')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Attributes:</span>
              <span style={{ fontWeight: 500 }}>Salary, EmployeeID, Name</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Relationships:</span>
              <span style={{ fontWeight: 500 }}>None</span>
            </div>
          </div>
        </div>

        {/* F. Impact Analysis */}
        <div className="card">
          <div className="card-header">
            <ShieldAlert size={18} style={{ color: getRiskColor(result.riskLevel) }} />
            <span>Impact Analysis</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Risk Level:</span>
              <span style={{ fontWeight: 600, color: getRiskColor(result.riskLevel) }}>{result.riskLevel}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Est. Rows Returned:</span>
              <span style={{ fontWeight: 500 }}>~150</span>
            </div>
            {result.riskLevel !== 'Safe' && (
              <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--warning-bg)', color: 'var(--warning-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', display: 'flex', gap: '0.5rem' }}>
                <AlertTriangle size={16} />
                <span>Modifying multiple rows without explicit WHERE limitation.</span>
              </div>
            )}
          </div>
        </div>

        {/* G. Validation */}
        <div className="card">
          <div className="card-header">
            <CheckCircle size={18} style={{ color: 'var(--success-color)' }} />
            <span>Query Validation</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)', fontSize: '0.9rem' }}>
              <CheckCircle size={14} /> Syntax Valid
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)', fontSize: '0.9rem' }}>
              <CheckCircle size={14} /> Table Exists
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)', fontSize: '0.9rem' }}>
              <CheckCircle size={14} /> Columns Verified
            </div>
          </div>
        </div>
      </div>

      {/* D. Generated SQL */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="card-header">
          <Zap size={18} />
          <span>Generated SQL Queries</span>
        </div>
        
        <div className="tabs">
          {result.options.map((opt, idx) => (
            <button 
              key={idx}
              className={`tab ${selectedOption === idx ? 'active' : ''}`}
              onClick={() => setSelectedOption(idx)}
            >
              {opt.title}
            </button>
          ))}
        </div>

        <div className="code-block" style={{ marginBottom: '1rem' }}>
          <button className="copy-btn" title="Copy SQL">
            <Copy size={16} />
          </button>
          <pre>{result.options[selectedOption].sql}</pre>
        </div>

        {/* E. Explanation */}
        <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>
            <Info size={16} /> Plain English Explanation
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            This query retrieves the <strong>EmployeeID</strong>, <strong>Name</strong>, and <strong>Salary</strong> from the <strong>Employee</strong> table, but only includes rows where the <strong>Salary</strong> is strictly greater than 50,000.
          </p>
        </div>
      </div>

      {/* J. Actions */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button className="glass-button">
          <RefreshCw size={16} /> Regenerate
        </button>
        <button className="glass-button">
          <Download size={16} /> Download
        </button>
        <button className="glass-button">
          <Save size={16} /> Save
        </button>
        <button className="btn-primary">
          <Play size={16} /> Execute Query
        </button>
      </div>

      {/* I. Results Mockup */}
      <div className="glass-panel" style={{ padding: '1.5rem', opacity: 0.7 }}>
        <div className="card-header">
          <Database size={18} />
          <span>Query Execution Result (Preview)</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Click "Execute Query" to fetch and display the results in a data table with pagination, sorting, and export features.
        </p>
      </div>

    </div>
  );
};

export default AnalysisPanel;
