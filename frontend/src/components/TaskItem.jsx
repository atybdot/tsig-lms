import { useState, Fragment, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-toastify';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  TrashIcon, 
  CheckIcon, 
  DocumentIcon, 
  ArrowTopRightOnSquareIcon,
  LinkIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { TaskStatus } from './TaskStatus';

const TaskItem = ({ task: initialTask, mentee, onTaskVerified, onTaskDeleted, isAdmin = false }) => {
  const [task, setTask] = useState(initialTask);
  const [imageError, setImageError] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);
  const cancelButtonRef = useRef(null);
  
  useEffect(() => {
    setTask(initialTask);
  }, [initialTask]);
  
  const formatSubmissionDate = (submissionData) => {
    if (!submissionData || !submissionData.submittedAt) {
      return 'Not submitted';
    }
    
    const date = new Date(submissionData.submittedAt);
    
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', submissionData.submittedAt);
      return 'Invalid date';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${day}-${month}-${year}`;
  };

  const isImageFile = (fileType) => {
    return fileType && fileType.startsWith('image/');
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
          <span className="font-bold text-red-700">PDF</span>
        </div>
      );
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
          <span className="font-bold text-green-700">XLS</span>
        </div>
      );
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
          <span className="font-bold text-blue-700">DOC</span>
        </div>
      );
    } else {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <DocumentIcon className="h-6 w-6 text-gray-600" />
        </div>
      );
    }
  };

  const formattedSubmissionDate = formatSubmissionDate(task.submission);
  
  const handleVerify = async () => {
    try {
      setVerifying(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_BACK_URL}api/admin/tasks/${task._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: "true" })
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify task');
      }
      
      setTask(prevTask => ({
        ...prevTask,
        status: "true"
      }));
      
      toast.success('Task verified successfully!');
      
      if (onTaskVerified) {
        onTaskVerified(task._id);
      }
      
    } catch (err) {
      console.error('Error verifying task:', err);
      setError('Failed to verify task. Please try again.');
      toast.error('Failed to verify task');
    } finally {
      setVerifying(false);
    }
  };

  const initiateDelete = () => {
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_BACK_URL}api/tasks/${task._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      toast.success('Task deleted successfully!');
      
      if (onTaskDeleted) {
        onTaskDeleted(task._id);
      }
      
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
      toast.error('Failed to delete task');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const toggleImageZoom = () => {
    setImageZoomed(!imageZoomed);
  };

  return (
    <>
      <motion.div 
        className="group relative rounded-lg border border-gray-200 bg-white p-3 sm:p-4 shadow-sm transition-all hover:shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Responsive header layout */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-1 flex-grow min-w-0">
            <h3 className="font-medium text-gray-900 break-words">{task.title}</h3>
            <TaskStatus completed={task.status} submissionDate={formattedSubmissionDate} />
            
            {/* Resource links with improved wrapping */}
            {task.resources && Object.keys(task.resources).length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-500">Resources:</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {Object.entries(task.resources).map(([label, url]) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                    >
                      {label}
                      <ArrowTopRightOnSquareIcon className="ml-1 h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Action buttons with responsive layout */}
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            {/* View Task button */}
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <EyeIcon className="h-3.5 w-3.5" />
              <span>View Task</span>
            </button>

            {task.submission && task.status !== "true" && (
              <button
                onClick={handleVerify}
                disabled={verifying || deleting}
                className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium ${
                  verifying 
                    ? 'bg-gray-100 text-gray-500' 
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                } transition-colors`}
              >
                {verifying ? (
                  <>
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Verifying</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-3.5 w-3.5" />
                    <span>Verify</span>
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={initiateDelete}
              disabled={deleting || verifying}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium ${
                deleting 
                  ? 'bg-gray-100 text-gray-500' 
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              } transition-colors`}
            >
              <TrashIcon className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
        
        {error && (
          <motion.div 
            className="mt-2 rounded-md bg-red-50 p-2 text-xs text-red-700"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}
        
        {task.submission && (
          <div className="mt-3 sm:mt-4 rounded-md border border-gray-100 bg-gray-50 p-3">
            {/* Responsive submission header */}
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-0">
              <p className="text-xs font-medium text-gray-500">
                Submitted by: {mentee?.fullname || task.submission.submittedBy}
              </p>
              <p className="text-xs text-gray-500">{formattedSubmissionDate}</p>
            </div>
            
            {/* Responsive submission summary */}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {task.submission.fileId && (
                <div className="flex items-center gap-2">
                  <DocumentIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-700">File submitted</span>
                </div>
              )}
              
              {task.submission.Links && (
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-gray-700">Link included</span>
                </div>
              )}
              
              <button
                onClick={() => setShowTaskModal(true)}
                className="ml-auto text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                View details
              </button>
            </div>
          </div>
        )}
        
        {!task.submission && (
          <div className="mt-3 sm:mt-4 flex items-center gap-2 rounded-md bg-amber-50 p-3 text-amber-700">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm">No submission yet</span>
          </div>
        )}
      </motion.div>

      {/* Improved Task View Modal */}
      <Transition.Root show={showTaskModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => {
          setShowTaskModal(false);
          setImageZoomed(false);
        }} initialFocus={cancelButtonRef}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-2 sm:p-4 text-center sm:items-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-[95%] sm:max-w-lg">
                  <div className="absolute right-0 top-0 pr-3 pt-3 z-10">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={() => {
                        setShowTaskModal(false);
                        setImageZoomed(false);
                      }}
                      ref={cancelButtonRef}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  
                  <div className="bg-white px-3 py-4 sm:p-6">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                        <DocumentIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title as="h3" className="text-base sm:text-lg font-semibold leading-6 text-gray-900">
                          {task.title}
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 whitespace-pre-line">
                            {task.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Resources section - improved for mobile */}
                    {task.resources && Object.keys(task.resources).length > 0 && (
                      <div className="mt-5 border-t border-gray-200 pt-3 sm:pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Resources</h4>
                        <div className="space-y-2 rounded-md bg-gray-50 p-3">
                          {Object.entries(task.resources).map(([label, url], idx) => (
                            <div key={idx} className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 rounded-md bg-white p-2 shadow-sm">
                              <span className="text-sm font-medium text-gray-700 break-words">{label}</span>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap"
                              >
                                View Link
                                <ArrowTopRightOnSquareIcon className="ml-1 h-3 w-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submission section - improved for mobile */}
                    {task.submission && (
                      <div className="mt-5 border-t border-gray-200 pt-3 sm:pt-4">
                        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-0 mb-3">
                          <h4 className="text-sm font-medium text-gray-700">Submission Details</h4>
                          <p className="text-xs text-gray-500">
                            Submitted: {formattedSubmissionDate}
                          </p>
                        </div>

                        {/* Link submission - improved for mobile */}
                        {task.submission.Links && (
                          <div className="mb-4 rounded-md border border-blue-100 bg-blue-50 p-3">
                            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0 mb-1">
                              <p className="text-sm font-medium text-blue-700 flex items-center">
                                <LinkIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                                Submitted Link
                              </p>
                              <a
                                href={task.submission.Links}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-md bg-white px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 whitespace-nowrap"
                              >
                                Open Link
                                <ArrowTopRightOnSquareIcon className="ml-1 inline-block h-3 w-3" />
                              </a>
                            </div>
                            <a
                              href={task.submission.Links}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-blue-600 hover:underline break-all"
                            >
                              {task.submission.Links}
                            </a>
                          </div>
                        )}

                        {/* File submission - improved for mobile */}
                        {task.submission.fileId && (
                          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                {getFileIcon(task.submission.fileType || '')}
                                <div className="min-w-0 flex-shrink">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {task.submission.fileName || 'Submitted file'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {task.submission.fileType}
                                  </p>
                                </div>
                              </div>
                              <a
                                href={`${import.meta.env.VITE_BACK_URL}api/tasks/files/${task.submission.fileId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                              >
                                Download
                                <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </a>
                            </div>

                            {/* Image preview with zoom capability - improved for mobile */}
                            {isImageFile(task.submission.fileType) && !imageError && (
                              <div className={`relative overflow-hidden rounded-md bg-white p-1 ${imageZoomed ? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90' : ''}`}>
                                <div className={`${imageZoomed ? 'max-h-[90vh] max-w-[90vw] relative' : 'max-h-60'}`}>
                                  <img
                                    src={`${import.meta.env.VITE_BACK_URL}api/tasks/files/${task.submission.fileId}`}
                                    alt="Submission preview"
                                    className={`mx-auto object-contain ${imageZoomed ? 'max-h-[85vh] max-w-full' : 'max-h-60 w-full cursor-zoom-in'}`}
                                    onClick={toggleImageZoom}
                                    onError={() => setImageError(true)}
                                  />
                                  {imageZoomed && (
                                    <button
                                      className="absolute right-2 top-2 rounded-full bg-white bg-opacity-75 p-1.5 text-gray-800 hover:bg-opacity-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleImageZoom();
                                      }}
                                    >
                                      <XMarkIcon className="h-6 w-6" />
                                    </button>
                                  )}
                                </div>
                                {!imageZoomed && (
                                  <div className="mt-1 flex items-center justify-center">
                                    <span className="text-xs text-gray-500">Click image to enlarge</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 px-3 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    {task.submission && task.status === 'pending' && (
                      <button
                        type="button"
                        className="w-full sm:w-auto sm:ml-3 mb-2 sm:mb-0 inline-flex justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                        onClick={() => {
                          handleVerify();
                          setShowTaskModal(false);
                        }}
                        disabled={verifying}
                      >
                        {verifying ? 'Verifying...' : 'Verify Task'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="w-full sm:w-auto inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      onClick={() => {
                        setShowTaskModal(false);
                        setImageZoomed(false);
                      }}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Delete Confirmation Dialog - improved for mobile */}
      <Transition.Root show={showDeleteConfirm} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={cancelDelete}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all w-full max-w-[95%] sm:max-w-lg sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <XCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        Delete Task
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete "{task.title}"? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto"
                      onClick={cancelDelete}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:w-auto ${
                        deleting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500'
                      }`}
                      onClick={confirmDelete}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default TaskItem;