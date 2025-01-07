export function formatDateTime(date) {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  }
  
  export function isSameDay(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
  
  export function isAttendanceExpired(lastMarkedDate) {
    if (!lastMarkedDate) return true;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastMarked = new Date(lastMarkedDate);
    
    return !isSameDay(today, lastMarked);
  }