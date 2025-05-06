import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, UserIcon, PencilSquareIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import TaskItem from "./TaskItem";
import { AttendanceButton } from "./AttendanceButton";

const MenteeAcc = ({ mentee, index, highlightDomain = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState({
    assigned: [],
    completed: []
  });
  const [activeTab, setActiveTab] = useState('assigned');

  // Initialize tasks from mentee props
  useEffect(() => {
    setTasks({
      assigned: mentee.taskAssign || [],
      completed: mentee.taskDone || []
    });
  }, [mentee]);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };
  
  // Handle task verification
  const handleTaskVerified = async (taskId) => {
    // Update local state
    setTasks(prev => {
      const verifiedTask = prev.assigned.find(task => task._id === taskId);
      
      return {
        assigned: prev.assigned.filter(task => task._id !== taskId),
        completed: verifiedTask ? [...prev.completed, {...verifiedTask, status: true}] : prev.completed
      };
    });
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(currentTasks => ({
      assigned: currentTasks.assigned.filter(task => task._id !== taskId),
      completed: currentTasks.completed.filter(task => task._id !== taskId)
    }));
  };

  return (
    <motion.div 
      className={`mb-4 overflow-hidden rounded-lg border ${
        highlightDomain ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
      } shadow-sm transition-colors duration-200`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={toggleAccordion}
        className={`flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50 ${
          highlightDomain ? 'bg-blue-50' : 'bg-white'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
            highlightDomain ? 'bg-blue-200 text-blue-800' : 'bg-blue-100 text-blue-700'
          }`}>
            <UserIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{mentee.fullname}</h3>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">ID: {mentee.id}</p>
              <span className="h-1 w-1 rounded-full bg-gray-300"></span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                highlightDomain 
                  ? 'bg-blue-200 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {mentee.domain}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {tasks.assigned.length} Assigned
            </span>
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              {tasks.completed.length} Completed
            </span>
          </div>
          <ChevronDownIcon 
            className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-t border-gray-200 bg-gray-50">
              <div className="flex items-center border-b border-gray-200">
                <button
                  className={`flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium ${
                    activeTab === 'assigned'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('assigned')}
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  Assigned Tasks ({tasks.assigned.length})
                </button>
                <button
                  className={`flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium ${
                    activeTab === 'completed'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('completed')}
                >
                  <ClipboardDocumentCheckIcon className="h-4 w-4" />
                  Completed Tasks ({tasks.completed.length})
                </button>
              </div>
              
              <div className="p-4">
                {activeTab === 'assigned' && (
                  <>
                    {tasks.assigned && tasks.assigned.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {tasks.assigned.map((task) => (
                          <TaskItem 
                            key={task._id || task.id} 
                            task={task} 
                            mentee={mentee}
                            onTaskVerified={handleTaskVerified}
                            onTaskDeleted={handleTaskDeleted}
                            isAdmin={true}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center">
                        <PencilSquareIcon className="mb-2 h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-500">No tasks assigned to this mentee.</p>
                      </div>
                    )}
                  </>
                )}
                
                {activeTab === 'completed' && (
                  <>
                    {tasks.completed && tasks.completed.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {tasks.completed.map((task) => (
                          <TaskItem 
                            key={task._id || task.id}
                            task={task} 
                            mentee={mentee}
                            onTaskVerified={handleTaskVerified}
                            onTaskDeleted={handleTaskDeleted}
                            isAdmin={true}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center">
                        <ClipboardDocumentCheckIcon className="mb-2 h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-500">No tasks have been completed yet.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="border-t border-gray-200 bg-white p-4">
                <AttendanceButton mentee={mentee} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MenteeAcc;
