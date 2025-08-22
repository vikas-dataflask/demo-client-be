// Test script to check admin backend connectivity
import fetch from 'node-fetch';

const testAdminBackend = async () => {
  const adminBaseUrl = 'http://localhost:3001';
  
  console.log('🧪 Testing Admin Backend connectivity...\n');
  
  // Test 1: Health check
  console.log('1️⃣ Testing admin backend health check...');
  try {
    const healthResponse = await fetch(`${adminBaseUrl}/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Admin backend health check:', healthData);
    } else {
      console.log('❌ Admin backend health check failed:', healthResponse.status);
    }
  } catch (error) {
    console.log('❌ Admin backend health check failed:', error.message);
  }
  
  // Test 2: Root endpoint
  console.log('\n2️⃣ Testing admin backend root endpoint...');
  try {
    const rootResponse = await fetch(`${adminBaseUrl}/`);
    if (rootResponse.ok) {
      const rootData = await rootResponse.json();
      console.log('✅ Admin backend root endpoint:', rootData);
    } else {
      console.log('❌ Admin backend root endpoint failed:', rootResponse.status);
    }
  } catch (error) {
    console.log('❌ Admin backend root endpoint failed:', error.message);
  }
  
  // Test 3: Engineering designs endpoint
  console.log('\n3️⃣ Testing engineering designs endpoint...');
  try {
    const designsResponse = await fetch(`${adminBaseUrl}/api/engineering-designs`);
    if (designsResponse.ok) {
      const designsData = await designsResponse.json();
      console.log('✅ Engineering designs endpoint:', designsData);
    } else {
      console.log('❌ Engineering designs endpoint failed:', designsResponse.status);
    }
  } catch (error) {
    console.log('❌ Engineering designs endpoint failed:', error.message);
  }
  
  // Test 4: Prefill-data endpoint with parameters
  console.log('\n4️⃣ Testing prefill-data endpoint...');
  try {
    const params = new URLSearchParams({
      locationId: '68861873a268c23790397a6b',
      buildingCategoryId: '6884a25c8f56dd2ac4b0fe2b',
      buildingTypeId: '6884a3fa2f6bdd175a2c3cf1',
      disciplineId: '68886b0d58efabd4ef499874',
      subCategoryId: '68886b0d58efabd4ef499879',
      calculationId: '68886c452e18491568a747d5'
    });
    
    const prefillUrl = `${adminBaseUrl}/api/engineering-designs/prefill-data?${params.toString()}`;
    console.log('URL:', prefillUrl);
    
    const prefillResponse = await fetch(prefillUrl);
    if (prefillResponse.ok) {
      const prefillData = await prefillResponse.json();
      console.log('✅ Prefill-data endpoint:', prefillData);
    } else {
      const errorData = await prefillResponse.text();
      console.log('❌ Prefill-data endpoint failed:', prefillResponse.status);
      console.log('Error response:', errorData);
    }
  } catch (error) {
    console.log('❌ Prefill-data endpoint failed:', error.message);
  }
};

// Run the test
console.log('🚀 Starting admin backend connectivity test...\n');
testAdminBackend();
