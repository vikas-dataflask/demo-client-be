// Test script to verify the prefill route is working
import fetch from 'node-fetch';

const testPrefillRoute = async () => {
  const baseUrl = 'http://localhost:8000';
  
  console.log('🧪 Testing prefill route...\n');
  
  // Test 1: Test endpoint
  console.log('1️⃣ Testing /api/test endpoint...');
  try {
    const testResponse = await fetch(`${baseUrl}/api/test`);
    const testData = await testResponse.json();
    console.log('✅ Test endpoint response:', testData);
  } catch (error) {
    console.log('❌ Test endpoint failed:', error.message);
  }
  
  console.log('\n2️⃣ Testing /api/prefill-designform endpoint...');
  
  // Test parameters (using the IDs from your console log)
  const params = new URLSearchParams({
    locationId: '68861873a268c23790397a6b',
    buildingCategoryId: '6884a25c8f56dd2ac4b0fe2b',
    buildingTypeId: '6884a3fa2f6bdd175a2c3cf1',
    disciplineId: '68886b0d58efabd4ef499874',
    subCategoryId: '68886b0d58efabd4ef499879',
    calculationId: '68886c452e18491568a747d5'
  });
  
  const url = `${baseUrl}/api/prefill-designform?${params.toString()}`;
  
  console.log('URL:', url);
  console.log('Parameters:', Object.fromEntries(params));
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('\n📊 Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Test PASSED - Endpoint is working!');
    } else {
      console.log('\n❌ Test FAILED - Endpoint returned error');
    }
    
  } catch (error) {
    console.error('\n💥 Test FAILED - Network or other error:', error.message);
  }
};

// Run the test
console.log('🚀 Starting prefill route test...\n');
testPrefillRoute();
