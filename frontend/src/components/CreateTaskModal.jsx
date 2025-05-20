import { useState, Fragment, useRef, useEffect } from 'react';
import { Dialog, Transition, Switch, Combobox } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  PlusIcon, 
  XMarkIcon, 
  LinkIcon, 
  DocumentTextIcon,
  UserIcon,
  GlobeAltIcon,
  ChevronUpDownIcon,
  CheckIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const FormField = ({ label, children, required = false }) => (
  <div className="space-y-1">
    <label className="flex items-center text-sm font-medium text-gray-700">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const CreateTaskModal = ({ isOpen, onClose, users, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState('');
  const [isGlobal, setIsGlobal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([
    { label: '', url: '' }
  ]);
  const [menteeQuery, setMenteeQuery] = useState('');

  const cancelButtonRef = useRef(null);
  const titleInputRef = useRef(null);

  // Focus title input when modal opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Filter mentees based on search query
  const filteredMentees = menteeQuery === ''
    ? users
    : users.filter((user) => {
        return user.fullname.toLowerCase().includes(menteeQuery.toLowerCase()) ||
               (user.id && user.id.toString().includes(menteeQuery));
      });

  const handleAddResource = () => {
    setResources([...resources, { label: '', url: '' }]);
  };

  const handleRemoveResource = (index) => {
    const updatedResources = [...resources];
    updatedResources.splice(index, 1);
    setResources(updatedResources);
  };

  const handleResourceChange = (index, field, value) => {
    const updatedResources = [...resources];
    updatedResources[index][field] = value;
    setResources(updatedResources);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setUserId('');
    setIsGlobal(false);
    setResources([{ label: '', url: '' }]);
    setMenteeQuery('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Filter out empty resource entries
    const filteredResources = resources.filter(
      resource => resource.label.trim() !== '' && resource.url.trim() !== ''
    );

    // Convert resources array to Map format for MongoDB
    const resourceMap = {};
    filteredResources.forEach(resource => {
      resourceMap[resource.label] = resource.url;
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_BACK_URL}api/tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title, 
          description, 
          user_id: userId, 
          isGlobal,
          resources: resourceMap
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task');
      }

      toast.success('Task created successfully!');
      resetForm();
      onClose(); // Close the modal
      
      // Notify parent component
      if (onTaskCreated) {
        onTaskCreated();
      }
      
    } catch (err) {
      console.error('Error creating task:', err);
      toast.error(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const selectedMentee = users.find(user => user.id === userId);

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
          <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity" />
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Create New Task
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Fill in the details below to create a new task for a mentee.
                      </p>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                  <FormField label="Task Title" required>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <input
                        type="text"
                        id="title"
                        ref={titleInputRef}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        placeholder="Enter task title"
                        required
                      />
                    </div>
                  </FormField>
                  
                  <FormField label="Description" required>
                    <div className="mt-1">
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="outline-none block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pl-3"
                        placeholder="Describe the task in detail..."
                        required
                      />
                    </div>
                  </FormField>
                  
                  <FormField label="Assign To" required>
                    <Combobox as="div" value={userId} onChange={setUserId} className="relative mt-1">
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <Combobox.Input
                          className="block w-full rounded-md border-gray-300 py-2 pl-10 pr-10 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                          onChange={(e) => setMenteeQuery(e.target.value)}
                          displayValue={(userId) => {
                            const user = users.find(user => user.id === userId);
                            return user ? user.fullname : '';
                          }}
                          placeholder="Search by name or ID..."
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </Combobox.Button>
                      </div>
                      
                      {filteredMentees.length > 0 && (
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {filteredMentees.map((user) => (
                            <Combobox.Option
                              key={user.id}
                              value={user.id}
                              className={({ active }) =>
                                classNames(
                                  'relative cursor-default select-none py-2 pl-3 pr-9',
                                  active ? 'bg-blue-600 text-white' : 'text-gray-900'
                                )
                              }
                            >
                              {({ active, selected }) => (
                                <>
                                  <div className="flex items-center">
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-800">
                                      {user.fullname.charAt(0)}
                                    </span>
                                    <span className={classNames('ml-3 truncate', selected && 'font-semibold')}>
                                      {user.fullname}
                                      <span className="ml-2 text-xs text-gray-500">
                                        ID: {user.id}
                                      </span>
                                    </span>
                                  </div>
                                  
                                  {selected && (
                                    <span
                                      className={classNames(
                                        'absolute inset-y-0 right-0 flex items-center pr-4',
                                        active ? 'text-white' : 'text-blue-600'
                                      )}
                                    >
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  )}
                                </>
                              )}
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      )}
                      
                      {filteredMentees.length === 0 && menteeQuery !== '' && (
                        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-4 px-3 text-center shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          <p className="text-gray-500">No mentees found matching "{menteeQuery}"</p>
                        </div>
                      )}
                    </Combobox>
                    
                    {userId && selectedMentee && (
                      <div className="mt-2 flex items-center justify-between rounded-md bg-blue-50 px-3 py-2 text-sm">
                        <div className="flex items-center">
                          <UserIcon className="mr-2 h-4 w-4 text-blue-500" />
                          <span className="font-medium text-blue-700">{selectedMentee.fullname}</span>
                        </div>
                        <span className="text-xs text-blue-600">
                          {selectedMentee.domain ? `Domain: ${selectedMentee.domain}` : ''}
                        </span>
                      </div>
                    )}
                  </FormField>
                  
                  {/* Resource Links Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Resource Links</h4>
                      <button 
                        type="button" 
                        onClick={handleAddResource}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                      >
                        <PlusIcon className="h-3 w-3" />
                        Add Resource
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {resources.map((resource, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="relative rounded-md border border-gray-200 bg-gray-50 p-3"
                        >
                          <div className="space-y-3">
                            <div>
                              <label htmlFor={`resource-label-${index}`} className="block text-xs font-medium text-gray-700">
                                Resource Label
                              </label>
                              <input
                                type="text"
                                id={`resource-label-${index}`}
                                value={resource.label}
                                onChange={(e) => handleResourceChange(index, 'label', e.target.value)}
                                placeholder="e.g., Documentation"
                                className="mt-1 block w-full rounded-md border-gray-300 py-1.5 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor={`resource-url-${index}`} className="block text-xs font-medium text-gray-700">
                                URL
                              </label>
                              <div className="relative mt-1 rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                  <LinkIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                  type="url"
                                  id={`resource-url-${index}`}
                                  value={resource.url}
                                  onChange={(e) => handleResourceChange(index, 'url', e.target.value)}
                                  placeholder="https://..."
                                  className="block w-full rounded-md border-gray-300 py-1.5 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {resources.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => handleRemoveResource(index)}
                              className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-gray-400 shadow-sm hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  
                  {/* <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center">
                      <Switch
                        checked={isGlobal}
                        onChange={setIsGlobal}
                        className={classNames(
                          isGlobal ? 'bg-blue-600' : 'bg-gray-200',
                          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={classNames(
                            isGlobal ? 'translate-x-5' : 'translate-x-0',
                            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                          )}
                        />
                      </Switch>
                      <div className="ml-3 flex items-center">
                        <GlobeAltIcon className={`mr-1.5 h-4 w-4 ${isGlobal ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium text-gray-900">
                          Make this a global task
                        </span>
                      </div>
                    </div>
                  </div> */}
                  
                  <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={onClose}
                      ref={cancelButtonRef}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        loading 
                          ? 'bg-blue-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg className="mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Task...
                        </>
                      ) : (
                        'Create Task'
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CreateTaskModal;