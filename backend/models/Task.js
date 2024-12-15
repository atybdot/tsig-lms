import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  user_id: { type: String, required: true }, // Links to a User
  title: { type: String, required: true },
  description: { type: String },
  resources: { type: Map, of: String }, // Resources as key-value pairs
  generated: { type: String },
  isGlobal: { type: Boolean, default: false },
  status: { type: Boolean, default: null }, // true for completed, false for incomplete, null for not started
  time: { type: Date, required: true },
});

export default mongoose.model('Task', taskSchema);
