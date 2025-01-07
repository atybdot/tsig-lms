import { useState, useEffect } from 'react';
import { isAttendanceExpired } from '../utils/dateTime';

export function useAttendance({ mentee }) {
  const user = `attendance_${mentee.id}`;

  const [status, setStatus] = useState(() => {
    const saved = localStorage.getItem(user);
    if (saved) {
      const { status, lastMarked } = JSON.parse(saved);
      return isAttendanceExpired(lastMarked) ? null : status;
    }
    return null;
  });

  const [lastMarked, setLastMarked] = useState(() => {
    const saved = localStorage.getItem(user);
    if (saved) {
      const { lastMarked } = JSON.parse(saved);
      return isAttendanceExpired(lastMarked) ? null : new Date(lastMarked);
    }
    return null;
  });

  useEffect(() => {
    if (status && lastMarked) {
      localStorage.setItem(user, JSON.stringify({ status, lastMarked }));
    }
  }, [status, lastMarked, user]);

  const markAttendance = async (newStatus) => {
    const newDate = new Date();
    try {
        const response = await fetch(`https://cms-production-0677.up.railway.app/api/users/attendance/${mentee.id}`, {
            method: 'PATCH'
        });
        const data = await response.json();
        console.log(data);
        if (!response.ok) {
            throw new Error('Attendance error: Try again later');
        }
        setLastMarked(newDate);
        setStatus(newStatus);
    } catch (error) {
        console.log(error);
    }
    
  };

  const isDisabled = status && !isAttendanceExpired(lastMarked);

  return {
    status,
    lastMarked,
    markAttendance,
    isDisabled
  };
}