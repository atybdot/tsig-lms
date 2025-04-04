import { TaskStatus } from './TaskStatus';

const TaskItem = ({ task , mentee }) => {
    const date = new Date(task.time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');

    console.log(`Year: ${year}, Month: ${month}, Day: ${day}`); // Output: Year: 2024, Month: 03, Day: 20

    // Formatted date string
    const formattedDate = `${year}-${month}-${day}`;
    console.log(formattedDate);
  return (
    <div className="p-4 border-b last:border-b-0 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
          <TaskStatus completed={task.status} submissionDate={formattedDate} />
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