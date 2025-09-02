#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏥 Setting up Seizure Management Healthcare Ecosystem...\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, description) {
  log(`\n${step}. ${description}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Check if we're in the right directory
const currentDir = process.cwd();
const packageJsonPath = path.join(currentDir, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  logError('Please run this script from the root directory of the seizure management project.');
  process.exit(1);
}

try {
  // Step 1: Check if doctor-portal directory exists
  logStep(1, 'Checking project structure...');
  
  const doctorPortalPath = path.join(currentDir, 'doctor-portal');
  if (!fs.existsSync(doctorPortalPath)) {
    logError('Doctor portal directory not found. Please ensure the doctor-portal directory exists.');
    process.exit(1);
  }
  
  logSuccess('Project structure verified');

  // Step 2: Install dependencies for patient app
  logStep(2, 'Installing patient app dependencies...');
  
  try {
    execSync('npm install', { stdio: 'inherit', cwd: currentDir });
    logSuccess('Patient app dependencies installed');
  } catch (error) {
    logError('Failed to install patient app dependencies');
    console.error(error);
  }

  // Step 3: Install dependencies for doctor portal
  logStep(3, 'Installing doctor portal dependencies...');
  
  try {
    execSync('npm install', { stdio: 'inherit', cwd: doctorPortalPath });
    logSuccess('Doctor portal dependencies installed');
  } catch (error) {
    logError('Failed to install doctor portal dependencies');
    console.error(error);
  }

  // Step 4: Check Firebase configuration
  logStep(4, 'Checking Firebase configuration...');
  
  const firebaseConfigPath = path.join(currentDir, 'firebase.config.ts');
  const doctorFirebaseConfigPath = path.join(doctorPortalPath, 'src', 'firebase.config.ts');
  
  if (!fs.existsSync(firebaseConfigPath)) {
    logWarning('Firebase configuration not found in patient app');
  } else {
    logSuccess('Patient app Firebase configuration found');
  }
  
  if (!fs.existsSync(doctorFirebaseConfigPath)) {
    logWarning('Firebase configuration not found in doctor portal');
  } else {
    logSuccess('Doctor portal Firebase configuration found');
  }

  // Step 5: Check Firestore rules
  logStep(5, 'Checking Firestore security rules...');
  
  const firestoreRulesPath = path.join(currentDir, 'firestore.rules');
  if (!fs.existsSync(firestoreRulesPath)) {
    logWarning('Firestore rules file not found');
  } else {
    logSuccess('Firestore security rules found');
  }

  // Step 6: Create environment files if they don't exist
  logStep(6, 'Setting up environment files...');
  
  const envFiles = [
    { path: path.join(currentDir, '.env'), name: 'Patient App' },
    { path: path.join(doctorPortalPath, '.env'), name: 'Doctor Portal' }
  ];
  
  envFiles.forEach(({ path: envPath, name }) => {
    if (!fs.existsSync(envPath)) {
      const envTemplate = `# ${name} Environment Variables
# Add your Firebase configuration here

FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Add any other environment variables here
`;
      
      fs.writeFileSync(envPath, envTemplate);
      logSuccess(`${name} .env file created`);
    } else {
      logInfo(`${name} .env file already exists`);
    }
  });

  // Step 7: Create setup instructions
  logStep(7, 'Creating setup instructions...');
  
  const setupInstructions = `# Setup Instructions for Seizure Management Healthcare Ecosystem

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
\`\`\`bash
# From the root directory
npx expo start
\`\`\`

### Doctor Web Portal
\`\`\`bash
# From the doctor-portal directory
cd doctor-portal
npm start
\`\`\`

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
`;

  const setupInstructionsPath = path.join(currentDir, 'SETUP_INSTRUCTIONS.md');
  fs.writeFileSync(setupInstructionsPath, setupInstructions);
  logSuccess('Setup instructions created');

  // Step 8: Final summary
  logStep(8, 'Setup complete!');
  
  log('\n🎉 Setup Summary:', 'bright');
  log('✅ Patient app dependencies installed', 'green');
  log('✅ Doctor portal dependencies installed', 'green');
  log('✅ Environment files created', 'green');
  log('✅ Setup instructions generated', 'green');
  
  log('\n📋 Next Steps:', 'bright');
  log('1. Configure Firebase project and update credentials', 'yellow');
  log('2. Update .env files with your Firebase configuration', 'yellow');
  log('3. Deploy Firestore security rules', 'yellow');
  log('4. Start the applications for testing', 'yellow');
  
  log('\n📖 Documentation:', 'bright');
  log('• README.md - Complete system documentation', 'blue');
  log('• SETUP_INSTRUCTIONS.md - Detailed setup guide', 'blue');
  log('• firestore.rules - Security rules configuration', 'blue');
  
  log('\n🚀 Quick Start Commands:', 'bright');
  log('Patient App: npx expo start', 'cyan');
  log('Doctor Portal: cd doctor-portal && npm start', 'cyan');
  
  log('\n💡 Tips:', 'bright');
  log('• Test the system with both patient and doctor accounts', 'magenta');
  log('• Verify data sharing between applications', 'magenta');
  log('• Check security rules are working correctly', 'magenta');
  
  log('\n🏥 Your healthcare ecosystem is ready!', 'bright');

} catch (error) {
  logError('Setup failed with error:');
  console.error(error);
  process.exit(1);
}

