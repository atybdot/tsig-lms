import Task from '../models/Task.js';
import User from '../models/UserModel.js';

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
    try {
      const { userId, taskId } = req.body;

      // Find the user
      const user = await User.findOne({ id: userId });
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found',
          userId 
        });
      }

      // Update task status using MongoDB's _id
      const task = await Task.findByIdAndUpdate(
        taskId,
        { status: true },
        { new: true }
      );
      if (!task) {
        return res.status(404).json({ 
          message: 'Task not found',
          taskId 
        });
      }

      // Add task to taskDone array if not already present
      if (!user.taskDone.includes(taskId)) {
        user.taskDone.push(taskId);
        await user.save();
      }

      res.json({ 
        success: true,
        message: 'Task submitted successfully', 
        task 
      });
    } catch (error) {
      console.error('Task submission error:', error);
      res.status(500).json({ 
        success: false,
        message: error
      });
    }
  }
};

export default TaskController; 