import React from 'react';
import { 
  Database, 
  History, 
  Bookmark, 
  Settings, 
  Sun, 
  Moon, 
  Plus, 
  LayoutDashboard,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ theme, toggleTheme, currentView, setCurrentView }) => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Database size={24} className="sidebar-logo" />
        <span className="sidebar-title">AI SQL Query</span>
      </div>

      <div style={{ padding: '1rem' }}>
        <button className="btn-primary" style={{ width: '100%' }} onClick={() => setCurrentView('chat')}>
          <Plus size={18} /> New Query
        </button>
      </div>

      <nav className="sidebar-nav">
        <a 
          className={`nav-item ${currentView === 'chat' ? 'active' : ''}`}
          onClick={() => setCurrentView('chat')}
        >
          <Database size={18} />
          <span>Chat / Query</span>
        </a>
        <a 
          className={`nav-item ${currentView === 'history' ? 'active' : ''}`}
          onClick={() => setCurrentView('history')}
        >
          <History size={18} />
          <span>Query History</span>
        </a>
        <a 
          className={`nav-item ${currentView === 'saved' ? 'active' : ''}`}
          onClick={() => setCurrentView('saved')}
        >
          <Bookmark size={18} />
          <span>Saved Queries</span>
        </a>
        <a 
          className={`nav-item ${currentView === 'schema' ? 'active' : ''}`}
          onClick={() => setCurrentView('schema')}
        >
          <LayoutDashboard size={18} />
          <span>Schema Explorer</span>
        </a>
        <a 
          className={`nav-item ${currentView === 'stats' ? 'active' : ''}`}
          onClick={() => setCurrentView('stats')}
        >
          <BarChart3Icon size={18} />
          <span>Statistics</span>
        </a>
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--panel-border)' }}>
        <div style={{ marginBottom: '1rem', padding: '0.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              Welcome, {user?.full_name?.split(' ')[0] || 'User'}
            </p>
          </div>
        </div>

        <a 
          className={`nav-item ${currentView === 'profile' ? 'active' : ''}`}
          onClick={() => setCurrentView('profile')}
          style={{ padding: '0.5rem', marginBottom: '0.25rem' }}
        >
          <User size={16} />
          <span style={{ fontSize: '0.9rem' }}>Profile</span>
        </a>

        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <button 
            className="nav-item" 
            style={{ padding: '0.5rem', flex: 1, color: 'var(--danger-color)', border: 'none', background: 'transparent', width: 'auto' }}
            onClick={logout}
          >
            <LogOut size={16} />
            <span style={{ fontSize: '0.9rem' }}>Logout</span>
          </button>
          
          <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle Theme" style={{ width: '2rem', height: '2rem' }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </aside>
  );
};

const BarChart3Icon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
);

export default Sidebar;
