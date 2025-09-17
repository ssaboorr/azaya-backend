import { v2 as cloudinary } from 'cloudinary';

const setupCloudinary = (): void => {
  try {
    // Configure Cloudinary with environment variables
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SEC,
      secure: true, // Use HTTPS URLs
    });

    if (process.env.CLOUDINARY_URL) {
      cloudinary.config({
        cloudinary_url: process.env.CLOUDINARY_URL,
      });
    }

    console.log('Cloudinary configured successfully');
   
  } catch (error) {
    console.error('❌ Cloudinary configuration error:', error);
  }
};

setupCloudinary();

export default cloudinary;

export { setupCloudinary };
