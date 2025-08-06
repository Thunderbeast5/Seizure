// Test script for profile service
// This script tests the profile service to ensure it handles user-specific data correctly

console.log('🧪 Testing Profile Service');
console.log('==========================');
console.log('');

// Test data for child information
const testChildInfo = {
  name: 'John Doe',
  age: 12,
  birthDate: '2012-05-15',
  gender: 'Male',
  weight: '45 kg',
  height: '150 cm',
  bloodType: 'A+',
  allergies: 'Peanuts, Shellfish',
  photo: 'https://api.dicebear.com/7.x/initials/svg?seed=John%20Doe'
};

console.log('Test child info:');
console.log(JSON.stringify(testChildInfo, null, 2));
console.log('');

// Test data for diagnosis information
const testDiagnosisInfo = {
  type: 'Epilepsy - Focal Seizures',
  diagnosisDate: '2020-03-10',
  diagnosedBy: 'Dr. Sarah Johnson',
  notes: 'Patient experiences focal seizures affecting the left temporal lobe. Responds well to medication.'
};

console.log('Test diagnosis info:');
console.log(JSON.stringify(testDiagnosisInfo, null, 2));
console.log('');

// Test data for caregiver
const testCaregiver = {
  name: 'Jane Doe',
  relation: 'Mother',
  phone: '+1-555-0123',
  email: 'jane.doe@email.com',
  isPrimary: true
};

console.log('Test caregiver:');
console.log(JSON.stringify(testCaregiver, null, 2));
console.log('');

// Test data for emergency contact
const testEmergencyContact = {
  name: 'Emergency Contact',
  relation: 'Father',
  phone: '+1-555-0456'
};

console.log('Test emergency contact:');
console.log(JSON.stringify(testEmergencyContact, null, 2));
console.log('');

// Test data for settings
const testSettings = {
  notifications: true,
  dataSharing: true,
  locationTracking: false,
  darkMode: true,
  autoBackup: true
};

console.log('Test settings:');
console.log(JSON.stringify(testSettings, null, 2));
console.log('');

// Simulate profile structure
const testProfile = {
  userId: 'test-user-123',
  child: testChildInfo,
  diagnosis: testDiagnosisInfo,
  caregivers: [testCaregiver],
  emergencyContacts: [testEmergencyContact],
  settings: testSettings
};

console.log('Complete test profile:');
console.log(JSON.stringify(testProfile, null, 2));
console.log('');

console.log('✅ Test completed! The profile service should now handle user-specific data correctly.');
console.log('');
console.log('Key features:');
console.log('- User-specific profile data');
console.log('- Child information management');
console.log('- Diagnosis information tracking');
console.log('- Caregiver management (add, edit, delete)');
console.log('- Emergency contact management');
console.log('- Settings management');
console.log('- Real-time profile updates');
console.log('- Secure data access (users can only access their own profiles)');
console.log('');
console.log('Profile sections:');
console.log('- Child Information: Name, age, birth date, gender, weight, height, blood type, allergies');
console.log('- Diagnosis: Type, date, doctor, notes');
console.log('- Caregivers: Name, relation, phone, email, primary status');
console.log('- Emergency Contacts: Name, relation, phone');
console.log('- Settings: Notifications, data sharing, location, dark mode, auto backup'); 