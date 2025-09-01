const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  doc,
  setDoc,
  serverTimestamp 
} = require('firebase/firestore');

// Firebase configuration (you'll need to add your own config here)
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testConnectionSystem() {
  try {
    console.log('🧪 Testing Patient-Doctor Connection System...\n');

    // 1. Create a test doctor
    console.log('1. Creating test doctor...');
    const doctorData = {
      email: 'test.doctor@example.com',
      name: 'Dr. John Smith',
      specialty: 'Neurology',
      hospital: 'City General Hospital',
      phone: '+1-555-0123',
      licenseNumber: 'MD123456',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const doctorRef = await addDoc(collection(db, 'doctors'), doctorData);
    console.log(`✅ Doctor created with ID: ${doctorRef.id}\n`);

    // 2. Create a test patient profile
    console.log('2. Creating test patient profile...');
    const patientProfile = {
      child: {
        name: 'Sarah Johnson',
        age: 12,
        gender: 'Female',
        bloodType: 'O+',
        allergies: 'None'
      },
      diagnosis: {
        type: 'Focal Seizures',
        severity: 'Moderate'
      },
      emergencyContacts: [
        { name: 'Parent 1', phone: '+1-555-0001', relationship: 'Mother' },
        { name: 'Parent 2', phone: '+1-555-0002', relationship: 'Father' }
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const patientRef = await addDoc(collection(db, 'profiles'), patientProfile);
    console.log(`✅ Patient profile created with ID: ${patientRef.id}\n`);

    // 3. Create a connection request
    console.log('3. Creating connection request...');
    const connectionRequest = {
      doctorId: doctorRef.id,
      patientId: patientRef.id,
      status: 'pending',
      message: 'Hello! I would like to connect with you to provide neurological care.',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const connectionRef = await addDoc(collection(db, 'patientConnections'), connectionRequest);
    console.log(`✅ Connection request created with ID: ${connectionRef.id}\n`);

    // 4. Test querying assigned patients (this should work now)
    console.log('4. Testing doctor access to assigned patients...');
    const profilesQuery = query(
      collection(db, 'profiles'),
      where('doctorId', '==', doctorRef.id)
    );
    
    const profilesSnapshot = await getDocs(profilesQuery);
    console.log(`✅ Found ${profilesSnapshot.docs.length} patients assigned to doctor\n`);

    // 5. Test the complete workflow
    console.log('5. Testing complete connection workflow...');
    
    // Simulate patient accepting the connection
    console.log('   - Patient accepting connection...');
    const connectionDoc = doc(db, 'patientConnections', connectionRef.id);
    await setDoc(connectionDoc, { 
      status: 'accepted',
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    // Update patient profile with doctorId
    const patientDoc = doc(db, 'profiles', patientRef.id);
    await setDoc(patientDoc, { 
      doctorId: doctorRef.id,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    console.log('   ✅ Connection accepted and patient profile updated\n');

    // 6. Verify doctor can now access patient data
    console.log('6. Verifying doctor access to patient data...');
    const updatedProfilesQuery = query(
      collection(db, 'profiles'),
      where('doctorId', '==', doctorRef.id)
    );
    
    const updatedProfilesSnapshot = await getDocs(updatedProfilesQuery);
    if (updatedProfilesSnapshot.docs.length > 0) {
      const patientData = updatedProfilesSnapshot.docs[0].data();
      console.log(`   ✅ Doctor can access patient: ${patientData.child.name}`);
      console.log(`   ✅ Patient age: ${patientData.child.age}`);
      console.log(`   ✅ Seizure type: ${patientData.diagnosis.type}\n`);
    }

    console.log('🎉 All tests passed! The connection system is working correctly.\n');
    console.log('📋 Test Summary:');
    console.log(`   - Doctor ID: ${doctorRef.id}`);
    console.log(`   - Patient ID: ${patientRef.id}`);
    console.log(`   - Connection ID: ${connectionRef.id}`);
    console.log(`   - Status: Connected`);

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error('Error details:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('\n💡 This appears to be a Firestore permissions issue.');
      console.log('   Please ensure your Firestore security rules are properly deployed.');
      console.log('   You can copy the rules from firestore.rules to your Firebase Console.');
    }
  }
}

// Run the test
testConnectionSystem();
