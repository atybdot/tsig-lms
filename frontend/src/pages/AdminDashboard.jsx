import { useState, useEffect } from 'react';
import CreateTaskModal from '../components/CreateTaskModal';
import MenteeAccordion from '../components/MenteeAccordion';
import React from 'react';

const AdminDashboard = () => {
  const [mentees, setMentees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('adminData'));
  
  // Fetch mentee data
  const fetchMentees = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACK_URL}api/users/mentor/${user.fullname}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      setMentees(data);
    } catch (err) {
      console.error('Error fetching mentees:', err);
      setError(err.message || 'Failed to fetch mentees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentees();
  }, []);


  // Redirect if not an admin
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Create Task
      </button>

      {/* Mentee Accordion */}
      <MenteeAccordion 
        mentees={mentees}
      />

      {/* Create Task Modal */}
      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} users={mentees} />
    </div>
  );
};

export default AdminDashboard;