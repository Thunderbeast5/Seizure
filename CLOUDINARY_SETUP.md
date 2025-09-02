# Cloudinary Setup Guide

## Overview
The seizure diary now supports cloud video storage using Cloudinary. This allows recorded videos to be stored securely in the cloud and accessed from anywhere.

## Setup Instructions

### 1. Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. Note down your Cloud Name, API Key, and API Secret from the dashboard

### 2. Configure Upload Preset
1. In your Cloudinary dashboard, go to Settings > Upload
2. Create a new upload preset with these settings:
   - Preset name: `seizure_videos_preset`
   - Signing mode: `Unsigned` (for mobile app uploads)
   - Resource type: `Video`
   - Folder: `seizure-videos`
   - Quality: `auto:good`
   - Format: `auto`

### 3. Update Environment Variables
Update your `.env` file with your Cloudinary credentials:

```env
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
EXPO_PUBLIC_CLOUDINARY_API_KEY=your_actual_api_key
EXPO_PUBLIC_CLOUDINARY_API_SECRET=your_actual_api_secret
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=seizure_videos_preset
```

### 4. Security Considerations
- The current implementation uses unsigned uploads for simplicity
- For production, consider implementing signed uploads through a backend service
- API secrets should never be exposed in client-side code in production

## Features Implemented

### Video Recording & Upload
- Records video using device camera (max 5 minutes)
- Automatically uploads to Cloudinary after recording
- Shows upload progress with loading indicator
- Fallback to local storage if upload fails

### Video Storage
- Videos are organized by user ID in folders: `seizure-videos/{userId}/{timestamp}`
- Automatic quality optimization and format conversion
- Secure HTTPS URLs for video access

### Error Handling
- Permission requests for camera access
- Upload failure handling with local fallback
- User-friendly error messages

## Usage
1. Open seizure diary
2. Tap "Record Seizure Video" button
3. Record video using camera
4. Video automatically uploads to cloud storage
5. Cloud URL is saved with seizure entry

## File Structure
```
services/
├── cloudinaryService.ts     # Cloudinary upload/delete functions
config/
├── cloudinary.config.ts     # Configuration constants
```

## Next Steps
- Set up your Cloudinary account with the provided instructions
- Update the environment variables with your actual credentials
- Test video recording and upload functionality
