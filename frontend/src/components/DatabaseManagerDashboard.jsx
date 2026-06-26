import React, { useState, useEffect } from 'react';
import DatabaseManagerSidebar from './DatabaseManagerSidebar';
import DMDashboardOverview from './DMDashboardOverview';
import ChatArea from './ChatArea';
import SchemaExplorer from './SchemaExplorer';
import QueryHistory from './QueryHistory';
import QueryOptimizer from './QueryOptimizer';
import ImpactAnalyzer from './ImpactAnalyzer';
import ExecutionHistory from './ExecutionHistory';
import StatisticsDashboard from './StatisticsDashboard';
import Reports from './Reports';
import DMSettings from './DMSettings';
import DMProfile from './DMProfile';
import { Bookmark } from 'lucide-react';

const DatabaseManagerDashboard = () => {
  const [theme, setTheme] = useState('dark');
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <div className="app-container">
      <DatabaseManagerSidebar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      
      <main className="main-content">
        {currentView === 'dashboard' && <DMDashboardOverview />}
        {currentView === 'chat' && <ChatArea />}
        {currentView === 'schema' && <SchemaExplorer />}
        {currentView === 'history' && <QueryHistory />}
        {currentView === 'saved' && (
          <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <Bookmark className="sidebar-logo" /> Saved Queries
            </h2>
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No saved queries yet. Generate a query and save it.
            </div>
          </div>
        )}
        {currentView === 'optimizer' && <QueryOptimizer />}
        {currentView === 'impact' && <ImpactAnalyzer />}
        {currentView === 'execution' && <ExecutionHistory />}
        {currentView === 'stats' && <StatisticsDashboard />}
        {currentView === 'reports' && <Reports />}
        {currentView === 'settings' && <DMSettings />}
        {currentView === 'profile' && <DMProfile />}
      </main>
    </div>
  );
};

export default DatabaseManagerDashboard;
