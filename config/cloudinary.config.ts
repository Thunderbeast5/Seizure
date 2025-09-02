// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  apiKey: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || 'your-api-key',
  apiSecret: process.env.EXPO_PUBLIC_CLOUDINARY_API_SECRET || 'your-api-secret',
  uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'seizure-videos',
};

// Upload configuration
export const VIDEO_UPLOAD_CONFIG = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxDuration: 300, // 5 minutes
  allowedFormats: ['mp4', 'mov', 'avi', 'mkv'],
  quality: 'auto:good',
  transformation: {
    width: 640,
    height: 480,
    crop: 'limit',
  },
};
