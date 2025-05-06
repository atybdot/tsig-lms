import Task from '../models/Task.js';
import User from '../models/UserModel.js';
import multer from 'multer';
import mongoose from 'mongoose';
import { promises as fs } from 'fs';
import path from 'path';
import { Readable } from 'stream';
import strivers from '../../public/problems_with_ids.json' assert { type: 'json' };
import { create } from 'domain';

// Set up GridFS
export let gfs; // Export the gfs variable
const conn = mongoose.connection;
conn.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
  console.log('GridFS connection established');
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
}).single('file');

const TaskController = {
  // Create a new task
  create: async (req, res) => {
    try {
      const { user_id } = req.body;
      const task = new Task(req.body);
      const savedTask = await task.save();
      const user = await User.findOne({ id: user_id });
      console.log(user);
      user.taskAssign.push(savedTask.id);
      await user.save();
      res.status(201).json(savedTask);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get all tasks
  getAll: async (req, res) => {
    try {
      const tasks = await Task.find();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get tasks by user ID
  getByUserId: async (req, res) => {
    try {
      const tasks = await Task.find({ user_id: req.params.userId });
      console.log("tasks api", tasks);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get global tasks
  getGlobalTasks: async (req, res) => {
    try {
      const tasks = await Task.find({ isGlobal: true });
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get task by ID
  getById: async (req, res) => {
    try {
      const task = await Task.findOne({ id: req.params.id });
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update task
  update: async (req, res) => {
    try {
      const task = await Task.findOneAndUpdate(
        { id: req.params.id },
        req.body,
        { new: true }
      );
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete task
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Find the task first to get user reference
      const task = await Task.findById(id);
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      // Remove the task from user's taskAssign and taskDone arrays
      try {
        if (task.user_id) {
          await User.updateOne(
            { id: task.user_id },
            {
              $pull: {
                taskAssign: task._id,
                taskDone: task._id
              }
            }
          );
          console.log(`Removed task references from user ${task.user_id}`);
        }
      } catch (userError) {
        console.error('Error updating user references:', userError);
        // Continue with task deletion even if user update fails
      }
      
      // Delete any associated submission file if exists
      if (task.submission && task.submission.fileId) {
        try {
          const fileId = new mongoose.Types.ObjectId(task.submission.fileId);
          await gfs.delete(fileId);
          console.log(`Deleted submission file: ${fileId}`);
        } catch (fileError) {
          console.error('Error deleting submission file:', fileError);
          // Continue with task deletion even if file deletion fails
        }
      }
      
      // Delete the task
      await Task.findByIdAndDelete(id);
      
      res.json({ 
        message: 'Task deleted successfully',
        taskId: id
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ message: error.message });
    }
  },

  deleteAll: async (req, res) => {
    try {
      // Optional: Add authentication/authorization check here
      const result = await Task.deleteMany({});
      res.json({ 
        message: 'All tasks deleted successfully', 
        deletedCount: result.deletedCount 
      });
    } catch (error) {
      console.error('Error deleting tasks:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Submit task
  submitTask: async (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      try {
        console.log('req.file:', req.file);
        console.log('req.body:', req.body);

        const { userId, taskId, Links, description } = req.body;
        
        if (!req.file) {
          return res.status(400).json({ message: "No file was uploaded" });
        }
        
        // Check if task exists
        const task = await Task.findOne({ _id: taskId });
        if (!task) {
          return res.status(404).json({ message: 'Task not found' });
        }

        // Create a unique filename
        const uniqueFilename = `${Date.now()}-${req.file.originalname}`;
        
        // Create a readable stream from buffer
        const readableStream = new Readable();
        readableStream.push(req.file.buffer);
        readableStream.push(null); // Indicate end of file
        
        // Create a GridFS upload stream
        const uploadStream = gfs.openUploadStream(uniqueFilename, {
          contentType: req.file.mimetype,
          metadata: {
            userId: userId,
            taskId: taskId,
            originalName: req.file.originalname
          }
        });
        
        // Wait for the file to be uploaded to GridFS
        await new Promise((resolve, reject) => {
          readableStream.pipe(uploadStream)
            .on('error', reject)
            .on('finish', resolve);
        });

        const user = await User.findOne({ _id: userId });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        user.taskDone.push(taskId); 
        user.taskAssign = user.taskAssign.filter(taskId => taskId !== taskId); // Remove from assigned tasks
        await user.save(); // Save the user with the updated taskDone array

        // Store the file reference in the task
        task.submission = {
          fileId: uploadStream.id, // Store GridFS file ID
          fileName: req.file.originalname,
          fileType: req.file.mimetype,
          submittedBy: userId,
          submittedAt: new Date(),
          Links: Links || null,
        };
        task.status = "pending"; // Mark task as completed
        // Save the updated task
        await task.save();
        
        return res.json({
          message: 'Task submission successful',
          taskId,
          fileId: uploadStream.id,
          fileName: req.file.originalname
        });
      } catch (error) {
        console.error('Error in submitTask:', error);
        return res.status(500).json({ message: error.message });
      }
    });
  },

  // Get task submission file
  getSubmissionFile: async (req, res) => {
    try {
      const { taskId } = req.params;
      
      // Find the task to get the fileId
      const task = await Task.findOne({ id: taskId });
      
      if (!task || !task.submission || !task.submission.fileId) {
        return res.status(404).json({ message: 'No submission found for this task' });
      }
      
      const fileId = new mongoose.Types.ObjectId(task.submission.fileId);
      
      // Check if file exists in GridFS
      const files = await gfs.find({ _id: fileId }).toArray();
      if (!files || files.length === 0) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      // Set the proper content type
      res.set('Content-Type', task.submission.fileType);
      res.set('Content-Disposition', `attachment; filename="${task.submission.fileName}"`);
      
      // Create a readable stream and pipe it to the response
      const downloadStream = gfs.openDownloadStream(fileId);
      downloadStream.pipe(res);
      
    } catch (error) {
      console.error('Error retrieving submission:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Get file by ID
  getFileById: async (req, res) => {
    try {
      const { fileId } = req.params;
      
      const objectId = new mongoose.Types.ObjectId(fileId);
      
      // Check if file exists in GridFS
      const files = await gfs.find({ _id: objectId }).toArray();
      if (!files || files.length === 0) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      // Set proper content type
      res.set('Content-Type', files[0].contentType);
      res.set('Content-Disposition', 'inline');
      
      // Stream the file to the response
      const downloadStream = gfs.openDownloadStream(objectId);
      downloadStream.pipe(res);
      
    } catch (error) {
      console.error('Error retrieving file:', error);
      res.status(500).json({ message: error.message });
    }
  },
  // Add this function to your TaskController object
deleteAllFiles: async (req, res) => {
  try {
    // Security checks - you might want to limit this to admin users only
    // For example: if (!req.user.isAdmin) return res.status(403).json({ message: 'Unauthorized' });

    // Check if GridFS is initialized
    if (!gfs) {
      return res.status(500).json({ message: 'GridFS not initialized' });
    }

    // Get all files to count them
    const files = await gfs.find({}).toArray();
    const fileCount = files.length;

    if (fileCount === 0) {
      return res.status(200).json({ 
        message: 'No files to delete', 
        deletedCount: 0 
      });
    }

    // Create an array of promises for deletion
    const deletionPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        gfs.delete(file._id)
          .then(() => resolve(file._id))
          .catch(err => reject(err));
      });
    });

    // Wait for all deletions to complete
    const results = await Promise.allSettled(deletionPromises);
    
    // Count successful and failed deletions
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`File deletion complete. Success: ${successful}, Failed: ${failed}`);

    // Optional: Update tasks to remove file references
    await Task.updateMany(
      { 'submission.fileId': { $exists: true } },
      { $unset: { 'submission.fileId': '' } }
    );

    return res.status(200).json({
      message: 'File deletion complete',
      totalFiles: fileCount,
      deletedCount: successful,
      failedCount: failed
    });
  } catch (error) {
    console.error('Error deleting files:', error);
    return res.status(500).json({ 
      message: 'Error deleting files', 
      error: error.message 
    });
  }
}};

export default TaskController;