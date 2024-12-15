import User from '../models/UserModel.js';

const UserController = {
  // Create a new user
  create: async (req, res) => {
    try {
      const user = new User(req.body);
      const savedUser = await user.save();
      res.status(201).json(savedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get all users
  getAll: async (req, res) => {
    try {
      const users = await User.find()
        .populate('taskDone')
        .populate('taskAssign');
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get user by ID
  getById: async (req, res) => {
    try {
      const user = await User.findOne({ id: req.params.id })
        .populate('taskDone')
        .populate('taskAssign');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get users by mentor
  getByMentor: async (req, res) => {
    try {
      const users = await User.find({ mentor: req.params.mentorId })
        .populate('taskDone')
        .populate('taskAssign');
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update user
  update: async (req, res) => {
    try {
      const user = await User.findOneAndUpdate(
        { id: req.params.id },
        req.body,
        { new: true }
      ).populate('taskDone').populate('taskAssign');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete user
  delete: async (req, res) => {
    try {
      const user = await User.findOneAndDelete({ id: req.params.id });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get one user by fullname
  getOneUser: async (req, res) => {
    try {
      const { fullname } = req.body;
      
      if (!fullname) {
        return res.status(400).json({ 
          success: false,
          message: 'Fullname is required' 
        });
      }

      const user = await User.findOne({ fullname })
        .populate('taskDone')
        .populate('taskAssign');

      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      res.json({
        success: true,
        user: {
          _id: user._id,
          id: user.id,
          fullname: user.fullname,
          domain: user.domain,
          taskDone: user.taskDone,
          taskAssign: user.taskAssign
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },
};

export default UserController; 