import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import routes from './routes/index.js';

// Load environment variables first
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173','http://192.168.29.41:5173','https://tsig.onrender.com',"https://cms-frontend-one-delta.vercel.app"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// API Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Separate database connection function
const connectDB = async () => {
  try {
    // It's good practice to reuse the connection in serverless
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    console.log('MongoDB connected successfully');
    
    // initScheduler(); // NOTE: This should be configured as a Vercel Cron Job.
    
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Connect to the database when the function initializes.
connectDB();

// Export the app for Vercel
export default app;
