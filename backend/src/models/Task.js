import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user_id: { type: String, required: true }, // Links to a User
  title: { type: String, required: true },
  description: { type: String },
  resources: { type: Map, of: String }, // Resources as key-value pairs
  generated: { type: String },
  isGlobal: { type: Boolean, default: false },
  status: { type: Boolean, default: false }, // true for completed, false for incomplete, null for not started
  submission: {
    fileId: mongoose.Schema.Types.ObjectId,
    fileName: String,
    fileType: String,
    submittedBy: String,
    submittedAt: Date
  }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
