import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import SchemaExplorer from './components/SchemaExplorer';
import StatisticsDashboard from './components/StatisticsDashboard';
import QueryHistory from './components/QueryHistory';
import Login from './components/Login';
import Register from './components/Register';
import { useAuth } from './context/AuthContext';
import { Bookmark, User } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function MainLayout() {
  const [theme, setTheme] = useState('dark');
  const [currentView, setCurrentView] = useState('chat');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="app-container">
      <Sidebar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      
      <main className="main-content">
        {currentView === 'chat' && <ChatArea />}
        {currentView === 'history' && <QueryHistory />}
        {currentView === 'saved' && (
          <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <Bookmark className="sidebar-logo" /> Saved Queries
            </h2>
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No saved queries yet. Run a query and click "Save" to keep it here.
            </div>
          </div>
        )}
        {currentView === 'schema' && <SchemaExplorer />}
        {currentView === 'stats' && <StatisticsDashboard />}
        {currentView === 'profile' && (
          <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <User className="sidebar-logo" /> Profile
            </h2>
            <div className="glass-panel" style={{ padding: '2rem', color: 'var(--text-primary)' }}>
              <h3>Profile features coming soon.</h3>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
