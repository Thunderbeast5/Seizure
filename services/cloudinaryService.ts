import { CLOUDINARY_CONFIG } from '../config/cloudinary.config';

export interface VideoUploadResult {
  publicId: string;
  secureUrl: string;
  duration?: number;
  format: string;
  resourceType: string;
}

export class CloudinaryService {
  static async uploadVideo(videoUri: string, userId: string): Promise<VideoUploadResult> {
    try {
      // Generate a unique public ID for the video
      const timestamp = Date.now();
      const publicId = `seizure-videos/${userId}/${timestamp}`;

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', {
        uri: videoUri,
        type: 'video/mp4',
        name: `seizure_video_${timestamp}.mp4`,
      } as any);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('public_id', publicId);
      formData.append('resource_type', 'video');
      formData.append('folder', 'seizure-videos');
      formData.append('quality', 'auto:good');

      // Upload to Cloudinary
      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/video/upload`;
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const result = await response.json();

      return {
        publicId: result.public_id,
        secureUrl: result.secure_url,
        duration: result.duration,
        format: result.format,
        resourceType: result.resource_type,
      };
    } catch (error) {
      console.error('Error uploading video to Cloudinary:', error);
      throw new Error('Failed to upload video to cloud storage');
    }
  }

  static async deleteVideo(publicId: string): Promise<boolean> {
    try {
      // For deletion, we need to use the admin API with authentication
      // This should ideally be done through a backend service for security
      const deleteUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/video/destroy`;
      
      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
      formData.append('timestamp', Math.round(Date.now() / 1000).toString());
      
      // Note: In production, signature should be generated on backend
      const response = await fetch(deleteUrl, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      return result.result === 'ok';
    } catch (error) {
      console.error('Error deleting video from Cloudinary:', error);
      return false;
    }
  }

  static getOptimizedVideoUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    quality?: string;
  }): string {
    const { width = 640, height = 480, quality = 'auto:good' } = options || {};
    
    // Build Cloudinary URL manually
    const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/video/upload`;
    const transformations = `w_${width},h_${height},c_limit,q_${quality},f_auto`;
    
    return `${baseUrl}/${transformations}/${publicId}`;
  }
}

export default CloudinaryService;
