import { UserCheck, UserX } from 'lucide-react';
import { AttendanceToast } from './AttendanceToast';
import { useAttendance } from '../hooks/useAttendance';
import { useState } from 'react';

export function AttendanceButton({ mentee }) {
  const { status, lastMarked, markAttendance, isDisabled } = useAttendance({ mentee });
  const [showToast, setShowToast] = useState(false);

  const handleMarkAttendance = async (newStatus) => {
    await markAttendance(newStatus);
    setShowToast(true);
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-white border-t">
      <div className="flex gap-2">
        <button
          onClick={() => handleMarkAttendance('present')}
          // disabled={isDisabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            status === 'present'
              ? 'bg-green-600 text-white'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          Present
        </button>

        <button
          onClick={() => handleMarkAttendance('absent')}
          // disabled={isDisabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            status === 'absent'
              ? 'bg-red-600 text-white'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          <UserX className="h-4 w-4" />
          Absent
        </button>
      </div>
      
      {/* {lastMarked && (
        <span className="text-sm text-gray-500">
          Last marked: {formatDateTime(lastMarked)}
        </span>
      )} */}

      <AttendanceToast
        status={status}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

    </div>
  );
}