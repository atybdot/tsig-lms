import { useState } from "react";
import TaskItem from "./TaskItem";
import { AttendanceButton } from "./AttendanceButton";

const MenteeAcc = ({ mentee, index }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    // console.log("toggled", index, openIndex);
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mb-2">
      <button
        onClick={() => toggleAccordion(index)}
        className="w-full text-left rounded-lg bg-gray-100 p-4 hover:bg-gray-200 flex justify-between items-center"
      >
        <span>{mentee.fullname}</span>
        <span
          className={`transform transition-transform ${
            openIndex === index ? "rotate-180" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 9l6 6 6-6"
            />
          </svg>
        </span>
      </button>
      {openIndex === index && (
        <div className="bg-gray-50 border-t">
          {mentee.taskAssign && mentee.taskAssign.length > 0 ? (
            mentee.taskAssign.map((task) => (
              <TaskItem key={task.id} task={task} mentee={mentee} />
            ))
          ) : (
            <div>No tasks assigned.</div>
          )}
          {mentee.taskDone && mentee.taskDone.length > 0 ? (
            mentee.taskDone.map((task) => (
              <TaskItem key={task.id} task={task} mentee={mentee} />
            ))
          ) : (
            <div>No tasks completed.</div>
          )}
          <AttendanceButton mentee={mentee} />
        </div>
      )}
    </div>
  );
};

export default MenteeAcc;
