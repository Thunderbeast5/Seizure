// Script to help set up Firebase index for medications
// Run this script to get the index creation URL

const firebaseConfig = {
  apiKey: "AIzaSyAdGx6v716ekZRbTUP9KU7wdmFs1FcUERc",
  authDomain: "seizure-tracker-166f0.firebaseapp.com",
  projectId: "seizure-tracker-166f0",
  storageBucket: "seizure-tracker-166f0.firebasestorage.app",
  messagingSenderId: "596929603017",
  appId: "1:596929603017:web:881986f40201a8043fb418"
};

console.log('🔥 Firebase Medication Index Setup');
console.log('=====================================');
console.log('');
console.log('To fix the index error, you need to create a composite index in Firebase Console.');
console.log('');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
console.log(`2. Select your project: ${firebaseConfig.projectId}`);
console.log('3. Go to Firestore Database > Indexes');
console.log('4. Click "Create Index"');
console.log('');
console.log('Index Configuration:');
console.log('- Collection ID: medications');
console.log('- Fields to index:');
console.log('  - userId (Ascending)');
console.log('  - createdAt (Descending)');
console.log('');
console.log('Or use this direct link:');
console.log('https://console.firebase.google.com/v1/r/project/seizure-tracker-166f0/firestore/indexes?create_composite=Cllwcm9qZWN0cy9zZWl6dXJlLXRyYWNrZXItMTY2ZjAvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL21lZGljYXRpb25zL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI');
console.log('');
console.log('After creating the index, wait a few minutes for it to build, then try the app again.');
console.log('');
console.log('Note: The app will work without the index (it will use a fallback query), but it will be slower.'); 