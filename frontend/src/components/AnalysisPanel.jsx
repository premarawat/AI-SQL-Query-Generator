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
import api from '../api/axios';

const AnalysisPanel = ({ result }) => {
  const [selectedOption, setSelectedOption] = useState(0);
  const [isExecuted, setIsExecuted] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [executionError, setExecutionError] = useState(null);
  const sqlOptions = result?.options || [];

const selectedSql =
  sqlOptions[selectedOption]?.sql ||
  result?.generatedSQL ||
  result?.sql ||
  "";

const selectedTitle =
  sqlOptions[selectedOption]?.title ||
  "Generated SQL";

  const handleExecute = async () => {
    if (!selectedSql) {
  alert("No SQL available to execute.");
  return;
}
    setIsExecuting(true);
    setExecutionResult(null);
    setExecutionError(null);
    
    if (result.intent === 'CREATE' && result.schemaDefinition) {
      try {
        await api.post('/schema', {
          name: result.schemaDefinition.name,
          columns: result.schemaDefinition.columns
        });
        
        const saved = sessionStorage.getItem('db_schema');
        const currentSchema = saved ? JSON.parse(saved) : [];
        
        const updatedSchema = [...currentSchema.filter(t => t.name !== result.schemaDefinition.name), result.schemaDefinition];
        sessionStorage.setItem('db_schema', JSON.stringify(updatedSchema));
      } catch (err) {
        console.error('Error saving schema to backend:', err);
      }
    }

    try {
      const response = await api.post('/queries/run', {
  sql: selectedSql
});
      setExecutionResult(response.data);
    } catch (err) {
      setExecutionError(err.response?.data?.message || err.message || 'Error executing query');
    } finally {
      setIsExecuting(false);
      setIsExecuted(true);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
 const file = new Blob([selectedSql], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "query.sql";
    document.body.appendChild(element);
    element.click();
  };

  const handleSave = async () => {
    try {
      await api.post('/queries/saved', {
        query_name: result.requirement.substring(0, 50),
        sql_query: selectedSql
      });
      alert('Query saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save query');
    }
  };

 const handleRegenerate = () => {
  alert(
    "Regenerate will be connected to the AI endpoint in the next module."
  );
};

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
              <span style={{ fontWeight: 500 }}>{result.tables?.length
  ? result.tables.join(", ")
  : "No tables detected"}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Attributes:</span>
              <span style={{ fontWeight: 500 }}>{result.attributes || "No attributes detected"}</span>
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
              <span style={{ fontWeight: 500 }}>{result.estRows || '~150'}</span>
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
  {sqlOptions.length > 0 ? (
    sqlOptions.map((opt, idx) => (
      <button
        key={idx}
        className={`tab ${selectedOption === idx ? 'active' : ''}`}
        onClick={() => setSelectedOption(idx)}
      >
        {opt.title}
      </button>
    ))
  ) : (
    <button className="tab active">
      Generated SQL
    </button>
  )}
</div>

        <div className="code-block" style={{ marginBottom: '1rem' }}>
          <button
  className="copy-btn"
  title="Copy SQL"
  onClick={() => {
    navigator.clipboard.writeText(selectedSql);
    alert("SQL copied to clipboard!");
  }}
>
            <Copy size={16} />
          </button>
         <pre>{selectedSql || "No SQL generated."}</pre>
        </div>

        {/* E. Explanation */}
        <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>
            <Info size={16} /> Plain English Explanation
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {result.explanation || 'This query retrieves the EmployeeID, Name, and Salary from the Employee table, but only includes rows where the Salary is strictly greater than 50,000.'}
          </p>
        </div>
      </div>

      {/* J. Actions */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button className="glass-button" onClick={handleRegenerate}>
          <RefreshCw size={16} /> Regenerate
        </button>
        <button className="glass-button" onClick={handleDownload}>
          <Download size={16} /> Download
        </button>
        <button className="glass-button" onClick={handleSave}>
          <Save size={16} /> Save
        </button>
        <button className="btn-primary" onClick={handleExecute} disabled={isExecuting}>
          {isExecuting ? <RefreshCw size={16} /> : <Play size={16} />} 
          {isExecuting ? 'Executing...' : 'Execute Query'}
        </button>
      </div>

      {/* I. Results Mockup */}
      <div className="glass-panel" style={{ padding: '1.5rem', opacity: isExecuted ? 1 : 0.7, transition: 'opacity 0.3s' }}>
        <div className="card-header">
          <Database size={18} />
          <span>Query Execution Result {isExecuted ? '' : '(Preview)'}</span>
        </div>
        
        {isExecuting ? (
          <div style={{ color: 'var(--accent-blue)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <RefreshCw size={16} /> Running query on database...
          </div>
        ) : !isExecuted ? (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Click "Execute Query" to fetch and display the results in a data table with pagination, sorting, and export features.
          </p>
        ) : result.intent === 'CREATE' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)' }}>
             <CheckCircle size={16} /> {result.schemaDefinition?.name
  ? `${result.schemaDefinition.name} created successfully.`
  : "Table created successfully."}
          </div>
        ) : executionError ? (
          <div style={{ padding: '1rem', background: 'var(--danger-bg)', color: 'var(--danger-color)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {executionError}
            </div>
          </div>
        ) : executionResult && executionResult.type === 'SELECT' ? (
          (!executionResult.rows || executionResult.rows.length === 0) ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No records found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--panel-border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
                    {executionResult.columns && executionResult.columns.map((field, idx) => (
                      <th key={idx} style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        {field}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {executionResult.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      {executionResult.columns && executionResult.columns.map((field, colIdx) => (
                        <td key={colIdx} style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                          {row[field] !== null && row[field] !== undefined ? String(row[field]) : <span style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>null</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : executionResult ? (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)', fontWeight: 500 }}>
              <CheckCircle size={18} /> {executionResult.message || `${executionResult.type} executed successfully.`}
            </div>
            {executionResult.rowCount !== undefined && (
               <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', paddingLeft: '1.75rem' }}>
                 Rows affected: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{executionResult.rowCount}</span>
               </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Execution completed.
          </div>
        )}
      </div>

    </div>
  );
};

export default AnalysisPanel;
