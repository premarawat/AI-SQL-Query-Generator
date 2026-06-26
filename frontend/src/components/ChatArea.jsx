import React, { useState, useEffect } from 'react';
import { Send, Mic, Sparkles, Database, FileDigit, BarChart3, ShieldCheck, CheckCircle, AlertTriangle, AlertOctagon, TerminalSquare } from 'lucide-react';
import AnalysisPanel from './AnalysisPanel';
import api from '../api/axios';

const ChatArea = ({ initialPrompt = '', setInitialPrompt }) => {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showSchemaPrompt, setShowSchemaPrompt] = useState(true);

  useEffect(() => {
    // Ensure we have the latest schema from DB when the chat area loads
    const fetchSchema = async () => {
      try {
        const response = await api.get('/schema');
        sessionStorage.setItem('db_schema', JSON.stringify(response.data));
      } catch (err) {
        console.error('Failed to sync schema for context', err);
      }
    };
    fetchSchema();
  }, []);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      if (setInitialPrompt) {
        setInitialPrompt('');
      }
    }
  }, [initialPrompt, setInitialPrompt]);

  const examplePrompts = [
    "Show employees whose salary is greater than 50000",
    "Find top 5 students by CGPA",
    "Increase salary of IT employees by 10%"
  ];

  const handlePromptClick = (text) => {
    setPrompt(text);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Fetch current schema to pass as context
      const savedSchemaStr = sessionStorage.getItem('db_schema');
      const currentSchema = savedSchemaStr ? JSON.parse(savedSchemaStr) : [];
      
      const response = await api.post('/ai/generate', {
        prompt,
        currentSchema
      });

      const aiResult = response.data;
      
      setIsAnalyzing(false);
      setAnalysisResult(aiResult);
      
      // Save query to history
      await api.post('/queries/history', {
        prompt,
        generated_sql: aiResult.options[0].sql,
        explanation: aiResult.explanation,
        execution_status: 'success'
      });
    } catch (err) {
      console.error('Error generating AI response:', err);
      setIsAnalyzing(false);
      alert('Failed to generate response. Check your API key and try again.');
    }
  };

  return (
    <div className="chat-container">
      {showSchemaPrompt && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '500px', width: '90%', textAlign: 'center', position: 'relative' }}>
            <Database size={48} style={{ color: 'var(--accent-blue)', margin: '0 auto 1.5rem auto' }} />
            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Table Schemas Required</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
              Please note: There are no dummy tables available by default. You need to provide the SQL queries for the tables you want to query against (or define your schema), so that the AI can understand your database structure and generate accurate results.
            </p>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowSchemaPrompt(false)}>
              Got it, let's start
            </button>
          </div>
        </div>
      )}

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
