import React, { useState } from 'react';
import SecurityManagement from '../components/SecurityManagement';
import '../styles/Dashboard.css';

const Dashboard = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!admin) {
    return <div className="loading">No admin data available</div>;
  }
  
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>{admin.email}</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>
      
      <div className="dashboard-nav">
        <button 
          className={`nav-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`nav-button ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security Management
        </button>
      </div>
      
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="welcome-card">
            <h2>Welcome, Admin!</h2>
            <p>You are successfully logged in as: <strong>{admin.email}</strong></p>
            <p>Role: <strong>{admin.role}</strong></p>
            <p>Current time: {new Date().toLocaleString()}</p>
            
            <div className="stats-container">
              <div className="stat-card">
                <h3>Admin Portal</h3>
                <p>Use this dashboard to manage your application.</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'security' && <SecurityManagement />}
      </div>
    </div>
  );
};

export default Dashboard;