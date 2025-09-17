import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/config';
import cloudinary from './config/cloudinary'; // Initialize Cloudinary configuration
import { User, Document, Signature } from './models';
import { errorHandler, notFound } from './middleware/errorMiddlewares';
import userRoutes from './routes/userRoutes';

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
  
  // List all environment variables that might be cloudinary-related
  const envKeys = Object.keys(process.env).filter(key => 
    key.toLowerCase().includes('cloud') || key.toLowerCase().includes('cloudinary')
  );
  
  res.json({
    status: isConfigured ? 'configured' : 'not_configured',
    cloudName: process.env.CLOUD_NAME || 'not_set',
    hasApiKey: !!process.env.CLOUD_API_KEY,
    hasApiSecret: !!process.env.CLOUD_API_SEC,
    hasCloudinaryUrl: !!process.env.CLOUDINARY_URL,
    availableCloudinaryEnvVars: envKeys,
    cloudinaryConfig: cloudinary.config(),
    timestamp: new Date().toISOString()
  });
});

// Cloudinary test endpoint
// app.get('/test/cloudinary', async (req, res) => {
//   try {
//     console.log('🧪 Testing Cloudinary upload...');
    
//     // Create a fresh cloudinary instance for testing
//     const { v2: testCloudinary } = require('cloudinary');
    
//     // Configure with the exact values from your example
//     testCloudinary.config({
//       cloud_name: 'dibzxgbun',
//       api_key: '549747455999693',
//       api_secret: process.env.CLOUD_API_SEC || process.env.CLOUDINARY_API_SECRET,
//       secure: true,
//     });
    
//     console.log('Test config:', testCloudinary.config());
    
//     // Upload a test image from URL using the test instance
//     const uploadResult = await testCloudinary.uploader.upload(
//       'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg',
//       {
//         public_id: 'test_shoes_' + Date.now(),
//         folder: 'azaya_tests'
//       }
//     );

//     console.log('✅ Upload successful:', uploadResult.public_id);

//     // Generate optimized URL using the test instance
//     const optimizeUrl = testCloudinary.url(uploadResult.public_id, {
//       fetch_format: 'auto',
//       quality: 'auto'
//     });

//     // Generate auto-crop URL using the test instance
//     const autoCropUrl = testCloudinary.url(uploadResult.public_id, {
//       crop: 'auto',
//       gravity: 'auto',
//       width: 500,
//       height: 500,
//     });

//     res.json({
//       status: 'success',
//       message: 'Cloudinary test completed successfully',
//       results: {
//         upload: {
//           public_id: uploadResult.public_id,
//           secure_url: uploadResult.secure_url,
//           width: uploadResult.width,
//           height: uploadResult.height,
//           format: uploadResult.format,
//           bytes: uploadResult.bytes
//         },
//         transformations: {
//           optimized_url: optimizeUrl,
//           auto_crop_url: autoCropUrl
//         }
//       },
//       timestamp: new Date().toISOString()
//     });

//   } catch (error) {
//     console.error('❌ Cloudinary test failed:', error);
    
//     // Get more details about the error
//     let errorDetails = 'Unknown error';
//     if (error instanceof Error) {
//       errorDetails = error.message;
//     } else if (typeof error === 'object' && error !== null) {
//       errorDetails = JSON.stringify(error);
//     }
    
//     res.status(500).json({
//       status: 'error',
//       message: 'Cloudinary test failed',
//       error: errorDetails,
//       cloudinaryConfig: {
//         hasCloudName: !!cloudinary.config().cloud_name,
//         hasApiKey: !!cloudinary.config().api_key,
//         hasApiSecret: !!cloudinary.config().api_secret,
//       },
//       timestamp: new Date().toISOString()
//     });
//   }
// });

// Routes
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
