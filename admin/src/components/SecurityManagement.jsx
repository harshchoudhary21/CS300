import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SecurityManagement.css';

const SecurityManagement = () => {
  const [securityList, setSecurityList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    securityId: '',
    password: ''
  });
  
  // Load security list when component mounts
  useEffect(() => {
    fetchSecurityList();
  }, []);
  
  // Fetch all security personnel
  const fetchSecurityList = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('http://localhost:5000/api/admin/security');
      if (response.data.success) {
        setSecurityList(response.data.security);
      }
    } catch (err) {
      console.error('Error fetching security personnel:', err);
      setError('Failed to load security personnel. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/security/register', 
        formData
      );
      
      if (response.data.success) {
        setSuccessMessage('Security personnel registered successfully!');
        // Clear form
        setFormData({
          name: '',
          phone: '',
          email: '',
          securityId: '',
          password: ''
        });
        // Refresh security list
        fetchSecurityList();
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Failed to register security personnel. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="security-management">
      <h2>Security Personnel Management</h2>
      
      {/* Registration Form */}
      <div className="security-form-container">
        <h3>Register New Security Personnel</h3>
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <form onSubmit={handleSubmit} className="security-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="securityId">Security ID</label>
            <input
              type="text"
              id="securityId"
              name="securityId"
              value={formData.securityId}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register Security'}
          </button>
        </form>
      </div>
      
      {/* Security List */}
      <div className="security-list-container">
        <h3>Security Personnel List</h3>
        
        {loading && <p>Loading...</p>}
        
        {securityList.length === 0 && !loading ? (
          <p>No security personnel registered yet.</p>
        ) : (
          <table className="security-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Security ID</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {securityList.map(security => (
                <tr key={security.id}>
                  <td>{security.name}</td>
                  <td>{security.securityId}</td>
                  <td>{security.email}</td>
                  <td>{security.phone}</td>
                  <td>{security.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SecurityManagement;