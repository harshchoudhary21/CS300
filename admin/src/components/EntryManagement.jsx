import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/EntryManagement.css';

const EntryManagement = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/entries');
      setEntries(response.data.entries);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (entryId, status) => {
    const confirmAction = window.confirm(`Are you sure you want to ${status} this entry?`);
    if (!confirmAction) return;

    try {
      await axios.post('http://localhost:5000/api/admin/entries/update', { entryId, status });
      alert(`Entry ${status} successfully!`);
      fetchEntries(); // Refresh entries
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading entries...</div>;
  }

  return (
    <div className="entry-management">
      <h2>Late Entry Management</h2>
      <table className="entries-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Roll Number</th>
            <th>Entry Time</th>
            <th>Proof</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.studentName}</td>
              <td>{entry.rollNumber}</td>
              <td>{new Date(entry.timestamp.seconds * 1000).toLocaleString()}</td>
              <td>
                {entry.proofUrl ? (
                  <a href={entry.proofUrl} target="_blank" rel="noopener noreferrer">
                    View Proof
                  </a>
                ) : (
                  'No Proof'
                )}
              </td>
              <td>
                {entry.verificationStatus === 'pending' ? (
                  <>
                    <button
                      onClick={() => updateStatus(entry.id, 'accepted')}
                      className="accept-button"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(entry.id, 'rejected')}
                      className="reject-button"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span>Status Updated: {entry.verificationStatus}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EntryManagement;