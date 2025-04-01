import React from 'react';
import './Dashboard.css';

const Dashboard = ({ adminEmail, onLogout }) => {
  return (
    <div className="dashboard-container">
      <h2>Admin Dashboard</h2>
      <div className="admin-info">
        <p>Welcome, {adminEmail}!</p>
      </div>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
