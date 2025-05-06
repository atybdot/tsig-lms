import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Set up the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

const AttendanceCalendar = ({ 
  events = [], 
  height = 600, 
  onEventClick = null,
  views = ['month'],
  defaultView = 'month'
}) => {
  // Custom event styling based on attendance status
  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: event.resource === 'present' ? '#10B981' : '#EF4444',
      color: 'white',
      borderRadius: '5px',
      border: 'none',
      display: 'block',
      opacity: 0.8
    };
    return { style };
  };

  // Generate dummy attendance data if no events are provided
//   const generateDummyAttendance = () => {
//     const dummyEvents = [];
//     const today = new Date();
//     const threeMonthsAgo = new Date();
//     threeMonthsAgo.setMonth(today.getMonth() - 3);
    
//     let currentDate = new Date(threeMonthsAgo);
    
//     while (currentDate <= today) {
//       // Only include weekdays (1-5 are Mon-Fri)
//       const day = currentDate.getDay();
//       if (day >= 1 && day <= 5) {
//         // Random attendance (90% present, 10% absent)
//         const isPresent = Math.random() > 0.1;
        
//         dummyEvents.push({
//           title: isPresent ? 'Present' : 'Absent',
//           start: new Date(currentDate),
//           end: new Date(currentDate),
//           allDay: true,
//           resource: isPresent ? 'present' : 'absent'
//         });
//       }
      
//       // Move to next day
//       const nextDate = new Date(currentDate);
//       nextDate.setDate(currentDate.getDate() + 1);
//       currentDate = nextDate;
//     }
    
//     return dummyEvents;
//   };

  // Use provided events or generate dummy data
  
  // Calculate attendance rate
  const presentCount = events.filter(event => event.title === 'present').length;
  const attendanceRate = events.length > 0 
    ? Math.round((presentCount / events.length) * 100) 
    : 0;

  return (
    <div className="attendance-calendar">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex space-x-6">
          <div className="flex items-center">
            <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm">Present</span>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 rounded-full bg-red-500 mr-2"></div>
            <span className="text-sm">Absent</span>
          </div>
        </div>
        <div className="text-sm font-medium">
          Attendance Rate: {attendanceRate}%
        </div>
      </div>
      
      <div style={{ height: height }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventStyleGetter}
          views={views}
          defaultView={defaultView}
          toolbar={true}
          onSelectEvent={onEventClick}
        />
      </div>
    </div>
  );
};

export default AttendanceCalendar;