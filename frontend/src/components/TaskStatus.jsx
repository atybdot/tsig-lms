import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { Badge } from "@tremor/react";

export const TaskStatus = ({ completed, submissionDate }) => {
  if (completed === 'true') {
    return (
      <motion.div 
        className="flex items-center gap-1.5"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.01 }}
      >
        <Badge color="emerald" size="sm">
          <div className="flex items-center gap-1.5">
            <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-700">Completed</span>
            {submissionDate && submissionDate !== 'Not submitted' && (
              <span className="text-xs text-gray-500">on {submissionDate}</span>
            )}
          </div>
        </Badge>
      </motion.div>
    );
  } else if (completed === 'pending') {
    return (
      <motion.div 
        className="flex items-center gap-1.5"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.01 }}
      >
        <Badge color="amber" size="sm">
          <div className="flex items-center gap-1.5">
            <ClockIcon className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium text-amber-700">Pending verification</span>
            {submissionDate && submissionDate !== 'Not submitted' && (
              <span className="text-xs text-gray-500">submitted {submissionDate}</span>
            )}
          </div>
        </Badge>
      </motion.div>
    );
  } else {
    return (
      <motion.div 
        className="flex items-center gap-1.5"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.01 }}
      >
        <Badge color="gray" size="sm">
          <div className="flex items-center gap-1.5">
            <XCircleIcon className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Not submitted</span>
            {submissionDate && submissionDate !== 'Not submitted' && (
              <span className="text-xs text-gray-500">{submissionDate}</span>
            )}
          </div>
        </Badge>
      </motion.div>
    );
  }
};