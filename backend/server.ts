import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/config';
import './config/cloudinary'; // Initialize Cloudinary configuration

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Azaya Backend API is running!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Cloudinary config check endpoint
app.get('/config/cloudinary', (req, res) => {
  const isConfigured = !!(process.env.CLOUD_NAME && process.env.CLOUD_API_KEY && process.env.CLOUD_API_SEC);
  
  res.json({
    status: isConfigured ? 'configured' : 'not_configured',
    cloudName: process.env.CLOUD_NAME || 'not_set',
    hasApiKey: !!process.env.CLOUD_API_KEY,
    hasApiSecret: !!process.env.CLOUD_API_SEC,
    hasCloudinaryUrl: !!process.env.CLOUDINARY_URL,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
