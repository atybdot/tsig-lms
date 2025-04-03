import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';

const TaskModal = ({ task, onClose, handleTaskSubmit, isOpen, user }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.[0]) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'image/*': []},
    maxSize: 5242880, // 5MB
    multiple: false
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      await handleTaskSubmit(task._id, file);
      toast.success('Task submitted successfully');
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">{task.description}</p>
        </div>

        { task.submission && task.submission.submittedBy === user._id ? (
          <img 
            src={`http://localhost:5000/api/tasks/files/${task.submission.fileId}`}
            alt=''
          />
        ) : (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{file.name}</p>
              {file.type.startsWith('image/') && (
                <img 
                  src={URL.createObjectURL(file)} 
                  alt="Preview" 
                  className="max-h-32 mx-auto object-contain"
                />
              )}
            </div>
          ) : (
            <p>{isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}</p>
          )}
        </div>)}

        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || !file}
            className={`px-4 py-2 bg-blue-500 text-white rounded-lg
              ${(uploading || !file) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
          >
            {uploading ? 'Submitting...' : 'Submit Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;