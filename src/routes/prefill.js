import express from 'express';
import axios from 'axios';

const router = express.Router();

// GET /prefill-designform endpoint for Dialux form prefill
// Accepts query params: { locationId, buildingCategoryId, buildingTypeId }
// Automatically attaches fixed Dialux IDs and calls Admin backend API
router.get('/prefill-designform', async (req, res) => {
  try {
    const { locationId, buildingCategoryId, buildingTypeId } = req.query;
    
    console.log('🔍 Prefill request received with params:', { locationId, buildingCategoryId, buildingTypeId });
    
    // Validate required parameters
    if (!locationId || !buildingCategoryId || !buildingTypeId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters. All of: locationId, buildingCategoryId, buildingTypeId are required.'
      });
    }
    
    // Fixed Dialux IDs as specified in requirements
    const DIALUX_IDS = {
      disciplineId: "68886b0d58efabd4ef499874",
      subCategoryId: "68886b0d58efabd4ef499879", 
      calculationId: "68886c452e18491568a747d5"
    };
    
    console.log('🔍 Using fixed Dialux IDs:', DIALUX_IDS);
    
    // Build the query parameters for Admin backend API call
    const adminApiParams = {
      location: locationId,
      buildingCategory: buildingCategoryId,
      buildingType: buildingTypeId,
      discipline: DIALUX_IDS.disciplineId,
      subCategory: DIALUX_IDS.subCategoryId,
      calculation: DIALUX_IDS.calculationId
    };
    
    console.log('🔍 Calling Admin backend with params:', adminApiParams);
    
    // Get Admin backend URL from environment or use default
                 const adminBackendUrl = process.env.ADMIN_BACKEND_URL || 'http://localhost:3001';
         const adminApiUrl = `${adminBackendUrl}/api/engineering-designs/designform`;
    
    console.log('🔍 Admin API URL:', adminApiUrl);
    
    // Call Admin backend API
    const adminResponse = await axios.get(adminApiUrl, {
      params: adminApiParams,
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Admin backend response received:', {
      status: adminResponse.status,
      hasData: !!adminResponse.data?.data
    });
    
    // Return the data from Admin backend
    res.json({
      success: true,
      data: adminResponse.data.data,
      message: 'Prefill data retrieved successfully from Admin backend',
      source: 'Admin Backend',
      dialuxIds: DIALUX_IDS
    });
    
  } catch (error) {
    console.error('❌ Error in prefill endpoint:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Admin backend responded with error status
      const { status, data } = error.response;
      console.error('Admin backend error response:', { status, data });
      
      if (status === 404) {
        return res.status(404).json({
          success: false,
          error: 'No matching Dialux design found for the specified building parameters',
          details: data?.error || 'No matching design found'
        });
      }
      
      return res.status(status).json({
        success: false,
        error: `Admin backend error: ${data?.error || 'Unknown error'}`,
        status: status
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response from Admin backend:', error.request);
      return res.status(503).json({
        success: false,
        error: 'Admin backend is not responding. Please try again later.',
        details: 'Request timeout or connection error'
      });
    } else {
      // Something else happened
      return res.status(500).json({
        success: false,
        error: 'Internal server error during prefill request',
        details: error.message
      });
    }
  }
});

// Health check endpoint for the prefill service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Prefill service is running',
    timestamp: new Date().toISOString(),
    dialuxIds: {
      disciplineId: "68886b0d58efabd4ef499874",
      subCategoryId: "68886b0d58efabd4ef499879",
      calculationId: "68886c452e18491568a747d5"
    }
  });
});

export default router;
