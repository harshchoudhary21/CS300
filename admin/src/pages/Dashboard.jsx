import React, { useState, useEffect } from 'react';
import SecurityManagement from '../components/SecurityManagement';
import EntryManagement from '../components/EntryManagement';
import '../styles/Dashboard.css';
import axios from 'axios';

const Dashboard = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentsCount, setStudentsCount] = useState(0);
  const [securityCount, setSecurityCount] = useState(0);
  const [lateEntriesCount, setLateEntriesCount] = useState(0);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverviewData();
    } else if (activeTab === 'students') {
      fetchStudents();
    }
  }, [activeTab]);

  const fetchOverviewData = async () => {
    try {
      const [studentsRes, securityRes, lateEntriesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/students'),
        axios.get('http://localhost:5000/api/admin/security'),
        axios.get('http://localhost:5000/api/admin/entries'),
      ]);

      setStudentsCount(studentsRes.data.students.length);
      setSecurityCount(securityRes.data.security.length);
      setLateEntriesCount(lateEntriesRes.data.entries.length);
    } catch (error) {
      console.error('Error fetching overview data:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/students');
      setStudents(response.data.students);
      setFilteredStudents(response.data.students); // Initialize filtered students
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredStudents(students); // Reset to all students if search query is empty
    } else {
      const filtered = students.filter((student) =>
        student.rollNumber.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  };

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
        <button
          className={`nav-button ${activeTab === 'entries' ? 'active' : ''}`}
          onClick={() => setActiveTab('entries')}
        >
          Entry Management
        </button>
        <button
          className={`nav-button ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Students
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>Welcome, Admin!</h2>
            <p>You are successfully logged in as: <strong>{admin.email}</strong></p>
            <p>Role: <strong>{admin.role}</strong></p>
            <p>Current time: {new Date().toLocaleString()}</p>

            <div className="overview-cards">
              <div className="overview-card">
                <h3>Total Students</h3>
                <p>{studentsCount}</p>
              </div>
              <div className="overview-card">
                <h3>Total Security Personnel</h3>
                <p>{securityCount}</p>
              </div>
              <div className="overview-card">
                <h3>Total Late Entries</h3>
                <p>{lateEntriesCount}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && <SecurityManagement />}
        {activeTab === 'entries' && <EntryManagement />}
        {activeTab === 'students' && (
          <div className="students-table">
            <h2>Student List</h2>
            <input
              type="text"
              placeholder="Search by Roll Number"
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Roll Number</th>
                  <th>Phone Number</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.rollNumber}</td>
                    <td>{student.phoneNumber}</td>
                    <td>{new Date(student.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;