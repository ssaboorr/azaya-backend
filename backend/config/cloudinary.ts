import { v2 as cloudinary } from 'cloudinary';



const setupCloudinary = (): void => {
  try {
    console.log('🔧 Setting up Cloudinary...');
    console.log('Environment variables:', {
      CLOUDINARY_URL: !!process.env.CLOUDINARY_URL,
      CLOUD_NAME: 'dibzxgbun',
      CLOUD_API_KEY: '549747455999693',
      CLOUD_API_SEC: !!process.env.CLOUD_API_SEC,
      CLOUDINARY_API_SECRET: !!process.env.CLOUD_API_SEC
    });

    // Check if CLOUDINARY_URL is available (preferred method)
    if (process.env.CLOUDINARY_URL) {
      console.log('Using CLOUDINARY_URL method...');
      cloudinary.config(process.env.CLOUDINARY_URL);
      console.log('✅ Cloudinary configured using CLOUDINARY_URL');
    } else {
      // Fallback to individual environment variables
      console.log('Using individual variables method...');
      const apiSecret = process.env.CLOUD_API_SEC || process.env.CLOUDINARY_API_SECRET || 'Z5J6c7IfvygCQabChouIiIaFrBs';
      
      if (!apiSecret) {
        console.error('❌ Cloudinary API secret not found in environment variables');
        console.error('Please set CLOUD_API_SEC or CLOUDINARY_URL environment variable');
        return; // Don't throw error, just return
      }
      
      const config = {
        cloud_name: process.env.CLOUD_NAME || 'dibzxgbun',
        api_key: process.env.CLOUD_API_KEY || '549747455999693',
        api_secret: apiSecret,
        secure: true,
      };
      
      console.log('Config object:', {
        cloud_name: config.cloud_name,
        api_key: config.api_key,
        api_secret: '***' + apiSecret.slice(-4), // Show last 4 chars for debugging
        secure: config.secure
      });
      
      cloudinary.config(config);
      console.log('✅ Cloudinary configured using individual variables');
    }

    // Verify configuration
    const config = cloudinary.config();
    console.log('Final Cloudinary config:', {
      cloud_name: config.cloud_name,
      api_key: config.api_key,
      api_secret: config.api_secret ? '***' + config.api_secret.slice(-4) : 'NOT_SET',
      secure: config.secure
    });
    
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      console.warn('⚠️  Cloudinary configuration incomplete - some credentials missing');
    } else {
      console.log(`📸 Cloud Name: ${config.cloud_name}`);
    }
   
  } catch (error) {
    console.error('❌ Cloudinary configuration error:', error);
  }
};

setupCloudinary();

export default cloudinary;

export { setupCloudinary };
