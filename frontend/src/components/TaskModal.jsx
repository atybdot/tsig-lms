import { useState, useRef, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { 
  XMarkIcon, 
  DocumentArrowUpIcon, 
  LinkIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const TaskModal = ({ isOpen, task, onClose, handleTaskSubmit, user, isInternalModal = false }) => {
  const [file, setFile] = useState(null);
  const [link, setLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const cancelButtonRef = useRef(null);

  // Initialize link state from task if available
  useState(() => {
    if (task?.submission?.Links) {
      setLink(task.submission.Links);
    }
  }, [task]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const validateLink = (url) => {
    if (!url) return true; // Empty link is valid
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    if (link && !validateLink(link)) {
      setError("Please enter a valid URL");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await handleTaskSubmit(task._id, file, link);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to submit task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return null;
    
    const fileType = file.type.toLowerCase();
    
    if (fileType.includes('pdf')) {
      return <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-700">PDF</div>;
    } else if (fileType.includes('image')) {
      try {
        return <img src={URL.createObjectURL(file)} alt="Preview" className="h-8 w-8 object-cover rounded-lg border border-gray-200" />;
      } catch (e) {
        return <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">IMG</div>;
      }
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">DOC</div>;
    } else if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('csv')) {
      return <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">XLS</div>;
    } else {
      return <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700">FILE</div>;
    }
  };

  // Skip rendering Dialog if this is an internal modal (for nested usage)
  if (isInternalModal) {
    return (
      <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
          </div>
          <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
            <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
              {task?.title}
            </Dialog.Title>
            <div className="mt-2">
              <p className="text-sm text-gray-500 whitespace-pre-line">
                {task?.description}
              </p>
            </div>
            
            {/* Resources Section */}
            {task?.resources && Object.keys(task.resources).length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <LinkIcon className="h-4 w-4 text-gray-500" />
                  Resources
                </h4>
                <div className="mt-2 space-y-2">
                  {Object.entries(task.resources).map(([label, url], index) => (
                    <motion.div 
                      key={label}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-md bg-gray-50 p-2 flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                      <a 
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        Visit Link
                        <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                      </a>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Task Status */}
            {task?.status === true && (
              <motion.div 
                className="mt-4 flex items-center gap-2 rounded-md border border-green-100 bg-green-50 p-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <p className="text-sm font-medium text-green-700">This task has been completed!</p>
              </motion.div>
            )}

            {/* Show existing submission link if present */}
            {task?.submission?.Links && (
              <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-blue-700 flex items-center">
                    <LinkIcon className="mr-1.5 h-4 w-4" />
                    Submitted Link
                  </p>
                  <a
                    href={task.submission.Links}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md bg-white px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
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
            
            {/* File Upload Form */}
            {task?.status !== true && (
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Submission
                  </label>
                  <div 
                    className={`mt-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                      dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <DocumentArrowUpIcon className="h-10 w-10 text-gray-400" />
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input 
                            id="file-upload" 
                            name="file-upload" 
                            type="file" 
                            className="sr-only" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Supported formats: PDF, Word, Excel, PowerPoint, images, and text files
                      </p>
                    </div>
                  </div>

                  {file && (
                    <motion.div 
                      className="mt-2 flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {getFileIcon()}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setFile(null)} 
                        className="flex-shrink-0 text-gray-400 hover:text-gray-500"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Add link input field */}
                <div className="mb-4">
                  <label htmlFor="submission-link" className="block text-sm font-medium text-gray-700">
                    Add Link (Optional)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="url"
                      id="submission-link"
                      name="submission-link"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://github.com/your-repo or other project link"
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Add a link to your project repository, deployed app, or additional resources
                  </p>
                </div>

                {error && (
                  <motion.p 
                    className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {error}
                  </motion.p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        initialFocus={cancelButtonRef}
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                    ref={cancelButtonRef}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <DocumentTextIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                        {task?.title}
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 whitespace-pre-line">
                          {task?.description}
                        </p>
                      </div>
                      
                      {/* Resources Section */}
                      {task?.resources && Object.keys(task.resources).length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <LinkIcon className="h-4 w-4 text-gray-500" />
                            Resources
                          </h4>
                          <div className="mt-2 space-y-2">
                            {Object.entries(task.resources).map(([label, url], index) => (
                              <motion.div 
                                key={label}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="rounded-md bg-gray-50 p-2 flex items-center justify-between"
                              >
                                <span className="text-sm font-medium text-gray-700">{label}</span>
                                <a 
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                  Visit Link
                                  <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                                </a>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Task Status */}
                      {task?.status === true && (
                        <motion.div 
                          className="mt-4 flex items-center gap-2 rounded-md border border-green-100 bg-green-50 p-3"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          <p className="text-sm font-medium text-green-700">This task has been completed!</p>
                        </motion.div>
                      )}

                      {/* Show existing submission link if present */}
                      {task?.submission?.Links && (
                        <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-blue-700 flex items-center">
                              <LinkIcon className="mr-1.5 h-4 w-4" />
                              Submitted Link
                            </p>
                            <a
                              href={task.submission.Links}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-md bg-white px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
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
                      
                      {/* File Upload Form */}
                      {task?.status !== true && (
                        <form onSubmit={handleSubmit} className="mt-4">
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                              Upload Submission
                            </label>
                            <div 
                              className={`mt-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                                dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                              }`}
                              onDragEnter={handleDrag}
                              onDragLeave={handleDrag}
                              onDragOver={handleDrag}
                              onDrop={handleDrop}
                            >
                              <div className="flex flex-col items-center justify-center">
                                <DocumentArrowUpIcon className="h-10 w-10 text-gray-400" />
                                <div className="mt-2 flex items-center text-sm text-gray-600">
                                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500">
                                    <span>Upload a file</span>
                                    <input 
                                      id="file-upload" 
                                      name="file-upload" 
                                      type="file" 
                                      className="sr-only" 
                                      ref={fileInputRef}
                                      onChange={handleFileChange}
                                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                                    />
                                  </label>
                                  <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                  Supported formats: PDF, Word, Excel, PowerPoint, images, and text files
                                </p>
                              </div>
                            </div>

                            {file && (
                              <motion.div 
                                className="mt-2 flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-2"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                              >
                                {getFileIcon()}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => setFile(null)} 
                                  className="flex-shrink-0 text-gray-400 hover:text-gray-500"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              </motion.div>
                            )}
                          </div>

                          {/* Add link input field */}
                          <div className="mb-4">
                            <label htmlFor="submission-link" className="block text-sm font-medium text-gray-700">
                              Add Link (Optional)
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <GlobeAltIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              </div>
                              <input
                                type="url"
                                id="submission-link"
                                name="submission-link"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder="https://github.com/your-repo or other project link"
                                className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                              />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              Add a link to your project repository, deployed app, or additional resources
                            </p>
                          </div>

                          {error && (
                            <motion.p 
                              className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded-md"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              {error}
                            </motion.p>
                          )}
                        </form>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  {task?.status !== true && (
                    <button
                      type="button"
                      className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                        isSubmitting || !file ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
                      }`}
                      onClick={handleSubmit}
                      disabled={isSubmitting || !file}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        'Submit Task'
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    {task?.status === true ? 'Close' : 'Cancel'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default TaskModal;