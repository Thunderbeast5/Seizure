# Seizure Management Healthcare Ecosystem

A comprehensive healthcare management system consisting of a **Patient Mobile App** (React Native) and a **Doctor Web Portal** (React + Tailwind CSS), both connected through Firebase for real-time data sharing and patient-doctor communication.

## 🏥 System Overview

This healthcare ecosystem provides:

- **Patient Mobile App**: Seizure tracking, medication management, and doctor communication
- **Doctor Web Portal**: Patient monitoring, analytics, and healthcare management
- **Real-time Data Sync**: Secure data sharing between patients and doctors
- **Patient-Doctor Assignment**: Direct relationship management

## 📱 Patient Mobile App (React Native + NativeWind)

### Features
- **Seizure Diary**: Log and track seizures with detailed information
- **Medication Reminder**: Manage medications and set reminders
- **Profile Management**: Comprehensive patient information
- **Doctor Connect**: Assign and communicate with doctors
- **Reports & Analytics**: View seizure patterns and statistics
- **SOS Emergency**: Quick emergency access
- **Education**: Educational content about epilepsy

### Tech Stack
- React Native with Expo
- TypeScript
- NativeWind (Tailwind CSS for React Native)
- Firebase (Authentication & Firestore)
- React Navigation

## 💻 Doctor Web Portal (React + Tailwind CSS)

### Features
- **Patient Dashboard**: View all assigned patients
- **Patient Analytics**: Seizure patterns and statistics
- **Real-time Monitoring**: Live patient data updates
- **Medical Records**: Access patient medical information
- **Communication Tools**: Patient-doctor messaging
- **Reports Generation**: Medical reports and analytics

### Tech Stack
- React with TypeScript
- Tailwind CSS
- Firebase (Authentication & Firestore)
- Recharts for data visualization
- React Router

## 🔐 Security & Privacy

### Data Protection
- **User-specific data isolation**: Each user can only access their own data
- **Doctor-patient relationships**: Secure data sharing based on assignments
- **Firebase Security Rules**: Comprehensive access control
- **Encrypted data transmission**: All data is encrypted in transit

### Authentication
- Firebase Authentication for both apps
- Role-based access (Patient vs Doctor)
- Secure session management

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (for mobile app)
- Firebase account

### Patient Mobile App Setup

1. **Navigate to the patient app directory:**
   ```bash
   cd /path/to/seizure-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Firebase:**
   - Update `firebase.config.ts` with your Firebase credentials
   - Set up Firestore security rules

4. **Start the development server:**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator:**
   - iOS: Press `i` in the terminal or scan QR code with Expo Go
   - Android: Press `a` in the terminal or scan QR code with Expo Go

### Doctor Web Portal Setup

1. **Navigate to the doctor portal directory:**
   ```bash
   cd doctor-portal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Firebase:**
   - Update `src/firebase.config.ts` with your Firebase credentials
   - Ensure Firestore security rules are configured

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Access the portal:**
   - Open [http://localhost:3000](http://localhost:3000) in your browser

## 📊 Database Structure

### Collections

#### Users
```typescript
{
  uid: string;
  email: string;
  name: string;
  username: string;
  age: number;
  gender: string;
  bloodGroup: string;
  seizureType: string;
  createdAt: timestamp;
}
```

#### Doctors
```typescript
{
  id: string;
  email: string;
  name: string;
  specialty: string;
  hospital: string;
  phone: string;
  licenseNumber: string;
  isActive: boolean;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

#### Profiles
```typescript
{
  userId: string;
  child: ChildInfo;
  diagnosis: DiagnosisInfo;
  caregivers: Caregiver[];
  emergencyContacts: EmergencyContact[];
  settings: ProfileSettings;
  doctorId?: string; // Links to assigned doctor
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

#### Seizures
```typescript
{
  id: string;
  userId: string;
  date: string;
  time: string;
  type: string;
  duration: string;
  triggers?: string;
  notes?: string;
  videoUrl?: string;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

#### Medications
```typescript
{
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string[];
  notes?: string;
  active: boolean;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

## 🔧 Configuration

### Firebase Setup

1. **Create a Firebase project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication and Firestore

2. **Configure Authentication:**
   - Enable Email/Password authentication
   - Set up security rules

3. **Configure Firestore:**
   - Create the database
   - Set up security rules (see `firestore.rules`)

4. **Update configuration files:**
   - Update `firebase.config.ts` in both apps
   - Add your Firebase project credentials

### Environment Variables

Create `.env` files for both apps with your Firebase configuration:

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## 📱 App Features

### Patient App Features

#### Seizure Diary
- Log seizures with detailed information
- Track seizure patterns and triggers
- View seizure history and analytics
- Export seizure reports

#### Medication Management
- Add and manage medications
- Set medication reminders
- Track medication adherence
- View medication history

#### Doctor Connect
- Browse available doctors
- Assign a doctor to your profile
- Communicate with your doctor
- Share medical data securely

#### Profile Management
- Complete patient information
- Medical history and diagnosis
- Caregiver information
- Emergency contacts

### Doctor Portal Features

#### Patient Dashboard
- View all assigned patients
- Patient overview and statistics
- Real-time patient data
- Quick patient access

#### Analytics & Reports
- Seizure pattern analysis
- Patient statistics
- Trend visualization
- Medical reports

#### Patient Management
- Access patient medical records
- View seizure history
- Monitor medication adherence
- Patient communication

## 🔒 Security Rules

The system uses comprehensive Firestore security rules to ensure data privacy:

```javascript
// Users can only access their own data
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

// Doctors can read profiles of their assigned patients
match /profiles/{profileId} {
  allow read, write: if request.auth != null && request.auth.uid == profileId;
  allow read: if request.auth != null && 
    exists(/databases/$(database)/documents/doctors/$(request.auth.uid)) &&
    resource.data.doctorId == request.auth.uid;
}
```

## 🚀 Deployment

### Patient App Deployment

1. **Build for production:**
   ```bash
   npx expo build:android  # For Android
   npx expo build:ios      # For iOS
   ```

2. **Submit to app stores:**
   - Follow Expo's deployment guide
   - Submit to Google Play Store and Apple App Store

### Doctor Portal Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Deploy to hosting:**
   - Firebase Hosting
   - Vercel
   - Netlify
   - AWS S3 + CloudFront

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- [ ] Video seizure recording
- [ ] AI-powered seizure detection
- [ ] Wearable device integration
- [ ] Advanced analytics
- [ ] Telemedicine features
- [ ] Family account management
- [ ] Multi-language support
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Emergency response integration

---

**Built with ❤️ for better healthcare management**
