import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  fullname: { type: String, required: true },
  domain: { type: String, required: true },
  mentor: { type: String }, // Could reference an Admin or User (depending on design)
  taskDone: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    default: []  // Default empty array when user is created
  },
  taskAssign: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    default: []  // Default empty array when user is created
  }
});

export default mongoose.model('User', userSchema);
