# Room Data Model Documentation

## Overview

The enhanced room data model provides a comprehensive structure for storing room geometry, walls, doors, and windows in a single document. This enables efficient querying and management of complete room definitions across multiple pages (Area Markup, Door Markup, Material Assignment, etc.).

## Data Structure

### Room Schema

```javascript
{
  id: String,                    // Unique room identifier
  name: String,                  // Room name
  description: String,           // Room description
  floorId: String,              // Associated floor ID
  projectId: String,            // Associated project ID
  geometry: {
    x: Number,                  // X coordinate (pixels)
    y: Number,                  // Y coordinate (pixels)
    width: Number,              // Width (pixels)
    height: Number,             // Height (pixels)
    area: Number                // Calculated area (pixels²)
  },
  shape: String,                // "rectangle" or "polygon"
  roomType: String,             // "Residential", "Commercial", etc.
  wallThickness: Number,        // Default wall thickness (mm)
  falseCeiling: String,         // False ceiling description
  walls: [WallSchema],          // Array of wall objects
  doors: [DoorSchema],          // Array of door objects
  windows: [WindowSchema],      // Array of window objects
  isActive: Boolean,            // Soft delete flag
  createdBy: String,            // Creator identifier
  createdAt: Date,              // Creation timestamp
  updatedAt: Date               // Last update timestamp
}
```

### Wall Schema

```javascript
{
  id: String,                   // Unique wall identifier
  start: {
    x: Number,                  // Start X coordinate
    y: Number                   // Start Y coordinate
  },
  end: {
    x: Number,                  // End X coordinate
    y: Number                   // End Y coordinate
  },
  thickness: Number,            // Wall thickness (mm)
  height: Number,               // Wall height (mm)
  type: String,                 // "Partition", "Load-bearing", "Glass", "Exterior"
  material: String,             // Wall material
  sharedWithRoomId: String,     // ID of room sharing this wall
  isShared: Boolean             // Whether wall is shared
}
```

### Door Schema

```javascript
{
  id: String,                   // Unique door identifier
  wallId: String,               // Associated wall ID
  position: Number,             // Position along wall (0-1)
  width: Number,                // Door width (mm)
  height: Number,               // Door height (mm)
  sillHeight: Number,           // Sill height (mm)
  type: String,                 // "Single", "Double", "Sliding", "Folding", "Revolving"
  material: String,             // Door material
  direction: String             // "Left", "Right", "Both"
}
```

### Window Schema

```javascript
{
  id: String,                   // Unique window identifier
  wallId: String,               // Associated wall ID
  position: Number,             // Position along wall (0-1)
  width: Number,                // Window width (mm)
  height: Number,               // Window height (mm)
  sillHeight: Number,           // Sill height (mm)
  type: String,                 // "Single", "Double", "D-glass", "Ventilation", "Fixed", "Sliding"
  material: String,             // Window material
  glazing: String               // "Single", "Double", "Triple"
}
```

## API Endpoints

### Room CRUD Operations

#### Create Room
```http
POST /api/rooms
Content-Type: application/json

{
  "name": "Living Room",
  "description": "Main living area",
  "floorId": "floor-123",
  "projectId": "project-456",
  "geometry": {
    "x": 100,
    "y": 100,
    "width": 500,
    "height": 400
  },
  "roomType": "Residential",
  "wallThickness": 200,
  "falseCeiling": "Gypsum board",
  "autoGenerateWalls": true
}
```

#### Get Rooms by Floor
```http
GET /api/rooms/floor/{floorId}
```

#### Get Room by ID
```http
GET /api/rooms/{roomId}
```

#### Update Room
```http
PATCH /api/rooms/{roomId}
Content-Type: application/json

{
  "name": "Updated Room Name",
  "geometry": {
    "width": 600,
    "height": 450
  }
}
```

#### Delete Room
```http
DELETE /api/rooms/{roomId}
```

### Wall Operations

#### Add Wall to Room
```http
POST /api/rooms/{roomId}/walls
Content-Type: application/json

{
  "start": { "x": 100, "y": 100 },
  "end": { "x": 600, "y": 100 },
  "thickness": 200,
  "height": 3000,
  "type": "Partition",
  "material": "Brick"
}
```

#### Update Wall
```http
PATCH /api/rooms/{roomId}/walls/{wallId}
Content-Type: application/json

{
  "thickness": 250,
  "material": "Concrete"
}
```

#### Remove Wall
```http
DELETE /api/rooms/{roomId}/walls/{wallId}
```

