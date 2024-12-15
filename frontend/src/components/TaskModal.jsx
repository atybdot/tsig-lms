import { useState } from 'react';

const TaskModal = ({ task, onClose, onSubmit, isOpen }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await onSubmit(task._id);
      onClose();
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="mt-1 text-gray-900">{task.description}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Deadline</p>
            <p className="mt-1 text-gray-900">
              {new Date(task.time).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs
              ${task.status === true 
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
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || task.status === true}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal; 