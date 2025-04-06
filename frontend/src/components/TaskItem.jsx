import { TaskStatus } from './TaskStatus';

const TaskItem = ({ task , mentee }) => {
  const formatSubmissionDate = (submissionData) => {
    if (!submissionData || !submissionData.submittedAt) {
      return 'Not submitted';
    }
    
    // Try to parse the date
    const date = new Date(submissionData.submittedAt);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', submissionData.submittedAt);
      return 'Invalid date';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${day}-${month}-${year}`;
  };

  // Get the formatted submission date
  const formattedSubmissionDate = formatSubmissionDate(task.submission);
  return (
    <div className="p-4 border-b last:border-b-0 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
          <TaskStatus completed={task.status} submissionDate={formattedSubmissionDate} />
        </div>
      </div>
      <span>
        {task.submission && mentee._id === task.submission.submittedBy ? (
          <img src={`https://tsiglms-production.up.railway.app/api/tasks/files/${task.submission.fileId}`} alt="" />
        ) : (
          <span className="text-gray-500">No submission</span>
        )}
      </span>
    </div>
  );
}

export default TaskItem;