import { CheckCircle, XCircle, X } from 'lucide-react';
import { useEffect } from 'react';

export function AttendanceToast({ status, isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible || !status) return null;

  const isPresent = status === 'present';

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-3 max-w-sm animate-slide-in ${
        isPresent ? 'bg-green-50' : 'bg-red-50'
      }`}
    >
      {isPresent ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500" />
      )}
      <div className="flex-1">
        <p className={`font-medium ${isPresent ? 'text-green-800' : 'text-red-800'}`}>
          Attendance Marked
        </p>
        <p className={`text-sm ${isPresent ? 'text-green-600' : 'text-red-600'}`}>
          You have been marked as {status} for today
        </p>
      </div>
      <button
        onClick={onClose}
        className={`p-1 rounded-full hover:bg-opacity-10 ${
          isPresent ? 'hover:bg-green-900' : 'hover:bg-red-900'
        }`}
      >
        <X className={`h-4 w-4 ${isPresent ? 'text-green-500' : 'text-red-500'}`} />
      </button>
    </div>
  );
}