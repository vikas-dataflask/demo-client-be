// Test script for the prefill-designform endpoint
import fetch from 'node-fetch';

const testPrefillEndpoint = async () => {
  const baseUrl = 'http://localhost:8000';
  const endpoint = '/api/prefill-designform';
  
  // Test parameters (replace with actual IDs from your database)
  // These should be real MongoDB ObjectIds that exist in your database
  const params = new URLSearchParams({
    locationId: '507f1f77bcf86cd799439011', // Example MongoDB ObjectId
    buildingCategoryId: '507f1f77bcf86cd799439012', // Example MongoDB ObjectId
    buildingTypeId: '507f1f77bcf86cd799439013' // Example MongoDB ObjectId
  });
  
  const url = `${baseUrl}${endpoint}?${params.toString()}`;
  
  console.log('🧪 Testing prefill endpoint...');
  console.log(`URL: ${url}`);
  console.log('Parameters:', Object.fromEntries(params));
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('\n📊 Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
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
console.log('🚀 Starting prefill endpoint test...\n');
testPrefillEndpoint();
