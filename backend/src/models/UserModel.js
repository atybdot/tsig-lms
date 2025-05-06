import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  fullname: { type: String, required: true },
  domain: { type: String, required: true },
  mentor: { type: String }, // Could reference an Admin or User (depending on design)
  password: {
    type: String,
    required: true
  },
  // attendance: {
  //   type: Map,
  //   of: Number,
  //   default: {}  // Default empty map when user is created
  // },
  taskDone: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    default: []  // Default empty array when user is created
  },
  taskAssign: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    default: []  // Default empty array when user is created
  },
});

export default mongoose.model('User', userSchema);
