import Task from '../models/Task.js';
import User from '../models/UserModel.js';
import multer from 'multer';
import mongoose from 'mongoose';
import { promises as fs } from 'fs';
import path from 'path';
import { Readable } from 'stream';

// Set up GridFS
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
  console.log('GridFS connection established');
});

const upload = multer().single('file');

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
      const task = await Task.findOneAndDelete({ id: req.params.id });
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
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

        const { userId, taskId } = req.body;
        
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
          submittedAt: new Date()
        };
        task.status = true; // Mark task as completed
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
  }
};

export default TaskController;