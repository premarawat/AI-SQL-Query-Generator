import React, { useState } from 'react';
import { Send, Mic, Sparkles, Database, FileDigit, BarChart3, ShieldCheck, CheckCircle, AlertTriangle, AlertOctagon, TerminalSquare } from 'lucide-react';
import AnalysisPanel from './AnalysisPanel';

const ChatArea = () => {
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const examplePrompts = [
    "Show employees whose salary is greater than 50000",
    "Find top 5 students by CGPA",
    "Increase salary of IT employees by 10%"
  ];

  const handlePromptClick = (text) => {
    setPrompt(text);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    // Simulate AI generation delay
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({
        requirement: prompt,
        intent: prompt.toLowerCase().includes('increase') || prompt.toLowerCase().includes('update') ? 'UPDATE' : 'SELECT',
        tables: ['Employee', 'Department'],
        riskLevel: prompt.toLowerCase().includes('delete') || prompt.toLowerCase().includes('update') ? 'Moderate' : 'Safe',
        options: [
          {
            title: 'Option 1 (Optimized)',
            sql: `SELECT \n  EmployeeID, \n  Name, \n  Salary \nFROM Employee \nWHERE Salary > 50000;`,
          },
          {
            title: 'Option 2 (All Columns)',
            sql: `SELECT * \nFROM Employee \nWHERE Salary > 50000;`,
          }
        ]
      });
    }, 1500);
  };

  return (
    <div className="chat-container">
      {!analysisResult && !isAnalyzing ? (
        <div className="empty-state">
          <Sparkles size={64} />
          <h2>AI Query Intelligence</h2>
          <p>Ask me anything about your database in plain English.</p>
        </div>
      ) : (
        <div style={{ flex: 1 }}>
          {isAnalyzing ? (
            <div className="empty-state">
              <Database size={48} className="animate-pulse" style={{ color: 'var(--accent-purple)' }} />
              <h3 className="gradient-text" style={{ marginTop: '1rem' }}>Analyzing Intent & Generating SQL...</h3>
            </div>
          ) : (
            <AnalysisPanel result={analysisResult} />
          )}
        </div>
      )}

      <div className="input-container">
        <div className="input-box">
          <div className="example-prompts">
            {examplePrompts.map((ep, idx) => (
              <span 
                key={idx} 
                className="prompt-chip"
                onClick={() => handlePromptClick(ep)}
              >
                {ep}
              </span>
            ))}
          </div>

          <form className="chat-input-wrapper" onSubmit={handleSubmit}>
            <textarea
              className="chat-input"
              placeholder="Describe what data you need in plain English..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              rows={1}
            />
            <div className="chat-actions">
              <button type="button" className="btn-icon">
                <Mic size={20} />
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
