import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';

function App() {
  const [token, setToken] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('adminEmail');
    if (storedToken) {
      setToken(storedToken);
      setAdminEmail(storedEmail);
    }
  }, []);

  const handleLogin = (token, email) => {
    setToken(token);
    setAdminEmail(email);
    localStorage.setItem('token', token);
    localStorage.setItem('adminEmail', email);
  };

  const handleLogout = () => {
    setToken(null);
    setAdminEmail('');
    localStorage.removeItem('token');
    localStorage.removeItem('adminEmail');
  };

  return (
    <>
      {token ? (
        <Dashboard adminEmail={adminEmail} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
