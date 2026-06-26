import React from 'react';
import { FileText, Download, Calendar, Activity, Database } from 'lucide-react';

const ReportCard = ({ title, description, icon: Icon, color }) => (
  <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ padding: '0.5rem', background: `var(--${color}-bg)`, color: `var(--${color}-color)`, borderRadius: '8px' }}>
        <Icon size={20} />
      </div>
      <h3 style={{ fontSize: '1.1rem' }}>{title}</h3>
    </div>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', flex: 1 }}>{description}</p>
    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
      <button className="glass-button" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>PDF</button>
      <button className="glass-button" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>Excel</button>
      <button className="glass-button" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>CSV</button>
    </div>
  </div>
);

const Reports = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileText className="sidebar-logo" /> Generate Reports
        </h2>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={16} /> Export All Data
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <ReportCard 
          title="Daily Summary" 
          description="A daily breakdown of all database activities, slow queries, and active connections."
          icon={Calendar} 
          color="accent" 
        />
        <ReportCard 
          title="Weekly Analytics" 
          description="Comprehensive weekly trends showing execution times and most queried tables."
          icon={Activity} 
          color="success" 
        />
        <ReportCard 
          title="Monthly Performance" 
          description="High-level performance metrics, total system load, and storage analysis for the month."
          icon={Database} 
          color="warning" 
        />
        <ReportCard 
          title="Query Usage Log" 
          description="Detailed export of all generated and executed queries across all users."
          icon={FileText} 
          color="accent" 
        />
      </div>
    </div>
  );
};

export default Reports;