#### Mark Wall as Shared
```http
PATCH /api/rooms/{roomId}/walls/{wallId}/share
Content-Type: application/json

{
  "sharedWithRoomId": "room-789"
}
```

### Door Operations

#### Add Door to Room
```http
POST /api/rooms/{roomId}/doors
Content-Type: application/json

{
  "wallId": "wall-123",
  "position": 0.5,
  "width": 900,
  "height": 2100,
  "type": "Single",
  "material": "Wood"
}
```

#### Update Door
```http
PATCH /api/rooms/{roomId}/doors/{doorId}
Content-Type: application/json

{
  "width": 1000,
  "type": "Double"
}
```

#### Remove Door
```http
DELETE /api/rooms/{roomId}/doors/{doorId}
```

### Window Operations

#### Add Window to Room
```http
POST /api/rooms/{roomId}/windows
Content-Type: application/json

{
  "wallId": "wall-123",
  "position": 0.3,
  "width": 1200,
  "height": 1200,
  "sillHeight": 900,
  "type": "Double",
  "material": "Aluminum"
}
```

#### Update Window
```http
PATCH /api/rooms/{roomId}/windows/{windowId}
Content-Type: application/json

{
  "width": 1500,
  "glazing": "Triple"
}
```

#### Remove Window
```http
DELETE /api/rooms/{roomId}/windows/{windowId}
```

### Utility Operations

#### Get Rooms with Shared Walls
```http
GET /api/rooms/floor/{floorId}/shared-walls
```

#### Generate Walls from Geometry
```http
POST /api/rooms/{roomId}/generate-walls
Content-Type: application/json

{
  "wallThickness": 200
}
```

## Frontend Integration

### Creating a Room

```javascript
import { createRoom, createRoomData } from '../utils/roomApi';

const roomData = createRoomData({
  name: "Living Room",
  description: "Main living area",
  floorId: "floor-123",
  projectId: "project-456",
  geometry: {
    x: 100,
    y: 100,
    width: 500,
    height: 400
  },
  roomType: "Residential",
  wallThickness: 200,
  falseCeiling: "Gypsum board",
  autoGenerateWalls: true
});

const newRoom = await createRoom(roomData);
```

### Adding a Door

```javascript
import { addDoorToRoom, createDoorData } from '../utils/roomApi';

const doorData = createDoorData({
  wallId: "wall-123",
  position: 0.5,
  width: 900,
  height: 2100,
  type: "Single",
  material: "Wood"
});

const newDoor = await addDoorToRoom(roomId, doorData);
```

### Adding a Window

```javascript
import { addWindowToRoom, createWindowData } from '../utils/roomApi';

const windowData = createWindowData({
  wallId: "wall-123",
  position: 0.3,
  width: 1200,
  height: 1200,
  sillHeight: 900,
  type: "Double",
  material: "Aluminum"
});

const newWindow = await addWindowToRoom(roomId, windowData);
```

## Key Features

### 1. Auto-Generated Walls
When creating a room with `autoGenerateWalls: true`, the system automatically generates four walls based on the room geometry.

### 2. Shared Wall Detection
Walls can be marked as shared between rooms using the `sharedWithRoomId` field, preventing duplication.

### 3. Position-Based Elements
Doors and windows are positioned along walls using a 0-1 scale, making it easy to place them accurately.

### 4. Comprehensive Validation
The schema includes validation for:
- Required fields
- Numeric ranges (e.g., position 0-1)
- Enum values for types
- Positive geometry coordinates

### 5. Efficient Indexing
Database indexes are created for:
- Floor-based queries
- Project-based queries
- Shared wall lookups
- Wall/door/window associations

## Migration Notes

### From Old Schema
The new schema replaces the old flat structure with a nested approach:
- `x`, `y`, `width`, `height` → `geometry.x`, `geometry.y`, `geometry.width`, `geometry.height`
- `level_id` → `floorId`
- Added `projectId` for better organization
- Walls, doors, and windows are now embedded in the room document

### Backward Compatibility
The API maintains backward compatibility by:
- Supporting both old and new field names in responses
- Providing migration utilities
- Maintaining existing endpoint patterns where possible

## Best Practices

1. **Always use helper functions** (`createRoomData`, `createWallData`, etc.) to ensure data consistency
2. **Validate geometry** before saving to ensure positive coordinates
3. **Use shared walls** when rooms are adjacent to avoid duplication
4. **Generate walls automatically** for rectangular rooms, manually for complex shapes
5. **Update positions** when walls are modified to maintain door/window placement
6. **Use soft deletes** to maintain data integrity and enable recovery 