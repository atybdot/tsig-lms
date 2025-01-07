import { CheckCircle, Clock, Calendar } from 'lucide-react';

export function TaskStatus({ completed, submissionDate }) {
  return (
    <div className="flex items-center space-x-4 text-sm text-gray-600">
      <div className="flex items-center">
        <Calendar className="h-4 w-4 mr-1" />
        <span>{submissionDate}</span>
      </div>
      <div className="flex items-center">
        {completed ? (
          <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
        ) : (
          <Clock className="h-4 w-4 mr-1 text-yellow-500" />
        )}
        <span>{completed ? 'Completed' : 'Pending'}</span>
      </div>
    </div>
  );
}