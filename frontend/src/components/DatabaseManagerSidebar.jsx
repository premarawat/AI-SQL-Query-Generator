import React from 'react';
import { 
  Database, History, Bookmark, Settings, Sun, Moon, Plus, 
  LayoutDashboard, LogOut, User, Activity, Zap, ShieldAlert,
  FileText, LineChart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DatabaseManagerSidebar = ({ theme, toggleTheme, currentView, setCurrentView }) => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Database size={24} className="sidebar-logo" />
        <span className="sidebar-title">DB Manager</span>
      </div>

      <nav className="sidebar-nav" style={{ overflowY: 'auto', flex: 1, padding: '0.5rem 0' }}>
        <a className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
          <LayoutDashboard size={18} /><span>Dashboard</span>
        </a>
        <a className={`nav-item ${currentView === 'chat' ? 'active' : ''}`} onClick={() => setCurrentView('chat')}>
          <Plus size={18} /><span>AI SQL Generator</span>
        </a>
        <a className={`nav-item ${currentView === 'schema' ? 'active' : ''}`} onClick={() => setCurrentView('schema')}>
          <Database size={18} /><span>Schema Explorer</span>
        </a>
        <a className={`nav-item ${currentView === 'history' ? 'active' : ''}`} onClick={() => setCurrentView('history')}>
          <History size={18} /><span>Query History</span>
        </a>
        <a className={`nav-item ${currentView === 'saved' ? 'active' : ''}`} onClick={() => setCurrentView('saved')}>
          <Bookmark size={18} /><span>Saved Queries</span>
        </a>
        <a className={`nav-item ${currentView === 'optimizer' ? 'active' : ''}`} onClick={() => setCurrentView('optimizer')}>
          <Zap size={18} /><span>Query Optimizer</span>
        </a>
        <a className={`nav-item ${currentView === 'impact' ? 'active' : ''}`} onClick={() => setCurrentView('impact')}>
          <ShieldAlert size={18} /><span>Impact Analyzer</span>
        </a>
        <a className={`nav-item ${currentView === 'execution' ? 'active' : ''}`} onClick={() => setCurrentView('execution')}>
          <Activity size={18} /><span>Execution History</span>
        </a>
        <a className={`nav-item ${currentView === 'stats' ? 'active' : ''}`} onClick={() => setCurrentView('stats')}>
          <LineChart size={18} /><span>Performance Dash</span>
        </a>
        <a className={`nav-item ${currentView === 'reports' ? 'active' : ''}`} onClick={() => setCurrentView('reports')}>
          <FileText size={18} /><span>Reports</span>
        </a>
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--panel-border)' }}>
        <div style={{ marginBottom: '1rem', padding: '0.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            {user?.full_name?.charAt(0) || 'D'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              Welcome, {user?.full_name?.split(' ')[0] || 'Manager'}
            </p>
          </div>
        </div>

        <a className={`nav-item ${currentView === 'profile' ? 'active' : ''}`} onClick={() => setCurrentView('profile')} style={{ padding: '0.5rem', marginBottom: '0.25rem' }}>
          <User size={16} /><span style={{ fontSize: '0.9rem' }}>Profile</span>
        </a>
        <a className={`nav-item ${currentView === 'settings' ? 'active' : ''}`} onClick={() => setCurrentView('settings')} style={{ padding: '0.5rem', marginBottom: '0.25rem' }}>
          <Settings size={16} /><span style={{ fontSize: '0.9rem' }}>Settings</span>
        </a>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <button className="nav-item" onClick={logout} style={{ padding: '0.5rem', flex: 1, color: 'var(--danger-color)', border: 'none', background: 'transparent', width: 'auto' }}>
            <LogOut size={16} /><span style={{ fontSize: '0.9rem' }}>Logout</span>
          </button>
          <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle Theme" style={{ width: '2rem', height: '2rem' }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DatabaseManagerSidebar;
