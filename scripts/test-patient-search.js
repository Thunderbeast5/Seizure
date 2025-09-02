const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to add your service account key)
// const serviceAccount = require('./path-to-your-service-account-key.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// For testing, we'll use the Firebase config from your app
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testPatientSearch() {
  try {
    console.log('🔍 Testing Patient Search...\n');
    
    // Test 1: Check if patient exists by ID
    const patientId = 'y6IPK6tuAZb2Tp4KSwNsO19kDgC2';
    console.log(`Looking for patient with ID: ${patientId}`);
    
    // Get all profiles
    const profilesQuery = collection(db, 'profiles');
    const profilesSnapshot = await getDocs(profilesQuery);
    
    console.log(`\n📊 Total profiles in database: ${profilesSnapshot.size}`);
    
    let patientFound = false;
    let patientData = null;
    
    profilesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n👤 Profile ID: ${doc.id}`);
      console.log(`   Name: ${data.child?.name || 'No name'}`);
      console.log(`   Age: ${data.child?.age || 'No age'}`);
      console.log(`   Gender: ${data.child?.gender || 'No gender'}`);
      console.log(`   Doctor ID: ${data.doctorId || 'No doctor assigned'}`);
      
      if (doc.id === patientId) {
        patientFound = true;
        patientData = data;
        console.log(`   ✅ FOUND TARGET PATIENT!`);
      }
    });
    
    if (patientFound) {
      console.log(`\n🎉 SUCCESS: Patient ${patientId} exists in the database!`);
      console.log(`   Patient Name: ${patientData.child?.name || 'Unknown'}`);
      console.log(`   Patient Age: ${patientData.child?.age || 'Unknown'}`);
    } else {
      console.log(`\n❌ ERROR: Patient ${patientId} NOT found in the database!`);
      console.log(`\n💡 Possible solutions:`);
      console.log(`   1. Make sure the patient is registered in the mobile app`);
      console.log(`   2. Check if the Patient ID is correct`);
      console.log(`   3. Verify the patient has completed their profile setup`);
    }
    
    // Test 2: Check if there are any doctors
    console.log(`\n\n🔍 Checking for doctors...`);
    const doctorsQuery = collection(db, 'doctors');
    const doctorsSnapshot = await getDocs(doctorsQuery);
    
    console.log(`📊 Total doctors in database: ${doctorsSnapshot.size}`);
    
    doctorsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n👨‍⚕️ Doctor ID: ${doc.id}`);
      console.log(`   Name: ${data.name || 'No name'}`);
      console.log(`   Specialty: ${data.specialty || 'No specialty'}`);
      console.log(`   Hospital: ${data.hospital || 'No hospital'}`);
    });
    
    // Test 3: Check patient connections
    console.log(`\n\n🔍 Checking patient connections...`);
    const connectionsQuery = collection(db, 'patientConnections');
    const connectionsSnapshot = await getDocs(connectionsQuery);
    
    console.log(`📊 Total connections in database: ${connectionsSnapshot.size}`);
    
    connectionsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n🔗 Connection ID: ${doc.id}`);
      console.log(`   Doctor ID: ${data.doctorId}`);
      console.log(`   Patient ID: ${data.patientId}`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Message: ${data.message || 'No message'}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing patient search:', error);
  }
}

// Run the test
testPatientSearch();

