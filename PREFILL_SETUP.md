# Dialux Form Prefill Setup

## Overview
This document describes the setup required for the Dialux form prefill functionality that connects the Client Frontend to the Admin Backend.

## Environment Variables
Create a `.env` file in the `demo-client-be` directory with the following variables:

```env
# Admin Backend API Configuration
ADMIN_API_BASE_URL=http://localhost:3001

# Other existing variables...
PORT=8000
MONGODB_URI=mongodb://localhost:27017/your_database_name
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```

## Fixed Values for Dialux
The following IDs are hardcoded for Dialux calculations:
- **disciplineId**: `68886b0d58efabd4ef499874`
- **subCategoryId**: `68886b0d58efabd4ef499879`
- **calculationId**: `68886c452e18491568a747d5`

## API Endpoints

### Client Backend
- `GET /api/prefill-designform` - Accepts `locationId`, `buildingCategoryId`, `buildingTypeId`

### Admin Backend
- `GET /api/engineering-designs/designform` - Accepts `location`, `buildingCategory`, `buildingType`, `discipline`, `subCategory`, `calculation`

## Data Flow
1. Client Frontend calls `/api/prefill-designform` with project IDs
2. Client Backend adds fixed Dialux IDs and calls Admin Backend
3. Admin Backend queries `engineeringdesign` collection
4. Data flows back through the chain to prefill the form

## Testing
1. Ensure Admin Backend is running on port 3001
2. Ensure Client Backend is running on port 8000
3. Test the prefill button in the DialuxForm component
4. Check console logs for debugging information

## Troubleshooting
- Verify Admin Backend is accessible
- Check environment variables are set correctly
- Ensure the `engineeringdesign` collection has data matching the criteria
- Check network requests in browser developer tools
