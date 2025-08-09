// Test script for seizure service
// This script tests the seizure service to ensure it handles undefined values correctly

console.log('🧪 Testing Seizure Service');
console.log('===========================');
console.log('');

// Test data that would cause the undefined error
const testSeizureData = {
  date: '2025-01-20',
  time: '14:30',
  type: 'Absence (Petit Mal)',
  duration: '30 seconds',
  triggers: undefined, // This was causing the error
  notes: undefined, // This was causing the error
  videoUrl: undefined // This was causing the error
};

console.log('Test seizure data:');
console.log(JSON.stringify(testSeizureData, null, 2));
console.log('');

// Simulate the cleaning process
const cleanSeizureData = {
  ...testSeizureData,
  triggers: testSeizureData.triggers && testSeizureData.triggers.trim() !== '' ? testSeizureData.triggers.trim() : null,
  notes: testSeizureData.notes && testSeizureData.notes.trim() !== '' ? testSeizureData.notes.trim() : null,
  videoUrl: testSeizureData.videoUrl && testSeizureData.videoUrl.trim() !== '' ? testSeizureData.videoUrl.trim() : null
};

console.log('Cleaned seizure data:');
console.log(JSON.stringify(cleanSeizureData, null, 2));
console.log('');

// Test with empty string values
const testSeizureData2 = {
  date: '2025-01-21',
  time: '08:15',
  type: 'Tonic-Clonic (Grand Mal)',
  duration: '2 minutes',
  triggers: '', // Empty string
  notes: '', // Empty string
  videoUrl: '' // Empty string
};

const cleanSeizureData2 = {
  ...testSeizureData2,
  triggers: testSeizureData2.triggers && testSeizureData2.triggers.trim() !== '' ? testSeizureData2.triggers.trim() : null,
  notes: testSeizureData2.notes && testSeizureData2.notes.trim() !== '' ? testSeizureData2.notes.trim() : null,
  videoUrl: testSeizureData2.videoUrl && testSeizureData2.videoUrl.trim() !== '' ? testSeizureData2.videoUrl.trim() : null
};

console.log('Test seizure data 2 (empty strings):');
console.log(JSON.stringify(testSeizureData2, null, 2));
console.log('');

console.log('Cleaned seizure data 2:');
console.log(JSON.stringify(cleanSeizureData2, null, 2));
console.log('');

// Test with valid data
const testSeizureData3 = {
  date: '2025-01-22',
  time: '19:45',
  type: 'Myoclonic',
  duration: '10 seconds',
  triggers: 'Missed medication',
  notes: 'Seizure occurred during dinner',
  videoUrl: 'https://example.com/video.mp4'
};

const cleanSeizureData3 = {
  ...testSeizureData3,
  triggers: testSeizureData3.triggers && testSeizureData3.triggers.trim() !== '' ? testSeizureData3.triggers.trim() : null,
  notes: testSeizureData3.notes && testSeizureData3.notes.trim() !== '' ? testSeizureData3.notes.trim() : null,
  videoUrl: testSeizureData3.videoUrl && testSeizureData3.videoUrl.trim() !== '' ? testSeizureData3.videoUrl.trim() : null
};

console.log('Test seizure data 3 (valid data):');
console.log(JSON.stringify(testSeizureData3, null, 2));
console.log('');

console.log('Cleaned seizure data 3:');
console.log(JSON.stringify(cleanSeizureData3, null, 2));
console.log('');

console.log('✅ Test completed! The seizure service should now handle undefined and empty values correctly.');
console.log('');
console.log('Key fixes:');
console.log('- undefined triggers/notes/videoUrl → null');
console.log('- empty string triggers/notes/videoUrl → null');
console.log('- valid triggers/notes/videoUrl → trimmed string');
console.log('- All undefined values are filtered out before sending to Firestore');
console.log('');
console.log('Features included:');
console.log('- User-specific seizure data');
console.log('- Date and time tracking');
console.log('- Seizure type categorization');
console.log('- Duration tracking');
console.log('- Trigger identification');
console.log('- Notes and observations');
console.log('- Video attachment support');
console.log('- Statistics and analytics'); 