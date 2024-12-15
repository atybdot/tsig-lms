import CompletedTask from '../models/CompletedTask.js';

const CompletedTaskController = {
  // Create a new completed task
  create: async (req, res) => {
    try {
      const completedTask = new CompletedTask(req.body);
      const savedTask = await completedTask.save();
      res.status(201).json(savedTask);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get all completed tasks
  getAll: async (req, res) => {
    try {
      const completedTasks = await CompletedTask.find();
      res.json(completedTasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get completed tasks by user ID
  getByUserId: async (req, res) => {
    try {
      const tasks = await CompletedTask.find({ user_id: req.params.userId });
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get completed task by ID
  getById: async (req, res) => {
    try {
      const task = await CompletedTask.findOne({ id: req.params.id });
      if (!task) return res.status(404).json({ message: 'Completed task not found' });
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update completed task
  update: async (req, res) => {
    try {
      const task = await CompletedTask.findOneAndUpdate(
        { id: req.params.id },
        req.body,
        { new: true }
      );
      if (!task) return res.status(404).json({ message: 'Completed task not found' });
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete completed task
  delete: async (req, res) => {
    try {
      const task = await CompletedTask.findOneAndDelete({ id: req.params.id });
      if (!task) return res.status(404).json({ message: 'Completed task not found' });
      res.json({ message: 'Completed task deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export default CompletedTaskController; 