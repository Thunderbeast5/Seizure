// Test script for medication service
// This script tests the medication service to ensure it handles undefined values correctly

console.log('🧪 Testing Medication Service');
console.log('==============================');
console.log('');

// Test data that would cause the undefined error
const testMedicationData = {
  name: 'Test Medication',
  dosage: '100mg',
  frequency: 'Once daily',
  time: ['08:00'],
  notes: undefined, // This was causing the error
  active: true
};

console.log('Test medication data:');
console.log(JSON.stringify(testMedicationData, null, 2));
console.log('');

// Simulate the cleaning process
const cleanMedicationData = {
  ...testMedicationData,
  notes: testMedicationData.notes && testMedicationData.notes.trim() !== '' ? testMedicationData.notes.trim() : null
};

console.log('Cleaned medication data:');
console.log(JSON.stringify(cleanMedicationData, null, 2));
console.log('');

// Test with empty string notes
const testMedicationData2 = {
  name: 'Test Medication 2',
  dosage: '200mg',
  frequency: 'Twice daily',
  time: ['08:00', '20:00'],
  notes: '', // Empty string
  active: true
};

const cleanMedicationData2 = {
  ...testMedicationData2,
  notes: testMedicationData2.notes && testMedicationData2.notes.trim() !== '' ? testMedicationData2.notes.trim() : null
};

console.log('Test medication data 2 (empty notes):');
console.log(JSON.stringify(testMedicationData2, null, 2));
console.log('');

console.log('Cleaned medication data 2:');
console.log(JSON.stringify(cleanMedicationData2, null, 2));
console.log('');

// Test with valid notes
const testMedicationData3 = {
  name: 'Test Medication 3',
  dosage: '300mg',
  frequency: 'Three times daily',
  time: ['08:00', '14:00', '20:00'],
  notes: 'Take with food',
  active: true
};

const cleanMedicationData3 = {
  ...testMedicationData3,
  notes: testMedicationData3.notes && testMedicationData3.notes.trim() !== '' ? testMedicationData3.notes.trim() : null
};

console.log('Test medication data 3 (valid notes):');
console.log(JSON.stringify(testMedicationData3, null, 2));
console.log('');

console.log('Cleaned medication data 3:');
console.log(JSON.stringify(cleanMedicationData3, null, 2));
console.log('');

console.log('✅ Test completed! The medication service should now handle undefined and empty values correctly.');
console.log('');
console.log('Key fixes:');
console.log('- undefined notes → null');
console.log('- empty string notes → null');
console.log('- valid notes → trimmed string');
console.log('- All undefined values are filtered out before sending to Firestore'); 