import { Card, Text, Metric, Badge } from '@tremor/react';
import { UsersIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const StatsCards = ({ stats, isFiltered = false }) => {
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <motion.div
        key={`mentees-${stats.totalMentees}`}
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`rounded-lg ${isFiltered ? 'ring-2 ring-blue-100' : ''}`} decoration="top" decorationColor="blue">
          <div className="flex items-center justify-between">
            <Text>Total Mentees</Text>
            <UsersIcon className="h-6 w-6 text-blue-500" />
          </div>
          <Metric className="mt-2">{stats.totalMentees}</Metric>
          {isFiltered && (
            <Text className="text-xs text-blue-600 mt-1">
              Filtered results
            </Text>
          )}
        </Card>
      </motion.div>
      
      <motion.div
        key={`tasks-${stats.totalTasks}`}
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`rounded-lg ${isFiltered ? 'ring-2 ring-green-100' : ''}`} decoration="top" decorationColor="green">
          <div className="flex items-center justify-between">
            <Text>Total Tasks</Text>
            <ChartBarIcon className="h-6 w-6 text-green-500" />
          </div>
          <Metric className="mt-2">{stats.totalTasks}</Metric>
          {isFiltered && (
            <Text className="text-xs text-green-600 mt-1">
              Filtered results
            </Text>
          )}
        </Card>
      </motion.div>
      
      <motion.div
        key={`completed-${stats.completedTasks}`}
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`rounded-lg ${isFiltered ? 'ring-2 ring-emerald-100' : ''}`} decoration="top" decorationColor="emerald">
          <div className="flex items-center justify-between">
            <Text>Completed</Text>
            <Badge className='ring-0 text-white rounded-md' color="emerald">{Math.round((stats.completedTasks / stats.totalTasks || 0) * 100)}%</Badge>
          </div>
          <Metric className="mt-2">{stats.completedTasks}</Metric>
          {isFiltered && (
            <Text className="text-xs text-emerald-600 mt-1">
              Filtered results
            </Text>
          )}
        </Card>
      </motion.div>
      
      <motion.div
        key={`pending-${stats.pendingTasks}`}
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`rounded-lg ${isFiltered ? 'ring-2 ring-amber-100' : ''}`} decoration="top" decorationColor="amber">
          <div className="flex items-center justify-between">
            <Text>Pending Tasks</Text>
            <Badge className="ring-0 rounded-md text-white" color="amber">{stats.pendingTasks}</Badge>
          </div>
          <Metric className="mt-2">{stats.pendingTasks}</Metric>
          {isFiltered && (
            <Text className="text-xs text-amber-600 mt-1">
              Filtered results
            </Text>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default StatsCards;