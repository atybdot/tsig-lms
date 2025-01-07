import Admin from '../models/Admin.js';
import Task from '../models/Task.js';
import User from '../models/UserModel.js';

const AdminController = {
  // Create a new admin
  create: async (req, res) => {
    try {
      const admin = new Admin(req.body);
      const savedAdmin = await admin.save();
      res.status(201).json(savedAdmin);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  signin: async (req, res) => {
    try {
      const { username, password } = req.body;

      console.log(username,password);

      if (!username || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'username and password is required' 
        });
      }

      const admin = await Admin.findOne({ id: password });

      if (admin.fullname != username || !admin) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }
      
      res.status(200).json(admin);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get all admins
  getAll: async (req, res) => {
    try {
      const admins = await Admin.find();
      res.json(admins);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get admin by ID
  getById: async (req, res) => {
    try {
      const { name, password } = req.body;
      const id = password.split('@')[1];
      console.log(id);
      const admin = await Admin.findOne({ id: req.params.id });
      if (!admin) return res.status(404).json({ message: 'Admin not found' });
      res.json(admin);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update admin
  update: async (req, res) => {
    try {
      const admin = await Admin.findOneAndUpdate(
        { id: req.params.id },
        req.body,
        { new: true }
      );
      if (!admin) return res.status(404).json({ message: 'Admin not found' });
      res.json(admin);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete admin
  delete: async (req, res) => {
    try {
      const admin = await Admin.findOneAndDelete({ id: req.params.id });
      if (!admin) return res.status(404).json({ message: 'Admin not found' });
      res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // New methods for task management
  createAndAssignTask: async (req, res) => {
    try {
      // Create new task
      const task = new Task({
        id: req.body.id || Date.now().toString(), // Generate an ID if not provided
        user_id: req.body.userId, // Required field from your schema
        title: req.body.title,
        description: req.body.description,
        resources: req.body.resources || new Map(), // Optional resources
        generated: req.body.generated,
        isGlobal: req.body.isGlobal || false,
        status: null, // null for not started as per your schema
        time: req.body.deadline || new Date(), // Required field
      });

      // Save the task
      const savedTask = await task.save();

      // Find user and update their taskAssign array
      const user = await User.findOne({ id: req.body.userId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Add task to user's taskAssign array
      user.taskAssign.push(savedTask._id);
      await user.save();

      res.status(201).json({
        message: 'Task created and assigned successfully',
        task: savedTask,
        assignedTo: user.username
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get all tasks created by an admin
  getAdminTasks: async (req, res) => {
    try {
      const tasks = await Task.find({ createdBy: req.params.adminId });
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update task status
  updateTaskStatus: async (req, res) => {
    try {
      const task = await Task.findByIdAndUpdate(
        req.params.taskId,
        { status: req.body.status },
        { new: true }
      );
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

export default AdminController; 