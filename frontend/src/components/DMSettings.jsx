import React from 'react';
import { Settings, Globe, Bell, Code, Monitor } from 'lucide-react';

const DMSettings = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Settings className="sidebar-logo" /> Settings
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Monitor size={18} /> Appearance
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <p style={{ fontWeight: 500 }}>Theme Preference</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Toggle between light and dark mode.</p>
            </div>
            <select className="chat-input-wrapper" style={{ padding: '0.5rem 1rem', width: '150px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}>
              <option value="system">System Default</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Code size={18} /> Database Preferences
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontWeight: 500 }}>Default SQL Dialect</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>The default dialect for generating queries.</p>
            </div>
            <select className="chat-input-wrapper" style={{ padding: '0.5rem 1rem', width: '150px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}>
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="sqlserver">SQL Server</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontWeight: 500 }}>Safe Execution Mode</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Always require confirmation for UPDATE/DELETE.</p>
            </div>
            <input type="checkbox" defaultChecked style={{ width: '1.2rem', height: '1.2rem' }} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Bell size={18} /> Notifications
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontWeight: 500 }}>Slow Query Alerts</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Notify when a query takes longer than 5s.</p>
            </div>
            <input type="checkbox" defaultChecked style={{ width: '1.2rem', height: '1.2rem' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontWeight: 500 }}>Weekly Reports</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Send weekly analytics to my email.</p>
            </div>
            <input type="checkbox" defaultChecked style={{ width: '1.2rem', height: '1.2rem' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button className="btn-primary">Save Settings</button>
        </div>
      </div>
    </div>
  );
};

export default DMSettings;
