import mongoose from 'mongoose';

const completedTaskSchema = new mongoose.Schema({
  id: { type: String, required: true }, // Links to a Task
  user_id: { type: String, required: true }, // Links to a User
  details: { type: String },
  source: { type: String }, // URL for additional details
});

export default mongoose.model('CompletedTask', completedTaskSchema);
