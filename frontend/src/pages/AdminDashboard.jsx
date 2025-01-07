import { useState, useEffect } from 'react';
import CreateTaskModal from '../components/CreateTaskModal';
import MenteeAccordion from '../components/MenteeAccordion';

const AdminDashboard = () => {
  const [mentees, setMentees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch mentee data
  const fetchMentees = async () => {
    const user = JSON.parse(localStorage.getItem('adminData'));
    try {
      const response = await fetch(`https://cms-production-0677.up.railway.app/api/users/mentor/${user.fullname}`); // Replace with your API endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch mentees');
      }
      const data = await response.json();
      console.log(data);
      setMentees(data);
    } catch (err) {
      console.error('Error fetching mentees:', err);
      setError(err.message);
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
      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default AdminDashboard; 