import { useState, useEffect } from 'react';
import { useParams, Navigate, useOutletContext } from 'react-router-dom';
import TaskModal from '../components/TaskModal';

const Dashboard = () => {
  const { userId } = useParams();
  const { setIsSidebarOpen } = useOutletContext();
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
      const response = await fetch(`${import.meta.env.VITE_BACK_URL}api/tasks/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      
      // Calculate stats
      const totalTasks = data.length;
      const pendingTasks = data.filter(task => task.status === null || task.status === "false").length;
      const completedTasks = data.filter(task => task.status === "true").length;
      
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

  const handleTaskSubmit = async (taskId, file, link) => {
    try {
      if (!userData || !userData._id) {
        throw new Error('User data not found');
      }
  
      // Create multipart FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userData._id);
      formData.append('taskId', taskId);
      if (link) {
        formData.append('Links', link);
      }
      
      // Debug: log each FormData pair
      for (let pair of formData.entries()) {
        console.log('FormData:', pair[0], pair[1]);
      }
  
      const response = await fetch(`${import.meta.env.VITE_BACK_URL}api/tasks/submit`, {
        method: 'POST',
        body: formData,
        // No "Content-Type" header; browser sets it for multipart/form-data
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error submitting task:', errorData);
        throw new Error(errorData.message || 'Failed to submit task');
      }
      const data = await response.json();
      await fetchUserTasks();
      console.log('Task submitted:', data);
      return data;
    } catch (error) {
      console.error('Error submitting task:', error);
      throw error;
    }
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return null;
    
    if (fileType.startsWith('image/')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else if (fileType.includes('pdf')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    
    // Default document icon
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

  // Handle calendar event click
  const handleAttendanceClick = (event) => {
    alert(`${!event.title} on ${moment(event.start).format('MMMM D, YYYY')}`);
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
    <div className="flex flex-col sm:w-full sm:z-0">
      <div className="flex-1 p-4">
        {/* Hamburger Icon */}
        <button onClick={setIsSidebarOpen} className="md:hidden p-2 text-gray-600">
          ☰
        </button>

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
                <div className="flex items-center">
                  {task.submission && task.submission.fileId && (
                    <div className="mr-3">
                      {getFileIcon(task.submission.fileType)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.description}</p>
                    {task.submission && (
                      <p className="text-xs text-blue-500 mt-1">
                        {task.submission.fileName ? `Submitted: ${task.submission.fileName}` : 'File submitted'}
                      </p>
                    )}
                  </div>
                </div>
                <span 
                  className={`rounded-full px-2 py-1 text-xs ${
                    task.status === "true" 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {task.status === "true" 
                    ? 'Completed' 
                    : task.status === "false" 
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
          handleTaskSubmit={handleTaskSubmit}
          user={userData}
        />
      </div>
    </div>
  );
};

export default Dashboard;
