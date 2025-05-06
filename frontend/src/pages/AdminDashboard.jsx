import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { motion } from 'framer-motion';
import { Card, Title, Text, Tab, TabGroup, TabList, TabPanel, TabPanels, Metric, Badge } from '@tremor/react';
import { PlusIcon, UsersIcon, CalendarIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import CreateTaskModal from '../components/CreateTaskModal';
import MenteeAccordion from '../components/MenteeAccordion';
import StatsCards from '../components/StatsCards';
import AttendanceCalendar from '../components/AttendanceCalendar';

const AdminDashboard = () => {
  const [mentees, setMentees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    totalMentees: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });
  const [originalStats, setOriginalStats] = useState({
    totalMentees: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });
  const [isFiltered, setIsFiltered] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('adminData'));
  
  // Fetch mentee data
  const fetchMentees = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACK_URL}api/users`, {
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

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      setMentees(data);
      
      // Calculate statistics
      const totalTasks = data.reduce((acc, mentee) => {
        return acc + (mentee.taskAssign?.length || 0) + (mentee.taskDone?.length || 0);
      }, 0);
      
      const completedTasks = data.reduce((acc, mentee) => {
        return acc + (mentee.taskDone?.length || 0);
      }, 0);
      
      const calculatedStats = {
        totalMentees: data.length,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks
      };
      
      setStats(calculatedStats);
      setOriginalStats(calculatedStats); // Save original stats for reference
      
    } catch (err) {
      console.error('Error fetching mentees:', err);
      setError(err.message || 'Failed to fetch mentees');
      toast.error('Failed to fetch mentees');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceEvents = () => {
    // Implementation for attendance events
  };

  useEffect(() => {
    fetchMentees();
    fetchAttendanceEvents();
  }, []);

  const attendanceEvents = [];
  const handleAttendanceClick = (event) => {
    console.log('Attendance event clicked:', event);
  };

  const handleCreateTask = () => {
    setIsModalOpen(true);
  };
  
  const handleTaskCreated = () => {
    fetchMentees(); // Refresh data after task creation
    toast.success('Task created successfully!');
  };

  // Handle filtered mentees from MenteeAccordion
  const handleFilteredMentees = (filteredMentees) => {
    // Check if filtering is active
    const isCurrentlyFiltered = filteredMentees.length !== mentees.length;
    setIsFiltered(isCurrentlyFiltered);
    
    if (isCurrentlyFiltered) {
      // Calculate stats for filtered mentees
      const totalTasks = filteredMentees.reduce((acc, mentee) => {
        return acc + (mentee.taskAssign?.length || 0) + (mentee.taskDone?.length || 0);
      }, 0);
      
      const completedTasks = filteredMentees.reduce((acc, mentee) => {
        return acc + (mentee.taskDone?.length || 0);
      }, 0);
      
      setStats({
        totalMentees: filteredMentees.length,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks
      });
    } else {
      // Reset to original stats
      setStats(originalStats);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <Text>Loading dashboard...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto mt-8 max-w-2xl border-red-200 bg-red-50">
        <div className="flex items-center gap-3 text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <Title>Error</Title>
        </div>
        <Text className="mt-2">{error}</Text>
        <button 
          onClick={fetchMentees}
          className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" richColors />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <Text className="text-gray-500">Welcome back, {user.fullname}</Text>
          </div>
          <button
            onClick={handleCreateTask}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Task</span>
          </button>
        </div>

        {/* Stats Cards - Now with filtered indicator */}
        <StatsCards stats={stats} isFiltered={isFiltered} />

        {/* Tabs */}
        <TabGroup index={activeTab} onIndexChange={setActiveTab}>
          <TabList className="mb-6">
            <Tab icon={UsersIcon}>Mentees</Tab>
            <Tab icon={CalendarIcon}>Attendance</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              <Card className='rounded-lg'>
                <Title>Mentee Management</Title>
                <Text className="mt-1 text-gray-500">
                  View and manage tasks for each mentee
                </Text>
                
                {mentees.length === 0 ? (
                  <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-8">
                    <UsersIcon className="h-12 w-12 text-gray-400" />
                    <Text className="mt-2">No mentees found</Text>
                  </div>
                ) : (
                  <div className="mt-6">
                    <MenteeAccordion mentees={mentees} onFilterChange={handleFilteredMentees} />
                  </div>
                )}
              </Card>
            </TabPanel>
            
            <TabPanel>
              <Card>
                <Title>Attendance History</Title>
                <Text className="mt-1 text-gray-500">
                  Track mentee attendance over time
                </Text>
                
                <div className="mt-6 h-[500px]">
                  <AttendanceCalendar
                    events={attendanceEvents}
                    onEventClick={handleAttendanceClick}
                  />
                </div>
              </Card>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </motion.div>

      {/* Create Task Modal */}
      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        users={mentees} 
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};

export default AdminDashboard;