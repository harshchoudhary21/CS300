import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminData, setAdminData] = useState(null);

  // Check for stored admin data when component mounts
  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminData');
    if (storedAdmin) {
      setAdminData(JSON.parse(storedAdmin));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (admin) => {
    // Save admin data to localStorage
    localStorage.setItem('adminData', JSON.stringify(admin));
    setIsLoggedIn(true);
    setAdminData(admin);
  };

  const handleLogout = () => {
    // Clear admin data from localStorage on logout
    localStorage.removeItem('adminData');
    setIsLoggedIn(false);
    setAdminData(null);
  };

  return (
    <div className="app">
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <Dashboard admin={adminData} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;