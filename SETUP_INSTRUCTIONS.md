# Setup Instructions for Seizure Management Healthcare Ecosystem

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (for mobile app)
- Firebase account

## Firebase Setup

1. **Create a Firebase project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication and Firestore

2. **Configure Authentication:**
   - Enable Email/Password authentication
   - Set up security rules

3. **Configure Firestore:**
   - Create the database
   - Set up security rules (see firestore.rules)

4. **Update configuration files:**
   - Update firebase.config.ts in both apps
   - Add your Firebase project credentials to .env files

## Running the Applications

### Patient Mobile App
```bash
# From the root directory
npx expo start
```

### Doctor Web Portal
```bash
# From the doctor-portal directory
cd doctor-portal
npm start
```

## Testing the System

1. **Register a doctor account** in the web portal
2. **Register a patient account** in the mobile app
3. **Assign the doctor to the patient** through the mobile app
4. **Test data sharing** between the applications

## Security Notes

- Ensure Firestore security rules are properly configured
- Test authentication flows
- Verify data isolation between users
- Check doctor-patient relationship permissions

## Troubleshooting

- If you encounter Firebase connection issues, check your API keys
- For mobile app issues, ensure Expo CLI is installed
- For web portal issues, check if all dependencies are installed
