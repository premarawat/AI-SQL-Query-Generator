import React, { useState, useEffect } from 'react';
import {
  Send,
  Mic,
  Sparkles,
  Database
} from 'lucide-react';
import AnalysisPanel from './AnalysisPanel';
import api from '../api/axios';

const ChatArea = ({ initialPrompt = '', setInitialPrompt }) => {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [isSavingHistory, setIsSavingHistory] = useState(false);
  const [showSchemaPrompt, setShowSchemaPrompt] = useState(true);

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await api.get('/schema');
        sessionStorage.setItem(
          'db_schema',
          JSON.stringify(response.data)
        );
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
    'Show employees whose salary is greater than 50000',
    'Find top 5 students by CGPA',
    'Increase salary of IT employees by 10%'
  ];

  const handlePromptClick = (text) => {
    setPrompt(text);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!prompt.trim()) return;
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setError(null);

    try {

  let currentSchema = [];

  try {
    const savedSchemaStr = sessionStorage.getItem("db_schema");
    currentSchema = savedSchemaStr
      ? JSON.parse(savedSchemaStr)
      : [];
  } catch {
    currentSchema = [];
  }

  const response = await api.post("/ai/generate", {
    prompt,
    currentSchema
  });

  const aiResult = response.data;

  setAnalysisResult(aiResult);
  sessionStorage.setItem(
"last_prompt",
prompt
);
setPrompt("");
  setIsAnalyzing(false);

  setIsSavingHistory(true);

  try {

    await api.post("/queries/history", {
      prompt,
      generated_sql:
        aiResult?.options?.[0]?.sql ||
        aiResult?.generatedSQL ||
        aiResult?.sql ||
        "",
      explanation:
        aiResult?.explanation || "",
      execution_status: "success"
    });

  } catch (historyError) {

    console.error("History save failed:", historyError);

  } finally {

    setIsSavingHistory(false);

  }

} catch (err) {

    console.error(err);

    setIsAnalyzing(false);

    const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unknown error";

    setError(message);

}
  };

  return (
    <div className="chat-container">
      {showSchemaPrompt && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div
            className="glass-panel"
            style={{
              padding: '2.5rem',
              width: '90%',
              maxWidth: '500px',
              textAlign: 'center'
            }}
          >
            <Database
              size={48}
              style={{
                color: 'var(--accent-blue)',
                margin: '0 auto 1.5rem'
              }}
            />

            <h3
              style={{
                marginBottom: '1rem'
              }}
            >
              Table Schemas Required
            </h3>

            <p
              style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '2rem'
              }}
            >
              Please note: There are no dummy tables
              available by default. Define your database
              schema or provide CREATE TABLE statements
              so the AI understands your database before
              generating SQL.
            </p>

            <button
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center'
              }}
              onClick={() =>
                setShowSchemaPrompt(false)
              }
            >
              Got it, let's start
            </button>
          </div>
        </div>
      )}

      {!analysisResult && !isAnalyzing ? (
        <div className="empty-state">
          <Sparkles size={64} />
          <h2>AI Query Intelligence</h2>
          <p
  style={{
    whiteSpace: "pre-line"
  }}
>
{`Examples

• Show employees earning > 50000

• Create Student table

• Find top 5 students

• Update salary by 10%

• Explain this SQL

• Optimize this query`}
</p>
        </div>
      ) : (
        <div style={{ flex: 1 }}>
          {isAnalyzing ? (
            <div className="empty-state">
              <Database
                size={48}
                className="animate-pulse"
                style={{
                  color: 'var(--accent-purple)'
                }}
              />

              <h3
                className="gradient-text"
                style={{
                  marginTop: '1rem'
                }}
              >
                Analyzing Intent & Generating SQL...
              </h3>
            </div>
          ) : (
            <AnalysisPanel result={analysisResult} />
          )}
        </div>
      )}
      {error && (

<div
className="glass-panel"
style={{
background:"rgba(239,68,68,.08)",
border:"1px solid rgba(239,68,68,.25)",
padding:"1rem",
color:"#ef4444"
}}
>

<strong>Error</strong>

<br/>

{error}

</div>

)}

      <div className="input-container">
        <div className="input-box">
          <div className="example-prompts">
            {examplePrompts.map((text, index) => (
              <span
                key={index}
                className="prompt-chip"
                onClick={() =>
                  handlePromptClick(text)
                }
              >
                {text}
              </span>
            ))}
          </div>

          <form
            className="chat-input-wrapper"
            onSubmit={handleSubmit}
          >
            <textarea
              className="chat-input"
              placeholder="Describe what data you need in plain English..."
              value={prompt}
              onChange={(e) =>
                setPrompt(e.target.value)
              }
              rows={1}
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />

            <div className="chat-actions">
              <button
                type="button"
                className="btn-icon"
              >
                <Mic size={20} />
              </button>
<button
type="submit"
className="btn-primary"
disabled={isAnalyzing}
                style={{
                  padding: '0.5rem 1rem'
                }}
              >
               {isAnalyzing ? (
<>
<div className="spinner"/>
Generating...
</>
) : (
<Send size={18}/>
)}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ChatArea; 