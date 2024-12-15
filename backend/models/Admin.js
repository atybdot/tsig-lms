import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  id: { type: String, required: true },
  fullname: { type: String, required: true },
  domain: { type: String, required: true },
});

export default mongoose.model('Admin', adminSchema);
