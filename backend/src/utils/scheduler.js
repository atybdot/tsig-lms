import cron from 'node-cron';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import User from '../models/UserModel.js';
import { gfs } from '../controllers/TaskController.js'; // Import the gfs bucket directly

/**
 * Initialize all scheduled tasks
 */
export const initScheduler = () => {
  // Schedule DSA task update to run at midnight every day (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running midnight maintenance tasks:', new Date().toISOString());
    
    try {
      // Process DSA tasks
      await processDSATasks();
      
      // Clean up task files
      await cleanupTaskFiles(gfs);
      
      console.log('Midnight maintenance tasks completed successfully');
    } catch (error) {
      console.error('Error in midnight scheduler:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  console.log('Task scheduler initialized - Tasks will be processed at midnight');
};

/**
 * Process DSA tasks - creates new tasks and updates completed ones
 */
async function processDSATasks() {
  try {
    // Step 1: Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to process for DSA tasks`);
    
    // Step 2: Ensure each user has a DSA task
    let tasksCreated = 0;
    for (const user of users) {
      try {
        const task = await Task.findOrCreateDSATask(user.id);
        if (task && task.isNew) {
          tasksCreated++;
        }
      } catch (err) {
        console.error(`Error creating task for user ${user.id}:`, err);
      }
    }
    
    console.log(`Created ${tasksCreated} new DSA tasks for users without them`);
    
    // Step 3: Update completed tasks to next problems
    const updatedCount = await Task.updateCompletedDSATasks();
    console.log(`Updated ${updatedCount} completed DSA tasks to next problems`);
  } catch (error) {
    console.error('Error in DSA task processing:', error);
    throw error;
  }
}

/**
 * Clean up task files and reset task status
 * Deletes files associated with tasks and resets status after a certain period
 * @param {Object} gfs - GridFS bucket reference
 */
async function cleanupTaskFiles(gfs) {
  try {
    if (!gfs) {
      console.error('GridFS not initialized yet, skipping file cleanup');
      return;
    }

    console.log('Starting task file cleanup and status reset...');
    
    // Find all tasks with submissions (excluding DSA tasks)
    const tasks = await Task.find({
      'submission.fileId': { $exists: true },
      'title': { $ne: "Strivers A2Z DSA Course" }
    });
    
    console.log(`Found ${tasks.length} tasks with file submissions to process`);
    
    let deletedFiles = 0;
    let resetTasks = 0;
    
    for (const task of tasks) {
      try {
        // Check if submission is older than 2 days
        const submissionDate = new Date(task.submission.submittedAt);
        const daysSinceSubmission = Math.floor((Date.now() - submissionDate) / (1000 * 60 * 60 * 24));
        
        // For tasks with verified status (completed), delete files after 2 days
        if (task.status === true && daysSinceSubmission >= 2) {
          // Delete the file from GridFS
          if (task.submission && task.submission.fileId) {
            try {
              const fileId = new mongoose.Types.ObjectId(task.submission.fileId);
              await gfs.delete(fileId);
              console.log(`Deleted file ${fileId} for task ${task._id}`);
              deletedFiles++;
            } catch (fileError) {
              console.error(`Error deleting file for task ${task._id}:`, fileError);
            }
          }
          
          // Clear the submission data but keep the task
          task.submission = undefined;
          await task.save();
        }
        
        // For pending tasks that haven't been verified within 5 days, reset status
        if (task.status === 'pending' && daysSinceSubmission >= 5) {
          // Reset task status to null (not started)
          task.status = null;
          resetTasks++;
          await task.save();
          console.log(`Reset status for task ${task._id} that was pending for ${daysSinceSubmission} days`);
        }
      } catch (taskError) {
        console.error(`Error processing task ${task._id}:`, taskError);
      }
    }
    
    console.log(`Cleanup summary: Deleted ${deletedFiles} files, reset ${resetTasks} task statuses`);
  } catch (error) {
    console.error('Error in task file cleanup:', error);
    throw error;
  }
}