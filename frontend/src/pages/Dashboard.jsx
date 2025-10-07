import { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router';
import { Navigate } from 'react-router';
import TaskModal from '../components/TaskModal';
import { 
  ChevronRightIcon,
  DocumentIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

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
  
      const response = await fetch(`${import.meta.env.VITE_BACK_URL}api/tasks/submit`, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit task');
      }
      const data = await response.json();
      await fetchUserTasks();
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

  // Redirect if no userId
  if (!userId) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
          <p className="mt-3 text-sm text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-4 flex flex-col items-center rounded-lg bg-red-50 p-4 text-center sm:p-6">
        <ExclamationCircleIcon className="h-10 w-10 text-red-500" />
        <h3 className="mt-2 text-lg font-medium text-red-800">Something went wrong</h3>
        <p className="mt-1 text-sm text-red-600">{error}</p>
        <button
          onClick={fetchUserTasks}
          className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 px-3 py-4 sm:px-6 sm:py-5">
        {/* Header with Hamburger Icon */}
        <div className="mb-4 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="md:hidden rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <span className="sr-only">Open menu</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-xl font-bold sm:text-2xl">
            Welcome, <span className="text-blue-600">{userData?.fullname || 'User'}</span>
          </h2>
          <div className="w-6 md:hidden">
            {/* Spacer for alignment */}
          </div>
        </div>
        
        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
              <DocumentIcon className="h-5 w-5 text-blue-500" />
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{stats.total}</p>
          </div>
          
          <div className="rounded-lg bg-white p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Pending Tasks</h3>
              <ClockIcon className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{stats.pending}</p>
          </div>
          
          <div className="rounded-lg bg-white p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Completed Tasks</h3>
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{stats.completed}</p>
          </div>
        </div>

        {/* Tasks List - Responsive Design */}
        <div className="mt-5 sm:mt-6 rounded-lg bg-white p-3 sm:p-5 shadow-sm">
          <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-medium">Your Tasks</h3>
          
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <DocumentIcon className="h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">No tasks assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div 
                  key={task._id}
                  onClick={() => handleTaskClick(task)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start sm:items-center mb-2 sm:mb-0">
                    <div className="mr-3 flex-shrink-0">
                      {task.submission && task.submission.fileId ? (
                        getFileIcon(task.submission.fileType)
                      ) : (
                        <DocumentIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{task.title}</p>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
                      {task.submission && (
                        <p className="mt-1 text-xs text-blue-500">
                          {task.submission.fileName ? 
                            <span className="truncate block">Submitted: {task.submission.fileName}</span> : 
                            'File submitted'
                          }
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto">
                    <span 
                      className={`rounded-full px-2.5 py-1 text-xs font-medium flex-shrink-0 ${
                        task.status === "true" 
                          ? 'bg-green-100 text-green-800' 
                          : task.status === "false"
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {task.status === "true" 
                        ? 'Completed' 
                        : task.status === "false" 
                        ? 'Rejected' 
                        : task.submission ? 'Pending' : 'Not Started'}
                    </span>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 ml-2 hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
          )}
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
