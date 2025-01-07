import { UserCheck, UserX } from 'lucide-react';
import { formatDateTime } from '../utils/dateTime';
import { useAttendance } from '../hooks/useAttendance';

export function AttendanceButton({ mentee }) {
  const { status, lastMarked, markAttendance, isDisabled } = useAttendance({ mentee });

  return (
    <div className="flex items-center gap-3 p-4 bg-white border-t">
      <div className="flex gap-2">
        <button
          onClick={() => markAttendance('present')}
          disabled={isDisabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            status === 'present'
              ? 'bg-green-600 text-white'
              : isDisabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          Present
        </button>

        <button
          onClick={() => markAttendance('absent')}
          disabled={isDisabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            status === 'absent'
              ? 'bg-red-600 text-white'
              : isDisabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          <UserX className="h-4 w-4" />
          Absent
        </button>
      </div>
      
      {lastMarked && (
        <span className="text-sm text-gray-500">
          Last marked: {formatDateTime(lastMarked)}
        </span>
      )}
    </div>
  );
}