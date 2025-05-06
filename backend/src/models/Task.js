import mongoose from 'mongoose';
import strivers from '../../public/problems_with_ids.json' assert { type: 'json' };
import { type } from 'os';
import User from './UserModel.js';

const taskSchema = new mongoose.Schema({
  user_id: { type: String, required: true }, // Links to a User
  title: { type: String, required: true },
  description: { type: String },
  resources: { type: Map, of: String },
  isGlobal: { type: Boolean, default: false },
  problemId: { type: Number, default: 0 }, // For tracking the problem ID in a course
  status: { type: String, default: null }, // true for completed, false for incomplete, null for not started
  submission: {
    fileId: mongoose.Schema.Types.ObjectId,
    fileName: String,
    fileType: String,
    submittedBy: String,
    submittedAt: Date,
    Remarks: String,
    Links: String,
  }
}, { timestamps: true });

/**
 * Updates all completed DSA tasks to the next problem in the Strivers course
 * Finds all tasks with status=true and problemId > 0, then updates them to the next problem
 * @returns {Promise<Number>} Number of tasks updated
 */
taskSchema.statics.updateCompletedDSATasks = async function() {
  try {
    // Find all completed tasks with valid problemId
    const completedTasks = await this.find({
      status: true,
      problemId: { $gt: 0 },
      title: "Strivers A2Z DSA Course"
    });
    
    console.log(`Found ${completedTasks.length} completed DSA tasks to update`);
    
    let updatedCount = 0;
    
    // Process each task
    for (const task of completedTasks) {
      const currentProblemIndex = strivers.findIndex(problem => problem.id === task.problemId);
      
      // If problem found and not the last problem
      if (currentProblemIndex !== -1 && currentProblemIndex < strivers.length - 1) {
        // Get the next problem
        const nextProblem = strivers[currentProblemIndex + 1];
        
        // Create resource map with practice link if available
        const resourceMap = new Map();
        if (nextProblem.practice_links && nextProblem.practice_links.length > 0) {
          resourceMap.set('practice', nextProblem.practice_links[0].url);
        }
        if (nextProblem.resource_links && nextProblem.resource_links.length > 0) {
          resourceMap.set('resource', nextProblem.resource_links[0].url);
        }
        
        // Update the task with the next problem
        task.description = nextProblem.platform;
        task.problemId = nextProblem.id;
        task.resources = resourceMap;
        task.status = false; // Reset status to incomplete
        
        await task.save();
        updatedCount++;
        
        console.log(`Updated task ${task._id} to problem "${nextProblem.platform}" (ID: ${nextProblem.id})`);
      } else if (currentProblemIndex === strivers.length - 1) {
        // Handle case where user completed the last problem
        console.log(`User ${task.user_id} has completed all DSA problems!`);
      } else {
        console.log(`Could not find problem with ID ${task.problemId} in the strivers list`);
      }
    }
    
    console.log(`Successfully updated ${updatedCount} tasks`);
    return updatedCount;
    
  } catch (error) {
    console.error('Error updating completed DSA tasks:', error);
    throw error;
  }
};

/**
 * Find or create a DSA task for a specific user
 * @param {String} userId - User ID to create the task for
 * @returns {Promise<Object>} Created or found task
 */
taskSchema.statics.findOrCreateDSATask = async function(userId) {
  try {
    // Check if user already has a DSA task
    const existingTask = await this.findOne({ 
      user_id: userId, 
      title: "Strivers A2Z DSA Course" 
    });
    
    if (existingTask) {
      return existingTask;
    }
    
    // Create new task with the first problem
    const firstProblem = strivers[0];
    
    // Create resource map
    const resourceMap = new Map();
    if (firstProblem.practice_links && firstProblem.practice_links.length > 0) {
      resourceMap.set('practice', firstProblem.practice_links[0].url);
    }
    if (firstProblem.resource_links && firstProblem.resource_links.length > 0) {
      resourceMap.set('resource', firstProblem.resource_links[0].url);
    }
    
    const newTask = new this({
      user_id: userId,
      title: "Strivers A2Z DSA Course",
      description: firstProblem.platform,
      resources: resourceMap,
      problemId: firstProblem.id,
      status: false // Not completed yet
    });

    const user = await User.findOne({ id: userId });
    user.taskAssign.push(newTask.id); // Assuming taskAssign is an array of task IDs
    await user.save(); // Save the user with the new task assignment
    
    await newTask.save();
    console.log(`Created new DSA task for user ${userId}`);
    return newTask;
    
  } catch (error) {
    console.error(`Error finding/creating DSA task for user ${userId}:`, error);
    throw error;
  }
};

export default mongoose.model('Task', taskSchema);
