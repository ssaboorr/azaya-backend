import { v2 as cloudinary } from 'cloudinary';

const setupCloudinary = (): void => {
  try {
    // Use the working configuration
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME || 'dibzxgbun',
      api_key: process.env.CLOUD_API_KEY || '549747455999693',
      api_secret: process.env.CLOUD_API_SEC || process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    console.log('✅ Cloudinary configured successfully');
    console.log(`📸 Cloud Name: ${cloudinary.config().cloud_name}`);
   
  } catch (error) {
    console.error('❌ Cloudinary configuration error:', error);
  }
};

setupCloudinary();

export default cloudinary;

export { setupCloudinary };
