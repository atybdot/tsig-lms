import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import TaskModal from '../components/TaskModal';

const Dashboard = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  // Fetch tasks for the user
  const fetchUserTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/tasks/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();

      if (data.success) {
        console.log("data", data.success);
      }
      
      // Calculate stats
      const totalTasks = data.length;
      const pendingTasks = data.filter(task => task.status === null || task.status === false).length;
      const completedTasks = data.filter(task => task.status === true).length;
      
      setTasks(data);
      setStats({
        total: totalTasks,
        pending: pendingTasks,
        completed: completedTasks,
      });
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserTasks();
    }
  }, [userId]);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTaskSubmit = async (taskId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData._id) {
        throw new Error('User data not found');
      }

      const response = await fetch(`http://localhost:5000/api/tasks/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          taskId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit task');
      }

      // Refresh tasks after successful submission
      await fetchUserTasks();
    } catch (error) {
      console.error('Error submitting task:', error);
      throw error;
    }
  };

  // Redirect if no userId
  if (!userId) {
    return <Navigate to="/" replace />;
  }

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
    <div>
      <h2 className="mb-6 text-2xl font-bold">
        Welcome, {userData?.fullname || 'User'}
      </h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
          <p className="mt-2 text-3xl font-bold">{stats.total}</p>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Pending Tasks</h3>
          <p className="mt-2 text-3xl font-bold">{stats.pending}</p>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Completed Tasks</h3>
          <p className="mt-2 text-3xl font-bold">{stats.completed}</p>
        </div>
      </div>

      {/* Tasks List */}
      <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-medium">Your Tasks</h3>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div 
              key={task._id}
              onClick={() => handleTaskClick(task)}
              className="flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-gray-500">{task.description}</p>
              </div>
              <span 
                className={`rounded-full px-2 py-1 text-xs ${
                  task.status === true 
                    ? 'bg-green-100 text-green-800' 
                    : task.status === false 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {task.status === true 
                  ? 'Completed' 
                  : task.status === false 
                  ? 'Incomplete' 
                  : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        task={selectedTask}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleTaskSubmit}
      />
    </div>
  );
};

export default Dashboard; 