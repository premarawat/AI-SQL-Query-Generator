import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import SchemaExplorer from './components/SchemaExplorer';
import StatisticsDashboard from './components/StatisticsDashboard';
import QueryHistory from './components/QueryHistory';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import VerifyOTP from './components/VerifyOTP';
import ResetPassword from './components/ResetPassword';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import DatabaseManagerDashboard from './components/DatabaseManagerDashboard';
import SavedQueries from './components/SavedQueries';
import Profile from './components/Profile';
import { useAuth } from './context/AuthContext';
import { Bookmark, User } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Default legacy users to 'user' role
  const userRole = user.role || 'user';

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // If they are admin/db_manager trying to access the user dashboard, send them to their respective dashboard
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    if (userRole === 'database_manager') return <Navigate to="/db-manager" replace />;
    
    // Otherwise, show access denied
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--danger-color)' }}>
        <h2>403 Access Denied</h2>
      </div>
    );
  }

  return children;
};

function MainLayout() {
  const [theme, setTheme] = useState('dark');
  const [currentView, setCurrentView] = useState('chat');
  const [activePrompt, setActivePrompt] = useState('');

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
        {currentView === 'chat' && <ChatArea initialPrompt={activePrompt} setInitialPrompt={setActivePrompt} />}
        {currentView === 'history' && <QueryHistory onReRun={(prompt) => { setActivePrompt(prompt); setCurrentView('chat'); }} />}
        {currentView === 'saved' && <SavedQueries onReRun={(prompt) => { setActivePrompt(prompt); setCurrentView('chat'); }} />}
        {currentView === 'schema' && <SchemaExplorer />}
        {currentView === 'stats' && <StatisticsDashboard />}
        {currentView === 'profile' && <Profile />}
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/db-manager" 
        element={
          <ProtectedRoute allowedRoles={['database_manager']}>
            <DatabaseManagerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/*" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <MainLayout />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
