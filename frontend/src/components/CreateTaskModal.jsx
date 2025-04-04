import { useState } from 'react';

const CreateTaskModal = ({ isOpen, onClose, users }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState('');
  const [isGlobal, setIsGlobal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log(userId)
    try {
      const response = await fetch(`${import.meta.env.VITE_BACK_URL}api/tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, user_id: userId, isGlobal }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task');
      }

      alert('Task created successfully!');
      onClose(); // Close the modal
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold">Create New Task</h3>
        {error && <div className="text-red-500">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">User ID</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2"
              required
            >
              <option value="" disabled>Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.id} : {user.fullname}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isGlobal}
                onChange={(e) => setIsGlobal(e.target.checked)}
                className="mr-2"
              />
              Is Global
            </label>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal; 